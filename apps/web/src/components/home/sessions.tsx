import { useState } from 'react';
import { Link } from 'react-router';
import type { ProductListItem } from '@/api/ecommerce-api';
import { useI18n } from '@/hooks/use-i18n';

export function Sessions({ products }: { products: ProductListItem[] }) {
	const { t } = useI18n();
	const [q, setQ] = useState('');
	const filtered = products.filter(p => p.title.toLowerCase().includes(q.toLowerCase()));

	return (
		<section id="sessions" className="sessions">
			<div className="eyebrow">{t('sess_eyebrow')}</div>
			<h2>{t('sess_t1')}<br /><em>{t('sess_t2')}</em></h2>
			<div className="search">
				<label htmlFor="search">{t('sess_search_label')}</label>
				<input id="search" value={q} maxLength={100} onChange={e => setQ(e.target.value)} placeholder={t('sess_search_ph')} />
			</div>
			<div className="grid">
				{filtered.map((p, i) => (
					<Link className="session" to={`/product/${encodeURIComponent(p.url_handle)}`} key={p.id}>
						{p.image ? <img src={p.image} alt={p.title} width="640" height="480" loading="lazy" /> : <div className="graphic">0{i + 1} ↗</div>}
						<small>{t('sess_card_cat')}</small>
						<h3>{p.title}</h3>
						<div className="price">{p.price_formatted}<span>{t('sess_card_cta')}</span></div>
					</Link>
				))}
			</div>
			{!filtered.length && <p>{t('sess_none')}</p>}
		</section>
	);
}
