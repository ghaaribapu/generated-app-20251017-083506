import { createContext } from 'react';
export type Language = 'en' | 'ar' | 'ur';
export interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: { [key: string]: string }) => string;
}
export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);