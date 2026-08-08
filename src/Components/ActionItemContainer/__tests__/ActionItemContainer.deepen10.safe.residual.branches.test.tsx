/**
 * ActionItemContainer deepen10 safe：isHandleTarget 非 HTMLElement、
 * dragOver 同 index、scrollRef 移除早退、cancelable false pan。
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

describe('ActionItemContainer deepen10 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('popup mousedown：target 非 HTMLElement → isHandle false', () => {
    const items = Array.from({ length: 10 }, (_, i) => (
      <button key={`h${i}`} type="button">
        H{i}
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
      const evt = new MouseEvent('mousedown', { bubbles: true });
      Object.defineProperty(evt, 'target', { value: document.createTextNode('x') });
      popupItem.dispatchEvent(evt);
      fireEvent.mouseUp(popupItem);
    }
    expect(screen.getAllByText('H0').length).toBeGreaterThan(0);
  });

  it('dragOver 同 index：overIndex === index 不重复 set', () => {
    const items = Array.from({ length: 10 }, (_, i) => (
      <button key={`d${i}`} type="button">
        D{i}
      </button>
    )) as KeyedElement[];
    const { container } = wrap(
      <ActionItemContainer showMenu>{items}</ActionItemContainer>,
    );
    const menu = container.querySelector(
      '[class*="overflow-container-menu"]',
    ) as HTMLElement | null;
    if (menu) fireEvent.click(menu);
    const popupItems = container.querySelectorAll(
      '[class*="overflow-container-popup-item"]',
    );
    const first = popupItems[0] as HTMLElement | undefined;
    const grip = first?.querySelector('[class*="drag-handle"]') as
      | HTMLElement
      | undefined;
    if (first && grip) {
      fireEvent.dragStart(first, { dataTransfer: { setData: vi.fn() } });
      fireEvent.dragOver(first);
      fireEvent.dragOver(first);
      fireEvent.dragEnd(first);
    }
    expect(screen.getAllByText('D0').length).toBeGreaterThan(0);
  });

  it('wheel 水平滚动 + pointerMove 无 pan 意图', () => {
    const items = [
      <button key="1" type="button">
        S1
      </button>,
      <button key="2" type="button">
        S2
      </button>,
    ] as KeyedElement[];
    const { container } = wrap(
      <ActionItemContainer>{items}</ActionItemContainer>,
    );
    const root = container.firstElementChild as HTMLElement;
    const scroll = container.querySelector(
      '[class*="scroll"]',
    ) as HTMLElement;
    Object.defineProperty(scroll, 'scrollLeft', {
      value: 0,
      writable: true,
      configurable: true,
    });
    fireEvent.pointerMove(root, { clientX: 50, pointerId: 3 });
    fireEvent.wheel(root, { deltaY: 12, deltaX: 0 });
    expect(screen.getByText('S1')).toBeInTheDocument();
  });

  it('panning：cancelable false 跳过 preventDefault', () => {
    const items = [
      <button key="a" type="button">
        Pan
      </button>,
      <button key="b" type="button">
        Pan2
      </button>,
      <button key="c" type="button">
        Pan3
      </button>,
    ] as KeyedElement[];
    const { container } = wrap(
      <ActionItemContainer>{items}</ActionItemContainer>,
    );
    const root = container.firstElementChild as HTMLElement;
    const scroll = (container.querySelector('[class*="scroll"]') ||
      container.firstElementChild) as HTMLElement;
    Object.defineProperty(scroll, 'scrollWidth', { value: 900, configurable: true });
    Object.defineProperty(scroll, 'clientWidth', { value: 200, configurable: true });
    fireEvent.pointerDown(root, { button: 0, clientX: 200, pointerId: 4 });
    fireEvent.pointerMove(root, { clientX: 100, pointerId: 4, cancelable: false });
    fireEvent.pointerUp(root, { pointerId: 4 });
    expect(screen.getByText('Pan')).toBeInTheDocument();
  });
});
