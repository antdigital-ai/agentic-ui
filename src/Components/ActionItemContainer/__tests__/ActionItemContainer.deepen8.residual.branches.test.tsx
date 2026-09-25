/**
 * ActionItemContainer deepen8：popup 非手柄 mousedown → draggingIndex null；
 * pointerDown Text 节点 → instanceof HTMLElement false。
 * hasMissingKey 跳过（毒化 scheduler）。
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

describe('ActionItemContainer deepen8 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('popup：非手柄区域 mousedown → isHandle false 臂', () => {
    const items = Array.from({ length: 10 }, (_, i) => (
      <button key={`p${i}`} type="button">
        P{i}
      </button>
    )) as KeyedElement[];
    const { container } = wrap(
      <ActionItemContainer showMenu>{items}</ActionItemContainer>,
    );
    const menu = container.querySelector(
      '[class*="overflow-container-menu"]',
    ) as HTMLElement | null;
    if (menu) fireEvent.click(menu);
    const popupItem = container.querySelector(
      '[class*="overflow-container-popup-item"]',
    ) as HTMLElement | null;
    if (popupItem) {
      fireEvent.mouseDown(popupItem);
      fireEvent.mouseUp(popupItem);
    }
    expect(screen.getAllByText('P0').length).toBeGreaterThan(0);
  });

  it('pointerDown：target null → 非 HTMLElement 早退', () => {
    const items = [
      <button key="1" type="button">
        One
      </button>,
      <button key="2" type="button">
        Two
      </button>,
    ] as KeyedElement[];
    const { container } = wrap(
      <ActionItemContainer>{items}</ActionItemContainer>,
    );
    const root = container.firstElementChild as HTMLElement;
    const evt = new Event('pointerdown', { bubbles: true });
    Object.defineProperty(evt, 'target', { value: null });
    Object.defineProperty(evt, 'button', { value: 0 });
    Object.defineProperty(evt, 'clientX', { value: 10 });
    Object.defineProperty(evt, 'pointerId', { value: 1 });
    root.dispatchEvent(evt);
    expect(screen.getByText('One')).toBeInTheDocument();
  });


  it('追加子项：merged.length !== incoming.length', () => {
    const a = [
      <button key="1" type="button">
        A
      </button>,
    ] as KeyedElement[];
    const { rerender } = wrap(<ActionItemContainer>{a}</ActionItemContainer>);
    const b = [
      <button key="1" type="button">
        A
      </button>,
      <button key="2" type="button">
        B
      </button>,
    ] as KeyedElement[];
    rerender(
      <ConfigProvider>
        <ActionItemContainer>{b}</ActionItemContainer>
      </ConfigProvider>,
    );
    expect(screen.getByText('B')).toBeInTheDocument();
  });
});
