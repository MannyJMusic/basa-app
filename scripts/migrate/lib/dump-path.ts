/**
 * Locating the WordPress dump the importers read.
 *
 * Shared because all three consumers - events, members and the URL inventory - need
 * the same answer, and a third copy of it was a copy too many.
 */
import { existsSync, readdirSync } from 'fs'
import { join } from 'path'

/**
 * The newest dump under `backups/mysql`.
 *
 * Names are `wordpress-YYYYMMDD-HHMMSS.sql.gz`, so a lexical sort is a chronological
 * one; the last entry is the most recent.
 */
export function newestDumpPath(): string {
  const dir = join(process.cwd(), 'backups', 'mysql')
  if (!existsSync(dir)) {
    throw new Error(
      `no dump given and ${dir} does not exist - run scripts/pull-backups.sh first`
    )
  }
  const files = readdirSync(dir).filter((f) => f.endsWith('.sql.gz')).sort()
  if (!files.length) throw new Error(`no *.sql.gz in ${dir} - run scripts/pull-backups.sh`)
  return join(dir, files[files.length - 1])
}
