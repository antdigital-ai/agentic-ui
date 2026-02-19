import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ActionItemContainer } from '../../../src/MarkdownInputField/BeforeToolContainer/BeforeToolContainer';

const capturedFns: Array<(...args: any[]) => any> = [];

vi.mock('@sofa-design/icons', () => ({
  GripVertical: (props: any) => (
    <div
      data-testid="grip-vertical-icon"
      className={props.className}
      onMouseDown={props.onMouseDown}
    />
  ),
  Menu: () => <div data-testid="menu-icon" />,
}));

vi.mock('antd', async () => {
  const actualAntd: any = await vi.importActual('antd');
  return {
    ...actualAntd,
    ConfigProvider: {
      ...actualAntd.ConfigProvider,
      ConfigContext: {
        Consumer: actualAntd.ConfigProvider.ConfigContext.Consumer,
        Provider: actualAntd.ConfigProvider.ConfigContext.Provider,
        displayName: 'ConfigContext',
        $$typeof: Symbol.for('react.context'),
        _currentValue: {
          getPrefixCls: (suffix: string) => `ant-${suffix}`,
        },
      },
    },
    Popover: ({ children, content, onOpenChange }: any) => (
      <div
        data-testid="mock-popover"
        onClick={() => onOpenChange?.(true)}
        onKeyDown={() => onOpenChange?.(true)}
        role="button"
        tabIndex={0}
      >
        {children}
        <div data-testid="mock-popover-content">{content}</div>
      </div>
    ),
  };
});

vi.mock('../../../src/Components/ActionItemBox', () => ({
  useStyle: () => ({
    wrapSSR: (node: React.ReactNode) => node,
    hashId: 'test-hash',
  }),
}));

vi.mock('../../../src/Hooks/useRefFunction', () => ({
  useRefFunction: (fn: any) => {
    capturedFns.push(fn);
    return fn;
  },
}));

type KeyedElement = React.ReactElement & { key: React.Key };

const createKeyedElement = (key: string, text: string): KeyedElement =>
  (
    <button key={key} data-testid={`action-button-${key}`} type="button">
      {text}
    </button>
  ) as KeyedElement;

const pickFn = (keyword: string) => {
  const fn = capturedFns.find((item) =>
    String(item).includes(keyword),
  ) as ((...args: any[]) => any) | undefined;
  expect(fn).toBeTruthy();
  return fn!;
};

describe('ActionItemContainer targeted coverage', () => {
  it('覆盖 DraggablePopupItem 鼠标分支与目标判断分支', () => {
    capturedFns.length = 0;
    render(
      <ActionItemContainer showMenu>
        {createKeyedElement('1', 'Button 1')}
        {createKeyedElement('2', 'Button 2')}
      </ActionItemContainer>,
    );

    const isInteractiveTarget = pickFn('INTERACTIVE_SELECTOR');
    const isHandleTarget = pickFn('drag-handle');

    expect(isInteractiveTarget({})).toBe(false);
    const button = document.createElement('button');
    isInteractiveTarget(button);

    expect(isHandleTarget({})).toBe(false);
    const wrap = document.createElement('div');
    const handle = document.createElement('span');
    handle.className = 'ant-agentic-chat-action-item-box-drag-handle';
    wrap.appendChild(handle);
    isHandleTarget(handle);

    const popupItems = document.querySelectorAll(
      '[class*="overflow-container-popup-item"]',
    );
    expect(popupItems.length).toBeGreaterThan(0);
    fireEvent.mouseDown(popupItems[0]);
    const grip = document.querySelector(
      '[class*="agentic-chat-action-item-box-drag-handle"]',
    ) as HTMLElement;
    if (grip) {
      fireEvent.mouseDown(grip);
    }
    fireEvent.mouseUp(popupItems[0]);
  });

  it('覆盖 key 校验中的非 ReactElement 分支', () => {
    capturedFns.length = 0;
    expect(() =>
      render(
        <ActionItemContainer>
          {[createKeyedElement('1', 'Button 1'), 'plain-text' as any]}
        </ActionItemContainer>,
      ),
    ).not.toThrow();
  });

  it('覆盖 pointer pan、wheel 与 click 抑制分支', () => {
    capturedFns.length = 0;
    const { container } = render(
      <ActionItemContainer>
        {createKeyedElement('1', 'Button 1')}
        {createKeyedElement('2', 'Button 2')}
      </ActionItemContainer>,
    );

    const scrollDiv = container.querySelector(
      '[class*="agentic-chat-action-item-box-scroll"]',
    ) as HTMLDivElement;
    expect(scrollDiv).toBeTruthy();
    (scrollDiv as any).setPointerCapture = vi.fn();
    (scrollDiv as any).releasePointerCapture = vi.fn();
    scrollDiv.scrollLeft = 20;

    const handlePointerDown = pickFn('panIntentRef.current = true');
    const handlePointerMove = pickFn('panStartScrollLeftRef.current - dx');
    const handlePointerUp = pickFn('releasePointerCapture');
    const handleWheel = pickFn('horizontalDelta');
    const handleClick = pickFn('if (hasPanMovedRef.current)');

    handlePointerDown({
      button: 0,
      clientX: 100,
      target: document.createElement('div'),
    });

    const preventDefault = vi.fn();
    const stopPropagation = vi.fn();
    handlePointerMove({
      clientX: 112,
      pointerId: 1,
      cancelable: true,
      preventDefault,
      stopPropagation,
    });

    expect((scrollDiv as any).setPointerCapture).toHaveBeenCalledWith(1);
    expect(preventDefault).toHaveBeenCalled();
    expect(stopPropagation).toHaveBeenCalled();

    handlePointerUp({ pointerId: 1 });
    expect((scrollDiv as any).releasePointerCapture).toHaveBeenCalledWith(1);

    handleWheel({ deltaX: 0, deltaY: 15, stopPropagation: vi.fn() });
    handleWheel({ deltaX: 18, deltaY: 0, stopPropagation: vi.fn() });

    const clickPrevent = vi.fn();
    const clickStop = vi.fn();
    handleClick({ preventDefault: clickPrevent, stopPropagation: clickStop });
    expect(clickPrevent).toHaveBeenCalled();
    expect(clickStop).toHaveBeenCalled();
  });
});

