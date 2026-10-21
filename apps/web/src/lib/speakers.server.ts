/**
 * Speaker onboarding, public directory and booking workflow.
 *
 * Confidentiality rules enforced here (routes only ever see these projections):
 *  - Public pages get `PublicSpeaker`: no email, phone or payout details, ever.
 *  - A speaker sees a client's contact details only after accepting that booking.
 *  - A client never sees the speaker's contact or payout details.
 *  - Public pages expose only `PublicSpeaker`; private contact and payout details stay encrypted.
 */
import { deletePhotoData, getPhotoData, putPhotoData, type Booking, type Speaker, mutateDb, readDb } from '@/lib/store.server';
import { COMMISSION_PCT, SITE_NAME, TERMS_VERSION } from '@/lib/config';
import { emailButton, emailLayout, sendMail } from '@/lib/mailer.server';
import { blindIndex, decryptJson, encryptJson, escapeHtml, randomId, signToken, verifyToken } from '@/lib/security.server';
import type { PayoutDetails } from '@/lib/validation';

const DAY = 86_400;

type SpeakerSecret = { email: string; phone: string; payout: PayoutDetails };
type BookingSecret = { clientName: string; clientEmail: string; clientPhone: string };

export type ProfileInput = {
	name: string;
	headline: string;
	category: string;
	specialties: string[];
	bio: string;
	languages: string[];
	city: string;
	linkedinUrl: string;
	instagramUrl: string;
	youtubeUrl: string;
	websiteUrl: string;
	feeInr: number | null;
	showFee: boolean;
};

export type PublicSpeaker = Pick<Speaker, 'slug' | 'name' | 'headline' | 'category' | 'specialties' | 'bio' | 'languages' | 'city' | 'linkedinUrl' | 'instagramUrl' | 'youtubeUrl' | 'websiteUrl'> & {
	photoUrl: string | null;
	feeInr: number | null;
};

const toPublic = (speaker: Speaker): PublicSpeaker => ({
	slug: speaker.slug,
	name: speaker.name,
	headline: speaker.headline,
	category: speaker.category,
	specialties: speaker.specialties ?? [],
	bio: speaker.bio,
	languages: speaker.languages,
	city: speaker.city,
	linkedinUrl: speaker.linkedinUrl ?? '',
	instagramUrl: speaker.instagramUrl ?? '',
	youtubeUrl: speaker.youtubeUrl ?? '',
	websiteUrl: speaker.websiteUrl ?? '',
	photoUrl: speaker.photo ? `/speaker-photo/${speaker.photo}` : null,
	feeInr: speaker.showFee ? speaker.feeInr : null,
});

const slugify = (name: string): string =>
	name
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 40) || 'speaker';

const adminEmail = (): string | null => process.env.ADMIN_EMAIL?.trim() || null;

const link = (origin: string, pathname: string, token: string) => `${origin}${pathname}?t=${encodeURIComponent(token)}`;

const manageToken = (speakerId: string) => signToken({ t: 'manage', sid: speakerId }, 30 * DAY);

const sendManageLinkEmail = async (speaker: Speaker, secret: SpeakerSecret, origin: string, isNew: boolean) => {
	const url = link(origin, '/manage', manageToken(speaker.id));

	await sendMail({
		to: secret.email,
		subject: isNew ? `Your ${SITE_NAME} profile is received` : `Your ${SITE_NAME} private profile link`,
		text: `${isNew ? 'Your profile is now live in the speaker directory.\n\n' : ''}Manage your profile, fee and payout details (private link, do not share):\n${url}\n\nThe link expires in 30 days.`,
		html: emailLayout(
			isNew ? 'Profile received' : 'Your private profile link',
			`<p>${isNew ? 'Thank you for registering. Your profile is now live in the speaker directory.' : 'Use the button below to manage your profile.'}</p>` +
				emailButton(url, 'Manage my profile') +
				'<p style="font-size:13px;color:#666">This link is private - anyone who has it can edit your profile. It expires in 30 days.</p>',
		),
	});
};

/* ---------------------------------------------------------------- photos */

const stripJpegMetadata = (buf: Buffer): Buffer => {
	const parts: Buffer[] = [buf.subarray(0, 2)];
	let i = 2;

	while (i + 4 <= buf.length) {
		if (buf[i] !== 0xff) {
			break;
		}

		const marker = buf[i + 1];

		if (marker === 0xda) {
			parts.push(buf.subarray(i));

			return Buffer.concat(parts);
		}

		const length = buf.readUInt16BE(i + 2);
		const segment = buf.subarray(i, i + 2 + length);

		// APP1 (EXIF/XMP, can hold GPS) through APP15 and comments are dropped; APP0 (JFIF) and APP2 (ICC) stay.
		const isMetadata = marker === 0xfe || (marker >= 0xe1 && marker <= 0xef && marker !== 0xe2);

		if (!isMetadata) {
			parts.push(segment);
		}

		i += 2 + length;
	}

	return Buffer.concat(parts);
};

