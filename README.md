# All Indian Speakers

React Router (SSR) storefront + speaker/celebrity directory. Sessions and checkout come from the Hostinger store; speaker profiles, booking requests and email notifications are handled by this app.

## Run

```bash
npm install
cp apps/web/.env.example apps/web/.env   # fill in every value
npm run build
npm start
```

## Features added in this version
- 10-language switcher (English, Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi) on the hero, listing, selection/payment page and footer. Language is remembered in a cookie and rendered server-side.
- "Add your profile" band under the hero and in the header → `/become-a-speaker`: name, bio, category, languages, fee, custom photo, private contact, payout account (UPI or bank), mandatory acceptance of terms.
- `/terms`: commission terms (rate in `apps/web/src/lib/config.ts`, currently 20%).
- `/speakers`, `/speakers/:slug`: public directory (approved profiles only) with booking-request form.
- Notifications: speaker is emailed on every request with Accept/Decline; client is emailed on receipt and again when the speaker accepts or declines. Site owner gets a copy.
- `/manage`: speakers edit profile, photo, fee and payout details through a private emailed link.

## Workflow
1. Speaker registers → profile is **pending**; owner receives an approval link at `ADMIN_EMAIL`.
2. Owner approves → profile goes public, speaker is emailed.
3. Client sends a request → speaker emailed → speaker accepts/declines on a confirmation page (links never act on GET, so email scanners cannot trigger them) → client emailed.
4. Payment and payout are **not automated** by this app: the owner collects payment (Hostinger checkout / invoice) and pays the speaker's share to the stored UPI/bank account. Automatic split payouts need a payments provider with marketplace support (e.g. Razorpay Route) and KYC; the stored payout details are ready for that integration.

## Security measures
- Speaker contact and payout details, and client contact details, are encrypted at rest (AES-256-GCM, keys derived from `APP_SECRET`); email lookups use a keyed hash. Public pages and APIs receive an explicit public projection only.
- Client details are revealed to a speaker only after acceptance; speaker contact details are never revealed to clients.
- Signed, expiring, purpose-bound links (HMAC-SHA256, constant-time compare); booking responses are single-use.
- Strict response headers in production (CSP, HSTS, frame denial, no-referrer, nosniff, permissions policy).
- Per-IP rate limits on every form, honeypot field, same-origin check, zod validation and length caps, output escaping in pages and emails.
- Uploads: signature-checked JPEG/PNG only, 2 MB cap, EXIF/GPS and text metadata stripped, random file names, served with `nosniff` and a sandbox CSP.
- Email links use `SITE_URL`, not the request Host header (prevents link poisoning).
- Merchant product HTML is sanitized server-side before rendering; cart data from localStorage is validated.
- Secrets, the local database folder and PocketBase data are git-ignored.

No website can be made "impossible to crack". Keep dependencies updated, keep `APP_SECRET`/SMTP passwords private, use HTTPS only, and back up `DATA_DIR`. `npm audit` reports only build-time tooling advisories (Tailwind 3 toolchain) that do not ship to visitors.
