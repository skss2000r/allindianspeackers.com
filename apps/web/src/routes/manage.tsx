import { Form, Link, data, useActionData, useNavigation } from 'react-router';
import type { Route } from './+types/manage';
import { Field } from '@/components/form-field';
import { PayoutFields, ProfileFields } from '@/components/speaker-form-fields';
import { readFormData } from '@/lib/api.server';
import { allowLink, allowManage, TOO_MANY } from '@/lib/limits.server';
import { seo } from '@/lib/seo';
import { assertSameOrigin, trustedOrigin } from '@/lib/security.server';
import { echoValues, parseContact, parsePayout, parseProfile, photoFrom } from '@/lib/speaker-forms.server';
import { deleteSpeakerProfile, loadManageView, requestManageLink, updateSpeaker } from '@/lib/speakers.server';

export function meta({ matches, location }: Route.MetaArgs) {
	return seo({ matches, location }, { title: 'Manage your profile — All Indian Speakers', description: 'Private speaker dashboard.', noindex: true });
}

export function headers() {
	return { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Robots-Tag': 'noindex, nofollow' };
}

export async function loader({ request }: Route.LoaderArgs) {
	const token = new URL(request.url).searchParams.get('t');

	return { view: token ? await loadManageView(token) : null, hasToken: Boolean(token), token: token ?? '' };
}

export async function action({ request }: Route.ActionArgs) {
	assertSameOrigin(request);

	let form: FormData;

	try {
		form = await readFormData(request, 3 * 1024 * 1024);
	} catch (error) {
		if (error instanceof Response) {
			return data({ intent: 'update' as const, errors: { photo: 'The upload is too large. Photos must be 2 MB or smaller.' } }, { status: 413 });
		}

		throw error;
	}

	const intent = form.get('intent');

	if (intent === 'resend') {
		if (!(await allowLink(request))) {
			return data({ intent: 'resend' as const, errors: { form: TOO_MANY } }, { status: 429 });
		}

		const email = String(form.get('email') ?? '').trim().toLowerCase();

		if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && email.length <= 254) {
			await requestManageLink(email, trustedOrigin(request));
		}

		// Identical answer whether or not the address exists.
		return { intent: 'resend' as const, sent: true as const };
	}

	if (intent === 'delete') {
		if (!(await allowManage(request))) {
			return data({ intent: 'delete' as const, errors: { form: TOO_MANY } }, { status: 429 });
		}

		if (form.get('confirmDelete') !== 'DELETE') {
			return data({ intent: 'delete' as const, errors: { form: 'Type DELETE exactly to confirm profile removal.' } }, { status: 400 });
		}

		const token = String(form.get('t') ?? '');
		const deleted = await deleteSpeakerProfile(token);

		if (!deleted) {
			throw new Response('This link is invalid or has expired', { status: 403 });
		}

		return { intent: 'delete' as const, deleted: true as const };
	}

	if (!(await allowManage(request))) {
		return data({ intent: 'update' as const, errors: { form: TOO_MANY } }, { status: 429 });
	}

	const token = String(form.get('t') ?? '');
	const values = echoValues(form);
	const profile = parseProfile(form);
	const contact = parseContact(form, ['phone']);
	const errors: Record<string, string> = { ...profile.errors, ...contact.errors };

	// Payout details are replaced only when the speaker typed new ones.
	const wantsPayout = Boolean(String(form.get(form.get('payoutMethod') === 'bank' ? 'accountNumber' : 'upiId') ?? '').trim());
	const payout = wantsPayout ? parsePayout(form) : null;

	if (payout) {
		Object.assign(errors, payout.errors);
	}

	if (!profile.data || !contact.data || Object.keys(errors).length) {
		return data({ intent: 'update' as const, errors, values }, { status: 400 });
	}

	try {
		const ok = await updateSpeaker(token, {
			profile: profile.data,
			phone: contact.data.phone,
			payout: payout?.data ?? null,
			photo: photoFrom(form),
			removePhoto: form.get('removePhoto') === 'on',
		});

		if (!ok) {
			throw new Response('This link is invalid or has expired', { status: 403 });
		}
	} catch (error) {
		if (error instanceof Error && error.message.startsWith('Photo')) {
			return data({ intent: 'update' as const, errors: { photo: error.message }, values }, { status: 400 });
		}

		throw error;
	}

	return { intent: 'update' as const, saved: true as const };
}

const inr = (value: number | null) => (value == null ? 'Not specified' : `₹${value.toLocaleString('en-IN')}`);

