/**
 * useTextOverflow：无 el 早退、溢出写 CSS 变量、无 ResizeObserver。
 */
import { act, render } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useTextOverflow } from '../useTextOverflow';

const Probe = ({ text }: { text: string }) => {
  const { textRef, isTextOverflow } = useTextOverflow(text);
  return (
    <div
      ref={textRef}
      data-testid="ov"
      data-overflow-state={String(isTextOverflow)}
      style={{ width: 40, overflow: 'hidden', whiteSpace: 'nowrap' }}
    >
      {text}
    </div>
  );
};

describe('useTextOverflow branches', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('溢出时写入 CSS 变量与 data-overflow', () => {
    const { getByTestId, rerender } = render(<Probe text="abcdefghijklmnop" />);
    const el = getByTestId('ov');
    Object.defineProperty(el, 'scrollWidth', { value: 200, configurable: true });
    Object.defineProperty(el, 'clientWidth', { value: 40, configurable: true });
    rerender(<Probe text="abcdefghijklmnop!!" />);
    const el2 = getByTestId('ov');
    Object.defineProperty(el2, 'scrollWidth', {
      value: 220,
      configurable: true,
    });
    Object.defineProperty(el2, 'clientWidth', {
      value: 40,
      configurable: true,
    });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    rerender(<Probe text="abcdefghijklmnop!!!" />);
    expect(getByTestId('ov').getAttribute('data-overflow')).toBe('true');
    expect(
      getByTestId('ov').style.getPropertyValue('--scroll-width'),
    ).toBeTruthy();
  });

  it('无 ResizeObserver 时不抛错', () => {
    vi.stubGlobal('ResizeObserver', undefined);
    expect(() => render(<Probe text="short" />)).not.toThrow();
  });

  it('未溢出时 data-overflow false', () => {
    const { getByTestId, rerender } = render(<Probe text="a" />);
    const el = getByTestId('ov');
    Object.defineProperty(el, 'scrollWidth', { value: 10, configurable: true });
    Object.defineProperty(el, 'clientWidth', { value: 40, configurable: true });
    rerender(<Probe text="ab" />);
    expect(getByTestId('ov').getAttribute('data-overflow')).toBe('false');
  });
});
