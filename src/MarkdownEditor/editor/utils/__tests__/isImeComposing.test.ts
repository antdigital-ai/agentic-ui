import { describe, expect, it, vi } from 'vitest';
import {
  IME_PROCESSING_KEY_CODE,
  isImeComposing,
  markImeEnterCommitGuard,
  resetImeEnterCommitGuardForTests,
  scheduleClearInputComposition,
} from '../isImeComposing';

describe('isImeComposing', () => {
  beforeEach(() => {
    resetImeEnterCommitGuardForTests();
  });

  it('inputComposition 为 true 时返回 true', () => {
    expect(isImeComposing({ nativeEvent: { isComposing: false } }, true)).toBe(
      true,
    );
  });

  it('nativeEvent.isComposing 为 true 时返回 true', () => {
    expect(isImeComposing({ nativeEvent: { isComposing: true } }, false)).toBe(
      true,
    );
  });

  it('keyCode 229 时返回 true', () => {
    expect(
      isImeComposing(
        { keyCode: IME_PROCESSING_KEY_CODE, nativeEvent: {} },
        false,
      ),
    ).toBe(true);
  });

  it('普通按键返回 false', () => {
    expect(
      isImeComposing(
        { key: 'a', keyCode: 13, nativeEvent: { isComposing: false } },
        false,
      ),
    ).toBe(false);
  });

  it('compositionend 后 Enter 在守卫窗口内返回 true', () => {
    markImeEnterCommitGuard();
    expect(
      isImeComposing(
        { key: 'Enter', nativeEvent: { isComposing: false } },
        false,
      ),
    ).toBe(true);
  });
});

describe('scheduleClearInputComposition', () => {
  it('应在双 rAF 后执行 clear', async () => {
    const clear = vi.fn();
    scheduleClearInputComposition(clear);
    expect(clear).not.toHaveBeenCalled();

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });
    expect(clear).toHaveBeenCalledTimes(1);
  });

  it('cancel 后不应执行 clear', async () => {
    const clear = vi.fn();
    const cancel = scheduleClearInputComposition(clear);
    cancel();

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });
    expect(clear).not.toHaveBeenCalled();
  });
});
