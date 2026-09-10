/**
 * Reconciliation reporting for the WordPress importers.
 *
 * Both importers are required to be idempotent, so the interesting number is
 * not "how many rows exist" but "what changed on this run" - a second run that
 * reports anything other than all-unchanged is a bug. Rows that could not be
 * mapped are grouped by reason rather than logged one by one, because 250 events
 * scrolling past hides the six that need a human.
 */

export type Action = 'created' | 'updated' | 'unchanged' | 'skipped'

const ACTIONS: Action[] = ['created', 'updated', 'unchanged', 'skipped']

export class MigrationReport {
  private readonly tallies = new Map<string, Map<Action, number>>()
  private readonly issues = new Map<string, string[]>()
  private readonly notes: string[] = []
  private readonly startedAt = Date.now()

  constructor(private readonly title: string, private readonly dryRun: boolean) {}

  tally(entity: string, action: Action): void {
    const byAction = this.tallies.get(entity) ?? new Map<Action, number>()
    byAction.set(action, (byAction.get(action) ?? 0) + 1)
    this.tallies.set(entity, byAction)
  }

  /** Something a human needs to look at, grouped under a short reason. */
  issue(reason: string, detail: string): void {
    const list = this.issues.get(reason) ?? []
    list.push(detail)
    this.issues.set(reason, list)
  }

  /** A decision the run made that is not a problem, but should be on the record. */
  note(text: string): void {
    this.notes.push(text)
  }

  get issueCount(): number {
    let total = 0
    this.issues.forEach((list) => { total += list.length })
    return total
  }

  print(detailLimit = 8): void {
    const lines: string[] = []
    lines.push('')
    lines.push(`${this.title} - ${this.dryRun ? 'DRY RUN, nothing was written' : 'COMMITTED'}`)
    lines.push('='.repeat(72))

    const entities = Array.from(this.tallies.keys())
    const width = Math.max(12, ...entities.map((e) => e.length))
    lines.push('')
    lines.push(`${'entity'.padEnd(width)}  ${ACTIONS.map((a) => a.padStart(9)).join('')}`)
    for (const entity of entities) {
      const byAction = this.tallies.get(entity)!
      const cells = ACTIONS.map((a) => String(byAction.get(a) ?? 0).padStart(9)).join('')
      lines.push(`${entity.padEnd(width)}  ${cells}`)
    }

    if (this.notes.length) {
      lines.push('')
      lines.push('Notes')
      lines.push('-'.repeat(72))
      for (const note of this.notes) lines.push(`  ${note}`)
    }

    if (this.issues.size) {
      lines.push('')
      lines.push(`Needs a look (${this.issueCount})`)
      lines.push('-'.repeat(72))
      const reasons = Array.from(this.issues.keys()).sort(
        (a, b) => this.issues.get(b)!.length - this.issues.get(a)!.length
      )
      for (const reason of reasons) {
        const list = this.issues.get(reason)!
        lines.push(`  ${reason} (${list.length})`)
        for (const detail of list.slice(0, detailLimit)) lines.push(`      ${detail}`)
        if (list.length > detailLimit) lines.push(`      ... and ${list.length - detailLimit} more`)
      }
    }

    lines.push('')
    lines.push(`Finished in ${((Date.now() - this.startedAt) / 1000).toFixed(1)}s`)
    lines.push('')
    console.log(lines.join('\n'))
  }
}

/** Tiny argv reader: `--flag`, `--key value` and `--key=value`. */
export function parseArgs(argv: string[]): { flags: Set<string>; values: Record<string, string> } {
  const flags = new Set<string>()
  const values: Record<string, string> = {}

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (!arg.startsWith('--')) continue
    const body = arg.slice(2)
    const eq = body.indexOf('=')
    if (eq !== -1) {
      values[body.slice(0, eq)] = body.slice(eq + 1)
      continue
    }
    const next = argv[i + 1]
    if (next && !next.startsWith('--')) {
      values[body] = next
      i++
    } else {
      flags.add(body)
    }
  }
  return { flags, values }
}
