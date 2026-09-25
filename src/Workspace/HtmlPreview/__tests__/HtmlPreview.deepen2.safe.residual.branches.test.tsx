/**
 * HtmlPreview deepen2 safe：非受控切 mode、html nullish、empty 假值。
 * HtmlPreview.midtail hang-quarantined。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { HtmlPreview } from '../index';

vi.mock('../../../MarkdownEditor', () => ({
  MarkdownEditor: ({ initValue }: any) => (
    <div data-testid="md">{initValue}</div>
  ),
}));

vi.mock('../style', () => ({
  useHtmlPreviewStyle: () => ({ hashId: 'h' }),
}));

const wrap = (ui: React.ReactNode) =>
  render(
    <ConfigProvider>
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
        {ui}
      </I18nContext.Provider>
    </ConfigProvider>,
  );

describe('HtmlPreview deepen2 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('非受控：切换 code；code 模式非空 html；html nullish sanitize', () => {
    const onViewModeChange = vi.fn();
    wrap(
      <HtmlPreview
        html="<p>hi</p>"
        status="done"
        defaultViewMode="preview"
        onViewModeChange={onViewModeChange}
      />,
    );
    const codeOpt = screen.getByText('代码');
    fireEvent.click(codeOpt);
    expect(onViewModeChange).toHaveBeenCalled();

    cleanup();
    wrap(
      <HtmlPreview html="<p>x</p>" status="done" defaultViewMode="code" />,
    );
    expect(screen.getByTestId('md').textContent).toContain('html');

    cleanup();
    // html null → sanitize 空串 + empty 态（覆盖 html ?? ''）
    wrap(<HtmlPreview html={null as any} status="done" />);
    expect(document.querySelector('[class*="-empty"]')).toBeTruthy();
  });

  it('空 html + done：empty 无 emptyRender', () => {
    wrap(<HtmlPreview html="   " status="done" />);
    expect(
      document.querySelector('[class*="-empty"]') ||
        document.body.textContent?.includes('No data'),
    ).toBeTruthy();
  });
});
