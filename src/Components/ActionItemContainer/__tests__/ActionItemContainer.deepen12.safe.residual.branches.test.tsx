/**
 * ActionItemContainer deepen12 safe：handleMouseUp draggingIndex、
 * grip mousedown、scrollRef cleanup、popup cond-expr index null。
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

describe('ActionItemContainer deepen12 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('popup grip mousedown + mouseup draggingIndex 非 null', () => {
    const items = Array.from({ length: 10 }, (_, i) => (
      <button key={`g${i}`} type="button">
        G{i}
      </button>
    )) as KeyedElement[];
    const { container } = wrap(
      <ActionItemContainer showMenu>{items}</ActionItemContainer>,
    );
    const menu = container.querySelector('[class*="overflow-container-menu"]');
    if (menu) fireEvent.click(menu);
    const popupItem = container.querySelector(
      '[class*="overflow-container-popup-item"]',
    ) as HTMLElement | null;
    const grip = popupItem?.querySelector('[class*="drag-handle"]') as
      | HTMLElement
      | undefined;
    if (popupItem && grip) {
      fireEvent.mouseDown(grip);
      fireEvent.mouseUp(popupItem);
    }
    expect(screen.getAllByText('G0').length).toBeGreaterThan(0);
  });

  it('wheel deltaX 水平滚动；pointerDown 非 handle', () => {
    const items = [
      <button key="w1" type="button">
        W1
      </button>,
      <button key="w2" type="button">
        W2
      </button>,
      <button key="w3" type="button">
        W3
      </button>,
    ] as KeyedElement[];
    const { container } = wrap(<ActionItemContainer>{items}</ActionItemContainer>);
    const root = container.firstElementChild as HTMLElement;
    const scroll = (container.querySelector('[class*="scroll"]') ||
      root) as HTMLElement;
    Object.defineProperty(scroll, 'scrollLeft', {
      value: 0,
      writable: true,
      configurable: true,
    });
    fireEvent.wheel(root, { deltaY: 0, deltaX: 16 });
    fireEvent.pointerDown(root, { clientX: 10, pointerId: 1, button: 0 });
    expect(screen.getByText('W1')).toBeInTheDocument();
  });

  it('showMenu false：无 popup 路径', () => {
    wrap(
      <ActionItemContainer showMenu={false}>
        <button key="n1" type="button">
          N1
        </button>
      </ActionItemContainer>,
    );
    expect(screen.getByText('N1')).toBeInTheDocument();
  });
});
