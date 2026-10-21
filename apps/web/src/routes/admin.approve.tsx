import { Form, data, useActionData } from 'react-router';
import type { Route } from './+types/admin.approve';
import { seo } from '@/lib/seo';
import { assertSameOrigin, verifyToken } from '@/lib/security.server';
import { approveSpeaker } from '@/lib/speakers.server';

export function meta({ matches, location }: Route.MetaArgs) {
	return seo({ matches, location }, { title: 'Approve profile', description: 'Admin approval.', noindex: true });
}

export function headers() {
	return { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Robots-Tag': 'noindex, nofollow' };
}

export function loader({ request }: Route.LoaderArgs) {
	const token = new URL(request.url).searchParams.get('t') ?? '';

	return { valid: Boolean(verifyToken(token, 'approve')), token };
}

export async function action({ request }: Route.ActionArgs) {
	assertSameOrigin(request);

	const speaker = await approveSpeaker(String((await request.formData()).get('t') ?? ''));

	return speaker ? { approved: speaker.name } : data({ error: 'This link is invalid or has expired' }, { status: 403 });
}

export default function Approve({ loaderData }: Route.ComponentProps) {
	const result = useActionData<typeof action>();
	const { token } = loaderData;

	return (
		<main className="detail">
			<h1>Approve profile.</h1>
			{result && 'approved' in result ? (
				<p role="status">{result.approved} is now live and has been emailed.</p>
			) : loaderData.valid ? (
				<Form method="post" className="form">
					<input type="hidden" name="t" value={token} />
					<p>Confirm that you have reviewed this profile and want it public.</p>
					<button className="action">Approve &amp; publish</button>
				</Form>
			) : (
				<p>This link is invalid or has expired.</p>
			)}
			{result && 'error' in result && <p className="error" role="alert">{result.error}</p>}
		</main>
	);
}
