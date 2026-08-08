/**
 * withSchemaPlugin deepen：非 schema split 走原 apply。
 */
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { withSchemaPlugin } from '../withSchemaPlugin';

describe('withSchemaPlugin deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('普通 insert_text 透传 apply', () => {
    const base = createEditor();
    base.children = [{ type: 'paragraph', children: [{ text: '' }] }] as any;
    const apply = vi.fn((op: any) => {
      // no-op stub
      void op;
    });
    base.apply = apply;
    const editor = withSchemaPlugin(base);
    editor.apply({
      type: 'insert_text',
      path: [0, 0],
      offset: 0,
      text: 'x',
    } as any);
    expect(apply).toHaveBeenCalled();
  });
});
