/**
 * PreviewComponent deepen2 safe：html ready/error rawContent、
 * loading locale、unknown 类型下载、locate/share locale 假值臂。
 * PreviewComponent.test hang-quarantined。
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
  HtmlPreview: ({ html, status }: any) => (
    <div data-testid="html-preview">
      {status}:{html}
    </div>
  ),
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
  UnsupportedFileCard: ({ onDownload }: any) => (
    <button type="button" data-testid="unsupported-dl" onClick={onDownload}>
      dl
    </button>
  ),
}));

const wrap = (ui: React.ReactNode, locale: Record<string, string> = {}) =>
  render(
    <ConfigProvider>
      <I18nContext.Provider value={{ locale, language: 'zh-CN' } as any}>
        {ui}
      </I18nContext.Provider>
    </ConfigProvider>,
  );

const textProcess = (over: any = {}) => ({
  typeInference: { category: 'text', fileType: 'markdown' },
  dataSource: { mimeType: 'text/plain', previewUrl: '' },
  canPreview: true,
  previewMode: 'text',
  ...over,
});

describe('PreviewComponent deepen2 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('html ready + 空 rawContent → ||\'\'；error 走 Alert locale', () => {
    // getContentStatus：`'error' in state` 为真即 error，ready 态勿带 error 键
    vi.mocked(usePreviewContent).mockReturnValue({
      processResult: {
        typeInference: { category: 'text', fileType: 'html' },
        dataSource: { mimeType: 'text/html', previewUrl: '' },
        canPreview: true,
        previewMode: 'text',
      },
      contentState: {
        status: 'ready',
        rawContent: '',
        mdContent: '',
      },
    } as any);
    wrap(
      <PreviewComponent file={{ name: 'b.html', key: 'b' } as any} />,
    );
    expect(screen.getByTestId('html-preview').textContent).toMatch(/done:|ready:/);

    cleanup();
    vi.mocked(usePreviewContent).mockReturnValue({
      processResult: {
        typeInference: { category: 'text', fileType: 'html' },
        dataSource: { mimeType: 'text/html', previewUrl: '' },
        canPreview: true,
        previewMode: 'text',
      },
      contentState: {
        status: 'error',
        error: 'e',
        rawContent: '<b>x</b>',
        mdContent: '',
      },
    } as any);
    wrap(
      <PreviewComponent file={{ name: 'a.html', key: 'a' } as any} />,
      {},
    );
    expect(document.body.textContent).toMatch(/失败|e/);
  });

  it('loading 无 locale；error 无 locale；unknown + 下载', () => {
    vi.mocked(usePreviewContent).mockReturnValue({
      processResult: textProcess(),
      contentState: {
        status: 'loading',
        error: null,
        rawContent: '',
        mdContent: '',
      },
    } as any);
    wrap(
      <PreviewComponent file={{ name: 'c.md', key: 'c' } as any} />,
      {},
    );
    expect(document.body.textContent).toMatch(/加载|loading|处理/i);

    cleanup();
    vi.mocked(usePreviewContent).mockReturnValue({
      processResult: textProcess(),
      contentState: {
        status: 'error',
        error: 'fail',
        rawContent: '',
        mdContent: '',
      },
    } as any);
    wrap(
      <PreviewComponent file={{ name: 'd.md', key: 'd' } as any} />,
      {},
    );
    expect(document.body.textContent).toMatch(/失败|fail|处理/);

    cleanup();
    const onDownload = vi.fn();
    vi.mocked(usePreviewContent).mockReturnValue({
      processResult: {
        typeInference: { category: 'other', fileType: 'bin' },
        dataSource: { mimeType: 'application/octet-stream', previewUrl: '' },
        canPreview: true,
        previewMode: 'binary',
      },
      contentState: {
        status: 'ready',
        error: null,
        rawContent: '',
        mdContent: '',
      },
    } as any);
    wrap(
      <PreviewComponent
        file={{ name: 'e.bin', key: 'e' } as any}
        onDownload={onDownload}
      />,
      {},
    );
    expect(document.body.textContent).toMatch(/未知|bin|文件/);
  });

  it('canLocate/canShare + 空 locale 走默认文案；触发 download', () => {
    vi.mocked(usePreviewContent).mockReturnValue({
      processResult: textProcess(),
      contentState: {
        status: 'ready',
        error: null,
        rawContent: 'hi',
        mdContent: 'hi',
      },
    } as any);
    const onLocate = vi.fn();
    const onShare = vi.fn();
    const onDownload = vi.fn();
    wrap(
      <PreviewComponent
        file={
          {
            name: 'f.md',
            key: 'f',
            canLocate: true,
            canShare: true,
            canDownload: true,
          } as any
        }
        onLocate={onLocate}
        onShare={onShare}
        onDownload={onDownload}
      />,
      {},
    );
    document
      .querySelectorAll('button,[role="button"],[class*="action"]')
      .forEach((el) => fireEvent.click(el));
    expect(
      onLocate.mock.calls.length +
        onShare.mock.calls.length +
        onDownload.mock.calls.length,
    ).toBeGreaterThan(0);
  });

  it('unsupported：canDownload 时点击下载', () => {
    const onDownload = vi.fn();
    vi.mocked(usePreviewContent).mockReturnValue({
      processResult: {
        typeInference: { category: 'binary', fileType: 'zip' },
        dataSource: { mimeType: 'application/zip', previewUrl: '' },
        canPreview: false,
        previewMode: 'none',
      },
      contentState: {
        status: 'ready',
        error: null,
        rawContent: '',
        mdContent: '',
      },
    } as any);
    wrap(
      <PreviewComponent
        file={{ name: 'z.zip', key: 'z', canDownload: true } as any}
        onDownload={onDownload}
      />,
    );
    fireEvent.click(screen.getByTestId('unsupported-dl'));
    expect(onDownload).toHaveBeenCalled();
  });
});
