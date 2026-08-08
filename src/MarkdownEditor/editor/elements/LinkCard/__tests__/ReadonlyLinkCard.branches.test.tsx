/**
 * ReadonlyLinkCard 分支覆盖：无 ConfigProvider、finished 超时回退链、
 * title/name 回退、collaborators 空值、点击 open。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ReadonlyLinkCard } from '../ReadonlyLinkCard';

vi.mock('../../../components/ContributorAvatar', () => ({
  AvatarList: ({ displayList }: any) => (
    <div data-testid="avatar-list">
      {(displayList || []).map((item: any, i: number) => (
        <span
          key={`${String(item.name)}-${i}`}
          data-testid={`avatar-${item.name ?? 'empty'}`}
        >
          {String(item.name)}:{item.collaboratorNumber}
        </span>
      ))}
    </div>
  ),
}));

const attrs = { 'data-testid': 'rlc' } as any;

const renderRaw = (element: any) =>
  render(
    <ReadonlyLinkCard element={element} attributes={attrs}>
      <span data-testid="left">L</span>
      <span data-testid="right">R</span>
    </ReadonlyLinkCard>,
  );

const renderWithProvider = (element: any) =>
  render(
    <ConfigProvider>
      <ReadonlyLinkCard element={element} attributes={attrs}>
        <span data-testid="left">L</span>
        <span data-testid="right">R</span>
      </ReadonlyLinkCard>
    </ConfigProvider>,
  );

describe('ReadonlyLinkCard 分支覆盖', () => {
  const openSpy = vi.fn();

  afterEach(() => {
    cleanup();
    // 勿 useRealTimers：避免 happy-dom Date 负 duration
    vi.clearAllTimers();
    openSpy.mockReset();
  });

  it('无 ConfigProvider 时 blockCls 为空字符串仍可渲染', () => {
    renderRaw({
      type: 'link-card',
      url: 'https://a.com',
      title: 'T',
      finished: true,
      children: [{ text: '' }],
    });
    expect(screen.getByText('T')).toBeInTheDocument();
    expect(document.querySelector('[data-be="link-card"]')).toBeTruthy();
  });

  it('finished=false 超时后 url/title/name 全空回退为「链接卡片」', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderWithProvider({
      type: 'link-card',
      finished: false,
      url: '',
      title: '',
      name: '',
      children: [{ text: '' }],
    });
    expect(document.querySelector('.ant-skeleton')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(5001);
    });
    expect(screen.getByText('链接卡片')).toBeInTheDocument();
    vi.clearAllTimers();
  });

  it('finished=false 超时优先展示 name（url/title 空）', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderWithProvider({
      type: 'link-card',
      finished: false,
      url: '',
      title: '',
      name: 'only-name',
      children: [{ text: '' }],
    });
    act(() => {
      vi.advanceTimersByTime(5001);
    });
    expect(screen.getByText('only-name')).toBeInTheDocument();
    vi.clearAllTimers();
  });

  it('标题缺省时 download/文案回退 name，再回退 no title', () => {
    const { unmount } = renderWithProvider({
      type: 'link-card',
      url: 'https://x.com',
      finished: true,
      children: [{ text: '' }],
    });
    expect(screen.getByText('no title').closest('a')!.getAttribute('download')).toBe(
      'no title',
    );
    unmount();

    renderWithProvider({
      type: 'link-card',
      url: 'https://x.com',
      name: 'N',
      finished: true,
      children: [{ text: '' }],
    });
    expect(screen.getByText('N').closest('a')!.getAttribute('download')).toBe(
      'N',
    );
  });

  it('无 description 时展示 url；无 icon 时不渲染 img', () => {
    renderWithProvider({
      type: 'link-card',
      url: 'https://desc-fallback.test',
      title: 'HasUrl',
      finished: true,
      children: [{ text: '' }],
    });
    expect(screen.getByText('https://desc-fallback.test')).toBeInTheDocument();
    expect(document.querySelector('img')).toBeNull();
  });

  it('无 otherProps 时 collaborators 渲染空占位且无 updateTime', () => {
    const { container } = renderWithProvider({
      type: 'link-card',
      url: 'https://x.com',
      title: 'T',
      finished: true,
      children: [{ text: '' }],
    });
    expect(screen.queryByTestId('avatar-list')).toBeNull();
    expect(container.querySelector('[class*="update-time"]')).toBeNull();
  });

  it('collaborators 空对象值回退 0，且 slice 截断到 5', () => {
    renderWithProvider({
      type: 'link-card',
      url: 'https://x.com',
      title: 'T',
      finished: true,
      otherProps: {
        collaborators: [
          { A: 1 },
          { B: undefined as any },
          {},
          { C: 3 },
          { D: 4 },
          { E: 5 },
          { F: 6 },
        ],
      },
      children: [{ text: '' }],
    });
    expect(screen.getByTestId('avatar-A')).toHaveTextContent('A:1');
    expect(screen.getByTestId('avatar-B')).toHaveTextContent('B:0');
    // `{}` → name 空，collaboratorNumber 走 || 0
    expect(screen.getByTestId('avatar-empty')).toHaveTextContent('undefined:0');
    expect(screen.queryByTestId('avatar-F')).toBeNull();
    expect(screen.getByTestId('avatar-list').querySelectorAll('span')).toHaveLength(
      5,
    );
  });

  it('点击容器与标题均触发 window.open', () => {
    Object.defineProperty(window, 'open', {
      configurable: true,
      writable: true,
      value: openSpy,
    });
    renderWithProvider({
      type: 'link-card',
      url: 'https://open.test',
      title: 'OpenMe',
      finished: true,
      children: [{ text: '' }],
    });
    const card = document.querySelector('[data-be="link-card"]')!;
    const clickable = card.querySelector('[class*="__container"]')!;
    fireEvent.click(clickable);
    fireEvent.click(screen.getByText('OpenMe').closest('a')!);
    expect(openSpy).toHaveBeenCalledWith('https://open.test');
    expect(openSpy).toHaveBeenCalledTimes(2);
  });

  it('有 icon 与 updateTime 时渲染对应节点', () => {
    renderWithProvider({
      type: 'link-card',
      url: 'https://x.com',
      title: 'T',
      icon: 'https://x.com/i.png',
      finished: true,
      otherProps: { updateTime: '2026-08-03', collaborators: [{ Z: 0 }] },
      children: [{ text: '' }],
    });
    expect(document.querySelector('img')?.getAttribute('src')).toBe(
      'https://x.com/i.png',
    );
    expect(screen.getByText('2026-08-03')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-Z')).toHaveTextContent('Z:0');
  });

  it('istanbul after：超时仅 url / 仅 title；有 description 不回退 url', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { unmount: u1 } = renderWithProvider({
      type: 'link-card',
      finished: false,
      url: 'https://only-url.test',
      title: '',
      name: '',
      children: [{ text: '' }],
    });
    act(() => {
      vi.advanceTimersByTime(5001);
    });
    expect(screen.getByText('https://only-url.test')).toBeInTheDocument();
    u1();

    const { unmount: u2 } = renderWithProvider({
      type: 'link-card',
      finished: false,
      url: '',
      title: 'only-title',
      name: '',
      children: [{ text: '' }],
    });
    act(() => {
      vi.advanceTimersByTime(5001);
    });
    expect(screen.getByText('only-title')).toBeInTheDocument();
    u2();
    vi.clearAllTimers();

    renderWithProvider({
      type: 'link-card',
      url: 'https://x.com',
      title: 'T',
      description: 'desc-text',
      finished: true,
      children: [{ text: '' }],
    });
    expect(screen.getByText('desc-text')).toBeInTheDocument();
    expect(screen.queryByText('https://x.com')).not.toBeInTheDocument();
  });
});
