/**
 * Server-only security primitives: encryption at rest (AES-256-GCM), signed
 * expiring tokens (HMAC-SHA256), blind indexes, response hardening headers and
 * same-origin checks. Nothing here may be imported by client code.
 *
 * All keys derive from one `APP_SECRET` (min 32 chars) via HKDF with a separate
 * label per purpose, so a leak of one derived key does not expose the others.
 * In production a missing secret is a hard failure: the app refuses to store or
 * read confidential data rather than fall back to a guessable key.
 */
import {
	createCipheriv,
	createDecipheriv,
	createHmac,
	hkdfSync,
	randomBytes,
	timingSafeEqual,
} from 'node:crypto';

let devSecret: Buffer | null = null;

const rootSecret = (): Buffer => {
	const configured = process.env.APP_SECRET;

	if (configured && configured.length >= 32) {
		return Buffer.from(configured, 'utf8');
	}

	if (process.env.NODE_ENV === 'production') {
		throw new Error('APP_SECRET is missing or shorter than 32 characters. Set it before starting the server.');
	}

	// Development only: random per process, so nothing encrypted here is ever readable elsewhere.
	devSecret ??= randomBytes(32);

	return devSecret;
};

const keyCache = new Map<string, Buffer>();

const deriveKey = (label: string): Buffer => {
	const cached = keyCache.get(label);

	if (cached) {
		return cached;
	}

	const key = Buffer.from(hkdfSync('sha256', rootSecret(), 'allindianspeakers/v1', label, 32));

	keyCache.set(label, key);

	return key;
};

export const randomId = (bytes = 16): string => randomBytes(bytes).toString('base64url');

/** AES-256-GCM. Output: `v1.<iv>.<tag>.<ciphertext>` (all base64url). */
export const encryptText = (plain: string): string => {
	const iv = randomBytes(12);
	const cipher = createCipheriv('aes-256-gcm', deriveKey('data-encryption'), iv);
	const ciphertext = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);

	return ['v1', iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), ciphertext.toString('base64url')].join('.');
};

export const decryptText = (blob: string): string => {
	const [version, iv, tag, ciphertext] = blob.split('.');

	if (version !== 'v1' || !iv || !tag || !ciphertext) {
		throw new Error('Unsupported ciphertext');
	}

	const decipher = createDecipheriv('aes-256-gcm', deriveKey('data-encryption'), Buffer.from(iv, 'base64url'));

	decipher.setAuthTag(Buffer.from(tag, 'base64url'));

	return Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64url')), decipher.final()]).toString('utf8');
};

export const encryptJson = (value: unknown): string => encryptText(JSON.stringify(value));
export const decryptJson = <T>(blob: string): T => JSON.parse(decryptText(blob)) as T;

const safeEqual = (a: string, b: string): boolean => {
	const left = Buffer.from(a);
	const right = Buffer.from(b);

	return left.length === right.length && timingSafeEqual(left, right);
};

/** Keyed hash for equality lookups (e.g. email) without storing the plain value. */
export const blindIndex = (value: string): string =>
	createHmac('sha256', deriveKey('blind-index')).update(value.trim().toLowerCase()).digest('base64url');

/** Signed, expiring, purpose-bound token. Not encrypted: put only ids in it. */
export const signToken = (payload: Record<string, string>, ttlSeconds: number): string => {
	const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds })).toString('base64url');
	const mac = createHmac('sha256', deriveKey('signed-token')).update(body).digest('base64url');

	return `${body}.${mac}`;
};

export const verifyToken = (token: string | null | undefined, purpose: string): Record<string, string> | null => {
	if (!token || token.length > 1024) {
		return null;
	}

	const [body, mac] = token.split('.');

	if (!body || !mac) {
		return null;
	}

	const expected = createHmac('sha256', deriveKey('signed-token')).update(body).digest('base64url');

	if (!safeEqual(mac, expected)) {
		return null;
	}

	try {
		const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as Record<string, unknown>;

		if (payload.t !== purpose || typeof payload.exp !== 'number' || payload.exp < Date.now() / 1000) {
			return null;
		}

		return payload as Record<string, string>;
	} catch {
		return null;
	}
};

export const escapeHtml = (value: string): string =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');

/**
 * Browser-facing hardening for page responses (not applied in development,
 * where the builder preview iframes the site and Vite injects inline code).
 */
export const applyPageSecurityHeaders = (headers: Headers): void => {
	if (process.env.NODE_ENV !== 'production') {
		return;
	}

	const csp = [
		"default-src 'self'",
		// React Router streams inline hydration scripts; the analytics hosts are the ones the store runtime loads.
		"script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net",
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
		"font-src 'self' https://fonts.gstatic.com",
		"img-src 'self' data: https:",
		"connect-src 'self' https://api-ecommerce.hostinger.com https://checkout.hostinger.com https://www.googletagmanager.com https://*.google-analytics.com https://*.facebook.com",
		"frame-ancestors 'none'",
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self'",
		'upgrade-insecure-requests',
	].join('; ');

	const defaults: Record<string, string> = {
		'Content-Security-Policy': csp,
		'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
		'X-Content-Type-Options': 'nosniff',
		'X-Frame-Options': 'DENY',
		// Token links (manage / accept / approve) must never leak through the Referer header.
		'Referrer-Policy': 'no-referrer',
		'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(self)',
		'Cross-Origin-Opener-Policy': 'same-origin',
	};

	for (const [name, value] of Object.entries(defaults)) {
		headers.set(name, value);
	}

	headers.delete('X-Powered-By');
};

/** Defence in depth for state-changing form posts: a browser-supplied Origin must match Host. */
export const assertSameOrigin = (request: Request): void => {
	const origin = request.headers.get('origin');

	if (!origin) {
		return;
	}

	const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');

	try {
		if (new URL(origin).host !== host) {
			throw new Response('Cross-origin request blocked', { status: 403 });
		}
	} catch (error) {
		if (error instanceof Response) {
			throw error;
		}

		throw new Response('Bad origin', { status: 400 });
	}
};

const CANONICAL_ORIGIN = 'https://allindianspeakers.com';

/**
 * Origin used for links placed in emails. Never taken blindly from the Host
 * header: an attacker could send `Host: evil.example` with a victim's address
 * and have the victim emailed a genuine, signed link that points at their site.
 * SITE_URL wins; otherwise only our own hosts are accepted.
 */
export const trustedOrigin = (request: Request): string => {
	const configured = process.env.SITE_URL?.trim().replace(/\/+$/, '');

	if (configured) {
		return configured;
	}

	const { hostname, host } = new URL(request.url);

	if (hostname === 'localhost' || hostname === '127.0.0.1') {
		return `http://${host}`;
	}

	return CANONICAL_ORIGIN;
};
