import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { I18nContext, I18nProvide, cnLabels } from '../../I18n';
import I18nBoundary from '../I18nBoundary';

describe('I18nBoundary', () => {
  it('无外层 I18nProvide 时应自动注入 Provider 并暴露 setLanguage', () => {
    const Probe = () => {
      const ctx = React.useContext(I18nContext);
      return (
        <span data-testid="has-set-language">
          {String(Boolean(ctx.setLanguage))}
        </span>
      );
    };

    render(
      <I18nBoundary>
        <Probe />
      </I18nBoundary>,
    );

    expect(screen.getByTestId('has-set-language')).toHaveTextContent('true');
  });

  it('已有外层 I18nProvide 时不应重复包裹', () => {
    const outerSetLanguage = () => {};
    const Probe = () => {
      const ctx = React.useContext(I18nContext);
      return (
        <span data-testid="same-set-language">
          {String(ctx.setLanguage === outerSetLanguage)}
        </span>
      );
    };

    render(
      <I18nContext.Provider
        value={{
          locale: cnLabels,
          language: 'zh-CN',
          setLanguage: outerSetLanguage,
        }}
      >
        <I18nBoundary>
          <Probe />
        </I18nBoundary>
      </I18nContext.Provider>,
    );

    expect(screen.getByTestId('same-set-language')).toHaveTextContent('true');
  });

  it('外层仅提供 setLocale 时也应视为已有 Provider', () => {
    const outerSetLocale = () => {};

    const Probe = () => {
      const ctx = React.useContext(I18nContext);
      return (
        <span data-testid="same-set-locale">
          {String(ctx.setLocale === outerSetLocale)}
        </span>
      );
    };

    render(
      <I18nContext.Provider
        value={{
          locale: cnLabels,
          language: 'en-US',
          setLocale: outerSetLocale,
        }}
      >
        <I18nBoundary>
          <Probe />
        </I18nBoundary>
      </I18nContext.Provider>,
    );

    expect(screen.getByTestId('same-set-locale')).toHaveTextContent('true');
  });

  it('嵌套在 I18nProvide 内时应复用外层上下文', () => {
    const Probe = () => {
      const ctx = React.useContext(I18nContext);
      return <span data-testid="language">{ctx.language}</span>;
    };

    render(
      <I18nProvide defaultLanguage="en-US" autoDetect={false}>
        <I18nBoundary>
          <Probe />
        </I18nBoundary>
      </I18nProvide>,
    );

    expect(screen.getByTestId('language')).toHaveTextContent('en-US');
  });
});
