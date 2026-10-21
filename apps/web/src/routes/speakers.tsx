import { Link } from 'react-router';
import type { Route } from './+types/speakers';
import { seo } from '@/lib/seo';
import { listPublicSpeakers } from '@/lib/speakers.server';

export async function loader() {
	return { speakers: await listPublicSpeakers() };
}

export function meta({ matches, location }: Route.MetaArgs) {
	return seo({ matches, location }, {
		title: 'Speakers & celebrities — All Indian Speakers',
		description: 'Browse approved speakers and celebrities and send a booking request. Profiles are verified before they go live.',
	});
}

export default function Speakers({ loaderData }: Route.ComponentProps) {
	return (
		<main className="detail">
			<div className="eyebrow">VERIFIED VOICES</div>
			<h1>Speakers.</h1>
			{!loaderData.speakers.length && <p>No profiles are live yet. <Link to="/become-a-speaker">Be the first to add yours →</Link></p>}
			<div className="grid speakers-grid">
				{loaderData.speakers.map(speaker => (
					<Link key={speaker.slug} className="session" to={`/speakers/${encodeURIComponent(speaker.slug)}`}>
						{speaker.photoUrl ? <img src={speaker.photoUrl} alt={speaker.name} width="640" height="480" loading="lazy" /> : <div className="graphic">{speaker.name.slice(0, 1)}</div>}
						<small>{speaker.category.toUpperCase()}</small>
						<h3>{speaker.name}</h3>
						<div className="price">{speaker.headline}<span>View profile ↗</span></div>
					</Link>
				))}
			</div>
		</main>
	);
}
