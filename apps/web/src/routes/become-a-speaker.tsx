import { Form, Link, data, useActionData, useNavigation } from 'react-router';
import type { Route } from './+types/become-a-speaker';
import { ProfileFields, PayoutFields } from '@/components/speaker-form-fields';
import { Field } from '@/components/form-field';
import { COMMISSION_PCT } from '@/lib/config';
import { readFormData } from '@/lib/api.server';
import { allowRegister, TOO_MANY } from '@/lib/limits.server';
import { seo } from '@/lib/seo';
import { assertSameOrigin, trustedOrigin } from '@/lib/security.server';
import { echoValues, parseContact, parsePayout, parseProfile, photoFrom } from '@/lib/speaker-forms.server';
import { registerSpeaker } from '@/lib/speakers.server';
import { decryptJson } from '@/lib/security.server';

export function meta({ matches, location }: Route.MetaArgs) {
	return seo({ matches, location }, {
		title: 'Add your profile — All Indian Speakers',
		description: 'Speakers and celebrities: create your profile, set your fee, receive booking requests and get paid to your own account.',
	});
}

type LinkedInImport = { name: string; email: string };

export async function loader({ request }: Route.LoaderArgs) {
	const cookie = request.headers.get('cookie') ?? '';
	const token = cookie.split(';').map(part => part.trim()).find(part => part.startsWith('linkedin_profile_import='))?.slice('linkedin_profile_import='.length) ?? '';
	let linkedinProfile: LinkedInImport | null = null;

	if (token) {
		try {
			const value = decryptJson<unknown>(token);
			if (value && typeof value === 'object' && 'name' in value && 'email' in value
				&& typeof value.name === 'string' && typeof value.email === 'string') {
				linkedinProfile = { name: value.name.slice(0, 80), email: value.email.slice(0, 254) };
			}
		} catch {
			// An invalid or expired import is ignored and immediately cleared.
		}
	}

	const secure = new URL(request.url).hostname !== 'localhost';
	const clearCookie = `linkedin_profile_import=; HttpOnly; SameSite=Lax; Path=/become-a-speaker; Max-Age=0${secure ? '; Secure' : ''}`;
	const error = new URL(request.url).searchParams.get('linkedinError');
	const linkedinMessage = error === 'not_configured' ? 'LinkedIn import needs app credentials configured.'
		: error === 'cancelled' ? 'LinkedIn sign-in was cancelled or declined.'
			: error ? 'LinkedIn sign-in could not be completed. Please try again.'
				: linkedinProfile ? 'LinkedIn name and email imported. Review them before submitting; this does not verify your identity.'
					: '';

	return data({ linkedinProfile, linkedinMessage }, {
		headers: {
			'Cache-Control': 'no-store, max-age=0',
			'Set-Cookie': clearCookie,
		},
	});
}

export async function action({ request }: Route.ActionArgs) {
	assertSameOrigin(request);

	if (!(await allowRegister(request))) {
		return data({ errors: { form: TOO_MANY } }, { status: 429 });
	}

	let form: FormData;

	try {
		form = await readFormData(request, 3 * 1024 * 1024);
	} catch (error) {
		if (error instanceof Response) {
			return data({ errors: { photo: 'The upload is too large. Photos must be 2 MB or smaller.' } }, { status: 413 });
		}

		throw error;
	}

	// Honeypot: real people never see or fill this field.
	if (form.get('website')) {
		return { done: true as const };
	}

	const values = echoValues(form);
	const profile = parseProfile(form);
	const contact = parseContact(form, ['email', 'phone']);
	const payout = parsePayout(form);
	const errors: Record<string, string> = {
		...profile.errors,
		...contact.errors,
		...payout.errors,
	};

	if (form.get('terms') !== 'on') {
		errors.terms = 'You must accept the terms and commission to continue';
	}

	if (!profile.data || !contact.data || !payout.data || Object.keys(errors).length) {
		return data({ errors, values }, { status: 400 });
	}

	try {
		await registerSpeaker({
			profile: profile.data,
			email: contact.data.email,
			phone: contact.data.phone,
			payout: payout.data,
			photo: photoFrom(form),
			origin: trustedOrigin(request),
		});
	} catch (error) {
		if (error instanceof Error && error.message.startsWith('Photo')) {
			return data({ errors: { photo: error.message }, values }, { status: 400 });
		}

		throw error;
	}

	return { done: true as const };
}

export default function BecomeASpeaker() {
	const result = useActionData<typeof action>();
	const navigation = useNavigation();
	const busy = navigation.state === 'submitting';

	if (result && 'done' in result) {
		return (
			<main className="detail">
				<div className="eyebrow">THANK YOU</div>
				<h1>Profile received.</h1>
				<p>Check your email: we sent you a private link to manage your profile, fee and payout details. If this address was already registered, the same link was re-sent. We review every profile before it goes live, and you will be emailed the moment it is approved.</p>
				<Link className="action" to="/">Back to the stage ↗</Link>
			</main>
		);
	}

	const errors = (result && 'errors' in result ? result.errors : {}) as Record<string, string>;
	const values = (result && 'values' in result ? result.values : {}) as Record<string, string>;

	return (
		<main className="detail">
			<div className="eyebrow">FOR SPEAKERS &amp; CELEBRITIES</div>
			<h1>Add your profile.</h1>
			<p>Create your profile, set your fee and receive booking requests directly by email. Your email, phone and payout details are never shown publicly and are stored encrypted. {COMMISSION_PCT}% platform commission applies on confirmed bookings; you keep the rest, paid to the account you add below.</p>
			<Form method="post" encType="multipart/form-data" className="form" noValidate={false}>
				{errors.form && <p className="error" role="alert">{errors.form}</p>}
				<div className="hp" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
				<ProfileFields values={values} errors={errors} linkedinProfile={loaderData.linkedinProfile} linkedinMessage={loaderData.linkedinMessage} />
				<fieldset className="panel">
					<legend>Private contact (never public)</legend>
					<Field label="Email" error={errors.email}><input type="email" name="email" required maxLength={254} defaultValue={values.email} autoComplete="email" /></Field>
					<Field label="Phone / WhatsApp" error={errors.phone}><input type="tel" name="phone" required maxLength={20} defaultValue={values.phone} autoComplete="tel" /></Field>
				</fieldset>
				<PayoutFields values={values} errors={errors} />
				<label className="check">
					<input type="checkbox" name="terms" required />
					<span>I accept the <Link to="/terms" target="_blank">terms and {COMMISSION_PCT}% commission</Link>.</span>
				</label>
				{errors.terms && <small className="error" role="alert">{errors.terms}</small>}
				<button className="action" disabled={busy}>{busy ? 'Submitting…' : 'Create my profile ↗'}</button>
			</Form>
		</main>
	);
}
