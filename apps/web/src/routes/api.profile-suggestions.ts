import { apiError, readJsonBody, withApi } from '@/lib/api.server';
import { assertSameOrigin } from '@/lib/security.server';

type GoogleItem = {
	title?: unknown;
	link?: unknown;
	snippet?: unknown;
	displayLink?: unknown;
};

export const action = withApi(async ({ request }) => {
	assertSameOrigin(request);

	if (request.method !== 'POST') {
		return apiError(405, 'Use POST for profile search');
	}

	const body = await readJsonBody<{ identifier?: unknown }>(request);
	const identifier = typeof body.identifier === 'string' ? body.identifier.trim() : '';

	if (identifier.length < 2 || identifier.length > 300) {
		return apiError(400, 'Enter a social profile link or @handle');
	}

	const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
	const engineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

	if (!apiKey || !engineId) {
		return apiError(503, 'Google profile search is not configured yet');
	}

	const search = new URL('https://www.googleapis.com/customsearch/v1');
	search.searchParams.set('key', apiKey);
	search.searchParams.set('cx', engineId);
	search.searchParams.set('q', `"${identifier}" speaker`);
	search.searchParams.set('num', '6');

	try {
		const response = await fetch(search, { signal: AbortSignal.timeout(8000) });

		if (!response.ok) {
			return apiError(503, 'Google profile search is temporarily unavailable');
		}

		const payload = await response.json() as { items?: GoogleItem[] };
		const results = (payload.items ?? []).slice(0, 6).flatMap(item => {
			if (typeof item.title !== 'string' || typeof item.link !== 'string' || typeof item.snippet !== 'string') {
				return [];
			}

			try {
				const url = new URL(item.link);

				if (url.protocol !== 'https:' || url.username || url.password) {
					return [];
				}

				return [{
					title: item.title.slice(0, 200),
					snippet: item.snippet.slice(0, 600),
					url: url.toString().slice(0, 500),
					displayLink: typeof item.displayLink === 'string' ? item.displayLink.slice(0, 160) : url.hostname,
				}];
			} catch {
				return [];
			}
		});

		return { results };
	} catch {
		// Do not surface request details: Google Search API keys are present in its server-side URL.
		return apiError(503, 'Google profile search is temporarily unavailable');
	}
});