const stripPngMetadata = (buf: Buffer): Buffer => {
	const parts: Buffer[] = [buf.subarray(0, 8)];
	let i = 8;
	const drop = new Set(['eXIf', 'tEXt', 'zTXt', 'iTXt', 'tIME']);

	while (i + 12 <= buf.length) {
		const length = buf.readUInt32BE(i);
		const type = buf.toString('ascii', i + 4, i + 8);
		const chunk = buf.subarray(i, i + 12 + length);

		if (!drop.has(type)) {
			parts.push(chunk);
		}

		i += 12 + length;
	}

	return Buffer.concat(parts);
};

export const PHOTO_MAX_BYTES = 2 * 1024 * 1024;

/** Validates by file signature (never the client-declared type), strips metadata, stores under a random name. */
const savePhoto = async (file: File): Promise<string> => {
	if (file.size > PHOTO_MAX_BYTES) {
		throw new Error('Photo must be 2 MB or smaller');
	}

	const buf = Buffer.from(await file.arrayBuffer());
	const isJpeg = buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
	const isPng = buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));

	if (!isJpeg && !isPng) {
		throw new Error('Photo must be a JPEG or PNG image');
	}

	const name = `${randomId(16)}.${isJpeg ? 'jpg' : 'png'}`;

	const cleanImage = isJpeg ? stripJpegMetadata(buf) : stripPngMetadata(buf);
	await putPhotoData(name, cleanImage.toString('base64'));

	return name;
};

const removePhoto = (name: string | null) => (name ? deletePhotoData(name) : Promise.resolve());

export const readPhoto = async (name: string): Promise<{ data: Buffer; type: string } | null> => {
	if (!/^[A-Za-z0-9_-]{16,40}\.(jpg|png)$/.test(name)) {
		return null;
	}

	const { speakers } = await readDb();

	if (!speakers.some(speaker => speaker.photo === name)) {
		return null;
	}

	const data = await getPhotoData(name);

	return data ? { data, type: name.endsWith('.png') ? 'image/png' : 'image/jpeg' } : null;
};

/* ------------------------------------------------------------ onboarding */

export const registerSpeaker = async (input: {
	profile: ProfileInput;
	email: string;
	phone: string;
	payout: PayoutDetails;
	photo: File | null;
	origin: string;
}): Promise<void> => {
	const emailIndex = blindIndex(input.email);
	const existing = (await readDb()).speakers.find(speaker => speaker.emailIndex === emailIndex);

	// Same visible outcome whether or not the address is already registered (no account enumeration).
	if (existing) {
		await sendManageLinkEmail(existing, decryptJson<SpeakerSecret>(existing.secret), input.origin, false);

		return;
	}

	const photo = input.photo && input.photo.size > 0 ? await savePhoto(input.photo) : null;
	const now = new Date().toISOString();
	const speaker = await mutateDb(db => {
		let slug = slugify(input.profile.name);

		while (db.speakers.some(item => item.slug === slug)) {
			slug = `${slugify(input.profile.name).slice(0, 32)}-${randomId(3).toLowerCase().replace(/[^a-z0-9]/g, 'x')}`;
		}

		const created: Speaker = {
			id: randomId(12),
			slug,
			status: 'approved',
			...input.profile,
			photo,
			secret: encryptJson({ email: input.email, phone: input.phone, payout: input.payout } satisfies SpeakerSecret),
			emailIndex,
			termsVersion: TERMS_VERSION,
			termsAcceptedAt: now,
			commissionPct: COMMISSION_PCT,
			createdAt: now,
			updatedAt: now,
		};

		db.speakers.push(created);

		return created;
	});

	await sendManageLinkEmail(speaker, { email: input.email, phone: input.phone, payout: input.payout }, input.origin, true);


};

export const requestManageLink = async (email: string, origin: string): Promise<void> => {
	const index = blindIndex(email);
	const speaker = (await readDb()).speakers.find(item => item.emailIndex === index);

	if (speaker) {
		const secret = decryptJson<SpeakerSecret>(speaker.secret);
		await sendManageLinkEmail(speaker, secret, origin, false);

	}
};

