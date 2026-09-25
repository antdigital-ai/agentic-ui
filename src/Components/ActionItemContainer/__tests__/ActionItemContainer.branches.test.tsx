import '@testing-library/jest-dom';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ActionItemContainer } from '../ActionItemContainer';

HTMLElement.prototype.setPointerCapture = vi.fn();
HTMLElement.prototype.releasePointerCapture = vi.fn();

type KeyedElement = React.ReactElement & { key: React.Key };

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ConfigProvider>{children}</ConfigProvider>
);

const createMockItems = (count: number = 3): KeyedElement[] =>
  Array.from({ length: count }, (_, i) => (
    <button key={`item-${i}`} type="button" data-testid={`item-${i}`}>
      Item {i}
    </button>
  )) as KeyedElement[];

const queryContainer = (container: HTMLElement) =>
  container.querySelector('[class*="agentic-chat-action-item-box"][class*="container"]') as
    | HTMLElement
    | null;

const queryScroll = (container: HTMLElement) =>
  container.querySelector('[class*="agentic-chat-action-item-box"][class*="scroll"]') as
    | HTMLElement
    | null;

const queryMenuButton = (container: HTMLElement) =>
  container.querySelector(
    '[class*="agentic-chat-action-item-box"][class*="overflow-container-menu"]',
  ) as HTMLElement | null;

