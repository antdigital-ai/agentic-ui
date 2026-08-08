/**
 * createMarkdownSlateEditor deepen：默认 plugins 参数臂。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMarkdownSlateEditor,
  getPluginsEditorCompositionKey,
} from '../createMarkdownSlateEditor';

describe('createMarkdownSlateEditor deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无参创建编辑器与空 composition key', () => {
    const editor = createMarkdownSlateEditor();
    expect(editor).toBeTruthy();
    expect(Array.isArray(editor.children)).toBe(true);
    expect(getPluginsEditorCompositionKey()).toBe('');
  });
});