export const approveSpeaker = async (token: string | null): Promise<Speaker | null> => {
	const payload = verifyToken(token, 'approve');

	if (!payload) {
		return null;
	}

	const approved = await mutateDb(db => {
		const speaker = db.speakers.find(item => item.id === payload.sid);

		if (!speaker) {
			return null;
		}

		speaker.status = 'approved';
		speaker.updatedAt = new Date().toISOString();

		return structuredClone(speaker);
	});

	if (approved) {
		const secret = decryptJson<SpeakerSecret>(approved.secret);

		await sendMail({
			to: secret.email,
			subject: `You're live on ${SITE_NAME}`,
			text: `Your profile has been approved and is now visible to clients.`,
			html: emailLayout('Your profile is live', '<p>Your profile has been approved and is now visible to clients. You will be emailed whenever someone requests a booking.</p>'),
		});
	}

	return approved;
};

/* ------------------------------------------------------------- directory */

export const listPublicSpeakers = async (): Promise<PublicSpeaker[]> =>
	(await readDb()).speakers.filter(speaker => speaker.status === 'approved').map(toPublic);

export const getPublicSpeaker = async (slug: string): Promise<PublicSpeaker | null> => {
	// Public directory/profile pages include legacy profiles regardless of their old approval state.
	// A speaker who is publicly visible must remain bookable.
	const speaker = (await readDb()).speakers.find(item => item.slug === slug);

	return speaker ? toPublic(speaker) : null;
};

/* ------------------------------------------------------------ management */

export type ManageView = {
	profile: ProfileInput & { slug: string; status: Speaker['status']; photoUrl: string | null; commissionPct: number };
	contact: { email: string; phone: string };
	payoutSummary: { method: 'upi' | 'bank'; masked: string };
	bookings: Array<{
		id: string;
		status: Booking['status'];
		eventType: string;
		eventDate: string;
		eventCity: string;
		budgetInr: number | null;
		message: string;
		createdAt: string;
		client: { name: string; email: string; phone: string } | null;
	}>;
};

const mask = (value: string) => `${'•'.repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`;

const payoutSummaryOf = (payout: PayoutDetails) =>
	payout.payoutMethod === 'upi'
		? { method: 'upi' as const, masked: `${mask(payout.upiId.split('@')[0] ?? '')}@${payout.upiId.split('@')[1] ?? ''}` }
		: { method: 'bank' as const, masked: `${payout.accountName} - ${mask(payout.accountNumber)} - ${payout.ifsc}` };

export const loadManageView = async (token: string | null): Promise<ManageView | null> => {
	const payload = verifyToken(token, 'manage');

	if (!payload) {
		return null;
	}

	const db = await readDb();
	const speaker = db.speakers.find(item => item.id === payload.sid);

	if (!speaker) {
		return null;
	}

	const secret = decryptJson<SpeakerSecret>(speaker.secret);

	return {
		profile: {
			name: speaker.name,
			headline: speaker.headline,
			category: speaker.category,
			specialties: speaker.specialties ?? [],
			bio: speaker.bio,
			languages: speaker.languages,
			city: speaker.city,
			linkedinUrl: speaker.linkedinUrl ?? '',
			instagramUrl: speaker.instagramUrl ?? '',
			youtubeUrl: speaker.youtubeUrl ?? '',
			websiteUrl: speaker.websiteUrl ?? '',
			feeInr: speaker.feeInr,
			showFee: speaker.showFee,
			slug: speaker.slug,
			status: speaker.status,
			photoUrl: speaker.photo ? `/speaker-photo/${speaker.photo}` : null,
			commissionPct: speaker.commissionPct,
		},
		contact: { email: secret.email, phone: secret.phone },
		payoutSummary: payoutSummaryOf(secret.payout),
		bookings: db.bookings
			.filter(booking => booking.speakerId === speaker.id)
			.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
			.map(booking => {
				const client = booking.status === 'accepted' ? decryptJson<BookingSecret>(booking.secret) : null;

				return {
					id: booking.id,
					status: booking.status,
					eventType: booking.eventType,
					eventDate: booking.eventDate,
					eventCity: booking.eventCity,
					budgetInr: booking.budgetInr,
					message: booking.message,
					createdAt: booking.createdAt,
					client: client && { name: client.clientName, email: client.clientEmail, phone: client.clientPhone },
				};
			}),
	};
};

