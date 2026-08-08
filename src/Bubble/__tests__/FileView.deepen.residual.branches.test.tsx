/**
 * BubbleFileView deepen residual：defaultHandlers preview/download 回退、
 * renderMoreAction 多形态、onViewAll 包装、fileViewConfig 假值。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BubbleFileView } from '../FileView';

vi.mock('../../MarkdownInputField/FileMapView', () => ({
  FileMapView: (props: any) => (
    <div data-testid="fv-map">
      <button
        type="button"
        data-testid="fv-preview"
        onClick={() => props.onPreview?.(props._file)}
      />
      <button
        type="button"
        data-testid="fv-download"
        onClick={() => props.onDownload?.(props._file)}
      />
      <button
        type="button"
        data-testid="fv-viewall"
        onClick={() => props.onViewAll?.(Array.from(props.fileMap?.values() || []))}
      />
      <div data-testid="fv-more">
        {props.renderMoreAction?.({ name: 'f' })}
      </div>
      <span data-testid="fv-slot">
        {typeof props.customSlot === 'function'
          ? props.customSlot({ name: 'slot' })
          : props.customSlot}
      </span>
    </div>
  ),
}));

describe('BubbleFileView deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('默认 onPreview：previewUrl 优先；无 url 早退', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    let captured: any;
    render(
      <BubbleFileView
        bubble={
          {
            originData: {
              fileMap: new Map([
                [
                  '1',
                  {
                    name: 'a.pdf',
                    previewUrl: 'https://p.example/a',
                    url: 'https://u.example/a',
                  },
                ],
              ]),
            },
            fileViewEvents: (d: any) => {
              captured = d;
              return d;
            },
          } as any
        }
        placement="right"
        bubbleListRef={null}
      />,
    );
    captured.onPreview({
      previewUrl: 'https://p.example/a',
      url: 'https://u.example/a',
    });
    expect(open).toHaveBeenCalledWith('https://p.example/a', '_blank');

    open.mockClear();
    captured.onPreview({ url: 'https://u.example/only' });
    expect(open).toHaveBeenCalledWith('https://u.example/only', '_blank');

    open.mockClear();
    captured.onPreview({});
    expect(open).not.toHaveBeenCalled();
    open.mockRestore();
  });

  it('默认 onDownload：url 优先；空 name 用 download；无 url 早退', () => {
    const append = vi.spyOn(document.body, 'appendChild');
    const remove = vi.spyOn(document.body, 'removeChild');
    let captured: any;
    render(
      <BubbleFileView
        bubble={
          {
            originData: {
              fileMap: new Map([['1', { url: 'https://dl.example/f' }]]),
            },
            fileViewEvents: (d: any) => {
              captured = d;
              return d;
            },
          } as any
        }
        placement="left"
        bubbleListRef={null}
      />,
    );

    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});

    captured.onDownload({
      url: 'https://dl.example/f',
      previewUrl: 'https://prev',
      name: 'doc.pdf',
    });
    expect(clickSpy).toHaveBeenCalled();
    expect(append).toHaveBeenCalled();
    expect(remove).toHaveBeenCalled();

    clickSpy.mockClear();
    captured.onDownload({ previewUrl: 'https://prev-only' });
    expect(clickSpy).toHaveBeenCalled();

    clickSpy.mockClear();
    captured.onDownload({});
    expect(clickSpy).not.toHaveBeenCalled();

    clickSpy.mockRestore();
    append.mockRestore();
    remove.mockRestore();
  });

  it('renderMoreAction：ReactNode / 抛错 / null / currying / 0 参', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fileMap = new Map([['1', { name: 'f' }]]);

    const { rerender } = render(
      <BubbleFileView
        bubble={
          {
            originData: { fileMap },
            fileViewConfig: {
              renderFileMoreAction: <span>node</span>,
            },
          } as any
        }
        placement="left"
        bubbleListRef={null}
      />,
    );
    expect(screen.getByText('node')).toBeInTheDocument();

    rerender(
      <BubbleFileView
        bubble={
          {
            originData: { fileMap },
            fileViewConfig: {
              renderFileMoreAction: () => {
                throw new Error('boom');
              },
            },
          } as any
        }
        placement="left"
        bubbleListRef={null}
      />,
    );
    expect(screen.getByTestId('fv-more')).toBeEmptyDOMElement();

    rerender(
      <BubbleFileView
        bubble={
          {
            originData: { fileMap },
            fileViewConfig: { renderFileMoreAction: null },
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
            fileViewConfig: {
              renderFileMoreAction: () => (file: any) => (
                <span>{file.name}-curried</span>
              ),
            },
          } as any
        }
        placement="left"
        bubbleListRef={null}
      />,
    );
    expect(screen.getByText('f-curried')).toBeInTheDocument();

    rerender(
      <BubbleFileView
        bubble={
          {
            originData: { fileMap },
            fileViewConfig: {
              renderFileMoreAction: () => <span>zero-arg</span>,
            },
          } as any
        }
        placement="left"
        bubbleListRef={null}
      />,
    );
    expect(screen.getByText('zero-arg')).toBeInTheDocument();
    warn.mockRestore();
  });

  it('onViewAll 包装与 fileViewEvents 抛错；config 假值', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const viewAll = vi.fn(() => true);
    const fileMap = new Map([['1', { name: 'a' }]]);

    render(
      <BubbleFileView
        bubble={
          {
            originData: { fileMap },
            fileViewEvents: () => ({ onViewAll: viewAll }),
            fileViewConfig: {
              className: 'c',
              style: { color: 'red' },
              maxDisplayCount: 1,
              showMoreButton: true,
              customSlot: <i>slot</i>,
              onFileClick: vi.fn(),
              disableDefaultFileClick: true,
            },
          } as any
        }
        placement="left"
        bubbleListRef={null}
      />,
    );
    fireEvent.click(screen.getByTestId('fv-viewall'));
    expect(viewAll).toHaveBeenCalled();
    expect(screen.getByText('slot')).toBeInTheDocument();

    cleanup();
    render(
      <BubbleFileView
        bubble={
          {
            originData: { fileMap },
            fileViewEvents: () => {
              throw new Error('events fail');
            },
          } as any
        }
        placement="left"
        bubbleListRef={null}
      />,
    );
    expect(warn).toHaveBeenCalled();

    cleanup();
    const { container } = render(
      <BubbleFileView
        bubble={
          {
            originData: { fileMap: new Map() },
            fileViewConfig: 'bad' as any,
          } as any
        }
        placement="left"
        bubbleListRef={null}
      />,
    );
    expect(container).toBeEmptyDOMElement();
    warn.mockRestore();
  });
});
