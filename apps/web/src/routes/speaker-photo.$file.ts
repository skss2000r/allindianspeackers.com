import type { Route } from './+types/speaker-photo.$file';
import { readPhoto } from '@/lib/speakers.server';

export async function loader({ params }: Route.LoaderArgs) {
	const photo = await readPhoto(params.file);

	if (!photo) {
		return new Response('Not found', { status: 404 });
	}

	return new Response(new Uint8Array(photo.data), {
		headers: {
			'Content-Type': photo.type,
			'Content-Length': String(photo.data.length),
			'X-Content-Type-Options': 'nosniff',
			'Content-Security-Policy': "default-src 'none'; sandbox",
			'Cross-Origin-Resource-Policy': 'same-origin',
			'Cache-Control': 'public, max-age=3600',
		},
	});
}