export const updateSpeaker = async (
	token: string | null,
	changes: { profile: ProfileInput; phone: string; payout: PayoutDetails | null; photo: File | null; removePhoto: boolean },
): Promise<boolean> => {
	const payload = verifyToken(token, 'manage');

	if (!payload) {
		return false;
	}

	const newPhoto = changes.photo && changes.photo.size > 0 ? await savePhoto(changes.photo) : null;
	let oldPhoto: string | null = null;

	const ok = await mutateDb(db => {
		const speaker = db.speakers.find(item => item.id === payload.sid);

		if (!speaker) {
			return false;
		}

		const secret = decryptJson<SpeakerSecret>(speaker.secret);

		Object.assign(speaker, changes.profile, { updatedAt: new Date().toISOString() });
		speaker.secret = encryptJson({ ...secret, phone: changes.phone, payout: changes.payout ?? secret.payout } satisfies SpeakerSecret);

		if (newPhoto || changes.removePhoto) {
			oldPhoto = speaker.photo;
			speaker.photo = newPhoto;
		}

		return true;
	});

	if (ok) {
		await removePhoto(oldPhoto);
	} else {
		await removePhoto(newPhoto);
	}

	return ok;
};

/** Permanently removes the profile and its photo using the owner's signed management link. */
export const deleteSpeakerProfile = async (token: string | null): Promise<boolean> => {
	const payload = verifyToken(token, 'manage');

	if (!payload) {
		return false;
	}

	let photo: string | null = null;
	const deleted = await mutateDb(db => {
		const index = db.speakers.findIndex(item => item.id === payload.sid);

		if (index < 0) {
			return false;
		}

		photo = db.speakers[index].photo;
		db.speakers.splice(index, 1);
		return true;
	});

	if (deleted) {
		await removePhoto(photo);
	}

	return deleted;
};

/* -------------------------------------------------------------- bookings */

export type BookingInput = {
	clientName: string;
	clientEmail: string;
	clientPhone: string;
	eventType: string;
	eventDate: string;
	eventCity: string;
	budgetInr: number | null;
	message: string;
};

const inr = (value: number | null) => (value == null ? 'Not specified' : `₹${value.toLocaleString('en-IN')}`);

export const createBooking = async (slug: string, input: BookingInput, origin: string): Promise<boolean> => {
	const speaker = (await readDb()).speakers.find(item => item.slug === slug && item.status === 'approved');

	if (!speaker) {
		return false;
	}

	const { clientName, clientEmail, clientPhone, ...event } = input;
	const booking: Booking = {
		id: randomId(12),
		speakerId: speaker.id,
		status: 'pending',
		secret: encryptJson({ clientName, clientEmail, clientPhone } satisfies BookingSecret),
		...event,
		createdAt: new Date().toISOString(),
		respondedAt: null,
	};

	await mutateDb(db => {
		db.bookings.push(booking);
	});

	const respond = link(origin, '/booking/respond', signToken({ t: 'booking', bid: booking.id }, 14 * DAY));
	const secret = decryptJson<SpeakerSecret>(speaker.secret);
	const details =
		`Event: ${event.eventType}\nDate: ${event.eventDate}\nCity: ${event.eventCity}\nBudget: ${inr(event.budgetInr)}\n\nMessage:\n${event.message}`;

	// Notify the speaker (no client contact details until they accept).
	await sendMail({
		to: secret.email,
		subject: `New booking request: ${event.eventType} on ${event.eventDate}`,
		text: `You have a new booking request on ${SITE_NAME}.\n\n${details}\n\nAccept or decline:\n${respond}\n\nClient contact details are shared once you accept.`,
		html: emailLayout(
			'New booking request',
			`<p><strong>${escapeHtml(event.eventType)}</strong><br/>Date: ${escapeHtml(event.eventDate)}<br/>City: ${escapeHtml(event.eventCity)}<br/>Budget: ${escapeHtml(inr(event.budgetInr))}</p>` +
				`<p style="white-space:pre-wrap">${escapeHtml(event.message)}</p>` +
				emailButton(respond, 'Review & respond') +
				'<p style="font-size:13px;color:#666">Client contact details are shared once you accept.</p>',
		),
	});

	// Acknowledge to the client.
	await sendMail({
		to: clientEmail,
		subject: `We received your request for ${speaker.name}`,
		text: `Hi ${clientName},\n\nYour booking request for ${speaker.name} has been sent. You will get an email as soon as they respond.\n\n${details}`,
		html: emailLayout(
			'Request sent',
			`<p>Hi ${escapeHtml(clientName)}, your booking request for <strong>${escapeHtml(speaker.name)}</strong> has been sent. You will receive an email as soon as they respond.</p>`,
		),
	});

	const owner = adminEmail();

	if (owner) {
		await sendMail({
			to: owner,
			subject: `Booking request: ${speaker.name} - ${event.eventType}`,
			text: `${clientName} requested ${speaker.name}.\n\n${details}`,
			html: emailLayout('New booking request', `<p>${escapeHtml(clientName)} requested <strong>${escapeHtml(speaker.name)}</strong>.</p><p style="white-space:pre-wrap">${escapeHtml(details)}</p>`),
		});
	}

	return true;
};

