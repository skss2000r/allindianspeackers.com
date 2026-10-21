import { Link } from 'react-router';
import { formatCurrency } from '@/api/ecommerce-api';
import { LanguageSwitcher } from '@/components/language-switcher';
import { cartLineKey, useCart } from '@/hooks/use-ecommerce-cart';
import { useEcommerceCheckout } from '@/hooks/use-ecommerce-checkout';
import { useI18n } from '@/hooks/use-i18n';
import { COMMISSION_PCT } from '@/lib/config';

export function CartPanel() {
	const c = useCart();
	const checkout = useEcommerceCheckout();
	const { t } = useI18n();

	return (
		<main className="detail">
			<div className="detail-top">
				<div className="eyebrow">{t('cart_eyebrow')}</div>
				<LanguageSwitcher />
			</div>
			<h1>{t('cart_title')}</h1>
			{c.isLoading ? (
				<p>{t('cart_loading')}</p>
			) : !c.lines.length ? (
				<p>{t('cart_empty')} <Link to="/#sessions">{t('cart_explore')}</Link></p>
			) : (
				<>
					{c.lines.map(l => (
						<div className="cart-row" key={cartLineKey(l)}>
							<h2>{l.title}</h2>
							<p>{formatCurrency(l.priceInCents, l.currencyInfo)}</p>
							<label>{t('cart_qty')} <input type="number" min="1" max="99" value={l.quantity} onChange={e => c.setQuantity(cartLineKey(l), Number(e.target.value))} /></label>
							<button onClick={() => c.removeLine(cartLineKey(l))}>{t('cart_remove')}</button>
						</div>
					))}
					<h2>{t('cart_total')} {formatCurrency(c.totalInCents, c.currencyInfo)}</h2>
					<p>{t('cart_commission', { pct: COMMISSION_PCT, amount: formatCurrency(Math.round(c.totalInCents * COMMISSION_PCT / 100), c.currencyInfo) })}</p>
					<button className="action" disabled={checkout.isBusy} onClick={() => checkout.start()}>{checkout.isBusy ? t('cart_pay_busy') : t('cart_pay')}</button>
					{checkout.error != null && <p role="alert">{t('cart_error')}</p>}
					{checkout.shortages.length > 0 && <button onClick={checkout.applyAvailableStock}>{t('cart_stock')}</button>}
				</>
			)}
		</main>
	);
}
