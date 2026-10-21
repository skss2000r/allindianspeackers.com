import { timingSafeEqual } from 'node:crypto';
import { useEffect } from 'react';
import { data } from 'react-router';
import type { Route } from './+types/auth.linkedin.callback';
import { siteOrigin } from '@/lib/site-origin.server';

type LinkedInProfile = { name: string; email: string };

const STATE_COOKIE = 'linkedin_import_state';
const clearStateCookie = (secure: boolean) => `${STATE_COOKIE}=; HttpOnly; SameSite=Lax; Path=/auth/linkedin/callback; Max-Age=0${secure ? '; Secure' : ''}`;
const callbackHeaders = (secure: boolean) => ({
	'Cache-Control': 'no-store, max-age=0',
	'Pragma': 'no-cache',
	'Referrer-Policy': 'no-referrer',
	'X-Robots-Tag': 'noindex, nofollow',
	'Set-Cookie': clearStateCookie(secure),
});

const timingSafeStringEqual = (left: string, right: string): boolean => {
	const leftBytes = Buffer.from(left);
	const rightBytes = Buffer.from(right);

	return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
};

export async function loader({ request }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const secure = url.protocol === 'https:';
	const headers = callbackHeaders(secure);
	const providerError = url.searchParams.get('error');

	if (providerError) {
		return data({ profile: null, message: providerError === 'not_configured'
			? 'LinkedIn import needs its app credentials configured on the website.'
			: 'LinkedIn sign-in was cancelled or declined.' }, { headers });
	}

	const state = url.searchParams.get('state') ?? '';
	const cookie = request.headers.get('cookie') ?? '';
	const savedState = cookie.split(';').map(part => part.trim()).find(part => part.startsWith(`${STATE_COOKIE}=`))?.slice(STATE_COOKIE.length + 1) ?? '';

	if (!state || !savedState || state.length !== savedState.length || !timingSafeStringEqual(state, savedState)) {
		return data({ profile: null, message: 'LinkedIn sign-in could not be verified. Please try again.' }, { headers });
	}

	const code = url.searchParams.get('code');
	const clientId = process.env.LINKEDIN_CLIENT_ID;
	const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

	if (!code || !clientId || !clientSecret) {
		return data({ profile: null, message: 'LinkedIn did not return a profile. Please try again.' }, { headers });
	}

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

		if (!tokenResponse.ok) {
			return data({ profile: null, message: 'LinkedIn could not complete sign-in. Please try again.' }, { headers });
		}

		const token = await tokenResponse.json() as { access_token?: unknown };
		if (typeof token.access_token !== 'string' || token.access_token.length > 8192) {
			return data({ profile: null, message: 'LinkedIn did not return profile access. Please try again.' }, { headers });
		}

		const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
			headers: { Authorization: `Bearer ${token.access_token}` },
			signal: AbortSignal.timeout(8000),
		});

		if (!profileResponse.ok) {
			return data({ profile: null, message: 'LinkedIn did not return profile details. Please try again.' }, { headers });
		}

		const linkedIn = await profileResponse.json() as { name?: unknown; email?: unknown };
		const name = typeof linkedIn.name === 'string' ? linkedIn.name.trim().slice(0, 80) : '';
		const email = typeof linkedIn.email === 'string' ? linkedIn.email.trim().slice(0, 254) : '';

		return data({ profile: { name, email } satisfies LinkedInProfile, message: 'LinkedIn profile details are ready to review.' }, { headers });
	} catch {
		// Keep provider payloads and request details out of logs; they can contain tokens.
		return data({ profile: null, message: 'LinkedIn sign-in is temporarily unavailable. Please try again.' }, { headers });
	}
}

export function headers() {
	return {
		'Cache-Control': 'no-store, max-age=0',
		'Pragma': 'no-cache',
		'Referrer-Policy': 'no-referrer',
		'X-Robots-Tag': 'noindex, nofollow',
	};
}

export default function LinkedInCallback({ loaderData }: Route.ComponentProps) {
	useEffect(() => {
		if (window.opener) {
			window.opener.postMessage({ type: 'linkedin-profile-import', ...loaderData }, window.location.origin);
			window.close();
		}
	}, [loaderData]);

	return (
		<main className="detail">
			<h1>{loaderData.profile ? 'LinkedIn profile ready' : 'LinkedIn profile not imported'}</h1>
			<p>{loaderData.message}</p>
			{loaderData.profile && <p>{loaderData.profile.name}{loaderData.profile.email ? ` · ${loaderData.profile.email}` : ''}</p>}
			<p>You can close this window and review the details in your profile form.</p>
		</main>
	);
}
