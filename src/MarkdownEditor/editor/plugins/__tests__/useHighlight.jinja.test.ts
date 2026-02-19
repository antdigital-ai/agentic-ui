import { Element } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useHighlight } from '../useHighlight';

vi.mock('../../utils/editorUtils', () => ({
  EditorUtils: {
    isDirtLeaf: vi.fn(() => false),
  },
}));

describe('useHighlight - Jinja', () => {
  const mockStore = { highlightCache: new WeakMap() };
  let decorate: ReturnType<ReturnType<typeof useHighlight>>;

  beforeEach(() => {
    vi.clearAllMocks();
    decorate = useHighlight(mockStore as any, true);
  });

  it('returns empty array when jinjaEnabled is false and text contains Jinja', () => {
    const noJinjaDecorate = useHighlight(mockStore as any, false);
    const node: Element = {
      type: 'paragraph',
      children: [{ text: '{{ x }}' }],
    };
    const ranges = noJinjaDecorate([node, [0]]);
    const jinjaRanges = ranges.filter(
      (r: any) =>
        r.jinjaVariable === true ||
        r.jinjaTag === true ||
        r.jinjaComment === true,
    );
    expect(jinjaRanges).toHaveLength(0);
  });

  it('returns ranges with jinjaVariable for {{ }} in paragraph', () => {
    const node: Element = {
      type: 'paragraph',
      children: [{ text: 'hello {{ name }} end' }],
    };
    const ranges = decorate([node, [0]]);
    const variableRanges = ranges.filter((r: any) => r.jinjaVariable === true);
    expect(variableRanges.length).toBeGreaterThanOrEqual(1);
    expect(variableRanges[0].anchor.offset).toBe(6);
    expect(variableRanges[0].focus.offset).toBe(16);
  });

  it('returns ranges with jinjaTag for {% %} in paragraph', () => {
    const node: Element = {
      type: 'paragraph',
      children: [{ text: '{% if x %}yes{% endif %}' }],
    };
    const ranges = decorate([node, [0]]);
    const tagRanges = ranges.filter((r: any) => r.jinjaTag === true);
    expect(tagRanges.length).toBeGreaterThanOrEqual(2);
  });

  it('returns ranges with jinjaComment for {# #} in paragraph', () => {
    const node: Element = {
      type: 'paragraph',
      children: [{ text: 'before {# comment #} after' }],
    };
    const ranges = decorate([node, [0]]);
    const commentRanges = ranges.filter((r: any) => r.jinjaComment === true);
    expect(commentRanges.length).toBeGreaterThanOrEqual(1);
    expect(commentRanges[0].anchor.offset).toBe(7);
    expect(commentRanges[0].focus.offset).toBe(20);
  });

  it('returns empty array for non-paragraph node', () => {
    const node: Element = {
      type: 'code',
      children: [{ text: '{{ x }}' }],
    } as any;
    const ranges = decorate([node, [0]]);
    expect(ranges).toEqual([]);
  });
});
