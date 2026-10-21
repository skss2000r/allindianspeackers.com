import { Form, data, useActionData, useNavigation } from 'react-router';
import type { Route } from './+types/booking.respond';
import { allowRespond, TOO_MANY } from '@/lib/limits.server';
import { seo } from '@/lib/seo';
import { assertSameOrigin } from '@/lib/security.server';
import { loadRespondView, respondToBooking, type RespondView } from '@/lib/speakers.server';

export function meta({ matches, location }: Route.MetaArgs) {
	return seo({ matches, location }, { title: 'Booking request — All Indian Speakers', description: 'Respond to a booking request.', noindex: true });
}

export function headers() {
	return { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Robots-Tag': 'noindex, nofollow' };
}

// GET never changes state: email scanners that pre-open links cannot accept or decline for the speaker.
export async function loader({ request }: Route.LoaderArgs) {
	const token = new URL(request.url).searchParams.get('t');

	return { view: await loadRespondView(token), token: token ?? '' };
}

export async function action({ request }: Route.ActionArgs) {
	assertSameOrigin(request);

	if (!(await allowRespond(request))) {
		return data({ error: TOO_MANY }, { status: 429 });
	}

	const form = await request.formData();
	const decision = form.get('decision');

	if (decision !== 'accept' && decision !== 'decline') {
		return data({ error: 'Choose accept or decline' }, { status: 400 });
	}

	const view = await respondToBooking(String(form.get('t') ?? ''), decision);

	return view ? { view } : data({ error: 'This link is invalid or has expired' }, { status: 403 });
}

const inr = (value: number | null) => (value == null ? 'Not specified' : `₹${value.toLocaleString('en-IN')}`);

function Summary({ view }: { view: RespondView }) {
	return (
		<>
			<p>
				<strong>{view.eventType}</strong><br />
				Date: {view.eventDate} · City: {view.eventCity}<br />
				Budget: {inr(view.budgetInr)} (commission {view.commissionPct}%)
			</p>
			<p style={{ whiteSpace: 'pre-wrap' }}>{view.message}</p>
		</>
	);
}

export default function BookingRespond({ loaderData }: Route.ComponentProps) {
	const result = useActionData<typeof action>();
	const busy = useNavigation().state === 'submitting';
	const view = result && 'view' in result ? result.view : loaderData.view;
	const { token } = loaderData;

	if (!view) {
		return (
			<main className="detail">
				<h1>Link not valid.</h1>
				<p>This link is invalid or has expired. Open the most recent email about this request.</p>
			</main>
		);
	}

	return (
		<main className="detail">
			<div className="eyebrow">BOOKING REQUEST FOR {view.speakerName.toUpperCase()}</div>
			<h1>{view.status === 'pending' ? 'Accept this booking?' : view.status === 'accepted' ? 'Accepted.' : 'Declined.'}</h1>
			<Summary view={view} />
			{result && 'error' in result && <p className="error" role="alert">{result.error}</p>}
			{view.status === 'pending' ? (
				<Form method="post" className="form">
					<input type="hidden" name="t" value={token} />
					<div className="row">
						<button className="action" name="decision" value="accept" disabled={busy}>Accept</button>
						<button className="action secondary" name="decision" value="decline" disabled={busy}>Decline</button>
					</div>
					<p className="hint">Accepting notifies the client by email and shares their contact details with you.</p>
				</Form>
			) : view.client ? (
				<p>Client: {view.client.name} · {view.client.email} · {view.client.phone}<br />The client has been notified by email. Our team will follow up with the confirmation and payment details.</p>
			) : (
				<p>The client has been notified.</p>
			)}
		</main>
	);
}
