/**
 * ActionItemContainer deepen4：合并长度不一致回退 incoming、
 * popup isHandle/非 handle、无 dragging drop、wheel。
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

describe('ActionItemContainer deepen4 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    cleanup();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('children 批量替换：merged.length !== incoming → 用 incoming', () => {
    const a = [
      <button key="a" type="button">
        A
      </button>,
      <button key="b" type="button">
        B
      </button>,
    ] as KeyedElement[];
    const { rerender } = wrap(
      <ActionItemContainer>{a}</ActionItemContainer>,
    );
    const b = [
      <button key="c" type="button">
        C
      </button>,
    ] as KeyedElement[];
    rerender(
      <ConfigProvider>
        <ActionItemContainer>{b}</ActionItemContainer>
      </ConfigProvider>,
    );
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.queryByText('A')).toBeNull();
  });

  it('popup：grip / item mouseDown；drop 无 dragging', () => {
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
      fireEvent.drop(popupItem, {
        dataTransfer: {
          effectAllowed: 'move',
          dropEffect: 'move',
          setData: vi.fn(),
        },
      });
    }
  });

  it('主列表 drop 无 draggingIndex；wheel 映射', () => {
    const items = [
      <button key="a" type="button">
        A
      </button>,
      <button key="b" type="button">
        B
      </button>,
    ] as KeyedElement[];
    const { container } = wrap(
      <ActionItemContainer>{items}</ActionItemContainer>,
    );
    const el = container.querySelector(
      '[class*="agentic-chat-action-item-box"][class*="container"]',
    ) as HTMLElement;
    const handles = container.querySelectorAll(
      '[class*="drag-handle"], [draggable="true"]',
    );
    const b = handles[1] as HTMLElement | undefined;
    if (b) {
      fireEvent.drop(b, {
        dataTransfer: {
          effectAllowed: 'move',
          dropEffect: 'move',
          setData: vi.fn(),
        },
      });
    }
    fireEvent.wheel(el, { deltaY: 20, deltaX: 0 });
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('pointerDown 在文本节点上（非 HTMLElement）', () => {
    const items = [
      <button key="1" type="button">
        1
      </button>,
    ] as KeyedElement[];
    const { container } = wrap(
      <ActionItemContainer>{items}</ActionItemContainer>,
    );
    const el = container.querySelector(
      '[class*="agentic-chat-action-item-box"][class*="container"]',
    ) as HTMLElement;
    const text = document.createTextNode('t');
    el.appendChild(text);
    fireEvent.pointerDown(text as unknown as Element, {
      button: 0,
      clientX: 0,
      pointerId: 9,
    });
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
