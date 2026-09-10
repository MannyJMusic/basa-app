# WordPress migration scripts

Importers that bring the live WordPress site's data into basa-app, for Phase 3 of
[`.claude/PLAN.md`](../../.claude/PLAN.md).

| Script | Issue | Brings over |
|---|---|---|
| `import-events.ts` | #57 | MEC events, venues, organizers, ticket tiers |
| `import-members.ts` | #58 | PMPro members, chapters, membership history |

## Running it

```bash
./scripts/pull-backups.sh                 # newest dumps into ./backups/ (gitignored)
pnpm migrate:events                       # dry run: reports, writes nothing
pnpm migrate:events --commit              # apply
pnpm migrate:events --images ./media      # also fetch the featured images
pnpm migrate:events --dump path/to.sql.gz # a dump other than the newest
pnpm migrate:events --limit 20            # stop after 20 events, for a quick look

pnpm migrate:members                      # dry run
pnpm migrate:members --commit             # apply
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
- **15 events recur.** They import as their first occurrence only, and are listed in
  the report, until recurring events exist in the model (#55).

## Featured images are not rehosted yet

basa-app has no media store: no volume on the app container, no blob container in
use, and `public/` is baked into the image at build time. So `Event.image` and
`Venue.image` hold the WordPress URL, and `--images <dir>` fetches every referenced
file to a directory with a `manifest.json` mapping URL to filename.

That is deliberately short of #57's "download and store rather than hotlink": where
the files should live is a hosting decision, and the images survive being downloaded
now regardless of which store wins. It has to be settled before WordPress is turned
off in Phase 6 — at that point the URLs stop resolving.

## What the members importer assumes

It is a much smaller job than "migrate the membership base" suggests. Across 314
PMPro rows there are 140 people, 296 expired memberships, and 14 active rows
belonging to 5 users — four of whom are BASA staff accounts whose memberships
have no end date. There is no paying membership base to move; there is a contact
list with history, and the history is the valuable part.

Following the decisions on #51 and #35:

- **Everyone imports as `EXPIRED`**, with their PMPro levels recorded in
  `LegacyMembership`. Market, Mission and Action have no equivalent in the launch
  product, so no `membershipTier` is set at all — placing the handful of current
  members onto new tiers is a decision per member, not a lookup table.
- **Chapter comes from `wp_pmpro_membership_levels_groups`**, never from parsing
  the level name: level 27 is `SS w Associate` with a lowercase w, and `SS W` has
  to be tested before `SS`. The database's group names (`South Side2East`,
  `Center of The City`, `South Side2West`) are mapped to the association's.
- **South Side West is retired but representable**: created as an inactive
  chapter so its members can still be attached.
- **82 people held levels in more than one chapter.** `Member.chapterId` takes the
  most recent; every chapter they held is in `LegacyMembership`.
- **No credentials and no email.** WordPress hashes are phpass and basa-app uses
  bcrypt, so nothing carries over. Accounts import with no password, `INACTIVE`,
  and need a claim or reset flow before anyone can sign in. The importer never
  sends anything.
- **Imported members are hidden from the directory.** They are lapsed contacts,
  not current listings; whoever renews opts back in.
- **An email that already belongs to a basa-app account is never written over** —
  a seeded admin or a guest ticket buyer keeps their account, and the row is
  reported as skipped.

Business details are assembled from the three places WordPress kept them: PeepSo
profile fields (numbered — the labels live in `peepso_user_field` posts, where
103 is "Main Company"), WooCommerce `billing_*`, and PMPro's own `pmpro_b*`.

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
