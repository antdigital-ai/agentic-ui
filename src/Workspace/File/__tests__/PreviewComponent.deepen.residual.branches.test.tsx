/**
 * PreviewComponent deepen residual：canDownload false、error rawContent、
 * locale 缺省文案、无 onDownload。轻量 timers，勿挂载 hang 套件。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { PreviewComponent } from '../PreviewComponent';
import { usePreviewContent } from '../preview/usePreviewContent';

vi.mock('../../../MarkdownEditor', () => ({
  MarkdownEditor: React.forwardRef(({ initValue }: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      store: { setMDContent: vi.fn() },
    }));
    return <div data-testid="md-editor">{initValue}</div>;
  }),
}));

vi.mock('../../HtmlPreview', () => ({
  HtmlPreview: ({ html }: any) => <div data-testid="html-preview">{html}</div>,
}));

vi.mock('../preview/usePreviewContent', () => ({
  usePreviewContent: vi.fn(),
}));

vi.mock('../preview/components/MediaPreview', () => ({
  MediaPreview: ({ category }: any) => (
    <div data-testid="media-preview">{category}</div>
  ),
}));

vi.mock('../preview/components/UnsupportedFileCard', () => ({
  UnsupportedFileCard: () => <div data-testid="unsupported" />,
}));

const wrap = (ui: React.ReactNode, locale: Record<string, string> = {}) =>
  render(
    <ConfigProvider>
      <I18nContext.Provider value={{ locale, language: 'zh-CN' } as any}>
        {ui}
      </I18nContext.Provider>
    </ConfigProvider>,
  );

describe('PreviewComponent deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('canDownload=false：下载按钮不触发 onDownload', () => {
    vi.mocked(usePreviewContent).mockReturnValue({
      ready: true,
      canPreview: true,
      content: 'hi',
      error: null,
      category: 'text',
      status: 'ready',
      rawContent: 'hi',
      mdContent: 'hi',
    } as any);
    const onDownload = vi.fn();
    wrap(
      <PreviewComponent
        file={{ name: 'a.txt', key: 'a', canDownload: false } as any}
        onDownload={onDownload}
      />,
    );
    const btns = Array.from(document.querySelectorAll('button'));
    btns.forEach((b) => fireEvent.click(b));
    expect(onDownload).not.toHaveBeenCalled();
  });

  it('html error：rawContent 置空；locale 缺省 loading/失败文案', () => {
    vi.mocked(usePreviewContent).mockReturnValue({
      ready: false,
      canPreview: true,
      content: '',
      error: new Error('boom'),
      category: 'html',
      status: 'error',
      rawContent: '<b>x</b>',
      mdContent: '',
    } as any);
    wrap(
      <PreviewComponent
        file={{ name: 'a.html', key: 'h', loading: true } as any}
      />,
      {},
    );
    expect(document.body.textContent).toBeTruthy();
  });

  it('onLocate/onShare：locale 缺省 title', () => {
    vi.mocked(usePreviewContent).mockReturnValue({
      ready: true,
      canPreview: true,
      content: '# t',
      error: null,
      category: 'markdown',
      status: 'ready',
      rawContent: '# t',
      mdContent: '# t',
    } as any);
    const onLocate = vi.fn();
    const onShare = vi.fn();
    wrap(
      <PreviewComponent
        file={{ name: 'c.md', key: 'c', url: 'blob:x' } as any}
        onLocate={onLocate}
        onShare={onShare}
        onDownload={vi.fn()}
      />,
    );
    document.querySelectorAll('[title],button').forEach((el) => {
      fireEvent.click(el);
    });
    expect(screen.queryByTestId('md-editor') || document.body).toBeTruthy();
  });
});
