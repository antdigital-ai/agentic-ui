import React, { useContext } from 'react';
import { I18nContext, I18nProvide } from '../I18n';

const I18nBoundary: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const outerI18n = useContext(I18nContext);
  const hasOuterI18nProvider = Boolean(
    outerI18n?.setLanguage || outerI18n?.setLocale,
  );

  if (hasOuterI18nProvider) {
    return <>{children}</>;
  }

  return <I18nProvide>{children}</I18nProvide>;
};

export default I18nBoundary;
