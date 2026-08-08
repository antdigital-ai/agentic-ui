/**
 * isImeComposing deepen：microtask 内 selection 丢失 / 长度已变不插入。
 */
import { createEditor, Transforms } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  commitImeCompositionTextIfMissing,
  resetImeEnterCommitGuardForTests,
} from '../isImeComposing';

describe('isImeComposing deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    resetImeEnterCommitGuardForTests();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    resetImeEnterCommitGuardForTests();
  });

  it('microtask 时 selection 已清空则跳过', async () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'ab' }] } as any];
    Transforms.select(editor, { path: [0, 0], offset: 2 });
    const insertSpy = vi.spyOn(Transforms, 'insertText');
    commitImeCompositionTextIfMissing(editor, '中', () => 'ab');
    editor.selection = null;
    await Promise.resolve();
    expect(insertSpy).not.toHaveBeenCalled();
    insertSpy.mockRestore();
  });

  it('microtask 时文本已变长但不含 composed 则不插入', async () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'ab' }] } as any];
    Transforms.select(editor, { path: [0, 0], offset: 2 });
    let snap = 'ab';
    commitImeCompositionTextIfMissing(editor, '中', () => snap);
    snap = 'abx';
    await Promise.resolve();
    expect(editor.children[0].children[0].text).toBe('ab');
  });
});
