/**
 * @jest-environment node
 *
 * The WordPress importers (#57, #58) read a mysqldump directly, so their parsing
 * is the thing most able to corrupt data quietly: a mis-split statement drops
 * events, a byte/character mix-up truncates every ticket description after an
 * emoji, and a timezone slip moves 259 events by an hour without erroring.
 */
import { writeFileSync, mkdtempSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

import { scanDump, Row } from '../../../scripts/migrate/lib/mysqldump'
import { phpUnserialize, phpUnserializeMap, phpString } from '../../../scripts/migrate/lib/php-unserialize'
import { decodeEntities, parseUsAddress, summarise } from '../../../scripts/migrate/lib/text'
import { wallClockToUtc, to24Hour, wallClockPartsInEventZone } from '../../../scripts/migrate/lib/timezone'

function writeDump(sql: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'basa-dump-'))
  const path = join(dir, 'dump.sql')
  writeFileSync(path, sql)
  return path
}

describe('mysqldump reader', () => {
  const ddl = [
    'CREATE TABLE `wp_posts` (',
    '  `ID` bigint unsigned NOT NULL AUTO_INCREMENT,',
    '  `post_title` text,',
    '  `post_content` longtext,',
    '  PRIMARY KEY (`ID`)',
    ') ENGINE=InnoDB;',
  ].join('\n')

  it('reads column names from CREATE TABLE and maps them onto values', async () => {
    const path = writeDump(`${ddl}\nINSERT INTO \`wp_posts\` VALUES (1,'Mixer','Body'),(2,'Meetup','More');\n`)
    const rows: Row[] = []
    await scanDump(path, { wp_posts: (r) => rows.push(r) })

    expect(rows).toEqual([
      { ID: '1', post_title: 'Mixer', post_content: 'Body' },
      { ID: '2', post_title: 'Meetup', post_content: 'More' },
    ])
  })

  it('does not split a statement on a semicolon inside post content', async () => {
    const path = writeDump(`${ddl}\nINSERT INTO \`wp_posts\` VALUES (1,'Doors; then drinks','a;b;c'),(2,'Second','ok');\n`)
    const rows: Row[] = []
    await scanDump(path, { wp_posts: (r) => rows.push(r) })

    expect(rows.length).toBe(2)
    expect(rows[0].post_title).toBe('Doors; then drinks')
    expect(rows[1].post_title).toBe('Second')
  })

  it('unescapes quotes, backslashes and newlines, and keeps NULL distinct from empty', async () => {
    const path = writeDump(
      `${ddl}\nINSERT INTO \`wp_posts\` VALUES (1,'Kirby\\'s \\"Steakhouse\\"','line1\\nline2\\\\done'),(2,NULL,'');\n`
    )
    const rows: Row[] = []
    await scanDump(path, { wp_posts: (r) => rows.push(r) })

    expect(rows[0].post_title).toBe('Kirby\'s "Steakhouse"')
    expect(rows[0].post_content).toBe('line1\nline2\\done')
    expect(rows[1].post_title).toBeNull()
    expect(rows[1].post_content).toBe('')
  })

  it('ignores tables nobody asked for, and complains about ones that are missing', async () => {
    const path = writeDump(
      `${ddl}\nINSERT INTO \`wp_options\` VALUES (1,'x');\nINSERT INTO \`wp_posts\` VALUES (1,'Only','one');\n`
    )
    const rows: Row[] = []
    await scanDump(path, { wp_posts: (r) => rows.push(r) })
    expect(rows.length).toBe(1)

    await expect(scanDump(path, { wp_usermeta: () => undefined })).rejects.toThrow(/wp_usermeta.*is not in/)
  })
})

describe('PHP unserialize', () => {
  it('reads the shape MEC stores tickets in', () => {
    const tickets = phpUnserializeMap(
      'a:1:{i:1;a:3:{s:4:"name";s:11:"Member Rate";s:5:"price";s:2:"25";s:9:"unlimited";s:1:"1";}}'
    )
    const first = tickets['1'] as Record<string, unknown>
    expect(phpString(first as never, 'name')).toBe('Member Rate')
    expect(phpString(first as never, 'price')).toBe('25')
  })

  it('counts string lengths in bytes, not characters', () => {
    // "🎳 Bowling" is 12 bytes and 10 JS characters.
    const parsed = phpUnserialize('a:2:{s:4:"name";s:12:"🎳 Bowling";s:2:"ok";b:1;}') as Record<string, unknown>
    expect(parsed.name).toBe('🎳 Bowling')
    expect(parsed.ok).toBe(true)
  })

  it('treats empty and a:0:{} as nothing, and refuses what it does not understand', () => {
    expect(phpUnserializeMap('')).toEqual({})
    expect(phpUnserializeMap('a:0:{}')).toEqual({})
    expect(() => phpUnserialize('O:8:"stdClass":0:{}')).toThrow(/unsupported serialized type/)
  })
})

