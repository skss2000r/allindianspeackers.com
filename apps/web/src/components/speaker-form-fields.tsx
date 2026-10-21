import { useEffect, useState } from 'react';
import { Field } from '@/components/form-field';
import { SPEAKER_CATEGORIES, SPEAKER_SPECIALTIES } from '@/lib/config';

type Values = Record<string, string | undefined>;
type SearchResult = { title: string; snippet: string; url: string; displayLink: string };
type ProfileSuggestion = { name: string; headline: string; bio: string; category: string; specialties: string[]; languages: string[]; city: string; linkedinUrl: string; instagramUrl: string; youtubeUrl: string; websiteUrl: string };
type LinkedInProfile = { name: string; email: string };

export function ProfileFields({
	values = {},
	errors = {},
	linkedinProfile = null,
	linkedinMessage = '',
}: {
	values?: Values;
	errors?: Record<string, string>;
	linkedinProfile?: LinkedInProfile | null;
	linkedinMessage?: string;
}) {
	const [profileName, setProfileName] = useState(values.name ?? '');
	const [identifier, setIdentifier] = useState('');
	const [searchBusy, setSearchBusy] = useState(false);
	const [searchError, setSearchError] = useState('');
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [searchSuggestions, setSearchSuggestions] = useState<ProfileSuggestion | null>(null);
	const [searchNotice, setSearchNotice] = useState('');
	const [linkedinNotice, setLinkedinNotice] = useState(linkedinMessage);
	const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${identifier || profileName} speaker`)}`;

	const setFormValue = (name: string, value: string) => {
		const form = document.querySelector('form.form');
		const field = form instanceof HTMLFormElement ? form.elements.namedItem(name) : null;

		if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
			const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(field), 'value')?.set;
			setter?.call(field, value);
			field.dispatchEvent(new Event('input', { bubbles: true }));
			field.dispatchEvent(new Event('change', { bubbles: true }));
		}
	};

	useEffect(() => {
		if (linkedinProfile?.name) setProfileName(linkedinProfile.name.slice(0, 80));
		if (linkedinProfile?.email) setFormValue('email', linkedinProfile.email.slice(0, 254));
		if (linkedinMessage) setLinkedinNotice(linkedinMessage);

		try {
			const savedIdentifier = sessionStorage.getItem('speaker-social-identifier');
			if (savedIdentifier) {
				setIdentifier(savedIdentifier.slice(0, 300));
				sessionStorage.removeItem('speaker-social-identifier');
			}
		} catch {
			// Storage may be unavailable; LinkedIn import still works.
		}
	}, [linkedinProfile, linkedinMessage]);

	const connectLinkedIn = () => {
		try {
			sessionStorage.setItem('speaker-social-identifier', identifier.trim());
		} catch {
			// Keep the flow usable when browser storage is unavailable.
		}
		window.location.assign('/auth/linkedin');
	};

	const searchProfile = async () => {
		const query = identifier.trim();

		if (query.length < 2) {
			setSearchError('Enter a social profile URL or @handle first.');
			return;
		}

		setSearchBusy(true);
		setSearchError('');
		setSearchNotice('');
		setSearchResults([]);
		setSearchSuggestions(null);

		try {
			const response = await fetch('/api/profile-suggestions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ identifier: query }),
			});
			const payload = await response.json() as { results?: SearchResult[]; suggestions?: ProfileSuggestion | null; aiAvailable?: boolean; error?: string };

			if (!response.ok) {
				throw new Error(payload.error || 'Profile search is unavailable right now.');
			}

			setSearchResults(payload.results ?? []);
			setSearchSuggestions(payload.suggestions ?? null);

			if (payload.results?.length && !payload.aiAvailable) {
				setSearchNotice('Google found public results, but AI suggestions are unavailable right now. Review a result or complete the fields yourself.');
			}

			if (!payload.results?.length) {
				setSearchNotice('Google did not return matching public results. Check the link or handle and try again.');
			}
		} catch (error) {
			setSearchError(error instanceof Error ? error.message : 'Profile search is unavailable right now.');
		} finally {
			setSearchBusy(false);
		}
	};

	const applySuggestions = () => {
		if (!searchSuggestions) return;
		const suggestion = searchSuggestions;

		if (suggestion.name) setProfileName(suggestion.name);
		for (const [name, value] of Object.entries({
			headline: suggestion.headline,
			bio: suggestion.bio,
			category: suggestion.category,
			languages: suggestion.languages.join(', '),
			city: suggestion.city,
			linkedinUrl: suggestion.linkedinUrl,
			instagramUrl: suggestion.instagramUrl,
			youtubeUrl: suggestion.youtubeUrl,
			websiteUrl: suggestion.websiteUrl,
		})) {
			if (value) setFormValue(name, value);
		}

		const form = document.querySelector('form.form');
		form?.querySelectorAll<HTMLInputElement>('input[name="specialties"]').forEach(input => {
			const checked = suggestion.specialties.includes(input.value);
			if (input.checked !== checked) {
				input.checked = checked;
				input.dispatchEvent(new Event('input', { bubbles: true }));
				input.dispatchEvent(new Event('change', { bubbles: true }));
			}
		});

		setSearchNotice('AI suggestions applied. Check every field and the Google sources before submitting.');
	};

	const useSearchResult = (result: SearchResult) => {
		setProfileName(result.title.slice(0, 80));
		const hostname = new URL(result.url).hostname.replace(/^www\./, '');
		const field = hostname.includes('linkedin.com') ? 'linkedinUrl'
			: hostname.includes('instagram.com') ? 'instagramUrl'
				: hostname.includes('youtube.com') || hostname.includes('youtu.be') ? 'youtubeUrl'
					: 'websiteUrl';
		setFormValue(field, result.url);
		setSearchNotice('Added the selected public link and title. Review these details and complete the rest of your profile.');
		setSearchResults([]);
	};

	return (
		<>
			<fieldset className="panel">
				<legend>Find your public profile</legend>
				<p className="hint">Enter one social profile link or @handle. The site sends this identifier and public Google snippets to Google and Gemini to draft editable fields. Nothing is saved until you submit the profile.</p>
				<Field label="Social profile URL or @handle">
					<input value={identifier} onChange={event => setIdentifier(event.target.value)} maxLength={300} placeholder="https://linkedin.com/in/... or @yourname" autoComplete="url" />
				</Field>
				<button type="button" className="action" disabled={searchBusy} onClick={searchProfile}>{searchBusy ? 'Searching…' : 'Search public profiles ↗'}</button>
				{searchError && <small className="error" role="alert">{searchError}</small>}
				{searchNotice && <p className="hint" role="status">{searchNotice}</p>}
				{searchSuggestions && <div className="panel" aria-label="AI profile suggestions">
					<h3>AI profile draft</h3>
					<p className="hint">Suggestions are based on Google result snippets. They can be wrong; check each field and review the source links below.</p>
					<button type="button" onClick={applySuggestions}>Apply AI suggestions</button>
				</div>}
				{searchResults.length > 0 && <div className="panel" aria-label="Google search suggestions">
					<p className="hint">Review each result carefully. Search matches can refer to someone else.</p>
					{searchResults.map((result) => <article key={result.url} className="cart-row">
						<h3><a href={result.url} target="_blank" rel="noreferrer">{result.title} ↗</a></h3>
						<p className="hint">{result.displayLink}</p>
						<p>{result.snippet}</p>
						<button type="button" onClick={() => useSearchResult(result)}>Use this result</button>
					</article>)}
				</div>}
				<button type="button" onClick={connectLinkedIn}>Import name and email from LinkedIn ↗</button>
				{linkedinNotice && <p className="hint" role="status">{linkedinNotice}</p>}
				<a className="hint" href={googleSearchUrl} target="_blank" rel="noreferrer">Open this search in Google ↗</a>
			</fieldset>
			<Field label="Full / stage name" error={errors.name}>
				<input name="name" required minLength={2} maxLength={80} value={profileName} onChange={event => setProfileName(event.target.value)} autoComplete="name" />
				{profileName.trim().length > 1 && <a className="hint" href={googleSearchUrl} target="_blank" rel="noreferrer">Search Google for this speaker ↗</a>}
				<p className="hint">Check the speaker name and details before submitting.</p>
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
