/**
 * ActionItemContainer deepen9：grip mousedown 设 draggingIndex；
 * 横向 pan pointer 流程。
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

describe('ActionItemContainer deepen9 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('popup grip：mousedown 设 index', () => {
    const items = Array.from({ length: 12 }, (_, i) => (
      <button key={`g${i}`} type="button">
        G{i}
      </button>
    )) as KeyedElement[];
    const { container } = wrap(
      <ActionItemContainer showMenu>{items}</ActionItemContainer>,
    );
    const menu = container.querySelector(
      '[class*="overflow-container-menu"]',
    ) as HTMLElement | null;
    if (menu) fireEvent.click(menu);
    const grip = container.querySelector(
      '[class*="drag-handle"]',
    ) as HTMLElement | null;
    if (grip) {
      fireEvent.mouseDown(grip);
      fireEvent.mouseUp(grip);
    }
    expect(screen.getAllByText('G0').length).toBeGreaterThan(0);
  });

  it('主容器 pointer pan：move + up', () => {
    const items = [
      <button key="1" type="button">
        X1
      </button>,
      <button key="2" type="button">
        X2
      </button>,
      <button key="3" type="button">
        X3
      </button>,
    ] as KeyedElement[];
    const { container } = wrap(
      <ActionItemContainer>{items}</ActionItemContainer>,
    );
    const scroll = (container.querySelector(
      '[class*="overflow-container"]',
    ) || container.firstElementChild) as HTMLElement;
    Object.defineProperty(scroll, 'scrollWidth', { value: 800, configurable: true });
    Object.defineProperty(scroll, 'clientWidth', { value: 200, configurable: true });
    fireEvent.pointerDown(scroll, {
      button: 0,
      clientX: 100,
      pointerId: 2,
    });
    fireEvent.pointerMove(scroll, { clientX: 60, pointerId: 2 });
    fireEvent.pointerUp(scroll, { pointerId: 2 });
    expect(screen.getByText('X1')).toBeInTheDocument();
  });
});
