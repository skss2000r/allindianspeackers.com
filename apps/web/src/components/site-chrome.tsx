import { Link } from 'react-router';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useCart } from '@/hooks/use-ecommerce-cart';
import { useI18n } from '@/hooks/use-i18n';
import { openCookiePreferences } from '@/lib/cookie-consent';

export function SiteChrome() {
	const c = useCart();
	const { t } = useI18n();

	return (
		<>
			<header>
				<Link to="/" className="brand"><span>ALL INDIAN</span><strong>SPEAKERS<span className="pink">.</span></strong></Link>
				<nav>
					<Link to="/speakers" className="nav-text">{t('nav_speakers')}</Link>
					<Link to="/become-a-speaker" className="nav-text">{t('nav_join')}</Link>
					<Link to="/#sessions" className="nav-text">{t('nav_discover')}</Link>
					<LanguageSwitcher />
					<Link className="action" to="/cart">{t('nav_cart')} {c.isLoading ? '' : `(${c.itemCount})`} ↗</Link>
				</nav>
			</header>
			<footer>
				<div className="footer-title">{t('footer_t1')}<br /><em>{t('footer_t2')}</em></div>
				<div className="footer-bottom">
					<span>{t('footer_brand')}</span>
					<Link to="/#sessions">{t('footer_explore')}</Link>
					<Link to="/terms">{t('footer_terms')}</Link>
					<button onClick={openCookiePreferences}>{t('footer_cookie')}</button>
				</div>
			</footer>
		</>
	);
}
