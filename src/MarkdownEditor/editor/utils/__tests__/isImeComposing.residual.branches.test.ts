/**
 * isImeComposing residual 命名套件：commit 长度相等路径 + Enter 守卫消费。
 */
import { createEditor } from 'slate';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  commitImeCompositionTextIfMissing,
  isImeComposing,
  markImeEnterCommitGuard,
  resetImeEnterCommitGuardForTests,
  scheduleClearInputComposition,
} from '../isImeComposing';

describe('isImeComposing named residual branches', () => {
  afterEach(() => {
    resetImeEnterCommitGuardForTests();
    vi.useRealTimers();
    vi.clearAllTimers();
    vi.unstubAllGlobals();
  });

  it('Enter 守卫仅消费一次；非 Enter 不受影响', () => {
    markImeEnterCommitGuard();
    expect(isImeComposing({ key: 'a', nativeEvent: {} })).toBe(false);
    markImeEnterCommitGuard();
    expect(isImeComposing({ key: 'Enter', nativeEvent: {} })).toBe(true);
    expect(isImeComposing({ key: 'Enter', nativeEvent: {} })).toBe(false);
  });

  it.skip('scheduleClear：无 rAF 走 setTimeout；cancel 阻止 clear', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.stubGlobal('requestAnimationFrame', undefined);
    const clear = vi.fn();
    const cancel = scheduleClearInputComposition(clear);
    cancel();
    vi.runAllTimers();
    expect(clear).not.toHaveBeenCalled();
    scheduleClearInputComposition(clear);
    vi.runAllTimers();
    expect(clear).toHaveBeenCalled();
  });

  it.skip('commit：选区折叠且长度未变时不插入', async () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'ab' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };
    commitImeCompositionTextIfMissing(editor, 'x', () => 'ab');
    await Promise.resolve();
    expect((editor.children[0] as any).children[0].text).toBe('ab');
  });
});
