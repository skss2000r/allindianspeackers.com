# All Indian Speakers

React Router server-rendered storefront and speaker directory. Hostinger store checkout is integrated; speaker profiles, booking requests, and email notifications are handled by this app.

## Run locally

Use Node.js 22.12 or newer in the 22.x or 24.x release lines.

```sh
npm ci
npm run build
npm start
```

For local development, run `npm run dev`. Configure the environment variables below in a local, untracked `apps/web/.env` file or in your hosting dashboard. Do not commit real values.

## Deploy to Hostinger

This is a server-rendered Node.js app; it cannot be deployed as a static GitHub Pages site. In Hostinger, create a Node.js web app from this repository and use:

- Root directory: repository root (`./`), so npm installs the monorepo workspace and its root lockfile.
- Node.js: 22.12+ (22.x or 24.x).
- Build command: `npm run build`.
- Output directory: `apps/web/build` (React Router's standard build folder). In Vercel, set the project root to `apps/web` and use the React Router preset.
- Server entry file, if requested: `apps/web/build/server/index.js`.
- Start command: `npm start`.

Set the required environment variables in Hostinger before accepting real submissions:

- `APP_SECRET`: at least 32 random characters. Keep it stable; changing it makes existing encrypted records unreadable.
- `DATA_DIR`: an absolute, writable, persistent directory outside Hostinger's per-deployment build folders. The app creates the directory if needed. Confirm the path survives redeploys; speaker records and uploaded photos are stored there.
- `SITE_URL`: the canonical HTTPS origin, for example `https://allindianspeakers.com`.
- `ADMIN_EMAIL`: mailbox that receives profile approval and booking copies.
- `SMTP_HOST`, `SMTP_PORT` (usually 465), `SMTP_USER`, `SMTP_PASS`, and optionally `MAIL_FROM`: required for transactional email.

The root `package-lock.json` is committed; deploy with npm so Hostinger installs the locked workspace dependencies. This repository's GitHub Actions workflow checks the Node build only. Vercel can deploy the SSR site from the `apps/web` root using its React Router preset. Configure `APP_SECRET`, `DATA_DIR`, and `SITE_URL` in Vercel. The app writes its database and photos to local disk; Vercel does not provide durable local storage, so profile registration and bookings need a persistent database and file storage before they should be enabled.

## Features

- Ten-language switcher: English, Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, and Punjabi.
- Speaker registration, profile approval, directory, booking requests, and private profile management links.
- Email notifications for profile submissions and booking decisions.
- Commission terms at `/terms`; the current rate is defined in `apps/web/src/lib/config.ts`.
- Payment collection and speaker payouts are not automated by this app.

## Security and operations

- Confidential speaker and client details are encrypted at rest. Signed, expiring links, rate limits, same-origin checks, input validation, and response security headers are applied by the app.
- Keep `APP_SECRET` and SMTP credentials only in the Hostinger environment settings. Back up the persistent `DATA_DIR` separately.
- Payment splitting is not implemented; the owner collects payment and pays speakers manually.
