# Review sandbox

`https://dev.businessassociationsa.com` serves the `dev` branch for review before a `dev` to `main` release. A push to `dev` runs the same build, unit, integration, Docker image, and browser checks as a production release; after they pass, the sandbox deploy job streams `.github/scripts/deploy-sandbox.sh` to the VPS. The job can also be rerun with `gh workflow run deploy.yml --ref dev`.

The sandbox uses `/opt/basa-sandbox`, Compose project `basa-sandbox`, image `basa-app:sandbox-current`, a private PostgreSQL volume, and app port `127.0.0.1:3002`. Production remains in `/opt/basa-app` on port 3000. Its Nginx site is `nginx/dev.businessassociationsa.com.conf`. A Let's Encrypt certificate named `basa-sandbox` renews through `/var/www/acme`.

Nginx requires HTTP Basic Auth for the entire site and sends `X-Robots-Tag: noindex, nofollow, noarchive`. The review account is in `/etc/nginx/basa-sandbox.htpasswd`; its generated password is stored root-only at `/root/basa-sandbox-review-password`. Review admin and demo passwords are in `/opt/basa-sandbox/.env.sandbox`, also root-only. Share credentials directly with reviewers, never in Git or issue comments.

The database is a sanitized production snapshot. `scripts/refresh-sandbox-data.sh` stops the app, checks the production schema fingerprint, streams a `pg_dump` directly into the isolated database, removes private tables, replaces identifying fields and IDs, verifies the result, seeds one independent review admin, and only then restarts the app. A failure leaves the app stopped. New production columns require a sanitizer review before another refresh. The running app forces Stripe, Mailgun, SMTP, Anthropic, Blob, Google OAuth, and membership sales off. This prevents real charges and outgoing mail; payment and email integrations must be tested in CI or in a separately configured test environment.

## First-time host setup

1. Clone the `dev` branch to `/opt/basa-sandbox` with a normal `022` umask, and create a mode `0600` `.env.sandbox` from `.env.sandbox.example` with independent random values. Create `uploads/` owned by UID 1001.
2. Create the Basic Auth password file and the HTTP challenge vhost. Issue the certificate with `certbot certonly --webroot -w /var/www/acme --cert-name basa-sandbox -d dev.businessassociationsa.com`.
3. Install the checked-in Nginx vhost at `/etc/nginx/sites-enabled/dev.businessassociationsa.com.conf`, then run `nginx -t` and reload Nginx.
4. Merge this workflow into `dev` or run `gh workflow run deploy.yml --ref dev`. The first deployment refreshes and sanitizes the data automatically when no `.sandbox-sanitized` marker exists. To refresh the data later, run:

   ```sh
   cd /opt/basa-sandbox
   bash scripts/refresh-sandbox-data.sh
   ```

## Checks

`curl -fsS http://127.0.0.1:3002/api/health` on the VPS should report a connected database. An unauthenticated HTTPS request to the same path on the public dev domain must return 401 with a valid certificate. An authenticated request must return 200. Use `docker compose --env-file .env.sandbox -f docker-compose.sandbox.yml ps` for container state.
