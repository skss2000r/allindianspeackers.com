import {
	data,
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useRouteLoaderData,
} from 'react-router';
import type { Route } from './+types/root';
import stylesheet from '@/index.css?url';
import { CartProvider } from '@/hooks/use-ecommerce-cart';
import { SiteChrome } from '@/components/site-chrome';
import { CookieBanner } from '@/components/cookie-banner';
import { siteOrigin } from '@/lib/site-origin.server';
import { I18nProvider } from '@/hooks/use-i18n';
import { isLangCode, LANG_COOKIE, type LangCode } from '@/lib/i18n';
import { HorizonsPreviewScripts } from './horizons-preview-scripts';

export const links: Route.LinksFunction = () => [
	{ rel: 'stylesheet', href: stylesheet },
	{ rel: 'icon', href: '/favicon.ico', sizes: '32x32' },
	{ rel: 'preconnect', href: 'https://fonts.googleapis.com' },
	{
		rel: 'preconnect',
		href: 'https://fonts.gstatic.com',
		crossOrigin: 'anonymous',
	},
	{
		rel: 'stylesheet',
		href: 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Manrope:wght@400;500;600;700&display=swap',
	},
];

/**
 * Publishes the site's public origin, which `seo()` reads to build canonical and
 * `og:url` tags, and advertises the sitemap to crawlers that read response
 * headers rather than HTML.
 *
 * A `meta` export can only reach server data through `matches`, and the `headers`
 * export cannot see loader data at all, so both have to travel this way.
 */
export function loader({ request }: Route.LoaderArgs) {
	const origin = siteOrigin(request);
	const cookie = request.headers.get('cookie')?.match(new RegExp(`(?:^|;\\s*)${LANG_COOKIE}=([a-z]{2})`))?.[1];
	const lang: LangCode = isLangCode(cookie) ? cookie : 'en';

	return data(
		{ origin, lang },
		{
			headers: {
				Link: `<${origin}/sitemap.xml>; rel="sitemap"; type="application/xml"`,
				// The page body depends on the language cookie.
				Vary: 'Cookie',
			},
		},
	);
}

/**
 * A page route that exports `headers` replaces this one, so merge `parentHeaders`
 * there rather than returning only that route's own headers.
 */
export function headers({ loaderHeaders }: Route.HeadersArgs) {
	return loaderHeaders;
}

export function Layout({ children }: { children: React.ReactNode }) {
	const rootData = useRouteLoaderData<typeof loader>('root');

	return (
		// suppressHydrationWarning absorbs attributes injected by browser extensions
		// and theme scripts before hydration; attribute-only, one element deep. Keep both.
		<html lang={rootData?.lang ?? 'en'} suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
				<HorizonsPreviewScripts />
			</head>
			<body suppressHydrationWarning>
				<div id="root">{children}</div>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App({ loaderData }: Route.ComponentProps) {
	return (
		<I18nProvider initialLang={loaderData.lang}>
			<CartProvider><SiteChrome /><Outlet /><CookieBanner /></CartProvider>
		</I18nProvider>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = 'Oops!';
	let details = 'An unexpected error occurred.';
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? '404' : 'Error';
		details =
			error.status === 404
				? 'The requested page could not be found.'
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main>
			<h1>{message}</h1>
			<p>{details}</p>
			{stack ? (
				<pre>
					<code>{stack}</code>
				</pre>
			) : null}
		</main>
	);
}
