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
import { neon } from '@neondatabase/serverless';

export type SpeakerStatus = 'pending' | 'approved' | 'suspended';

export type Speaker = {
	id: string;
	slug: string;
	status: SpeakerStatus;
	name: string;
	headline: string;
	category: string;
	specialties: string[];
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

const emptyDb = (): Db => ({ speakers: [], bookings: [] });
const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
const sql = databaseUrl ? neon(databaseUrl) : null;
let databaseReady: Promise<void> | null = null;

const ensureDatabase = async (): Promise<void> => {
	if (!sql) {
		return;
	}

	databaseReady ??= (async () => {
		await sql`CREATE TABLE IF NOT EXISTS ais_app_state (
			singleton smallint PRIMARY KEY CHECK (singleton = 1),
			version bigint NOT NULL,
			data jsonb NOT NULL
		)`;
		await sql`INSERT INTO ais_app_state (singleton, version, data)
			VALUES (1, 0, ${JSON.stringify(emptyDb())}::jsonb)
			ON CONFLICT (singleton) DO NOTHING`;
		await sql`CREATE TABLE IF NOT EXISTS ais_speaker_photos (
			file_name text PRIMARY KEY,
			data_base64 text NOT NULL
		)`;
	})();
	await databaseReady;
};

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
	if (sql) {
		await ensureDatabase();
		const [row] = await sql`SELECT data FROM ais_app_state WHERE singleton = 1`;

		return (row?.data as Db | undefined) ?? emptyDb();
	}

	await queue;

	return load();
};

const mutatePostgres = async <T>(fn: (db: Db) => T | Promise<T>): Promise<T> => {
	await ensureDatabase();

	for (let attempt = 0; attempt < 10; attempt += 1) {
		const [row] = await sql!`SELECT version, data FROM ais_app_state WHERE singleton = 1`;
		const db = structuredClone((row?.data as Db | undefined) ?? emptyDb());
		const result = await fn(db);
		const updated = await sql!`UPDATE ais_app_state
			SET version = version + 1, data = ${JSON.stringify(db)}::jsonb
			WHERE singleton = 1 AND version = ${Number(row?.version ?? 0)}
			RETURNING version`;

		if (updated.length > 0) {
			return result;
		}
	}

	throw new Error('Could not save the profile database after repeated concurrent updates');
};

export const putPhotoData = async (name: string, base64: string): Promise<void> => {
	if (sql) {
		await ensureDatabase();
		await sql`INSERT INTO ais_speaker_photos (file_name, data_base64)
			VALUES (${name}, ${base64})
			ON CONFLICT (file_name) DO UPDATE SET data_base64 = EXCLUDED.data_base64`;
		return;
	}

	await fs.mkdir(photosDir(), { recursive: true, mode: 0o700 });
	await fs.writeFile(path.join(photosDir(), name), Buffer.from(base64, 'base64'), { mode: 0o600 });
};

export const getPhotoData = async (name: string): Promise<Buffer | null> => {
	if (sql) {
		await ensureDatabase();
		const [row] = await sql`SELECT data_base64 FROM ais_speaker_photos WHERE file_name = ${name}`;
		return row?.data_base64 ? Buffer.from(String(row.data_base64), 'base64') : null;
	}

	try {
		return await fs.readFile(path.join(photosDir(), name));
	} catch {
		return null;
	}
};

export const deletePhotoData = async (name: string): Promise<void> => {
	if (sql) {
		await ensureDatabase();
		await sql`DELETE FROM ais_speaker_photos WHERE file_name = ${name}`;
		return;
	}

	await fs.rm(path.join(photosDir(), name), { force: true });
};

/** Runs `fn` against the database exclusively, then saves. A throw leaves the file untouched. */
export const mutateDb = <T>(fn: (db: Db) => T | Promise<T>): Promise<T> => {
	if (sql) {
		return mutatePostgres(fn);
	}

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
