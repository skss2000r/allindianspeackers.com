/**
 * Minimal persistent store for speakers and bookings: one JSON file written
 * atomically (temp file + rename, mode 0600) and serialised through a queue so
 * concurrent requests cannot interleave writes.
 *
 * Confidential values are never stored here in plain text: they live inside the
 * `secret` field, encrypted by `security.server.ts`.
 *
 * DATA_DIR must point at storage that survives restarts and redeploys. If the
 * host wipes the app folder on deploy, move this behind a managed database; the
 * rest of the app only talks to `readDb` / `mutateDb`.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

export type SpeakerStatus = 'pending' | 'approved' | 'suspended';

export type Speaker = {
	id: string;
	slug: string;
	status: SpeakerStatus;
	name: string;
	headline: string;
	category: string;
	bio: string;
	languages: string[];
	city: string;
	feeInr: number | null;
	showFee: boolean;
	/** File name inside DATA_DIR/photos, or null. */
	photo: string | null;
	/** Encrypted JSON: email, phone, payout details. */
	secret: string;
	emailIndex: string;
	termsVersion: string;
	termsAcceptedAt: string;
	commissionPct: number;
	createdAt: string;
	updatedAt: string;
};

export type BookingStatus = 'pending' | 'accepted' | 'declined';

export type Booking = {
	id: string;
	speakerId: string;
	status: BookingStatus;
	/** Encrypted JSON: client name, email, phone. */
	secret: string;
	eventType: string;
	eventDate: string;
	eventCity: string;
	budgetInr: number | null;
	message: string;
	createdAt: string;
	respondedAt: string | null;
};

type Db = { speakers: Speaker[]; bookings: Booking[] };

export const dataDir = (): string => path.resolve(process.env.DATA_DIR || path.join(process.cwd(), '.data'));

const dbFile = () => path.join(dataDir(), 'db.json');

let cache: Db | null = null;
let queue: Promise<unknown> = Promise.resolve();

const load = async (): Promise<Db> => {
	if (cache) {
		return cache;
	}

	await fs.mkdir(dataDir(), { recursive: true, mode: 0o700 });

	try {
		cache = JSON.parse(await fs.readFile(dbFile(), 'utf8')) as Db;
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
			throw error;
		}

		cache = { speakers: [], bookings: [] };
	}

	return cache;
};

const persist = async (db: Db): Promise<void> => {
	const tmp = `${dbFile()}.${process.pid}.tmp`;

	await fs.writeFile(tmp, JSON.stringify(db), { mode: 0o600 });
	await fs.rename(tmp, dbFile());
};

export const readDb = async (): Promise<Readonly<Db>> => {
	await queue;

	return load();
};

/** Runs `fn` against the database exclusively, then saves. A throw leaves the file untouched. */
export const mutateDb = <T>(fn: (db: Db) => T | Promise<T>): Promise<T> => {
	const run = queue.then(async () => {
		const db = await load();
		const snapshot = structuredClone(db);

		try {
			const result = await fn(db);

			await persist(db);

			return result;
		} catch (error) {
			cache = snapshot;

			throw error;
		}
	});

	queue = run.catch(() => undefined);

	return run;
};

export const photosDir = (): string => path.join(dataDir(), 'photos');