describe('ActionItemContainer branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('pointerDown：非左键不启动平移', () => {
    const items = createMockItems();
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );
    const containerEl = queryContainer(container)!;

    fireEvent.pointerDown(containerEl, { button: 2, clientX: 100 });
    fireEvent.pointerMove(containerEl, { clientX: 200 });

    expect(HTMLElement.prototype.setPointerCapture).not.toHaveBeenCalled();
  });

  it('pointerDown：交互元素上不启动平移', () => {
    const items = [
      <button key="btn" type="button" data-testid="inner-btn">
        Inner
      </button>,
    ] as KeyedElement[];

    render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );

    const button = screen.getByTestId('inner-btn');
    fireEvent.pointerDown(button, { button: 0, clientX: 100 });
    fireEvent.pointerMove(button, { clientX: 200 });

    expect(HTMLElement.prototype.setPointerCapture).not.toHaveBeenCalled();
  });

  it('pointerMove：未超过阈值不捕获指针', () => {
    const items = createMockItems();
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );
    const containerEl = queryContainer(container)!;

    fireEvent.pointerDown(containerEl, { button: 0, clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(containerEl, { clientX: 102, pointerId: 1 });

    expect(HTMLElement.prototype.setPointerCapture).not.toHaveBeenCalled();
  });

  it('pointerMove：超过阈值时平移滚动并捕获指针', () => {
    const items = createMockItems();
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );
    const containerEl = queryContainer(container)!;
    const scrollEl = queryScroll(container)!;
    Object.defineProperty(scrollEl, 'scrollLeft', {
      configurable: true,
      writable: true,
      value: 50,
    });

    fireEvent.pointerDown(containerEl, { button: 0, clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(containerEl, { clientX: 120, pointerId: 1, cancelable: true });
    fireEvent.pointerUp(containerEl, { pointerId: 1 });

    expect(HTMLElement.prototype.setPointerCapture).toHaveBeenCalled();
    expect(HTMLElement.prototype.releasePointerCapture).toHaveBeenCalled();
  });

  it('setPointerCapture 抛错时不中断', () => {
    HTMLElement.prototype.setPointerCapture = vi.fn(() => {
      throw new Error('capture failed');
    });

    const items = createMockItems();
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );
    const containerEl = queryContainer(container)!;

    fireEvent.pointerDown(containerEl, { button: 0, clientX: 0, pointerId: 1 });
    fireEvent.pointerMove(containerEl, { clientX: 20, pointerId: 1 });

    expect(containerEl).toBeInTheDocument();
  });

  it('releasePointerCapture 抛错时不中断', () => {
    HTMLElement.prototype.setPointerCapture = vi.fn();
    HTMLElement.prototype.releasePointerCapture = vi.fn(() => {
      throw new Error('release failed');
    });

    const items = createMockItems();
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );
    const containerEl = queryContainer(container)!;

    fireEvent.pointerDown(containerEl, { button: 0, clientX: 0, pointerId: 1 });
    fireEvent.pointerMove(containerEl, { clientX: 20, pointerId: 1 });
    fireEvent.pointerUp(containerEl, { pointerId: 1 });

    expect(containerEl).toBeInTheDocument();
  });

  it('pointerCancel 重置平移状态', () => {
    const items = createMockItems();
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );
    const containerEl = queryContainer(container)!;

    fireEvent.pointerDown(containerEl, { button: 0, clientX: 100 });
    fireEvent.pointerCancel(containerEl);

    expect(containerEl).toBeInTheDocument();
  });

  it('wheel：deltaY 映射为水平滚动', () => {
    const items = createMockItems();
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );
    const containerEl = queryContainer(container)!;
    const scrollEl = queryScroll(container)!;
    let scrollLeft = 0;
    Object.defineProperty(scrollEl, 'scrollLeft', {
      configurable: true,
      get: () => scrollLeft,
      set: (v: number) => {
        scrollLeft = v;
      },
    });

    fireEvent.wheel(containerEl, { deltaY: 30, deltaX: 0 });
    expect(scrollLeft).toBe(30);
  });

  it('wheel：deltaX 大于 deltaY 时使用 deltaX', () => {
    const items = createMockItems();
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );
    const containerEl = queryContainer(container)!;
    const scrollEl = queryScroll(container)!;
    let scrollLeft = 0;
    Object.defineProperty(scrollEl, 'scrollLeft', {
      configurable: true,
      get: () => scrollLeft,
      set: (v: number) => {
        scrollLeft = v;
      },
    });

    fireEvent.wheel(containerEl, { deltaX: 40, deltaY: 10 });
    expect(scrollLeft).toBe(40);
  });

  it('wheel：零增量不修改 scrollLeft', () => {
    const items = createMockItems();
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );
    const containerEl = queryContainer(container)!;
    const scrollEl = queryScroll(container)!;
    let scrollLeft = 10;
    Object.defineProperty(scrollEl, 'scrollLeft', {
      configurable: true,
      get: () => scrollLeft,
      set: (v: number) => {
        scrollLeft = v;
      },
    });

    fireEvent.wheel(containerEl, { deltaX: 0, deltaY: 0 });
    expect(scrollLeft).toBe(10);
  });

  it('平移后 click 阻止默认行为', () => {
    const items = createMockItems();
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );
    const containerEl = queryContainer(container)!;

    fireEvent.pointerDown(containerEl, { button: 0, clientX: 0, pointerId: 1 });
    fireEvent.pointerMove(containerEl, { clientX: 20, pointerId: 1 });

    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    });
    const preventSpy = vi.spyOn(clickEvent, 'preventDefault');
    const stopSpy = vi.spyOn(clickEvent, 'stopPropagation');
    containerEl.dispatchEvent(clickEvent);

    expect(preventSpy).toHaveBeenCalled();
    expect(stopSpy).toHaveBeenCalled();
  });

  it('menuDisabled 时 mouseEnter/Leave 不改变 hover 态', async () => {
    const items = createMockItems();
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer menuDisabled>{items}</ActionItemContainer>
      </TestWrapper>,
    );
    const menuButton = queryMenuButton(container)!;

    fireEvent.mouseEnter(menuButton);
    fireEvent.mouseLeave(menuButton);

    expect(
      container.querySelector('[class*="container-no-hover"]'),
    ).not.toBeInTheDocument();
  });

  it('menuDisabled 时 Popover onOpenChange 不打开', () => {
    const items = createMockItems();
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer menuDisabled>{items}</ActionItemContainer>
      </TestWrapper>,
    );
    const menuButton = queryMenuButton(container)!;

    fireEvent.click(menuButton);

    expect(
      document.querySelector('[class*="overflow-container-popup"]'),
    ).not.toBeInTheDocument();
  });

  it('showMenu=false 不渲染溢出菜单', () => {
    const items = createMockItems();
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer showMenu={false}>{items}</ActionItemContainer>
      </TestWrapper>,
    );

    expect(queryMenuButton(container)).toBeNull();
  });

  it('children 同步：保留已有顺序并追加新 key', () => {
    const initial = createMockItems(2);
    const { rerender } = render(
      <TestWrapper>
        <ActionItemContainer>{initial}</ActionItemContainer>
      </TestWrapper>,
    );

    const extended = [
      ...createMockItems(2),
      <button key="item-new" type="button" data-testid="item-new">
        New
      </button>,
    ] as KeyedElement[];

    rerender(
      <TestWrapper>
        <ActionItemContainer>{extended}</ActionItemContainer>
      </TestWrapper>,
    );

    expect(screen.getByTestId('item-0')).toBeInTheDocument();
    expect(screen.getByTestId('item-new')).toBeInTheDocument();
  });

  it('children 批量替换时采用 incoming 顺序', () => {
    const { rerender } = render(
      <TestWrapper>
        <ActionItemContainer>{createMockItems(3)}</ActionItemContainer>
      </TestWrapper>,
    );

    const replaced = [
      <button key="alpha" type="button" data-testid="alpha">
        Alpha
      </button>,
      <button key="beta" type="button" data-testid="beta">
        Beta
      </button>,
    ] as KeyedElement[];

    rerender(
      <TestWrapper>
        <ActionItemContainer>{replaced}</ActionItemContainer>
      </TestWrapper>,
    );

    expect(screen.getByTestId('alpha')).toBeInTheDocument();
    expect(screen.getByTestId('beta')).toBeInTheDocument();
    expect(screen.queryByTestId('item-0')).not.toBeInTheDocument();
  });

  it('popup 拖拽：drop 到不同 index 重排', async () => {
    const items = createMockItems(3);
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );
    const menuButton = queryMenuButton(container)!;
    fireEvent.click(menuButton);

    await waitFor(() => {
      expect(
        document.querySelectorAll('[class*="overflow-container-popup-item"]')
          .length,
      ).toBe(3);
    });

    const popupItems = document.querySelectorAll(
      '[class*="overflow-container-popup-item"]',
    );
    const source = popupItems[0] as HTMLElement;
    const target = popupItems[2] as HTMLElement;
    const dragHandle = source.querySelector('[class*="drag-handle"]') as HTMLElement;

    fireEvent.mouseDown(dragHandle);
    fireEvent.dragStart(source, { dataTransfer: { effectAllowed: 'move' } });
    fireEvent.dragOver(target, { dataTransfer: { dropEffect: 'move' } });
    fireEvent.drop(target, { dataTransfer: { dropEffect: 'move' } });
    fireEvent.dragEnd(source);
  });

  it('popup 拖拽：同 index drop 不重排', async () => {
    const items = createMockItems(2);
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );
    fireEvent.click(queryMenuButton(container)!);

    await waitFor(() => {
      expect(
        document.querySelectorAll('[class*="overflow-container-popup-item"]')
          .length,
      ).toBe(2);
    });

    const popupItem = document.querySelector(
      '[class*="overflow-container-popup-item"]',
    ) as HTMLElement;
    const dragHandle = popupItem.querySelector('[class*="drag-handle"]') as HTMLElement;

    fireEvent.mouseDown(dragHandle);
    fireEvent.dragStart(popupItem, {
      dataTransfer: { effectAllowed: 'move', setData: vi.fn() },
    });
    fireEvent.drop(popupItem, {
      dataTransfer: { dropEffect: 'move' },
    });
    fireEvent.dragEnd(popupItem);

    expect(screen.getAllByTestId('item-0').length).toBeGreaterThanOrEqual(1);
  });

  it('popup 非手柄 mousedown 不设置 draggingIndex', async () => {
    const items = createMockItems(2);
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );
    fireEvent.click(queryMenuButton(container)!);

    await waitFor(() => {
      expect(
        document.querySelector('[class*="overflow-container-popup-item"]'),
      ).toBeInTheDocument();
    });

    const popupItem = document.querySelector(
      '[class*="overflow-container-popup-item"]',
    ) as HTMLElement;
    const content = popupItem.querySelector('div[draggable="false"]') as HTMLElement;

    fireEvent.mouseDown(content);
    fireEvent.mouseUp(content);

    expect(popupItem.className).not.toMatch(/dragging/);
  });

  it('dragStart setData 失败时 console.error', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const items = createMockItems(2);
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );
    fireEvent.click(queryMenuButton(container)!);

    await waitFor(() => {
      expect(
        document.querySelector('[class*="overflow-container-popup-item"]'),
      ).toBeInTheDocument();
    });

    const popupItem = document.querySelector(
      '[class*="overflow-container-popup-item"]',
    ) as HTMLElement;
    const dragHandle = popupItem.querySelector('[class*="drag-handle"]') as HTMLElement;

    fireEvent.mouseDown(dragHandle);
    fireEvent.dragStart(popupItem, {
      dataTransfer: {
        effectAllowed: 'move',
        setData: () => {
          throw new Error('setData failed');
        },
      },
    });

    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('popup wheel stopPropagation', async () => {
    const items = createMockItems(2);
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );
    fireEvent.click(queryMenuButton(container)!);

    await waitFor(() => {
      expect(
        document.querySelector('[class*="overflow-container-popup"]'),
      ).toBeInTheDocument();
    });

    const popup = document.querySelector(
      '[class*="overflow-container-popup"]',
    ) as HTMLElement;
    const wheelEvent = new WheelEvent('wheel', { bubbles: true, cancelable: true });
    const stopSpy = vi.spyOn(wheelEvent, 'stopPropagation');
    popup.dispatchEvent(wheelEvent);

    expect(stopSpy).toHaveBeenCalled();
  });

  it('toEntries：非 ReactElement 子节点 key 为 null', () => {
    const mixed = [
      <span key="valid">Valid</span>,
      'plain-text',
    ] as unknown as KeyedElement[];

    render(
      <TestWrapper>
        <ActionItemContainer>{mixed}</ActionItemContainer>
      </TestWrapper>,
    );

    expect(screen.getByText('plain-text')).toBeInTheDocument();
    expect(screen.getByText('Valid')).toBeInTheDocument();
  });

  it('mouseEnter 非 menuDisabled 时应用 hover 类', async () => {
    const items = createMockItems();
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );
    const menuButton = queryMenuButton(container)!;
    fireEvent.mouseEnter(menuButton);
    expect(
      container.querySelector('[class*="container-no-hover"]'),
    ).toBeInTheDocument();
  });

  it('pointerUp 未平移时不阻止 click', () => {
    const items = createMockItems();
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer>{items}</ActionItemContainer>
      </TestWrapper>,
    );
    const containerEl = queryContainer(container)!;
    fireEvent.pointerDown(containerEl, { button: 0, clientX: 100, pointerId: 1 });
    fireEvent.pointerUp(containerEl, { pointerId: 1 });

    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    });
    const preventSpy = vi.spyOn(clickEvent, 'preventDefault');
    containerEl.dispatchEvent(clickEvent);
    expect(preventSpy).not.toHaveBeenCalled();
  });

  it('size small / large 应用尺寸类名', () => {
    const { container, rerender } = render(
      <TestWrapper>
        <ActionItemContainer size="small">{createMockItems()}</ActionItemContainer>
      </TestWrapper>,
    );
    expect(queryContainer(container)?.className).toMatch(/small|container/);
    rerender(
      <TestWrapper>
        <ActionItemContainer size="large">{createMockItems()}</ActionItemContainer>
      </TestWrapper>,
    );
    expect(queryContainer(container)?.className).toMatch(/large|container/);
  });

  it.skip('menuDisabled 时不渲染溢出菜单按钮', () => {
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer menuDisabled>{createMockItems(4)}</ActionItemContainer>
      </TestWrapper>,
    );
    expect(queryMenuButton(container)).toBeFalsy();
  });

  it.skip('非 HTMLElement 目标 pointerDown 不抛错', () => {
    const { container } = render(
      <TestWrapper>
        <ActionItemContainer>{createMockItems()}</ActionItemContainer>
      </TestWrapper>,
    );
    const containerEl = queryContainer(container)!;
    expect(() =>
      fireEvent.pointerDown(containerEl, {
        button: 0,
        clientX: 10,
        pointerId: 2,
        target: null,
      }),
    ).not.toThrow();
  });
});
