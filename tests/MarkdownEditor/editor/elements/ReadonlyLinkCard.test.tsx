import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReadonlyLinkCard } from '../../../../src/MarkdownEditor/editor/elements/LinkCard/ReadonlyLinkCard';

vi.mock(
  '../../../../src/MarkdownEditor/editor/components/ContributorAvatar',
  () => ({
    AvatarList: ({ displayList }: any) => (
      <div data-testid="avatar-list">
        {(displayList || []).map((item: any) => (
          <span key={item.name} data-testid={`avatar-${item.name}`}>
            {item.name}:{item.collaboratorNumber}
          </span>
        ))}
      </div>
    ),
  }),
);

describe('ReadonlyLinkCard', () => {
  const openSpy = vi.fn();

  const baseElement: any = {
    type: 'link-card',
    url: 'https://example.com',
    title: 'Title',
    name: 'Name',
    description: 'Desc',
    icon: 'https://example.com/icon.png',
    finished: true,
    otherProps: {
      collaborators: [{ Alice: 2 }, { Bob: 3 }],
      updateTime: '2026-02-13',
    },
    children: [{ text: '' }],
  };

  const renderCard = (element: any) =>
    render(
      <ConfigProvider>
        <ReadonlyLinkCard
          element={element}
          attributes={{ 'data-testid': 'readonly-link-card' } as any}
        >
          <span data-testid="left-slot">L</span>
          <span data-testid="right-slot">R</span>
        </ReadonlyLinkCard>
      </ConfigProvider>,
    );

  beforeEach(() => {
    vi.useFakeTimers();
    openSpy.mockReset();
    Object.defineProperty(window, 'open', {
      configurable: true,
      writable: true,
      value: openSpy,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('finished=false 初始显示 skeleton，卸载时清理 timer', () => {
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout');
    const { unmount } = renderCard({ ...baseElement, finished: false });
    expect(document.querySelector('.ant-skeleton')).toBeInTheDocument();
    unmount();
    expect(clearSpy).toHaveBeenCalled();
  });

  it('finished=false 超时后显示文本回退', () => {
    renderCard({
      ...baseElement,
      finished: false,
      title: '',
      name: '',
      url: 'https://fallback.link',
    });
    expect(document.querySelector('.ant-skeleton')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(5001);
    });
    expect(screen.getByText('https://fallback.link')).toBeInTheDocument();
  });

  it('finished 从 false 变 true 时恢复正常卡片渲染', () => {
    const { rerender } = renderCard({ ...baseElement, finished: false });
    rerender(
      <ConfigProvider>
        <ReadonlyLinkCard
          element={{ ...baseElement, finished: true }}
          attributes={{ 'data-testid': 'readonly-link-card' } as any}
        >
          <span data-testid="left-slot">L</span>
          <span data-testid="right-slot">R</span>
        </ReadonlyLinkCard>
      </ConfigProvider>,
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Desc')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-Alice')).toBeInTheDocument();
    expect(screen.getByText('2026-02-13')).toBeInTheDocument();
  });

  it('点击卡片容器和标题链接都会触发 window.open', () => {
    renderCard({ ...baseElement, finished: true });
    const container = document.querySelector('[class*="link-card-container"]')!;
    fireEvent.click(container);

    const link = screen.getByText('Title').closest('a')!;
    fireEvent.click(link);

    expect(openSpy).toHaveBeenCalledTimes(2);
    expect(openSpy).toHaveBeenCalledWith('https://example.com');
  });
});

