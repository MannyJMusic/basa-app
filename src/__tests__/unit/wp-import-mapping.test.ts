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
import { loadMedia, storedImage, fileNameFor, serialiseManifest, Media } from '../../../scripts/migrate/lib/media'

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

describe('imported media paths (#111)', () => {
  const media = (manifest: Record<string, string>, failed: string[] = []): Media => ({
    dir: '/tmp/media',
    manifest,
    failed: new Set(failed),
  })
  const WP = 'https://businessassociationsa.com/wp-content/uploads/2024/01/mixer.jpg'

  it('leaves the WordPress URL alone when media is not managed', () => {
    // --images is opt-in; without it the importer must behave exactly as before.
    expect(storedImage(null, WP)).toBe(WP)
  })

  it('stores a local uploads path once the file has been fetched', () => {
    expect(storedImage(media({ [WP]: 'mixer.jpg' }), WP)).toBe('/uploads/mixer.jpg')
  })

  it('is stable across runs, so a second import reports no change', () => {
    // The whole point of persisting the manifest: recomputing the WordPress URL
    // here would rewrite every row and report all of them as updated.
    const m = media({ [WP]: 'mixer.jpg' })
    expect(storedImage(m, WP)).toBe(storedImage(m, WP))
    expect(storedImage(m, WP)).not.toBe(WP)
  })

  it('keeps the WordPress URL for a file not fetched yet', () => {
    // First run: the sync happens before anything is downloaded.
    expect(storedImage(media({}), WP)).toBe(WP)
  })

  it('nulls an image that could not be fetched rather than storing a dead link', () => {
    // 14 venue photos were already 404 on WordPress before any of this began.
    expect(storedImage(media({}, [WP]), WP)).toBeNull()
  })

  it('never stores a PDF as an image', () => {
    // Four "featured images" are flyers. An <img> at a PDF renders broken.
    const pdf = 'https://businessassociationsa.com/wp-content/uploads/flyer.pdf'
    expect(storedImage(media({ [pdf]: 'flyer.pdf' }), pdf)).toBeNull()
    expect(storedImage(media({ [pdf]: 'FLYER.PDF' }), pdf)).toBeNull()
  })

  it('passes a null image through', () => {
    expect(storedImage(media({}), null)).toBeNull()
    expect(storedImage(null, null)).toBeNull()
  })

  it('makes file names safe for the filesystem', () => {
    expect(fileNameFor('https://x.test/a/b/Golf Flyer (2023).png')).toBe('Golf_Flyer__2023_.png')
    expect(fileNameFor('https://x.test/a/../etc/passwd')).toBe('passwd')
  })

  it('returns no media store when --images was not passed', () => {
    expect(loadMedia(null)).toBeNull()
  })

  it('starts empty when the directory has no manifest yet', () => {
    const m = loadMedia('/tmp/basa-media-does-not-exist')
    expect(m).not.toBeNull()
    expect(m!.manifest).toEqual({})
  })

  it('survives a corrupt manifest instead of failing the run', () => {
    const dir = mkdtempSync(join(tmpdir(), 'basa-media-'))
    writeFileSync(join(dir, 'manifest.json'), '{ this is not json')
    expect(loadMedia(dir)!.manifest).toEqual({})
  })

  it('remembers which files could not be fetched, so they do not churn', () => {
    // The bug this guards: without persisting failures, every run rewrites the dead
    // WordPress URL during the sync and nulls it again afterwards, reporting 14
    // venues as updated forever.
    const dir = mkdtempSync(join(tmpdir(), 'basa-media-'))
    const gone = 'https://businessassociationsa.com/wp-content/uploads/deleted.jpg'
    const first = { dir, manifest: { [WP]: 'mixer.jpg' }, failed: new Set([gone]) }

    writeFileSync(join(dir, 'manifest.json'), JSON.stringify(serialiseManifest(first)))
    const second = loadMedia(dir)!

    expect(second.manifest[WP]).toBe('mixer.jpg')
    expect(second.failed.has(gone)).toBe(true)
    expect(storedImage(second, gone)).toBeNull()
    expect(storedImage(second, WP)).toBe('/uploads/mixer.jpg')
  })

  it('serialises a failure as null and a success as its file name', () => {
    const gone = 'https://x.test/gone.jpg'
    const out = serialiseManifest({ dir: '/tmp', manifest: { [WP]: 'mixer.jpg' }, failed: new Set([gone]) })
    expect(out).toEqual({ [WP]: 'mixer.jpg', [gone]: null })
  })

  it('reads back what a previous run wrote', () => {
    const dir = mkdtempSync(join(tmpdir(), 'basa-media-'))
    writeFileSync(join(dir, 'manifest.json'), JSON.stringify({ [WP]: 'mixer.jpg' }))
    expect(storedImage(loadMedia(dir), WP)).toBe('/uploads/mixer.jpg')
  })
})
