# WordPress redirect map

**Generated** by `pnpm migrate:urls` from the production dump. Do not edit by hand —
change `scripts/migrate/url-inventory.ts` and regenerate.

Every public URL `businessassociationsa.com` answers on today, and where it goes when
the domain points at basa-app (#70, #71). Those URLs carry inbound links and search
traffic; cutting over without this throws that away.

## Summary

| Type | URLs | 301 | 410 |
|---|---|---|---|
| post (syndicated) | 2418 | 0 | 2418 |
| event | 259 | 259 | 0 |
| page | 41 | 36 | 5 |
| product | 15 | 15 | 0 |
| post (BASA) | 4 | 4 | 0 |
| **total** | **2737** | **314** | **2423** |

## The one big decision

2423 URLs return **410 Gone** rather than redirecting. 2418 of them are the
Feedzy-syndicated "San Antonio News" posts — articles BASA neither wrote nor owns, which were never going to
be migrated (#35). Redirecting thousands of them to a single page is a soft 404: search
engines treat a redirect to irrelevant content as deception, and it can drag down the pages
that do matter. 410 says the true thing — this is gone, stop asking.

The remaining 5 are plugin internals — BadgeOS assertion/evidence pages and a
PeepSo interstitial — which mean nothing without the plugin that served them.

The 4 genuinely BASA-authored posts (3 podcasts, 1 BASA News) redirect to `/blog` instead,
and are listed below so they can be re-pointed once the news feature is rescoped.

## Pages

| URL | Goes to | Why |
|---|---|---|
| `/` | `/` | front page |
| `/activity-2/` | `/` | community dropped; duplicate PeepSo page |
| `/activity/` | `/` | community dropped; no equivalent anywhere |
| `/adverts/` | `/resources` | perks dropped; resources is the nearest section |
| `/adverts/add/` | `/resources` | perks dropped (#35) |
| `/adverts/manage/` | `/resources` | perks dropped (#35) |
| `/assertion-page/` | **410** | BadgeOS plumbing; badges dropped (#35) |
| `/badge-page/` | **410** | BadgeOS plumbing; badges dropped (#35) |
| `/cart/` | `/membership` | shop dropped |
| `/checkout/` | `/membership/join` | shop dropped; joining is the remaining checkout |
| `/evidence-page/` | **410** | BadgeOS plumbing; badges dropped (#35) |
| `/external-link/` | **410** | a PeepSo interstitial, meaningless off that plugin |
| `/groups-2/` | `/` | community dropped; duplicate PeepSo page |
| `/groups/` | `/` | community dropped; no equivalent anywhere |
| `/issuer-page/` | **410** | BadgeOS plumbing; badges dropped (#35) |
| `/login/` | `/auth/sign-in` | equivalent page |
| `/members-2/` | `/dashboard` | directory lives behind sign-in now |
| `/members/` | `/dashboard` | directory lives behind sign-in now |
| `/membership-account/` | `/dashboard` | equivalent page |
| `/membership-account/membership-billing/` | `/dashboard` | billing lives in the dashboard now |
| `/membership-account/membership-cancel/` | `/dashboard` | billing lives in the dashboard now |
| `/membership-account/membership-checkout/` | `/membership/join` | equivalent page |
| `/membership-account/membership-confirmation/` | `/membership` | no per-order page; the section index is the nearest thing |
| `/membership-account/membership-invoice/` | `/dashboard` | billing lives in the dashboard now |
| `/membership-account/membership-levels/` | `/membership/pricing` | equivalent page |
| `/membership-account/your-profile/` | `/dashboard` | equivalent page |
| `/membership-levels/` | `/membership/pricing` | equivalent page |
| `/messages/` | `/` | community dropped; no equivalent anywhere |
| `/my-account/` | `/dashboard` | equivalent page |
| `/news/` | `/blog` | the section index; the posts themselves are gone, see below |
| `/notifications/` | `/dashboard` | community dropped; the dashboard is the nearest thing |
| `/password-recover/` | `/auth/forgot-password` | equivalent page |
| `/password-reset/` | `/auth/reset-password` | equivalent page |
| `/perks/` | `/resources` | perks dropped; resources is the nearest section |
| `/podcasts/` | `/blog` | nearest section until news is rescoped |
| `/privacy-policy/` | `/` | NO EQUIVALENT - basa-app has no privacy policy page |
| `/profile/` | `/dashboard` | the member’s own page is the dashboard now |
| `/refund_returns/` | `/contact` | NO EQUIVALENT - basa-app has no refund policy page |
| `/register/` | `/auth/sign-up` | equivalent page |
| `/search/` | `/` | no site-wide search in basa-app |
| `/shop/` | `/membership` | shop dropped; memberships were the only thing really sold |

## BASA-authored posts

| URL | Title | Goes to |
|---|---|---|
| `/basa-launches-new-member-portal/` | BASA Launches New Member Portal | `/blog` |
| `/dec-6-2021/` | Episode 17 | `/blog` |
| `/december-6th-2021/` | Episode 16 | `/blog` |
| `/episode-15-thanksgiving/` | Episode 15 | `/blog` |

## Events, products and syndicated posts

259 event URLs map one to one — the importer preserves the WordPress
slug, so `/events/<slug>/` becomes `/events/<slug>`.

15 WooCommerce product URLs go to `/membership/pricing`; they were membership
products, and the shop is dropped (#35).

The syndicated posts are not listed individually here — there are thousands, and they are all
the same disposition. `pnpm migrate:urls --nginx <file>` emits every one of them.

## Applying it

```bash
pnpm migrate:urls --nginx redirects.conf
```

The file is one exact-match `location` per URL (each with and without its trailing slash),
and it is included **inside** the `server` block for `businessassociationsa.com`, after the
host the redirects point at has been set:

```nginx
set $basa_target https://app.businessassociationsa.com;   # "" once the app itself is on the apex
include /etc/nginx/basa-redirects.conf;
```

The cutover kit in `nginx/cutover/` does exactly this. It was two `map` blocks at first, but
`map` is http-context only and CloudPanel's nginx.conf already declares one, which fixes the
hash sizes before these 147-byte keys can ask for bigger ones.

Exact locations are a sorted array searched by binary search, not thousands of regex tests.

Keys are stored **decoded**, because nginx matches `$uri` after percent-decoding it - 19 of
these slugs contain encoded emoji and would silently never match otherwise. Destinations keep
the encoded slug, which is what the importer wrote to `Event.slug`.

**Test after cutover, not before** — before it, every one of these still resolves to WordPress
and proves nothing.
