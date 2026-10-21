import { useId } from 'react';
import { useI18n } from '@/hooks/use-i18n';
import { isLangCode, LANGUAGES } from '@/lib/i18n';

export function LanguageSwitcher() {
	const { lang, setLang, t } = useI18n();
	const id = useId();

	return (
		<div className="lang-switch">
			<label htmlFor={id} className="sr-only">{t('lang_label')}</label>
			<select id={id} value={lang} onChange={event => isLangCode(event.target.value) && setLang(event.target.value)}>
				{LANGUAGES.map(option => (
					<option key={option.code} value={option.code} lang={option.code}>{option.label}</option>
				))}
			</select>
		</div>
	);
}
