import * as React from 'react';
import { translations } from '@/lib/translations';
import { LanguageContext, Language } from './LanguageContextDef';
export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = React.useState<Language>('en');
  const t = React.useCallback((key: string, replacements?: { [key: string]: string }) => {
    const keys = key.split('.');
    let result = translations[language] as any;
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        return key; // Return key if translation not found
      }
    }
    if (typeof result === 'string' && replacements) {
      return Object.keys(replacements).reduce((acc, currentKey) => {
        return acc.replace(`{${currentKey}}`, replacements[currentKey]);
      }, result);
    }
    return result || key;
  }, [language]);
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};