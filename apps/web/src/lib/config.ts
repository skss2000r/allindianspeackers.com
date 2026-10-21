/** Business constants shared by server and client. Change them here only. */
export const COMMISSION_PCT = 20;
export const TERMS_VERSION = '2026-10-21';
/** Business days after a completed event within which the speaker's share is settled. */
export const PAYOUT_BUSINESS_DAYS = 7;
export const SITE_NAME = 'All Indian Speakers';

export const SPEAKER_CATEGORIES = [
	'Leadership & Business',
	'Technology & Innovation',
	'Sports',
	'Film, TV & Entertainment',
	'Music & Performing Arts',
	'Education & Academia',
	'Health & Wellness',
	'Social Impact',
	'Other',
] as const;
