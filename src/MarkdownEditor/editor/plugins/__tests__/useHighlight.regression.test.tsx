import { act, render } from '@testing-library/react';
import React from 'react';
import { createEditor, Transforms, type NodeEntry, type Range } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import { describe, expect, it } from 'vitest';
import type { EditorStore } from '../../store';
import { useHighlight } from '../useHighlight';

describe('highlight cache regressions', () => {
  it('keeps repeated decoration identical without appending to plugin ranges', () => {
    const node = {
      type: 'paragraph',
      children: [{ text: 'Visit https://example.com today' }],
    };
    const pluginRanges = Object.freeze([
      {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
        bold: true,
      },
    ]);
    const store = {
      highlightCache: new WeakMap([[node, pluginRanges]]),
    } as unknown as EditorStore;
    const decorate = useHighlight(store);
    const first = decorate([node, [0]] as NodeEntry);

    expect(first).toHaveLength(2);
    for (let i = 0; i < 100; i++) {
      expect(decorate([node, [0]] as NodeEntry)).toEqual(first);
    }
    expect(store.highlightCache.get(node)).toBe(pluginRanges);
    expect(pluginRanges).toHaveLength(1);
  });

  it('retains both inline and special paragraph decorations on warm cache hits', () => {
    for (const text of ['```https://example.com', '| https://example.com |']) {
      const node = { type: 'paragraph', children: [{ text }] };
      const decorate = useHighlight();
      const first = decorate([node, [0]] as NodeEntry);
      expect(first).toHaveLength(2);
      expect(first.some((range) => 'link' in range)).toBe(true);
      expect(first.some((range) => 'color' in range)).toBe(true);
      expect(decorate([node, [0]] as NodeEntry)).toEqual(first);
    }
  });

  it('isolates Jinja configuration and recomputes moved-node paths', () => {
    const node = { type: 'paragraph', children: [{ text: '{{ name }}' }] };
    const enabled = useHighlight(undefined, true);
    const disabled = useHighlight(undefined, false);
    expect(disabled([node, [0]] as NodeEntry)).toHaveLength(0);
    const first = enabled([node, [0]] as NodeEntry);
    expect(first).toHaveLength(3);
    expect(disabled([node, [0]] as NodeEntry)).toHaveLength(0);
    expect(enabled([node, [0]] as NodeEntry)).toEqual(first);
    expect(
      enabled([node, [2]] as NodeEntry).every(
        (range) => range.anchor.path[0] === 2,
      ),
    ).toBe(true);
  });

  it('keeps real Slate leaf DOM and plugin ranges stable while moving selection', async () => {
    const editor = withReact(createEditor());
    const node = {
      type: 'paragraph',
      children: [{ text: 'Visit https://example.com today' }],
    };
    const pluginRanges: Range[] = [
      {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      },
    ];
    const store = {
      highlightCache: new WeakMap([[node, pluginRanges]]),
    } as unknown as EditorStore;
    const { container } = render(
      <Slate editor={editor} initialValue={[node]}>
        <Editable decorate={useHighlight(store)} />
      </Slate>,
    );
    const leafCount = container.querySelectorAll('[data-slate-leaf]').length;
    for (let i = 0; i < 20; i++) {
      await act(async () => {
        Transforms.select(editor, { path: [0, 0], offset: i % 5 });
        await Promise.resolve();
      });
      expect(container.querySelectorAll('[data-slate-leaf]')).toHaveLength(
        leafCount,
      );
    }
    expect(pluginRanges).toHaveLength(1);
  });
});
