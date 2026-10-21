import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LANG_COOKIE, type LangCode, type MessageKey, translate } from '@/lib/i18n';

type I18nValue = {
	lang: LangCode;
	setLang: (lang: LangCode) => void;
	t: (key: MessageKey, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

/** The server reads the language cookie, so the first paint already matches the visitor's choice. */
export function I18nProvider({ initialLang, children }: { initialLang: LangCode; children: ReactNode }) {
	const [lang, setLangState] = useState<LangCode>(initialLang);

	useEffect(() => {
		document.documentElement.lang = lang;
	}, [lang]);

	const setLang = useCallback((next: LangCode) => {
		setLangState(next);
		const secure = window.location.protocol === 'https:' ? '; Secure' : '';

		document.cookie = `${LANG_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
	}, []);

	const value = useMemo<I18nValue>(
		() => ({ lang, setLang, t: (key, vars) => translate(lang, key, vars) }),
		[lang, setLang],
	);

	return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
	const value = useContext(I18nContext);

	if (!value) {
		throw new Error('useI18n() needs <I18nProvider> in src/root.tsx');
	}

	return value;
}
