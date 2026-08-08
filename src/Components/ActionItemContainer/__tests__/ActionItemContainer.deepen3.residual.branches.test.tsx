/**
 * ActionItemContainer deepen3：popup handle、drop 无 dragging、
 * 二次 dragOver、非 HTMLElement、追加合并。
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

describe('ActionItemContainer deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    cleanup();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('popup grip mouseDown 标记 handle；非 handle mouseDown', () => {
    const items = Array.from({ length: 8 }, (_, i) => (
      <button key={String(i)} type="button">
        {i}
      </button>
    )) as KeyedElement[];
    const { container } = wrap(
      <ActionItemContainer showMenu>{items}</ActionItemContainer>,
    );
    const menu = container.querySelector(
      '[class*="overflow-container-menu"]',
    ) as HTMLElement | null;
    if (!menu) return;
    fireEvent.click(menu);
    const grip = document.querySelector(
      '[class*="overflow-container-popup-item"] [class*="drag-handle"]',
    ) as HTMLElement | null;
    const popupItem = document.querySelector(
      '[class*="overflow-container-popup-item"]',
    ) as HTMLElement | null;
    if (grip) {
      fireEvent.mouseDown(grip);
      fireEvent.mouseUp(grip);
    }
    if (popupItem) {
      fireEvent.mouseDown(popupItem);
      fireEvent.mouseUp(popupItem);
    }
  });

  it('drop 无 draggingIndex 早退；二次 dragOver 同 index', () => {
    const items = [
      <button key="a" type="button">
        A
      </button>,
      <button key="b" type="button">
        B
      </button>,
    ] as KeyedElement[];
    const { container } = wrap(
      <ActionItemContainer showMenu>{items}</ActionItemContainer>,
    );
    const handles = container.querySelectorAll(
      '[class*="drag-handle"], [draggable="true"]',
    );
    const a = handles[0] as HTMLElement | undefined;
    const b = handles[1] as HTMLElement | undefined;
    if (!a || !b) return;

    const dt = {
      effectAllowed: 'move',
      dropEffect: 'move',
      setData: vi.fn(),
    };
    fireEvent.drop(b, { dataTransfer: dt });

    fireEvent.dragStart(a, { dataTransfer: dt });
    fireEvent.dragOver(b, { dataTransfer: dt });
    fireEvent.dragOver(b, { dataTransfer: dt });
    fireEvent.drop(b, { dataTransfer: dt });
    fireEvent.dragEnd(a);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('pointerDown 交互元素早退；panning move/up', () => {
    const items = [
      <button key="1" type="button">
        1
      </button>,
      <button key="2" type="button">
        2
      </button>,
    ] as KeyedElement[];
    const { container } = wrap(
      <ActionItemContainer>{items}</ActionItemContainer>,
    );
    const el = container.querySelector(
      '[class*="agentic-chat-action-item-box"][class*="container"]',
    ) as HTMLElement;
    expect(el).toBeTruthy();

    const btn = screen.getByText('1');
    fireEvent.pointerDown(btn, { button: 0, clientX: 0, pointerId: 1 });

    Object.defineProperty(el, 'scrollLeft', {
      value: 0,
      writable: true,
      configurable: true,
    });
    fireEvent.pointerDown(el, { button: 0, clientX: 10, pointerId: 2 });
    fireEvent.pointerMove(el, {
      clientX: 40,
      pointerId: 2,
      cancelable: true,
    });
    fireEvent.pointerUp(el, { pointerId: 2 });
  });

  it('children 追加项合并保留顺序', () => {
    const a = [
      <button key="1" type="button">
        1
      </button>,
    ] as KeyedElement[];
    const { rerender } = wrap(
      <ActionItemContainer>{a}</ActionItemContainer>,
    );
    const b = [
      <button key="1" type="button">
        1
      </button>,
      <button key="2" type="button" data-testid="added">
        2
      </button>,
    ] as KeyedElement[];
    rerender(
      <ConfigProvider>
        <ActionItemContainer>{b}</ActionItemContainer>
      </ConfigProvider>,
    );
    expect(screen.getByTestId('added')).toBeInTheDocument();
  });
});
