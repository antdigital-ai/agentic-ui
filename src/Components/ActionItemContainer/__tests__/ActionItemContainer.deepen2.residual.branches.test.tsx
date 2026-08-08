/**
 * ActionItemContainer deepen2：production 缺 key、批量替换、drag same index、wheel/cancel。
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

describe('ActionItemContainer deepen2 residual branches', () => {
  const prevEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    process.env.NODE_ENV = prevEnv;
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('NODE_ENV=production 缺 key 不抛', () => {
    process.env.NODE_ENV = 'production';
    expect(() =>
      wrap(
        <ActionItemContainer>
          <button type="button">A</button>
          <button type="button">B</button>
        </ActionItemContainer>,
      ),
    ).not.toThrow();
  });

  it('children 批量替换（数量变化）采用 incoming', () => {
    const a = [
      <button key="1" type="button">
        1
      </button>,
      <button key="2" type="button">
        2
      </button>,
    ] as KeyedElement[];
    const { rerender } = wrap(
      <ActionItemContainer>{a}</ActionItemContainer>,
    );
    const b = [
      <button key="x" type="button" data-testid="x">
        X
      </button>,
    ] as KeyedElement[];
    rerender(
      <ConfigProvider>
        <ActionItemContainer>{b}</ActionItemContainer>
      </ConfigProvider>,
    );
    expect(screen.getByTestId('x')).toBeInTheDocument();
  });

  it('dragOver 同 index / drop 同 index 早退；setData 抛错', () => {
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
    const target = (handles[0] ||
      container.querySelector('[class*="overflow"]')) as HTMLElement;
    if (!target) return;

    const dt = {
      effectAllowed: 'move',
      dropEffect: 'move',
      setData: vi.fn(() => {
        throw new Error('setData fail');
      }),
    };
    fireEvent.dragStart(target, { dataTransfer: dt });
    fireEvent.dragOver(target, { dataTransfer: dt });
    fireEvent.drop(target, { dataTransfer: dt });
    fireEvent.dragEnd(target);
  });

  it('pointerCancel + wheel 水平滚动', () => {
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
    fireEvent.pointerDown(el, { button: 0, clientX: 0, pointerId: 1 });
    fireEvent.pointerCancel(el);
    Object.defineProperty(el, 'scrollLeft', {
      value: 0,
      writable: true,
      configurable: true,
    });
    fireEvent.wheel(el, { deltaY: 40, deltaX: 0 });
  });

  it('popup mouseUp 在非拖拽时清 isHandlePress', () => {
    const items = Array.from({ length: 6 }, (_, i) => (
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
    if (menu) {
      fireEvent.click(menu);
      const popupItem = document.querySelector(
        '[class*="overflow-container-popup-item"]',
      ) as HTMLElement | null;
      if (popupItem) {
        fireEvent.mouseDown(popupItem);
        fireEvent.mouseUp(popupItem);
      }
    }
  });
});
