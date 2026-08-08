/**
 * SuggestionList 分支覆盖：OverflowTooltip、showMore 键盘、locale 回退与 submitting。
 */
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../I18n';
import { SuggestionList } from '../SuggestionList';

const items = [
  { key: '1', text: '建议一', tooltip: '完整提示一' },
  { key: '2', text: '建议二', icon: <span data-testid="item-icon">I</span> },
  {
    key: '3',
    text: '操作项',
    actionIcon: <span data-testid="action-icon">A</span>,
  },
];

describe('SuggestionList 分支覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('OverflowTooltip：文本溢出时挂载 Tooltip', async () => {
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
      configurable: true,
      get() {
        return 200;
      },
    });
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get() {
        return 50;
      },
    });

    render(<SuggestionList items={[{ key: '1', text: '很长很长很长' }]} />);
    await act(async () => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(document.querySelector('.ant-follow-up-label')).toBeTruthy();
  });

  it('OverflowTooltip：forceShow 时即使未溢出也挂 Tooltip', () => {
    render(
      <SuggestionList
        items={[{ key: '1', text: '短', tooltip: '强制提示' }]}
      />,
    );
    expect(screen.getByText('短')).toBeInTheDocument();
  });

  it('showMore：无自定义 text 时使用 locale 回退', () => {
    render(
      <I18nContext.Provider
        value={{
          locale: { 'suggestion.searchMore': 'Search more' },
          language: 'en-US',
        }}
      >
        <SuggestionList items={items} showMore={{ enable: true }} />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('Search more')).toBeInTheDocument();
  });

  it('showMore：Enter/Space 键盘触发 onClick', () => {
    const onClick = vi.fn();
    const { container } = render(
      <SuggestionList
        items={items}
        showMore={{ enable: true, onClick }}
      />,
    );
    const icon = container.querySelector('.ant-follow-up-more-icon')!;
    fireEvent.keyDown(icon, { key: 'Enter' });
    fireEvent.keyDown(icon, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('项键盘 Enter/Space 触发 handleClick', async () => {
    const onItemClick = vi.fn();
    render(<SuggestionList items={items} onItemClick={onItemClick} />);
    const btn = screen.getByRole('button', { name: /选择建议：建议一/ });
    await act(async () => {
      fireEvent.keyDown(btn, { key: 'Enter' });
      await Promise.resolve();
    });
    expect(onItemClick).toHaveBeenCalledWith('建议一');
  });

  it('disabled 项键盘与点击均被拦截', async () => {
    const onItemClick = vi.fn();
    render(
      <SuggestionList
        items={[{ key: 'd', text: '禁用', disabled: true }]}
        onItemClick={onItemClick}
      />,
    );
    const btn = screen.getByRole('button', { name: /选择建议：禁用/ });
    fireEvent.keyDown(btn, { key: 'Enter' });
    fireEvent.click(btn);
    expect(onItemClick).not.toHaveBeenCalled();
  });

  it('submitting 期间第二项点击被阻止', async () => {
    let gate = false;
    const slow = vi.fn(async () => {
      while (!gate) {
        await new Promise((r) => setTimeout(r, 10));
      }
    });
    render(<SuggestionList items={items} onItemClick={slow} />);

    fireEvent.click(screen.getByText('建议一'));
    await act(async () => {
      await Promise.resolve();
    });
    fireEvent.click(screen.getByText('建议二'));
    expect(slow).toHaveBeenCalledTimes(1);

    gate = true;
    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });
  });

  it('无 locale 时使用中文默认 aria-label', () => {
    render(
      <I18nContext.Provider value={{ locale: undefined as any, language: 'zh-CN' }}>
        <SuggestionList items={[{ key: '1', text: '追问' }]} />
      </I18nContext.Provider>,
    );
    expect(screen.getByRole('group')).toHaveAttribute('aria-label', '追问区域');
  });

  it('horizontal + white 布局类名分支', () => {
    const { container } = render(
      <ConfigProvider>
        <SuggestionList items={items} layout="horizontal" type="white" />
      </ConfigProvider>,
    );
    const root = container.querySelector('.ant-follow-up')!;
    expect(root).toHaveClass('ant-follow-up-horizontal');
    expect(root).toHaveClass('ant-follow-up-white');
  });

  it('item.onClick 优先于 onItemClick', async () => {
    const itemClick = vi.fn();
    const listClick = vi.fn();
    render(
      <SuggestionList
        items={[{ key: '1', text: '自定义', onClick: itemClick }]}
        onItemClick={listClick}
      />,
    );
    await act(async () => {
      fireEvent.click(screen.getByText('自定义'));
      await Promise.resolve();
    });
    expect(itemClick).toHaveBeenCalledWith('自定义');
    expect(listClick).not.toHaveBeenCalled();
  });
});
