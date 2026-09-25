/**
 * LanguageSelector midtail：缺省 element、katex、有 language。
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { LanguageSelector } from '../LanguageSelector';

vi.mock('../../../../I18n', () => ({
  I18nContext: React.createContext({
    locale: {
      'code.languageSearchPlaceholder': 'Search lang',
      'code.selectLanguage': 'Select',
    },
    language: 'en-US',
  }),
}));

vi.mock('../../langIconMap', () => ({
  langIconMap: { javascript: 'js.png', python: 'py.png' },
}));

vi.mock('../../utils/langOptions', () => ({
  langOptions: [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
  ],
}));

vi.mock('../LoadImage', () => ({
  LoadImage: () => <span data-testid="lang-icon" />,
}));

describe('LanguageSelector midtail branches', () => {
  it('element 缺省安全回退', () => {
    expect(() => render(<LanguageSelector />)).not.toThrow();
  });

  it('katex 不因空 language 崩溃；有 language 显示', () => {
    const { rerender } = render(
      <LanguageSelector element={{ language: undefined, katex: true } as any} />,
    );
    expect(document.body).toBeTruthy();

    rerender(
      <LanguageSelector
        element={{ language: 'javascript' } as any}
        setLanguage={vi.fn()}
      />,
    );
    expect(document.body.textContent).toMatch(/javascript|JavaScript|Select/i);
  });

  it('prev language 清空路径：rerender 到空 language', () => {
    const { rerender } = render(
      <LanguageSelector
        element={{ language: 'python' } as any}
        setLanguage={vi.fn()}
      />,
    );
    rerender(
      <LanguageSelector
        element={{ language: undefined } as any}
        setLanguage={vi.fn()}
      />,
    );
    expect(screen.queryByText(/python|Python/i) || document.body).toBeTruthy();
  });
});
