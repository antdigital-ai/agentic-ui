/**
 * HtmlPreview deepen：空 html locale 回退；非空 html code 模式。
 */
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { HtmlPreview } from '../index';

vi.mock('../../../MarkdownEditor', () => ({
  MarkdownEditor: (props: any) => (
    <div data-testid="md-editor">{props.initValue}</div>
  ),
}));

describe('HtmlPreview deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('空 html + 空 locale 显示 No data', () => {
    const { container } = render(
      <ConfigProvider>
        <I18nContext.Provider
          value={{ locale: {} as any, language: 'en-US' }}
        >
          <HtmlPreview html="   " status="done" />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(
      container.querySelector('.ant-empty-description')?.textContent,
    ).toBe('No data');
  });

  it('code 模式非空 html 走 MarkdownEditor fence', () => {
    render(
      <ConfigProvider>
        <HtmlPreview html="<p>x</p>" status="done" viewMode="code" />
      </ConfigProvider>,
    );
    const md = screen.getByTestId('md-editor');
    expect(md.textContent).toMatch(/```html/);
    expect(md.textContent).toContain('<p>x</p>');
  });
});
