/**
 * Streaming reader for a `mysqldump` file, plain or gzipped.
 *
 * The WordPress dumps this repo works with are ~45 MB uncompressed and the only
 * copy of the live data we are allowed to keep off-box, so the importers read
 * them directly rather than depending on a running MySQL. That keeps the import
 * repeatable long after the WordPress host is gone (#71).
 *
 * Two things make this more than a line split:
 *
 *  - mysqldump writes one extended INSERT per ~1 MB of data, so a single
 *    statement spans many lines and a single line holds thousands of rows.
 *  - Values are backslash-escaped, and post content is full of `;`, `'` and
 *    newlines. Statement boundaries have to be found with quote tracking.
 */
import { createReadStream } from 'fs'
import { createGunzip } from 'zlib'

export type Row = Record<string, string | null>

/** One callback per table we care about. Tables not listed are skipped. */
export type RowHandlers = Record<string, (row: Row) => void>

const KEY_LINE = /^\s*(PRIMARY\s+KEY|UNIQUE\s+KEY|KEY|CONSTRAINT|FULLTEXT|SPATIAL|INDEX)\b/i
const COLUMN_LINE = /^\s*`([^`]+)`\s/

/** Column names in ordinal order, captured from each CREATE TABLE. */
function parseCreateTable(stmt: string): { table: string; columns: string[] } | null {
  const head = /^CREATE TABLE (?:IF NOT EXISTS )?`([^`]+)`/.exec(stmt)
  if (!head) return null

  const columns: string[] = []
  for (const line of stmt.split('\n').slice(1)) {
    if (KEY_LINE.test(line)) continue
    if (/^\)/.test(line)) break
    const col = COLUMN_LINE.exec(line)
    if (col) columns.push(col[1])
  }
  return { table: head[1], columns }
}

function unescape(raw: string): string {
  if (raw.indexOf('\\') === -1) return raw

  let out = ''
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]
    if (ch !== '\\' || i === raw.length - 1) {
      out += ch
      continue
    }
    const next = raw[++i]
    switch (next) {
      case '0': out += '\0'; break
      case 'b': out += '\b'; break
      case 'n': out += '\n'; break
      case 'r': out += '\r'; break
      case 't': out += '\t'; break
      case 'Z': out += '\x1a'; break
      // \\ \' \" and anything else: the backslash was only protecting the char.
      default: out += next
    }
  }
  return out
}

/**
 * Parse the tuple list of an INSERT, calling `emit` per row. Values arrive as
 * strings (or null); coercion is the caller's job, because MySQL's idea of a
 * type and Prisma's rarely line up and the mapping wants to be explicit.
 */
function parseValues(stmt: string, from: number, columns: string[], emit: (row: Row) => void): void {
  let i = from
  const len = stmt.length

  while (i < len) {
    while (i < len && stmt[i] !== '(') i++
    if (i >= len) return
    i++ // past '('

    const values: (string | null)[] = []
    while (i < len) {
      if (stmt[i] === "'") {
        const start = ++i
        while (i < len) {
          if (stmt[i] === '\\') i += 2
          else if (stmt[i] === "'") break
          else i++
        }
        values.push(unescape(stmt.slice(start, i)))
        i++ // past closing quote
      } else {
        const start = i
        while (i < len && stmt[i] !== ',' && stmt[i] !== ')') i++
        const bare = stmt.slice(start, i).trim()
        values.push(bare === 'NULL' ? null : bare)
      }

      if (stmt[i] === ',') { i++; continue }
      if (stmt[i] === ')') { i++; break }
      // Trailing whitespace or newline between values.
      while (i < len && /\s/.test(stmt[i])) i++
      if (stmt[i] === ',') { i++; continue }
      if (stmt[i] === ')') { i++; break }
    }

    if (values.length !== columns.length) {
      throw new Error(
        `row has ${values.length} values but the table has ${columns.length} columns ` +
        `(${columns.join(', ')})`
      )
    }

    const row: Row = {}
    for (let c = 0; c < columns.length; c++) row[columns[c]] = values[c]
    emit(row)

    // Skip the separator between tuples; stop at the statement's own end.
    while (i < len && stmt[i] !== '(' && stmt[i] !== ';') i++
    if (stmt[i] === ';') return
  }
}

