import { useState } from 'react';
import { Field } from '@/components/form-field';
import { SPEAKER_CATEGORIES, SPEAKER_SPECIALTIES } from '@/lib/config';

type Values = Record<string, string | undefined>;

export function ProfileFields({ values = {}, errors = {} }: { values?: Values; errors?: Record<string, string> }) {
	return (
		<>
			<Field label="Full / stage name" error={errors.name}>
				<input name="name" required minLength={2} maxLength={80} defaultValue={values.name} autoComplete="name" />
			</Field>
			<Field label="One-line headline" error={errors.headline} hint="e.g. Olympic medallist & motivational speaker">
				<input name="headline" maxLength={120} defaultValue={values.headline} />
			</Field>
			<Field label="Category" error={errors.category}>
				<select name="category" required defaultValue={values.category || SPEAKER_CATEGORIES[0]}>
					{SPEAKER_CATEGORIES.map(category => <option key={category}>{category}</option>)}
				</select>
			</Field>
			<fieldset className="panel">
				<legend>What can you speak about? (choose up to six)</legend>
				<p className="hint">These specialties help organizers find the right speaker.</p>
				{errors.specialties && <small className="error" role="alert">{errors.specialties}</small>}
				{SPEAKER_SPECIALTIES.map(specialty => (
					<label className="check" key={specialty}>
						<input type="checkbox" name="specialties" value={specialty} defaultChecked={(values.specialties ?? '').split(',').includes(specialty)} />
						<span>{specialty}</span>
					</label>
				))}
			</fieldset>
			<Field label="About you (shown publicly)" error={errors.bio}>
				<textarea name="bio" required minLength={20} maxLength={1500} rows={6} defaultValue={values.bio} />
			</Field>
			<Field label="Languages you speak in" error={errors.languages} hint="Comma separated, e.g. English, Hindi, Tamil">
				<input name="languages" required maxLength={120} defaultValue={values.languages} />
			</Field>
			<fieldset className="panel">
				<legend>Public profile links (optional)</legend>
				<p className="hint">Add links so organizers can learn more about your work. Paste full https:// links; they will appear on your public profile.</p>
				<Field label="LinkedIn profile" error={errors.linkedinUrl}><input type="url" name="linkedinUrl" placeholder="https://www.linkedin.com/in/your-name" maxLength={300} defaultValue={values.linkedinUrl} /></Field>
				<Field label="Instagram profile" error={errors.instagramUrl}><input type="url" name="instagramUrl" placeholder="https://www.instagram.com/your-name" maxLength={300} defaultValue={values.instagramUrl} /></Field>
				<Field label="YouTube channel" error={errors.youtubeUrl}><input type="url" name="youtubeUrl" placeholder="https://www.youtube.com/@your-channel" maxLength={300} defaultValue={values.youtubeUrl} /></Field>
				<Field label="Website or other public profile" error={errors.websiteUrl}><input type="url" name="websiteUrl" placeholder="https://example.com" maxLength={300} defaultValue={values.websiteUrl} /></Field>
			</fieldset>
			<Field label="Home city" error={errors.city}>
				<input name="city" required maxLength={60} defaultValue={values.city} autoComplete="address-level2" />
			</Field>
			<Field label="Your fee per appearance (₹, before commission)" error={errors.feeInr} hint="Optional. Leave empty to quote per request.">
				<input name="feeInr" inputMode="numeric" maxLength={12} defaultValue={values.feeInr} />
			</Field>
			<label className="check">
				<input type="checkbox" name="showFee" defaultChecked={values.showFee === 'on'} />
				<span>Show my fee publicly on my profile</span>
			</label>
			<Field label="Profile photo (JPEG or PNG, max 2 MB)" error={errors.photo} hint="Location data is removed from the image automatically.">
				<input type="file" name="photo" accept="image/jpeg,image/png" />
			</Field>
		</>
	);
}

export function PayoutFields({ values = {}, errors = {}, optional = false }: { values?: Values; errors?: Record<string, string>; optional?: boolean }) {
	const [method, setMethod] = useState(values.payoutMethod === 'bank' ? 'bank' : 'upi');

	return (
		<fieldset className="panel">
			<legend>Payout account (private, encrypted)</legend>
			{optional && <p className="hint">Leave blank to keep your current payout account.</p>}
			<Field label="Payout method" error={errors.payoutMethod}>
				<select name="payoutMethod" value={method} onChange={event => setMethod(event.target.value)}>
					<option value="upi">UPI</option>
					<option value="bank">Bank account</option>
				</select>
			</Field>
			{method === 'upi' ? (
				<Field label="UPI ID" error={errors.upiId}>
					<input name="upiId" autoComplete="off" maxLength={100} placeholder="name@bank" />
				</Field>
			) : (
				<>
					<Field label="Account holder name" error={errors.accountName}>
						<input name="accountName" autoComplete="off" maxLength={80} defaultValue={values.accountName} />
					</Field>
					<Field label="Account number" error={errors.accountNumber}>
						<input name="accountNumber" inputMode="numeric" autoComplete="off" maxLength={18} />
					</Field>
					<Field label="IFSC code" error={errors.ifsc}>
						<input name="ifsc" autoComplete="off" maxLength={11} defaultValue={values.ifsc} />
					</Field>
				</>
			)}
		</fieldset>
	);
}
