import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useClickAway from '../@ant-design/agentic-ui/Hooks/useClickAway';

describe('useClickAway', () => {
  let mockCallback: ReturnType<typeof vi.fn>;
  let mockRef: React.RefObject<HTMLDivElement>;

  beforeEach(() => {
    mockCallback = vi.fn();
    mockRef = {
      current: document.createElement('div'),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call callback when clicking outside the ref element', () => {
    renderHook(() => useClickAway(mockCallback, mockRef));

    const event = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });

    // 模拟点击外部元素
    document.body.dispatchEvent(event);

    expect(mockCallback).toHaveBeenCalledWith(event);
  });

  it('should not call callback when clicking inside the ref element', () => {
    renderHook(() => useClickAway(mockCallback, mockRef));

    const event = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });

    // 模拟点击内部元素
    mockRef.current?.dispatchEvent(event);

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('should not call callback when clicking on parent node', () => {
    const parentElement = document.createElement('div');
    const childElement = document.createElement('div');
    parentElement.appendChild(childElement);
    (mockRef as any).current = childElement;

    renderHook(() => useClickAway(mockCallback, mockRef));

    const event = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });

    // 模拟点击父元素
    parentElement.dispatchEvent(event);

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('should handle null ref gracefully', () => {
    const nullRef = { current: null };

    expect(() => {
      renderHook(() => useClickAway(mockCallback, nullRef));
    }).not.toThrow();
  });

  it('should handle undefined ref gracefully', () => {
    const undefinedRef = {
      current: undefined,
    } as unknown as React.RefObject<HTMLDivElement>;

    expect(() => {
      renderHook(() => useClickAway(mockCallback, undefinedRef));
    }).not.toThrow();
  });

  it('should remove event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = renderHook(() => useClickAway(mockCallback, mockRef));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mousedown',
      expect.any(Function),
    );
  });

  it('should handle multiple click away hooks', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const ref1 = { current: document.createElement('div') };
    const ref2 = { current: document.createElement('div') };

    renderHook(() => useClickAway(callback1, ref1));
    renderHook(() => useClickAway(callback2, ref2));

    const event = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });

    document.body.dispatchEvent(event);

    expect(callback1).toHaveBeenCalledWith(event);
    expect(callback2).toHaveBeenCalledWith(event);
  });
});