/**
 * Read `dumpPath` once, calling the handler for every row of every named table.
 * Rows arrive in dump order. Tables appear alphabetically in a mysqldump, which
 * is why `wp_postmeta` is read before `wp_posts` — a caller that needs to filter
 * meta by post id has to make two passes.
 */
export async function scanDump(dumpPath: string, handlers: RowHandlers): Promise<void> {
  const wanted = new Set(Object.keys(handlers))
  const columnsByTable = new Map<string, string[]>()

  let pending = ''
  let pos = 0
  let inQuote = false

  const handleStatement = (stmt: string): void => {
    const trimmed = stmt.trim()
    if (trimmed.startsWith('CREATE TABLE')) {
      const parsed = parseCreateTable(trimmed)
      if (parsed) columnsByTable.set(parsed.table, parsed.columns)
      return
    }
    if (!trimmed.startsWith('INSERT INTO')) return

    const head = /^INSERT INTO `([^`]+)`\s*/.exec(trimmed)
    if (!head) return
    const table = head[1]
    const handler = handlers[table]
    if (!handler) return

    let cursor = head[0].length
    let columns = columnsByTable.get(table)

    // --complete-insert dumps name their columns; ours do not, but a dump taken
    // with different flags should not silently import into the wrong fields.
    if (trimmed[cursor] === '(') {
      const close = trimmed.indexOf(')', cursor)
      columns = trimmed
        .slice(cursor + 1, close)
        .split(',')
        .map((c) => c.trim().replace(/`/g, ''))
      cursor = close + 1
    }
    if (!columns) throw new Error(`INSERT into ${table} before its CREATE TABLE`)

    const valuesAt = trimmed.indexOf('VALUES', cursor)
    if (valuesAt === -1) throw new Error(`INSERT into ${table} has no VALUES`)

    try {
      parseValues(trimmed, valuesAt + 'VALUES'.length, columns, handler)
    } catch (err) {
      throw new Error(`while reading ${table}: ${(err as Error).message}`)
    }
  }

  // Scan for statement ends, tracking quotes so a `;` inside post content does
  // not split a statement in half.
  const consume = (): void => {
    while (pos < pending.length) {
      if (inQuote) {
        const ch = pending[pos]
        if (ch === '\\') {
          if (pos + 1 >= pending.length) return // escape split across chunks
          pos += 2
        } else if (ch === "'") {
          inQuote = false
          pos++
        } else {
          const nextQuote = pending.indexOf("'", pos)
          const nextEsc = pending.indexOf('\\', pos)
          const next = nextEsc === -1 ? nextQuote : nextQuote === -1 ? nextEsc : Math.min(nextQuote, nextEsc)
          if (next === -1) { pos = pending.length; return }
          pos = next
        }
        continue
      }

      const nextQuote = pending.indexOf("'", pos)
      const nextEnd = pending.indexOf(';', pos)
      if (nextEnd === -1 && nextQuote === -1) { pos = pending.length; return }

      if (nextEnd !== -1 && (nextQuote === -1 || nextEnd < nextQuote)) {
        handleStatement(pending.slice(0, nextEnd))
        pending = pending.slice(nextEnd + 1)
        pos = 0
      } else {
        inQuote = true
        pos = nextQuote + 1
      }
    }
  }

  await new Promise<void>((resolve, reject) => {
    let stream: NodeJS.ReadableStream = createReadStream(dumpPath)
    if (dumpPath.endsWith('.gz')) stream = stream.pipe(createGunzip())
    stream.setEncoding('utf8')

    stream.on('data', (chunk: string | Buffer) => {
      pending += chunk
      try {
        consume()
      } catch (err) {
        stream.emit('error', err)
      }
    })
    stream.on('error', reject)
    stream.on('end', () => {
      try {
        if (pending.trim()) handleStatement(pending)
        resolve()
      } catch (err) {
        reject(err)
      }
    })
  })

  Array.from(wanted).forEach((table) => {
    if (!columnsByTable.has(table)) {
      throw new Error(`table \`${table}\` is not in ${dumpPath}`)
    }
  })
}
