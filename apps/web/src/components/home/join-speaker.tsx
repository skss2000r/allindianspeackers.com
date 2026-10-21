import { Link } from 'react-router';
import { useI18n } from '@/hooks/use-i18n';

/** Band directly under the hero inviting speakers and celebrities to create a profile. */
export function JoinSpeaker() {
	const { t } = useI18n();

	return (
		<section className="join" aria-labelledby="join-title">
			<Link to="/become-a-speaker" className="join-icon" aria-label={t('nav_join')}>
				<svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
					<circle cx="10" cy="8" r="4" />
					<path d="M2.5 21c.6-4 3.6-6.5 7.5-6.5 1.2 0 2.3.2 3.3.6" />
					<path d="M19 14v6M16 17h6" />
				</svg>
			</Link>
			<div className="join-copy">
				<div className="eyebrow">{t('join_eyebrow')}</div>
				<h2 id="join-title">{t('join_title')}</h2>
				<p>{t('join_text')}</p>
				<small>{t('join_terms')} <Link to="/terms">{t('footer_terms')}</Link></small>
			</div>
			<Link className="action" to="/become-a-speaker">{t('join_cta')}</Link>
		</section>
	);
}
