/**
 * Image deepen2 residual：ReadonlyImage store/preview、onError 链、宽高。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReadonlyImage } from '../index';

const storeState: any = {
  markdownEditorRef: { current: {} },
  editorProps: {},
  readonly: true,
};

vi.mock('antd', () => ({
  Image: (props: any) => (
    <img
      data-testid="antd-img"
      src={props.src}
      alt={props.alt}
      width={props.width}
      height={props.height}
      onError={props.onError}
    />
  ),
  Skeleton: { Image: () => <div data-testid="skeleton-image" /> },
  Popover: ({ children }: any) => <div>{children}</div>,
  Space: ({ children }: any) => <div>{children}</div>,
  Modal: { confirm: vi.fn() },
}));

vi.mock('../../components/MediaErrorLink', () => ({
  MediaErrorLink: ({ displayText }: any) => (
    <a data-testid="img-err">{displayText}</a>
  ),
}));

vi.mock('../../../store', () => ({
  useEditorStore: () => storeState,
}));

describe('Image deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    storeState.editorProps = {};
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('ReadonlyImage：最小 props 渲染', () => {
    render(<ReadonlyImage src="https://example.com/a.png" alt="a" />);
    expect(screen.getByTestId('antd-img')).toHaveAttribute(
      'src',
      'https://example.com/a.png',
    );
  });

  it('ReadonlyImage：宽高与空 alt', () => {
    render(
      <ReadonlyImage
        src="https://example.com/b.png"
        alt=""
        width={120}
        height={80}
      />,
    );
    const img = screen.getByTestId('antd-img');
    expect(img).toHaveAttribute('width', '120');
    expect(img).toHaveAttribute('alt', 'image');
  });

  it('ReadonlyImage：onError 回退 MediaErrorLink；无 alt 用 src', () => {
    render(<ReadonlyImage src="https://example.com/bad.png" />);
    fireEvent.error(screen.getByTestId('antd-img'));
    expect(screen.getByText('https://example.com/bad.png')).toBeInTheDocument();
  });
});
