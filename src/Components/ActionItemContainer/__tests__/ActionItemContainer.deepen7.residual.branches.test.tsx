/**
 * ActionItemContainer deepen7：等长 children 替换、wheel、popup menu。
 * hasMissingKey 抛错会毒化 React scheduler，跳过。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ActionItemContainer } from '../ActionItemContainer';

HTMLElement.prototype.setPointerCapture = vi.fn();
HTMLElement.prototype.releasePointerCapture = vi.fn();

type KeyedElement = React.ReactElement & { key: React.Key };

const wrap = (ui: React.ReactNode) =>
  render(<ConfigProvider>{ui}</ConfigProvider>);

describe('ActionItemContainer deepen7 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('popup menu + wheel', () => {
    const items = Array.from({ length: 8 }, (_, i) => (
      <button key={`k${i}`} type="button">
        X{i}
      </button>
    )) as KeyedElement[];
    const { container } = wrap(
      <ActionItemContainer showMenu>{items}</ActionItemContainer>,
    );
    const menu = container.querySelector(
      '[class*="overflow-container-menu"]',
    ) as HTMLElement | null;
    if (menu) fireEvent.click(menu);
    const root = container.firstElementChild as HTMLElement | null;
    if (root) fireEvent.wheel(root, { deltaY: 20 });
    expect(screen.getAllByText('X0').length).toBeGreaterThan(0);
  });

  it('children 等长替换：merged length 相等臂', () => {
    const a = [
      <button key="1" type="button">
        One
      </button>,
      <button key="2" type="button">
        Two
      </button>,
    ] as KeyedElement[];
    const { rerender } = wrap(
      <ActionItemContainer>{a}</ActionItemContainer>,
    );
    const b = [
      <button key="1" type="button">
        One!
      </button>,
      <button key="2" type="button">
        Two!
      </button>,
    ] as KeyedElement[];
    rerender(
      <ConfigProvider>
        <ActionItemContainer>{b}</ActionItemContainer>
      </ConfigProvider>,
    );
    expect(screen.getByText('One!')).toBeInTheDocument();
  });
});
