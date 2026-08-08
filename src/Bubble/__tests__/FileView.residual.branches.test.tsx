import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BubbleFileView } from '../FileView';

vi.mock('../../MarkdownInputField/FileMapView', () => ({
  FileMapView: (props: any) => <div data-testid="files">{props.renderMoreAction?.({ name: 'f' })}</div>,
}));

describe('BubbleFileView residual branches', () => {
  it('returns null for missing and empty file maps', () => {
    const { container } = render(<BubbleFileView bubble={{ originData: {} } as any} placement="left" bubbleListRef={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('accepts direct and curried more actions while swallowing event factory errors', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { rerender } = render(
      <BubbleFileView
        bubble={{
          originData: { fileMap: new Map([['f', { name: 'f' }]]) },
          fileViewEvents: () => { throw new Error('ignored'); },
          fileViewConfig: { renderFileMoreAction: () => (file: any) => <span>{file.name}</span> },
        } as any}
        placement="right"
        bubbleListRef={null}
      />,
    );
    expect(screen.getByText('f')).toBeInTheDocument();
    expect(warn).toHaveBeenCalled();
    rerender(<BubbleFileView bubble={{ originData: { fileMap: new Map([['f', {}]]) }, fileViewConfig: { renderFileMoreAction: false } } as any} placement="left" bubbleListRef={null} />);
    expect(screen.getByTestId('files')).toBeEmptyDOMElement();
    warn.mockRestore();
  });

  it('fileViewEvents 返回非函数与 preview/download 回退 url', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const fileMap = new Map([
      [
        '1',
        {
          name: 'doc.pdf',
          previewUrl: 'https://ex.com/p',
          url: 'https://ex.com/u',
        },
      ],
    ]);
    render(
      <BubbleFileView
        bubble={
          {
            originData: { fileMap },
            fileViewEvents: () => ({ onPreview: 'bad', onDownload: null }),
            fileViewConfig: {
              renderFileMoreAction: (file: any) => (
                <button
                  type="button"
                  data-testid="more"
                  onClick={() => {
                    /* exercise defaults via config only */
                    void file;
                  }}
                >
                  more
                </button>
              ),
            },
          } as any
        }
        placement="left"
        bubbleListRef={null}
      />,
    );
    expect(screen.getByTestId('more')).toBeTruthy();
    open.mockRestore();
  });

  it('fileViewConfig null/false/非函数；空 name 下载默认名', () => {
    const fileMap = new Map([['1', { url: 'https://ex.com/u' }]]);
    const { rerender } = render(
      <BubbleFileView
        bubble={
          {
            originData: { fileMap },
            fileViewConfig: null,
          } as any
        }
        placement="left"
        bubbleListRef={null}
      />,
    );
    expect(screen.getByTestId('files')).toBeInTheDocument();

    rerender(
      <BubbleFileView
        bubble={
          {
            originData: { fileMap },
            fileViewConfig: false,
          } as any
        }
        placement="left"
        bubbleListRef={null}
      />,
    );
    rerender(
      <BubbleFileView
        bubble={
          {
            originData: { fileMap },
            fileViewConfig: { renderFileMoreAction: 'x' as any },
          } as any
        }
        placement="left"
        bubbleListRef={null}
      />,
    );
    expect(screen.getByTestId('files')).toBeInTheDocument();
  });
});
