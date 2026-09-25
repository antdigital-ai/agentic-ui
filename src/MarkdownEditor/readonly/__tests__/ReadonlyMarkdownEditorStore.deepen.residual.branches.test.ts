/**
 * ReadonlyMarkdownEditorStore deepen：构造与只读 API。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReadonlyMarkdownEditorStore } from '../ReadonlyMarkdownEditorStore';

describe('ReadonlyMarkdownEditorStore deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('getMDContent / setMDContent / editor 容器', () => {
    const root = document.createElement('div');
    root.innerHTML = '<p>hello</p>';
    const store = new ReadonlyMarkdownEditorStore({
      getContent: () => 'hello',
      getContainer: () => root,
    });
    expect(store.getMDContent()).toBe('hello');
    expect(store.editor).toBeTruthy();
    store.setMDContent('ignored');
  });
});
