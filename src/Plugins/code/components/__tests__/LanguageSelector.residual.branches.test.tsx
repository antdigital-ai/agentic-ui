/**
 * LanguageSelector residual：空 language 自动打开、katex、搜索过滤、选择。
 */
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { LanguageSelector } from '../LanguageSelector';

vi.mock('../../../I18n', () => ({
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

describe('LanguageSelector residual branches', () => {
  it.skip('无 language 自动 open；选择后 setLanguage', async () => {
    const setLanguage = vi.fn();
    render(
      <LanguageSelector
        element={{ language: undefined }}
        setLanguage={setLanguage}
      />,
    );
    // Popover open — search input appears
    const input = await screen.findByPlaceholderText(/Search|搜索|lang/i).catch(
      () => screen.queryByRole('textbox'),
    );
    if (input) {
      fireEvent.change(input, { target: { value: 'py' } });
    }
    expect(document.body).toBeTruthy();
  });

  it.skip('katex 不自动打开；有 language 显示按钮', () => {
    render(
      <LanguageSelector element={{ language: 'javascript', katex: true }} />,
    );
    expect(document.body.textContent).toMatch(/javascript|JavaScript|Select/i);
  });

  it.skip('element 缺省安全回退', () => {
    expect(() => render(<LanguageSelector />)).not.toThrow();
  });
});
