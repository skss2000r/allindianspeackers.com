import { z } from 'zod';
import { SPEAKER_CATEGORIES, SPEAKER_SPECIALTIES } from '@/lib/config';

const clean = (max: number, min = 0) =>
	z
		.string()
		.trim()
		// Strip control characters (keeps newlines/tabs) so stored text cannot smuggle terminal or header tricks.
		.transform(value => value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ''))
		.pipe(z.string().min(min, 'This field is required').max(max, `Keep this under ${max} characters`));

const phone = z
	.string()
	.trim()
	.regex(/^[+0-9 ()-]{7,20}$/, 'Enter a valid phone number');
const email = z.string().trim().toLowerCase().email('Enter a valid email address').max(254);

const optionalFee = z
	.string()
	.trim()
	.transform(value => (value === '' ? null : Number(value.replaceAll(',', ''))))
	.pipe(z.number().int('Whole rupees only').min(0).max(100_000_000).nullable());

export const speakerProfileSchema = z.object({
	name: clean(80, 2),
	headline: clean(120),
	category: z.enum(SPEAKER_CATEGORIES),
	specialties: z.array(z.enum(SPEAKER_SPECIALTIES)).min(1, 'Choose at least one specialty').max(6, 'Choose up to six specialties'),
	bio: clean(1500, 20),
	languages: clean(120, 2).transform(value =>
		value
			.split(',')
			.map(item => item.trim())
			.filter(Boolean)
			.slice(0, 8),
	),
	city: clean(60, 2),
	feeInr: optionalFee,
	showFee: z.string().optional().transform(value => value === 'on'),
});

export const speakerContactSchema = z.object({ email, phone });

export const payoutSchema = z.discriminatedUnion('payoutMethod', [
	z.object({
		payoutMethod: z.literal('upi'),
		upiId: z
			.string()
			.trim()
			.regex(/^[a-zA-Z0-9._-]{2,64}@[a-zA-Z][a-zA-Z0-9.-]{1,63}$/, 'Enter a valid UPI ID, e.g. name@bank'),
	}),
	z.object({
		payoutMethod: z.literal('bank'),
		accountName: clean(80, 2),
		accountNumber: z.string().trim().regex(/^\d{9,18}$/, 'Account number must be 9–18 digits'),
		ifsc: z
			.string()
			.trim()
			.toUpperCase()
			.regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Enter a valid IFSC code'),
	}),
]);

export const bookingSchema = z.object({
	clientName: clean(80, 2),
	clientEmail: email,
	clientPhone: phone,
	eventType: clean(80, 2),
	eventDate: z
		.string()
		.trim()
		.regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose the event date')
		.refine(value => !Number.isNaN(Date.parse(value)) && Date.parse(value) >= Date.now() - 86_400_000, 'Choose a future date'),
	eventCity: clean(80, 2),
	budgetInr: optionalFee,
	message: clean(1000),
});

export type PayoutDetails = z.infer<typeof payoutSchema>;

export const fieldErrors = (error: z.ZodError): Record<string, string> => {
	const out: Record<string, string> = {};

	for (const issue of error.issues) {
		const key = String(issue.path[0] ?? 'form');

		out[key] ??= issue.message;
	}

	return out;
};
