import { timingSafeEqual } from 'node:crypto';
import { redirect } from 'react-router';
import type { Route } from './+types/auth.linkedin.callback';
import { encryptJson } from '@/lib/security.server';
import { siteOrigin } from '@/lib/site-origin.server';

const STATE_COOKIE = 'linkedin_import_state';
const PROFILE_COOKIE = 'linkedin_profile_import';
const clearStateCookie = (secure: boolean) => `${STATE_COOKIE}=; HttpOnly; SameSite=Lax; Path=/auth/linkedin/callback; Max-Age=0${secure ? '; Secure' : ''}`;
const returnToForm = (error: string, secure: boolean) => redirect(`/become-a-speaker?linkedinError=${encodeURIComponent(error)}`, {
	headers: {
		'Cache-Control': 'no-store, max-age=0',
		'Referrer-Policy': 'no-referrer',
		'X-Robots-Tag': 'noindex, nofollow',
		'Set-Cookie': clearStateCookie(secure),
	},
});

const timingSafeStringEqual = (left: string, right: string): boolean => {
	const leftBytes = Buffer.from(left);
	const rightBytes = Buffer.from(right);
	return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
};

export async function loader({ request }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const secure = url.protocol === 'https:';
	const providerError = url.searchParams.get('error');
	if (providerError) return returnToForm('cancelled', secure);

	const state = url.searchParams.get('state') ?? '';
	const cookie = request.headers.get('cookie') ?? '';
	const savedState = cookie.split(';').map(part => part.trim()).find(part => part.startsWith(`${STATE_COOKIE}=`))?.slice(STATE_COOKIE.length + 1) ?? '';
	if (!state || !savedState || state.length !== savedState.length || !timingSafeStringEqual(state, savedState)) {
		return returnToForm('state', secure);
	}

	const code = url.searchParams.get('code');
	const clientId = process.env.LINKEDIN_CLIENT_ID;
	const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
	if (!code || !clientId || !clientSecret) return returnToForm('unavailable', secure);

	const redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${siteOrigin(request)}/auth/linkedin/callback`;

	try {
		const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				grant_type: 'authorization_code',
				code,
				redirect_uri: redirectUri,
				client_id: clientId,
				client_secret: clientSecret,
			}),
			signal: AbortSignal.timeout(8000),
		});
		if (!tokenResponse.ok) return returnToForm('unavailable', secure);

		const token = await tokenResponse.json() as { access_token?: unknown };
		if (typeof token.access_token !== 'string' || token.access_token.length > 8192) return returnToForm('unavailable', secure);

		const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
			headers: { Authorization: `Bearer ${token.access_token}` },
			signal: AbortSignal.timeout(8000),
		});
		if (!profileResponse.ok) return returnToForm('unavailable', secure);

		const linkedIn = await profileResponse.json() as { name?: unknown; email?: unknown };
		const name = typeof linkedIn.name === 'string' ? linkedIn.name.trim().slice(0, 80) : '';
		const email = typeof linkedIn.email === 'string' ? linkedIn.email.trim().slice(0, 254) : '';
		if (!name && !email) return returnToForm('empty', secure);

		const headers = new Headers({
			'Cache-Control': 'no-store, max-age=0',
			'Referrer-Policy': 'no-referrer',
			'X-Robots-Tag': 'noindex, nofollow',
			'Set-Cookie': clearStateCookie(secure),
		});
		const secureAttribute = secure ? '; Secure' : '';
		headers.append('Set-Cookie', `${PROFILE_COOKIE}=${encryptJson({ name, email })}; HttpOnly; SameSite=Lax; Path=/become-a-speaker; Max-Age=120${secureAttribute}`);

		return redirect('/become-a-speaker?linkedinImported=1', { headers });
	} catch {
		// Keep OAuth credentials, codes, and access tokens out of logs and responses.
		return returnToForm('unavailable', secure);
	}
}

export function headers() {
	return {
		'Cache-Control': 'no-store, max-age=0',
		'Referrer-Policy': 'no-referrer',
		'X-Robots-Tag': 'noindex, nofollow',
	};
}
