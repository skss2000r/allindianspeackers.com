import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
	index('routes/home.tsx'),
 route('product/:handle','routes/product.$handle.tsx'),
 route('cart','routes/cart.tsx'),
 route('speakers','routes/speakers.tsx'),
 route('speakers/:slug','routes/speakers.$slug.tsx'),
 route('become-a-speaker','routes/become-a-speaker.tsx'),
 route('auth/linkedin', 'routes/auth.linkedin.tsx'),
 route('auth/linkedin/callback', 'routes/auth.linkedin.callback.tsx'),
 route('manage','routes/manage.tsx'),
 route('booking/respond','routes/booking.respond.tsx'),
 route('admin/approve','routes/admin.approve.tsx'),
 route('terms','routes/terms.tsx'),
 route('speaker-photo/:file','routes/speaker-photo.$file.ts'),
 route('checkout/success','routes/checkout.success.tsx'),
 route('checkout/cancelled','routes/checkout.cancelled.tsx'),
	route('sitemap.xml', 'routes/sitemap.xml.ts'),
	route('robots.txt', 'routes/robots.txt.ts'),
	route('api/health', 'routes/api.health.ts'),
	route('api/profile-suggestions', 'routes/api.profile-suggestions.ts'),
	route('api/*', 'routes/api.$.ts'),
] satisfies RouteConfig;
