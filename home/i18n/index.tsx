import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { SiteLocale, SiteMessages } from './locales';
import { siteLocales } from './locales';

export type { SiteLocale, SiteMessages };

const STORAGE_KEY = 'agentic-ui-site-language';

type SiteLanguageContextValue = {
  locale: SiteLocale;
  messages: SiteMessages;
  setLocale: (locale: SiteLocale) => void;
  toggleLocale: () => void;
};

const SiteLanguageContext = createContext<SiteLanguageContextValue>({
  locale: 'zh-CN',
  messages: siteLocales['zh-CN'],
  setLocale: () => {},
  toggleLocale: () => {},
});

/** 读取浏览器/存储偏好，默认中文 */
const detectInitialLocale = (): SiteLocale => {
  if (typeof window === 'undefined') return 'zh-CN';

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'zh-CN' || saved === 'en-US') return saved;

  const browserLang = window.navigator.language?.toLowerCase() ?? 'zh';
  return browserLang.startsWith('zh') ? 'zh-CN' : 'en-US';
};

export const SiteLanguageProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [locale, setLocaleState] = useState<SiteLocale>(detectInitialLocale);

  // 语言切换时同步 <html lang>，便于读屏与 SEO
  useEffect(() => {
    document.documentElement.setAttribute('lang', locale);
  }, [locale]);

  const setLocale = useCallback((next: SiteLocale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'zh-CN' ? 'en-US' : 'zh-CN');
  }, [locale, setLocale]);

  const value = useMemo<SiteLanguageContextValue>(
    () => ({
      locale,
      messages: siteLocales[locale],
      setLocale,
      toggleLocale,
    }),
    [locale, setLocale, toggleLocale],
  );

  return (
    <SiteLanguageContext.Provider value={value}>
      {children}
    </SiteLanguageContext.Provider>
  );
};

/** 官网首页文案统一入口 */
export function useSiteI18n(): SiteLanguageContextValue {
  return useContext(SiteLanguageContext);
}
