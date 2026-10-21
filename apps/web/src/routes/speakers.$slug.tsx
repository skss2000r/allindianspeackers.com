import { Form, Link, data, useActionData, useNavigation } from 'react-router';
import type { Route } from './+types/speakers.$slug';
import { Field } from '@/components/form-field';
import { allowBooking, TOO_MANY } from '@/lib/limits.server';
import { seo } from '@/lib/seo';
import { assertSameOrigin, trustedOrigin } from '@/lib/security.server';
import { createBooking, getPublicSpeaker } from '@/lib/speakers.server';
import { bookingSchema, fieldErrors } from '@/lib/validation';

export async function loader({ params }: Route.LoaderArgs) {
	const speaker = await getPublicSpeaker(params.slug);

	if (!speaker) {
		throw new Response('Speaker not found', { status: 404 });
	}

	return { speaker };
}

export function meta({ matches, location, loaderData }: Route.MetaArgs) {
	const speaker = loaderData?.speaker;

	return seo({ matches, location }, speaker
		? { title: `${speaker.name} — All Indian Speakers`, description: `${speaker.headline || speaker.category}. ${speaker.bio}`.slice(0, 160), image: speaker.photoUrl ?? undefined }
		: { title: 'Speaker not found', description: 'This profile is not available.', noindex: true });
}

const KEYS = ['clientName', 'clientEmail', 'clientPhone', 'eventType', 'eventDate', 'eventCity', 'budgetInr', 'message'] as const;

export async function action({ request, params }: Route.ActionArgs) {
	assertSameOrigin(request);

	if (!(await allowBooking(request))) {
		return data({ errors: { form: TOO_MANY } }, { status: 429 });
	}

	const form = await request.formData();

	if (form.get('website')) {
		return { sent: true as const };
	}

	const values = Object.fromEntries(KEYS.map(key => [key, typeof form.get(key) === 'string' ? String(form.get(key)) : '']));
	const parsed = bookingSchema.safeParse(values);

	if (!parsed.success) {
		return data({ errors: fieldErrors(parsed.error), values }, { status: 400 });
	}

	const created = await createBooking(params.slug, parsed.data, trustedOrigin(request));

	if (!created) {
		throw new Response('Speaker not found', { status: 404 });
	}

	return { sent: true as const };
}

export default function SpeakerProfile({ loaderData }: Route.ComponentProps) {
	const { speaker } = loaderData;
	const result = useActionData<typeof action>();
	const busy = useNavigation().state === 'submitting';
	const errors = (result && 'errors' in result ? result.errors : {}) as Record<string, string>;
	const values = (result && 'values' in result ? result.values : {}) as Record<string, string>;

	return (
		<main className="detail">
			<Link to="/speakers">← All speakers</Link>
			<div className="eyebrow">{speaker.category.toUpperCase()}</div>
			<h1>{speaker.name}</h1>
			{speaker.photoUrl && <img src={speaker.photoUrl} width="800" height="500" alt={speaker.name} />}
			<p><strong>{speaker.headline}</strong></p>
			<p style={{ whiteSpace: 'pre-wrap' }}>{speaker.bio}</p>
			<p>Based in {speaker.city} · Speaks {speaker.languages.join(', ')}</p>
			{speaker.feeInr != null && <p className="big-price">From ₹{speaker.feeInr.toLocaleString('en-IN')}</p>}

			<h2>Request a booking</h2>
			{result && 'sent' in result ? (
				<p role="status">Request sent. {speaker.name} has been notified and you will receive an email as soon as they respond.</p>
			) : (
				<Form method="post" className="form">
					{errors.form && <p className="error" role="alert">{errors.form}</p>}
					<div className="hp" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
					<Field label="Your name" error={errors.clientName}><input name="clientName" required maxLength={80} defaultValue={values.clientName} autoComplete="name" /></Field>
					<Field label="Your email" error={errors.clientEmail}><input type="email" name="clientEmail" required maxLength={254} defaultValue={values.clientEmail} autoComplete="email" /></Field>
					<Field label="Your phone" error={errors.clientPhone}><input type="tel" name="clientPhone" required maxLength={20} defaultValue={values.clientPhone} autoComplete="tel" /></Field>
					<Field label="Type of event" error={errors.eventType}><input name="eventType" required maxLength={80} defaultValue={values.eventType} /></Field>
					<Field label="Event date" error={errors.eventDate}><input type="date" name="eventDate" required defaultValue={values.eventDate} /></Field>
					<Field label="Event city" error={errors.eventCity}><input name="eventCity" required maxLength={80} defaultValue={values.eventCity} /></Field>
					<Field label="Budget (₹, optional)" error={errors.budgetInr}><input name="budgetInr" inputMode="numeric" maxLength={12} defaultValue={values.budgetInr} /></Field>
					<Field label="Message" error={errors.message}><textarea name="message" rows={5} maxLength={1000} defaultValue={values.message} /></Field>
					<p className="hint">Your contact details are shared with {speaker.name} only if they accept.</p>
					<button className="action" disabled={busy}>{busy ? 'Sending…' : 'Send booking request ↗'}</button>
				</Form>
			)}
		</main>
	);
}
