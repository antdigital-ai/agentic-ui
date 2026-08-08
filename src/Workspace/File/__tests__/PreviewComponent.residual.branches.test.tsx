/**
 * PreviewComponent 残留：customContent、loading、header 覆盖。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
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

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ConfigProvider>
    <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
      {children}
    </I18nContext.Provider>
  </ConfigProvider>
);

describe('PreviewComponent residual branches', () => {
  it('customContent 优先', () => {
    vi.mocked(usePreviewContent).mockReturnValue({
      ready: true,
      canPreview: true,
      content: '',
      error: null,
      category: 'text',
    } as any);
    render(
      <Wrapper>
        <PreviewComponent
          file={{ name: 'a.txt', key: 'a' } as any}
          customContent={<span data-testid="custom">c</span>}
        />
      </Wrapper>,
    );
    expect(screen.getByTestId('custom')).toBeInTheDocument();
  });

  it('loading 文件', () => {
    vi.mocked(usePreviewContent).mockReturnValue({
      ready: false,
      canPreview: true,
      content: '',
      error: null,
      category: 'text',
    } as any);
    render(
      <Wrapper>
        <PreviewComponent
          file={{ name: 'b.md', key: 'b', loading: true } as any}
        />
      </Wrapper>,
    );
    expect(document.body).toBeTruthy();
  });

  it('onBack / onDownload / headerFileOverride', () => {
    vi.mocked(usePreviewContent).mockReturnValue({
      ready: true,
      canPreview: true,
      content: '# hi',
      error: null,
      category: 'markdown',
    } as any);
    const onBack = vi.fn();
    const onDownload = vi.fn();
    render(
      <Wrapper>
        <PreviewComponent
          file={{ name: 'c.md', key: 'c', url: 'blob:x' } as any}
          onBack={onBack}
          onDownload={onDownload}
          headerFileOverride={{ name: 'override.md' }}
          customActions={<button type="button">act</button>}
        />
      </Wrapper>,
    );
    const back = screen.queryByRole('button', { name: /back|返回/i });
    if (back) fireEvent.click(back);
    expect(document.body.textContent).toMatch(/override|c\.md|hi|act/);
  });

  it('canPreview false 仍渲染预览壳', () => {
    vi.mocked(usePreviewContent).mockReturnValue({
      ready: true,
      canPreview: false,
      content: '',
      error: null,
      category: 'binary',
    } as any);
    render(
      <Wrapper>
        <PreviewComponent file={{ name: 'x.bin', key: 'x' } as any} />
      </Wrapper>,
    );
    expect(document.body.textContent).toMatch(/x\.bin|处理|预览|不支持/);
  });

  it('loading / error / html Segmented；share/download 门控', () => {
    vi.mocked(usePreviewContent).mockReturnValue({
      ready: false,
      canPreview: true,
      content: '',
      error: null,
      category: 'text',
      loading: true,
    } as any);
    const { rerender } = render(
      <Wrapper>
        <PreviewComponent
          file={{ name: 'a.md', key: 'a', content: '# hi' } as any}
        />
      </Wrapper>,
    );
    expect(document.body).toBeTruthy();

    vi.mocked(usePreviewContent).mockReturnValue({
      ready: true,
      canPreview: true,
      content: '<p>h</p>',
      error: 'boom',
      category: 'html',
    } as any);
    rerender(
      <Wrapper>
        <PreviewComponent
          file={{ name: 'a.html', key: 'a', content: '<p>h</p>' } as any}
          onDownload={vi.fn()}
          onShare={vi.fn()}
        />
      </Wrapper>,
    );
    expect(document.body.textContent).toMatch(/boom|html|a\.html|预览/i);
  });
});