describe('text mapping', () => {
  it('decodes the entities WordPress stores in titles', () => {
    expect(decodeEntities('Anne Marie&#8217;s Catering &amp; Events')).toBe('Anne Marie’s Catering & Events')
    expect(decodeEntities('Coffee Talkin&rsquo;')).toBe('Coffee Talkin’')
  })

  it('splits the address formats MEC venues actually use', () => {
    expect(parseUsAddress('123 N Loop 1604 E, San Antonio, TX 78232')).toEqual({
      address: '123 N Loop 1604 E', city: 'San Antonio', state: 'TX', zipCode: '78232',
    })
    expect(parseUsAddress('8142 Broadway, San Antonio, Texas 78209')).toEqual({
      address: '8142 Broadway', city: 'San Antonio', state: 'TX', zipCode: '78209',
    })
    expect(parseUsAddress('19110 Stone Oak Pkwy, 78258')).toEqual({
      address: '19110 Stone Oak Pkwy', city: null, state: null, zipCode: '78258',
    })
  })

  it('leaves a city null rather than guessing one', () => {
    expect(parseUsAddress('I 410 and jones Maltsberger')).toEqual({
      address: 'I 410 and jones Maltsberger', city: null, state: null, zipCode: null,
    })
    expect(parseUsAddress('')).toEqual({ address: null, city: null, state: null, zipCode: null })
  })

  it('summarises HTML content into plain text', () => {
    expect(summarise('<h1>Escape the Office</h1><p>Join <strong>BASA</strong>.</p>')).toBe('Escape the Office Join BASA.')
    expect(summarise('<p>&nbsp;</p>')).toBeNull()
  })
})

describe('event times', () => {
  it('converts MEC 12-hour fields, and rejects nonsense', () => {
    expect(to24Hour('4', '30', 'PM')).toEqual({ hour: 16, minute: 30 })
    expect(to24Hour('12', '0', 'AM')).toEqual({ hour: 0, minute: 0 })
    expect(to24Hour('12', '0', 'PM')).toEqual({ hour: 12, minute: 0 })
    expect(to24Hour('13', '0', 'PM')).toBeNull()
    expect(to24Hour('4', '30', '')).toBeNull()
  })

  it('reads a wall clock as San Antonio time on both sides of the DST boundary', () => {
    // Central Daylight Time, UTC-5.
    expect(wallClockToUtc(2026, 10, 13, 16, 30).toISOString()).toBe('2026-10-13T21:30:00.000Z')
    // Central Standard Time, UTC-6.
    expect(wallClockToUtc(2026, 1, 14, 8, 30).toISOString()).toBe('2026-01-14T14:30:00.000Z')
  })

  it('reads an instant back as San Antonio wall clock', () => {
    expect(wallClockPartsInEventZone(new Date('2025-02-28T15:00:00Z')))
      .toEqual({ year: 2025, month: 2, day: 28, hour: 9, minute: 0 })
    // Same wall clock, one hour less of UTC offset: this is CDT.
    expect(wallClockPartsInEventZone(new Date('2025-03-14T14:00:00Z')))
      .toEqual({ year: 2025, month: 3, day: 14, hour: 9, minute: 0 })
  })

  it('keeps a repeating event at the same local time across a DST change', () => {
    // "Brewing With BASA" recurs at 9:00 AM on Feb 28, Mar 14 and Mar 28 2025.
    // Adding 14 days of milliseconds to the first instant would leave every later
    // occurrence an hour late once Central moves to daylight time on March 9.
    const first = wallClockToUtc(2025, 2, 28, 9, 0)
    const second = wallClockToUtc(2025, 3, 14, 9, 0)

    expect(first.toISOString()).toBe('2025-02-28T15:00:00.000Z')
    expect(second.toISOString()).toBe('2025-03-14T14:00:00.000Z')
    expect(wallClockPartsInEventZone(second).hour).toBe(9)

    const naive = new Date(first.getTime() + 14 * 24 * 60 * 60 * 1000)
    expect(wallClockPartsInEventZone(naive).hour).toBe(10)
  })

  it('does not shift an event stored as the site would render it', () => {
    const stored = wallClockToUtc(2026, 10, 13, 16, 30)
    const rendered = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago', hour: 'numeric', minute: '2-digit', hour12: true,
    }).format(stored)
    expect(rendered).toBe('4:30 PM')
  })
})
