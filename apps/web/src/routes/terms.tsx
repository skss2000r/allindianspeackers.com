import type { Route } from './+types/terms';
import { COMMISSION_PCT, PAYOUT_BUSINESS_DAYS, SITE_NAME, TERMS_VERSION } from '@/lib/config';
import { seo } from '@/lib/seo';

export function meta({ matches, location }: Route.MetaArgs) {
	return seo({ matches, location }, {
		title: 'Terms & commission — All Indian Speakers',
		description: 'Commission, payout, booking and confidentiality terms for speakers, celebrities and clients using All Indian Speakers.',
	});
}

export default function Terms() {
	const speakerShare = 100 - COMMISSION_PCT;

	return (
		<main className="detail legal">
			<div className="eyebrow">VERSION {TERMS_VERSION}</div>
			<h1>Terms &amp; commission.</h1>
			<p>These terms apply to speakers and celebrities (&ldquo;Speakers&rdquo;) who list a profile on {SITE_NAME} and to clients who request bookings through it. By creating a profile or sending a booking request you agree to them.</p>

			<h2>1. Commission</h2>
			<p>{SITE_NAME} charges a platform commission of <strong>{COMMISSION_PCT}%</strong> of the confirmed booking value. The Speaker receives the remaining <strong>{speakerShare}%</strong>. The fee a Speaker sets on their profile is the amount before commission; the client pays the booking value and the commission is deducted from it, never added on top of the Speaker&rsquo;s share.</p>
			<p>Example: for a confirmed booking of ₹100,000 the commission is ₹{(100000 * COMMISSION_PCT / 100).toLocaleString('en-IN')} and the Speaker&rsquo;s share is ₹{(100000 * speakerShare / 100).toLocaleString('en-IN')}. Applicable taxes (such as GST) are handled according to law and are shown on the booking confirmation.</p>

            <h2>2. Booking flow</h2>
			<p>A client sends a booking request. The Speaker is notified by email and may accept or decline. A request is only a request until it is accepted <em>and</em> the client has paid under the confirmation sent by {SITE_NAME}. The client is notified by email when the Speaker accepts or declines. Accepting a request does not by itself create a payment obligation until the confirmation and payment details are issued.</p>

			<h2>3. Payouts</h2>
			<p>Speakers provide a UPI ID or bank account for payouts. After the event is completed and the client&rsquo;s payment has been received, the Speaker&rsquo;s share is settled to that account within {PAYOUT_BUSINESS_DAYS} business days. Settlement may be delayed if details are incorrect, if the event is disputed, or if verification is required by law. Speakers are responsible for the accuracy of the payout details and for their own tax obligations.</p>

			<h2>4. Cancellations</h2>
			<p>Cancellations and rescheduling are governed by the booking confirmation issued for each engagement. A Speaker who cancels an accepted booking without a valid reason may be removed from the platform.</p>

			<h2>5. Profiles and content</h2>
			<p>Speakers must be who they say they are and must have the right to use the name, photo and biography they submit. Profiles are reviewed before publication and may be edited, suspended or removed at our discretion for inaccurate, misleading or unlawful content.</p>

			<h2>6. Confidentiality and privacy</h2>
			<p>A Speaker&rsquo;s email address, phone number and payout details are never shown on the public site. They are stored encrypted and are used only to run bookings and payouts. A client&rsquo;s contact details are shared with a Speaker only after the Speaker accepts that client&rsquo;s request. We do not sell personal data. Speakers may ask us to correct or delete their data at any time through the contact address on this site.</p>

			<h2>7. Acceptable use</h2>
			<p>Do not attempt to access other users&rsquo; data, interfere with the service, or use it to send spam or abusive requests. Accounts that do so will be blocked.</p>

			<h2>8. Changes</h2>
			<p>We may update these terms. Material changes to the commission apply to new bookings only, and Speakers will be notified by email beforehand. Each profile records the version of the terms accepted at registration.</p>

			<p className="note">This document is a commercial template provided with the site. Have it reviewed by a qualified lawyer before relying on it.</p>
		</main>
	);
}
