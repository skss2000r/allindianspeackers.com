import { useI18n } from '@/hooks/use-i18n';

export function Hero() {
	const { t } = useI18n();

	return (
		<section className="hero">
			<div className="eyebrow">{t('hero_eyebrow')}</div>
			<h1>{t('hero_l1')}<br /><em>{t('hero_l2')}</em></h1>
			<div className="hero-bottom">
				<p>{t('hero_p1')}<br />{t('hero_p2')}</p>
				<a className="action" href="/speakers">{t('hero_cta')}</a>
			</div>
			<div className="orbit" aria-hidden="true">AIS</div>
		</section>
	);
}
