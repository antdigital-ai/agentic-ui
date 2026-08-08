/**
 * Quote 分支：closable、popupDirection、fileName/lineRange、onFileClick 守卫。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Quote } from '../index';

describe('Quote 分支覆盖', () => {
  it('无 popupDetail 时不渲染 popup', () => {
    render(
      <ConfigProvider>
        <Quote quoteDescription="描述" />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('quote-description')).toHaveTextContent('描述');
    expect(screen.queryByTestId('quote-popup')).not.toBeInTheDocument();
    expect(screen.queryByTestId('quote-close-button')).not.toBeInTheDocument();
  });

  it('closable 点击触发 onClose', () => {
    const onClose = vi.fn();
    render(
      <ConfigProvider>
        <Quote quoteDescription="d" closable onClose={onClose} />
      </ConfigProvider>,
    );
    fireEvent.click(screen.getByTestId('quote-close-button'));
    expect(onClose).toHaveBeenCalled();
  });

  it('popupDirection=right 与 fileName+lineRange', () => {
    const onFileClick = vi.fn();
    render(
      <ConfigProvider>
        <Quote
          quoteDescription="q"
          popupDetail="detail"
          popupDirection="right"
          fileName="a.ts"
          lineRange="1-3"
          onFileClick={onFileClick}
          classNames={{ root: 'r', popup: 'p' }}
          styles={{ root: { margin: 1 }, popup: { zIndex: 9 } }}
          className="legacy"
        />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('quote-popup')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('quote-popup-header'));
    expect(onFileClick).toHaveBeenCalledWith('a.ts', '1-3');
  });

  it('仅 lineRange 无 fileName 时点击 header 不回调', () => {
    const onFileClick = vi.fn();
    render(
      <ConfigProvider>
        <Quote
          quoteDescription="q"
          popupDetail="detail"
          lineRange="10"
          onFileClick={onFileClick}
        />
      </ConfigProvider>,
    );
    fireEvent.click(screen.getByTestId('quote-popup-header'));
    expect(onFileClick).not.toHaveBeenCalled();
  });

  it('仅 fileName 无 lineRange', () => {
    const onFileClick = vi.fn();
    render(
      <ConfigProvider>
        <Quote
          quoteDescription="q"
          popupDetail="detail"
          fileName="b.ts"
          onFileClick={onFileClick}
        />
      </ConfigProvider>,
    );
    fireEvent.click(screen.getByTestId('quote-popup-header'));
    expect(onFileClick).toHaveBeenCalledWith('b.ts', undefined);
  });

  it('popupDetail 无 fileName/lineRange 时不渲染 popup header', () => {
    render(
      <ConfigProvider>
        <Quote quoteDescription="q" popupDetail="only body" />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('quote-popup')).toBeInTheDocument();
    expect(screen.queryByTestId('quote-popup-header')).not.toBeInTheDocument();
  });
});
