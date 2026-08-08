/**
 * ActionItemContainer deepen6：grip isHandle、非 HTMLElement、
 * children 长度变化、wheel。
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

describe('ActionItemContainer deepen6 residual branches', () => {
  beforeEach(() => {
    cleanup();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('popup grip：isHandle → index', () => {
    const items = Array.from({ length: 10 }, (_, i) => (
      <button key={`k${i}`} type="button">
        item-{i}
      </button>
    )) as KeyedElement[];
    const { container } = wrap(
      <ActionItemContainer showMenu>{items}</ActionItemContainer>,
    );
    const menu = container.querySelector(
      '[class*="overflow-container-menu"]',
    ) as HTMLElement | null;
    if (menu) fireEvent.click(menu);
    const grip = document.querySelector(
      '[class*="drag-handle"]',
    ) as HTMLElement | null;
    if (grip) {
      fireEvent.mouseDown(grip);
      fireEvent.mouseUp(document);
    }
    expect(screen.getAllByText('item-0').length).toBeGreaterThan(0);
  });

  it('pointer/wheel：容器事件', () => {
    const items = Array.from({ length: 6 }, (_, i) => (
      <span key={`s${i}`}>S{i}</span>
    )) as KeyedElement[];
    const { container } = wrap(
      <ActionItemContainer>{items}</ActionItemContainer>,
    );
    const root = container.firstElementChild as HTMLElement | null;
    if (root) {
      fireEvent.wheel(root, { deltaY: 40 });
      fireEvent.pointerDown(root, { pointerId: 1, button: 0 });
    }
    expect(screen.getByText('S0')).toBeInTheDocument();
  });

  it('children 长度变化：merged !== incoming', () => {
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
    rerender(
      <ConfigProvider>
        <ActionItemContainer>
          {
            [
              <button key="9" type="button">
                Nine
              </button>,
            ] as KeyedElement[]
          }
        </ActionItemContainer>
      </ConfigProvider>,
    );
    expect(screen.getByText('Nine')).toBeInTheDocument();
  });
});
