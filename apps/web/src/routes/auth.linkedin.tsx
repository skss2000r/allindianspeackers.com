import { randomBytes } from 'node:crypto';
import { redirect } from 'react-router';
import type { Route } from './+types/auth.linkedin';
import { siteOrigin } from '@/lib/site-origin.server';

const STATE_COOKIE = 'linkedin_import_state';

export async function loader({ request }: Route.LoaderArgs) {
	const clientId = process.env.LINKEDIN_CLIENT_ID;
	const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

	if (!clientId || !clientSecret) {
		return redirect('/auth/linkedin/callback?error=not_configured');
	}

	const state = randomBytes(32).toString('hex');
	const redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${siteOrigin(request)}/auth/linkedin/callback`;
	const authorize = new URL('https://www.linkedin.com/oauth/v2/authorization');
	authorize.searchParams.set('response_type', 'code');
	authorize.searchParams.set('client_id', clientId);
	authorize.searchParams.set('redirect_uri', redirectUri);
	authorize.searchParams.set('state', state);
	authorize.searchParams.set('scope', 'openid profile email');

	const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';

	return redirect(authorize.toString(), {
		headers: {
			'Cache-Control': 'no-store',
			'Referrer-Policy': 'no-referrer',
			'X-Robots-Tag': 'noindex, nofollow',
			'Set-Cookie': `${STATE_COOKIE}=${state}; HttpOnly; SameSite=Lax; Path=/auth/linkedin/callback; Max-Age=600${secure}`,
		},
	});
}
