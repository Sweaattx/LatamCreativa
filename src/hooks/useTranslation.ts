/**
 * useTranslation Hook
 * 
 * React hook for accessing translations in components
 * 
 * @module hooks/useTranslation
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { t, getLocale, setLocale, Locale, availableLocales } from '../i18n';

interface UseTranslationReturn {
    /** Translation function */
    t: typeof t;
    /** Current locale */
    locale: Locale;
    /** Change locale */
    changeLocale: (locale: Locale) => void;
    /** Available locales */
    locales: typeof availableLocales;
}

/**
 * Hook for using translations in components
 * 
 * @example
 * ```tsx
 * const { t, locale, changeLocale } = useTranslation();
 * return <h1>{t('common.loading')}</h1>;
 * ```
 */
export function useTranslation(): UseTranslationReturn {
    const [locale, setCurrentLocale] = useState<Locale>(getLocale());

    // Sync with localStorage on mount
    useEffect(() => {
        const storedLocale = getLocale();
        if (storedLocale !== locale) {
            setCurrentLocale(storedLocale);
        }
    }, [locale]);

    const changeLocale = useCallback((newLocale: Locale) => {
        setLocale(newLocale);
        setCurrentLocale(newLocale);
    }, []);

    return {
        t,
        locale,
        changeLocale,
        locales: availableLocales,
    };
}