export default function Manage({ loaderData }: Route.ComponentProps) {
	const { view, hasToken, token } = loaderData;
	const result = useActionData<typeof action>();
	const busy = useNavigation().state === 'submitting';
	const errors = (result && 'errors' in result ? result.errors : {}) as Record<string, string>;
	const values = (result && 'values' in result ? result.values : {}) as Record<string, string>;

	if (result && 'deleted' in result) {
		return (
			<main className="detail">
				<div className="eyebrow">PROFILE REMOVED</div>
				<h1>Your profile has been deleted.</h1>
				<p>Your profile and photo are no longer available. Existing booking records are retained for business history. You can create a new profile any time.</p>
				<Link className="action" to="/become-a-speaker">Create a new profile ↗</Link>
			</main>
		);
	}

	if (!view) {
		return (
			<main className="detail">
				<div className="eyebrow">PRIVATE AREA</div>
				<h1>Manage your profile.</h1>
				<p>{hasToken ? 'This link is invalid or has expired. ' : ''}Enter the email you registered with and we will send you a new private link.</p>
				{result && 'sent' in result ? (
					<p role="status">If that address is registered, a new link is on its way.</p>
				) : (
					<Form method="post" className="form">
						<input type="hidden" name="intent" value="resend" />
						{errors.form && <p className="error" role="alert">{errors.form}</p>}
						<Field label="Email"><input type="email" name="email" required maxLength={254} autoComplete="email" /></Field>
						<button className="action" disabled={busy}>Send me a link</button>
					</Form>
				)}
				<p><Link to="/become-a-speaker">New here? Add your profile →</Link></p>
			</main>
		);
	}

	const p = view.profile;
	const profile = { name: p.name, headline: p.headline, category: p.category, specialties: p.specialties.join(','), bio: p.bio, city: p.city, linkedinUrl: p.linkedinUrl, instagramUrl: p.instagramUrl, youtubeUrl: p.youtubeUrl, websiteUrl: p.websiteUrl, languages: p.languages.join(', '), feeInr: p.feeInr == null ? '' : String(p.feeInr), showFee: p.showFee ? 'on' : '' };
	const current = Object.keys(values).length ? { ...profile, ...values } : profile;

	return (
		<main className="detail">
			<div className="eyebrow">PRIVATE · {view.profile.status.toUpperCase()}</div>
			<h1>{view.profile.name}</h1>
			<p>{view.profile.status === 'approved' ? <>Your profile is live: <Link to={`/speakers/${encodeURIComponent(view.profile.slug)}`}>view it</Link>.</> : 'Your profile is waiting for approval. We will email you when it goes live.'} Commission on confirmed bookings: {view.profile.commissionPct}% · <Link to="/terms">Terms</Link></p>

			<h2>Booking requests</h2>
			{!view.bookings.length && <p>No requests yet.</p>}
			{view.bookings.map(booking => (
				<div className="cart-row" key={booking.id}>
					<h3>{booking.eventType} — {booking.eventDate}, {booking.eventCity}</h3>
					<p>Status: <strong>{booking.status}</strong> · Budget: {inr(booking.budgetInr)}<br />{booking.message}</p>
					{booking.client && <p>Client: {booking.client.name} · {booking.client.email} · {booking.client.phone}</p>}
				</div>
			))}

			<h2>Edit profile</h2>
			{result && 'saved' in result && <p role="status">Saved.</p>}
			<Form method="post" encType="multipart/form-data" className="form">
				<input type="hidden" name="intent" value="update" />
				<input type="hidden" name="t" value={token} />
				{errors.form && <p className="error" role="alert">{errors.form}</p>}
				{view.profile.photoUrl && (
					<div className="panel">
						<img src={view.profile.photoUrl} alt="Current profile" width="160" height="160" style={{ objectFit: 'cover', borderRadius: 8 }} />
						<label className="check"><input type="checkbox" name="removePhoto" /><span>Remove current photo</span></label>
					</div>
				)}
				<ProfileFields values={current} errors={errors} />
				<fieldset className="panel">
					<legend>Private contact</legend>
					<p className="hint">Email on file: {view.contact.email}</p>
					<Field label="Phone / WhatsApp" error={errors.phone}><input type="tel" name="phone" required maxLength={20} defaultValue={values.phone ?? view.contact.phone} /></Field>
				</fieldset>
				<p className="hint">Current payout account: {view.payoutSummary.method.toUpperCase()} — {view.payoutSummary.masked}</p>
				<PayoutFields values={values} errors={errors} optional />
				<button className="action" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
			</Form>
			<section className="panel" aria-labelledby="delete-profile-heading">
				<h2 id="delete-profile-heading">Delete your profile</h2>
				<p>This permanently removes your profile details and photo. Existing booking records are retained for business history. You can create another profile later.</p>
				<Form method="post" className="form">
					<input type="hidden" name="intent" value="delete" />
					<input type="hidden" name="t" value={token} />
					<Field label="Type DELETE to confirm" error={result && 'intent' in result && result.intent === 'delete' && 'errors' in result ? result.errors.form : undefined}>
						<input name="confirmDelete" required pattern="DELETE" autoComplete="off" />
					</Field>
					<button className="action" disabled={busy}>{busy ? 'Deleting…' : 'Permanently delete my profile'}</button>
				</Form>
			</section>
		</main>
	);
}
