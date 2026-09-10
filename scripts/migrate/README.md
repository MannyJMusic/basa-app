# WordPress migration scripts

Importers that bring the live WordPress site's data into basa-app, for Phase 3 of
[`.claude/PLAN.md`](../../.claude/PLAN.md).

| Script | Issue | Brings over |
|---|---|---|
| `import-events.ts` | #57 | MEC events, venues, organizers, ticket tiers |
| `import-members.ts` | #58 | PMPro members, tiers, chapters, expiry dates (not written yet) |

## Running it

```bash
./scripts/pull-backups.sh                 # newest dumps into ./backups/ (gitignored)
pnpm migrate:events                       # dry run: reports, writes nothing
pnpm migrate:events --commit              # apply
pnpm migrate:events --images ./media      # also fetch the featured images
pnpm migrate:events --dump path/to.sql.gz # a dump other than the newest
pnpm migrate:events --limit 20            # stop after 20 events, for a quick look
```

Dry run is the default. Every write is an upsert keyed on the WordPress id, so a
second run reports everything unchanged — that is the check that the mapping is
stable, and it is worth doing after any change here.

## Why a dump and not the REST API

The obvious source is the WP REST API with the `basa-mec-api` plugin from
`BASA-AI-CREW/wordpress-plugin/`, which is what #57 originally proposed. It is the
wrong source for this site:

- **MEC keeps venues and organizers as taxonomy _terms_**, with the address,
  latitude, longitude and photo in term meta. The `mec_location` / `mec_organizer`
  _post types_ that the plugin exposes carry none of it — all twelve location posts
  on this site have no meta at all, while the 112 location terms have everything.
- The plugin is deleted along with the AI crew (#36), and WordPress itself is
  retired in Phase 6 (#71). A dump keeps the import re-runnable afterwards, and
  reproducible from a fixed input.
- `wp/v2/mec-events` takes longer than 20 seconds to answer for one event on this
  host. Reading the whole 45 MB dump takes about a second.

The dumps come from the nightly cron on the production host and are pulled down by
`scripts/pull-backups.sh`. They contain member PII and password hashes: they are
gitignored, and they stay that way.

## What the importer does with MEC's quirks

Everything here was found in the data, not assumed:

- **Times are wall clock with no offset.** MEC stores `2026-10-13`, hour `4`,
  minutes `30`, ampm `PM`. They are read as `America/Chicago` and stored as UTC,
  because that is how the event pages format them. Note the WordPress site's own
  `timezone_string` is `America/Mexico_City` — wrong for San Antonio, and ignored.
- **`mec_location_id` and `mec_organizer_id` of `1` mean "none selected".** Term 1
  on this site is a `category` term called "BASA News". 261 of 269 events have no
  organizer and 52 have no venue for this reason, not because of a mapping bug.
- **Two events point at a location _post_ id** rather than a term. Those keep the
  name and get no address, because the post does not have one.
- **Ticket prices are free text.** "25", "$25", "FREE" and blank all appear; blank
  is how MEC writes a free ticket, so blank and FREE both import as 0.
- **Attachment URLs still name `member.businessassociationsa.com`**, a hostname the
  site no longer answers on. Image URLs are rebuilt against the canonical site URL.
- **Titles occasionally contain markup** (`<center>…</center>`) and entities
  (`Anne Marie&#8217;s`). Both are stripped or decoded, since React escapes on render.
- **Recurrence rules are not trustworthy; the materialized dates are.** MEC keeps
  repeat rules in post meta *and* the occurrences it already expanded into
  `wp_mec_dates`. They disagree. Of the 15 events flagged as recurring, 8 carry an
  identical `until` of 2020-09-30 while starting between October 2020 and September
  2021 — the rule ends before the event begins, and MEC gives each of them exactly
  one date. The importer trusts `wp_mec_dates` and reports the rest.
- **Two "series" are not events.** *"Deadline for Members To Members Email"* and
  *"Deadline for Social Content on BASA Pages"* are internal reminders on the events
  calendar with no end date, which MEC expanded into 600 weekly dates each running
  to 2033 — 1,200 of the 1,474 rows in that table. Anything past
  `MAX_SERIES_OCCURRENCES` imports as a single event and is named in the report.
- **The 5 real series import as a parent plus its later occurrences.** The first
  date is the event itself; dates two onwards are their own `Event` rows with
  `parentEventId` set, so registrations, capacity and tickets attach per date.
  Occurrence *dates* come from `wp_mec_dates`, but the *time of day* comes from the
  parent event — that table holds absolute timestamps MEC computed in the site's
  own `America/Mexico_City`, which drifts an hour from Central for half the year
  since Mexico dropped daylight saving in 2022. Verified on "Brewing With BASA":
  its Feb 28 2025 date stores `15:00Z` and its Mar 14 date `14:00Z`, both rendering
  9:00 AM.
- **An occurrence is never rewritten once imported**, so one that was moved or
  cancelled by hand survives a re-run. That is also why the ticket-tier count is
  higher on a first run than on later ones.

## Featured images are not rehosted yet

basa-app has no media store: no volume on the app container, no blob container in
use, and `public/` is baked into the image at build time. So `Event.image` and
`Venue.image` hold the WordPress URL, and `--images <dir>` fetches every referenced
file to a directory with a `manifest.json` mapping URL to filename.

That is deliberately short of #57's "download and store rather than hotlink": where
the files should live is a hosting decision, and the images survive being downloaded
now regardless of which store wins. It has to be settled before WordPress is turned
off in Phase 6 — at that point the URLs stop resolving.

## The pieces

```
lib/mysqldump.ts       streaming reader for a mysqldump, plain or gzipped
lib/php-unserialize.ts PHP unserialize() for serialized meta (byte-accurate)
lib/wp-source.ts       loads posts, meta, terms and options into memory
lib/text.ts            entity decoding, address splitting, summarising
lib/timezone.ts        wall clock in a zone to UTC, across DST
lib/report.ts          reconciliation report and argv parsing
```

`src/__tests__/unit/wp-import-mapping.test.ts` covers the parsers, which are the
parts that can corrupt data without raising an error.
