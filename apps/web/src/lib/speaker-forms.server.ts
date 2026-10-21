import { type ProfileInput } from '@/lib/speakers.server';
import { fieldErrors, payoutSchema, speakerContactSchema, speakerProfileSchema, type PayoutDetails } from '@/lib/validation';

const text = (form: FormData, key: string): string => {
	const value = form.get(key);

	return typeof value === 'string' ? value : '';
};

export type FormValues = Record<string, string>;

export const echoValues = (form: FormData): FormValues => {
	const keys = ['name', 'headline', 'category', 'bio', 'languages', 'city', 'feeInr', 'email', 'phone', 'payoutMethod', 'accountName', 'ifsc', 'showFee'];

	return Object.fromEntries(keys.map(key => [key, text(form, key)]));
};

export const parseProfile = (form: FormData) => {
	const result = speakerProfileSchema.safeParse(Object.fromEntries(['name', 'headline', 'category', 'bio', 'languages', 'city', 'feeInr', 'showFee'].map(key => [key, text(form, key)])));

	return result.success
		? { data: result.data as ProfileInput, errors: {} as Record<string, string> }
		: { data: undefined, errors: fieldErrors(result.error) };
};

export const parseContact = (form: FormData, fields: Array<'email' | 'phone'>) => {
	const result = speakerContactSchema.safeParse({ email: text(form, 'email') || 'placeholder@example.com', phone: text(form, 'phone') });

	if (!result.success) {
		const errors = fieldErrors(result.error);

		return { data: undefined, errors: Object.fromEntries(Object.entries(errors).filter(([key]) => (fields as string[]).includes(key))) as Record<string, string> };
	}

	return { data: result.data, errors: {} as Record<string, string> };
};

export const parsePayout = (form: FormData) => {
	const result = payoutSchema.safeParse({
		payoutMethod: text(form, 'payoutMethod'),
		upiId: text(form, 'upiId'),
		accountName: text(form, 'accountName'),
		accountNumber: text(form, 'accountNumber'),
		ifsc: text(form, 'ifsc'),
	});

	return result.success
		? { data: result.data as PayoutDetails, errors: {} as Record<string, string> }
		: { data: undefined, errors: fieldErrors(result.error) };
};

export const photoFrom = (form: FormData): File | null => {
	const value = form.get('photo');

	return value instanceof File && value.size > 0 ? value : null;
};
