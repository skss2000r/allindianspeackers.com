import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import type { Route } from './+types/speakers';
import { seo } from '@/lib/seo';
import { SPEAKER_SPECIALTIES } from '@/lib/config';
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
	const [query, setQuery] = useState('');
	const [specialty, setSpecialty] = useState('all');
	const speakers = useMemo(() => loaderData.speakers.filter(speaker => {
		const text = [speaker.name, speaker.headline, speaker.category, speaker.city, speaker.bio, ...speaker.specialties].join(' ').toLowerCase();
		return text.includes(query.trim().toLowerCase()) && (specialty === 'all' || speaker.specialties.includes(specialty));
	}), [loaderData.speakers, query, specialty]);

	return (
		<main className="detail">
			<div className="eyebrow">VERIFIED VOICES</div>
			<h1>Speakers.</h1>
			{!loaderData.speakers.length && <p>No approved profiles are live yet. Speakers can <Link to="/become-a-speaker">create a profile</Link>; approved profiles appear here automatically.</p>}
			{loaderData.speakers.length > 0 && <div className="form">
				<label className="field"><span>Search speakers</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Name, topic, or city" /></label>
				<label className="field"><span>Filter by specialty</span><select value={specialty} onChange={event => setSpecialty(event.target.value)}><option value="all">All specialties</option>{SPEAKER_SPECIALTIES.map(item => <option key={item}>{item}</option>)}</select></label>
				<p className="hint">Showing {speakers.length} of {loaderData.speakers.length} approved speakers</p>
			</div>}
			<div className="grid speakers-grid">
				{speakers.map(speaker => (
					<Link key={speaker.slug} className="session" to={`/speakers/${encodeURIComponent(speaker.slug)}`}>
						{speaker.photoUrl ? <img src={speaker.photoUrl} alt={speaker.name} width="640" height="480" loading="lazy" /> : <div className="graphic">{speaker.name.slice(0, 1)}</div>}
						<small>{speaker.category.toUpperCase()}</small>
						{speaker.specialties.length > 0 && <small>{speaker.specialties.join(' · ')}</small>}
						<h3>{speaker.name}</h3>
						<div className="price">{speaker.headline}<span>View profile ↗</span></div>
					</Link>
				))}
			</div>
			{loaderData.speakers.length > 0 && speakers.length === 0 && <p>No speakers match that search. Try a different name or specialty.</p>}
		</main>
	);
}
