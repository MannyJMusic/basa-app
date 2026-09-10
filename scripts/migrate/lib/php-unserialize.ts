/**
 * Minimal `unserialize()` for the PHP-serialized values WordPress keeps in meta.
 *
 * MEC stores an event's tickets, booking rules and repeat rules this way, so the
 * importer cannot read prices without it. Only the types WordPress actually
 * writes into meta are supported; an object (`O:`) or a reference (`R:`) means we
 * are reading something we do not understand, and that should fail loudly rather
 * than silently import an event with no tickets.
 *
 * String lengths in the format are counted in BYTES, not characters, and BASA's
 * ticket descriptions are full of emoji. Parsing happens over a Buffer for that
 * reason - `"🎳".length` is 2 in JS and 4 in PHP.
 */

export type PhpValue = string | number | boolean | null | PhpValue[] | { [key: string]: PhpValue }

class Parser {
  private pos = 0

  constructor(private readonly buf: Buffer) {}

  parse(): PhpValue {
    const type = String.fromCharCode(this.buf[this.pos])

    switch (type) {
      case 'N':
        this.expect('N;')
        return null
      case 'b': {
        this.expect('b:')
        const v = this.readUntil(';') === '1'
        return v
      }
      case 'i': {
        this.expect('i:')
        return parseInt(this.readUntil(';'), 10)
      }
      case 'd': {
        this.expect('d:')
        return parseFloat(this.readUntil(';'))
      }
      case 's': {
        this.expect('s:')
        const bytes = parseInt(this.readUntil(':'), 10)
        this.expect('"')
        const value = this.buf.toString('utf8', this.pos, this.pos + bytes)
        this.pos += bytes
        this.expect('";')
        return value
      }
      case 'a': {
        this.expect('a:')
        const count = parseInt(this.readUntil(':'), 10)
        this.expect('{')
        // PHP arrays are ordered maps; a list and a dictionary are the same type.
        // Keep insertion order by building an object, since MEC's ticket keys are
        // 1-based integers and the order is the display order.
        const out: { [key: string]: PhpValue } = {}
        for (let i = 0; i < count; i++) {
          const key = this.parse()
          if (typeof key !== 'string' && typeof key !== 'number') {
            throw new Error(`array key at byte ${this.pos} is neither string nor int`)
          }
          out[String(key)] = this.parse()
        }
        this.expect('}')
        return out
      }
      default:
        throw new Error(`unsupported serialized type '${type}' at byte ${this.pos}`)
    }
  }

  private expect(literal: string): void {
    const actual = this.buf.toString('utf8', this.pos, this.pos + literal.length)
    if (actual !== literal) {
      throw new Error(`expected ${JSON.stringify(literal)} at byte ${this.pos}, found ${JSON.stringify(actual)}`)
    }
    this.pos += literal.length
  }

  private readUntil(terminator: string): string {
    const end = this.buf.indexOf(terminator, this.pos)
    if (end === -1) throw new Error(`unterminated value at byte ${this.pos}`)
    const value = this.buf.toString('utf8', this.pos, end)
    this.pos = end + terminator.length
    return value
  }
}

export function phpUnserialize(value: string): PhpValue {
  if (value === '') return null
  return new Parser(Buffer.from(value, 'utf8')).parse()
}

/** `a:0:{}` and the empty string both mean "nothing here" in WordPress meta. */
export function phpUnserializeMap(value: string | undefined): Record<string, PhpValue> {
  if (!value || value === 'a:0:{}') return {}
  const parsed = phpUnserialize(value)
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
  return parsed as Record<string, PhpValue>
}

/** Reads one field out of a PHP array, as a trimmed string. */
export function phpString(map: Record<string, PhpValue>, key: string): string {
  const v = map[key]
  if (v === null || v === undefined) return ''
  if (typeof v === 'object') return ''
  return String(v).trim()
}
