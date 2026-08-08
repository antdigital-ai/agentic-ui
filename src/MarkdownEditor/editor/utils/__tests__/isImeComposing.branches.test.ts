/**
 * isImeComposing 残留分支：守卫、rAF/setTimeout、commit 补写。
 */
import { createEditor } from 'slate';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  clearImeEnterCommitGuard,
  commitImeCompositionTextIfMissing,
  getEditorTextSnapshot,
  isImeComposing,
  markImeEnterCommitGuard,
  resetImeEnterCommitGuardForTests,
  scheduleClearInputComposition,
} from '../isImeComposing';

describe('isImeComposing residual branches', () => {
  afterEach(() => {
    resetImeEnterCommitGuardForTests();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('getEditorTextSnapshot：无 editor/无 selection/异常路径', () => {
    expect(getEditorTextSnapshot(null)).toBe('');
    expect(getEditorTextSnapshot(undefined)).toBe('');
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'hi' }] }] as any;
    editor.selection = null;
    expect(getEditorTextSnapshot(editor)).toBe('');
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    };
    expect(getEditorTextSnapshot(editor)).toBe('hi');
    editor.selection = {
      anchor: { path: [9, 0], offset: 0 },
      focus: { path: [9, 0], offset: 0 },
    };
    expect(getEditorTextSnapshot(editor)).toBe('');
  });

  it('isImeComposing：composition / keyCode / Enter 守卫', () => {
    expect(
      isImeComposing({ key: 'a', nativeEvent: {} }, true),
    ).toBe(true);
    expect(
      isImeComposing({
        key: 'a',
        nativeEvent: { isComposing: true },
      }),
    ).toBe(true);
    expect(
      isImeComposing({ key: 'a', keyCode: 229, nativeEvent: {} }),
    ).toBe(true);

    markImeEnterCommitGuard();
    expect(
      isImeComposing({ key: 'Enter', nativeEvent: {} }),
    ).toBe(true);
    // 仅消费一次
    expect(
      isImeComposing({ key: 'Enter', nativeEvent: {} }),
    ).toBe(false);

    markImeEnterCommitGuard();
    clearImeEnterCommitGuard();
    expect(
      isImeComposing({ key: 'Enter', nativeEvent: {} }),
    ).toBe(false);
  });

  it('scheduleClearInputComposition：rAF 双帧与 cancel；无 rAF 走 setTimeout', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const clear = vi.fn();
    const cancel = scheduleClearInputComposition(clear);
    cancel();
    vi.runAllTimers();
    expect(clear).not.toHaveBeenCalled();

    const clear2 = vi.fn();
    scheduleClearInputComposition(clear2);
    vi.runAllTimers();
    expect(clear2).toHaveBeenCalled();

    vi.stubGlobal('requestAnimationFrame', undefined);
    const clear3 = vi.fn();
    const cancel3 = scheduleClearInputComposition(clear3);
    cancel3();
    vi.runAllTimers();
    expect(clear3).not.toHaveBeenCalled();

    scheduleClearInputComposition(clear3);
    vi.runAllTimers();
    expect(clear3).toHaveBeenCalled();
    vi.clearAllTimers();
  });

  it('commitImeCompositionTextIfMissing：早退与已写入跳过', async () => {
    expect(() =>
      commitImeCompositionTextIfMissing(null, 'x', () => ''),
    ).not.toThrow();

    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'ab' }] }] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };

    commitImeCompositionTextIfMissing(editor, '', () => 'ab');
    commitImeCompositionTextIfMissing(editor, 'x', () => 'abx');
    await Promise.resolve();

    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    };
    commitImeCompositionTextIfMissing(editor, 'x', () => 'ab');
    await Promise.resolve();
  });
});
