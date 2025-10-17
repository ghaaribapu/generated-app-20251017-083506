import * as React from 'react';
import { LanguageContext, LanguageContextType } from '@/contexts/LanguageContextDef';
export const useLanguage = (): LanguageContextType => {
  const context = React.useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};