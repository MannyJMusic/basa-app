/**
 * One CSV cell: quotes doubled, and a leading = + - @ (or tab/CR) neutralised
 * with an apostrophe so a spreadsheet never evaluates member-entered text as a
 * formula (CSV injection).
 */
export function csvCell(value: unknown): string {
  let text = value === null || value === undefined ? "" : String(value)
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