export type RespondView = {
	status: Booking['status'];
	speakerName: string;
	eventType: string;
	eventDate: string;
	eventCity: string;
	budgetInr: number | null;
	message: string;
	commissionPct: number;
	client: { name: string; email: string; phone: string } | null;
};

const respondView = (booking: Booking, speaker: Speaker): RespondView => {
	const client = booking.status === 'accepted' ? decryptJson<BookingSecret>(booking.secret) : null;

	return {
		status: booking.status,
		speakerName: speaker.name,
		eventType: booking.eventType,
		eventDate: booking.eventDate,
		eventCity: booking.eventCity,
		budgetInr: booking.budgetInr,
		message: booking.message,
		commissionPct: speaker.commissionPct,
		client: client && { name: client.clientName, email: client.clientEmail, phone: client.clientPhone },
	};
};

export const loadRespondView = async (token: string | null): Promise<RespondView | null> => {
	const payload = verifyToken(token, 'booking');

	if (!payload) {
		return null;
	}

	const db = await readDb();
	const booking = db.bookings.find(item => item.id === payload.bid);
	const speaker = booking && db.speakers.find(item => item.id === booking.speakerId);

	return booking && speaker ? respondView(booking, speaker) : null;
};

/** Single-use: only a pending booking can be answered, so a replayed link changes nothing. */
export const respondToBooking = async (token: string | null, decision: 'accept' | 'decline'): Promise<RespondView | null> => {
	const payload = verifyToken(token, 'booking');

	if (!payload) {
		return null;
	}

	const result = await mutateDb(db => {
		const booking = db.bookings.find(item => item.id === payload.bid);
		const speaker = booking && db.speakers.find(item => item.id === booking.speakerId);

		if (!booking || !speaker) {
			return null;
		}

		const changed = booking.status === 'pending';

		if (changed) {
			booking.status = decision === 'accept' ? 'accepted' : 'declined';
			booking.respondedAt = new Date().toISOString();
		}

		return { booking: structuredClone(booking), speaker: structuredClone(speaker), changed };
	});

	if (!result) {
		return null;
	}

	const { booking, speaker, changed } = result;

	if (changed) {
		const client = decryptJson<BookingSecret>(booking.secret);
		const accepted = booking.status === 'accepted';
		const summary = `Event: ${booking.eventType}\nDate: ${booking.eventDate}\nCity: ${booking.eventCity}`;

		await sendMail({
			to: client.clientEmail,
			subject: accepted ? `${speaker.name} accepted your booking request` : `Update on your request for ${speaker.name}`,
			text: accepted
				? `Hi ${client.clientName},\n\nGood news - ${speaker.name} has accepted your booking request.\n\n${summary}\n\nOur team will contact you shortly with the confirmation, contract and payment details.`
				: `Hi ${client.clientName},\n\nUnfortunately ${speaker.name} is not available for this request.\n\n${summary}\n\nYou are welcome to browse other speakers on ${SITE_NAME}.`,
			html: emailLayout(
				accepted ? 'Booking accepted' : 'Request update',
				accepted
					? `<p>Hi ${escapeHtml(client.clientName)},</p><p>Good news - <strong>${escapeHtml(speaker.name)}</strong> has accepted your booking request.</p><p style="white-space:pre-wrap">${escapeHtml(summary)}</p><p>Our team will contact you shortly with the confirmation, contract and payment details.</p>`
					: `<p>Hi ${escapeHtml(client.clientName)},</p><p>Unfortunately <strong>${escapeHtml(speaker.name)}</strong> is not available for this request.</p><p>You are welcome to browse other speakers on ${escapeHtml(SITE_NAME)}.</p>`,
			),
		});

		const owner = adminEmail();

		if (owner) {
			await sendMail({
				to: owner,
				subject: `Booking ${booking.status}: ${speaker.name} - ${booking.eventType}`,
				text: `${speaker.name} ${booking.status} the request from ${client.clientName} (${client.clientEmail}, ${client.clientPhone}).\n\n${summary}`,
				html: emailLayout(`Booking ${booking.status}`, `<p>${escapeHtml(speaker.name)} ${escapeHtml(booking.status)} the request from ${escapeHtml(client.clientName)} (${escapeHtml(client.clientEmail)}, ${escapeHtml(client.clientPhone)}).</p><p style="white-space:pre-wrap">${escapeHtml(summary)}</p>`),
			});
		}
	}

	return respondView(booking, speaker);
};
