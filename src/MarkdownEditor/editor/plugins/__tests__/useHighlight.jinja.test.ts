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
        r.jinjaComment === true ||
        r.jinjaDelimiter === true ||
        r.jinjaVariableName === true ||
        r.jinjaKeyword === true,
    );
    expect(jinjaRanges).toHaveLength(0);
  });

  it('returns ranges with jinjaVariableName/jinjaDelimiter for {{ }} in paragraph', () => {
    const node: Element = {
      type: 'paragraph',
      children: [{ text: 'hello {{ name }} end' }],
    };
    const ranges = decorate([node, [0]]);
    const variableRanges = ranges.filter(
      (r: any) => r.jinjaVariableName === true || r.jinjaVariable === true,
    );
    const delimiterRanges = ranges.filter((r: any) => r.jinjaDelimiter === true);
    expect(variableRanges.length).toBeGreaterThanOrEqual(1);
    expect(delimiterRanges.length).toBeGreaterThanOrEqual(2);
    const nameRange = variableRanges.find((r: any) => r.jinjaVariableName);
    expect(nameRange).toBeDefined();
    expect(nameRange!.anchor.offset).toBe(9);
    expect(nameRange!.focus.offset).toBe(13);
  });

  it('returns ranges with jinjaKeyword/jinjaDelimiter for {% %} in paragraph', () => {
    const node: Element = {
      type: 'paragraph',
      children: [{ text: '{% if x %}yes{% endif %}' }],
    };
    const ranges = decorate([node, [0]]);
    const keywordRanges = ranges.filter((r: any) => r.jinjaKeyword === true);
    const delimiterRanges = ranges.filter((r: any) => r.jinjaDelimiter === true);
    expect(keywordRanges.length).toBeGreaterThanOrEqual(2);
    expect(delimiterRanges.length).toBeGreaterThanOrEqual(4);
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

  it('returns ranges with jinjaVariableName for {{ $var }} (system variable)', () => {
    const node: Element = {
      type: 'paragraph',
      children: [{ text: 'hello {{ $name }} end' }],
    };
    const ranges = decorate([node, [0]]);
    const variableRanges = ranges.filter((r: any) => r.jinjaVariableName === true);
    expect(variableRanges.length).toBeGreaterThanOrEqual(1);
    expect(variableRanges[0].anchor.offset).toBe(9);
    expect(variableRanges[0].focus.offset).toBe(14);
  });

  it('returns empty array for non-paragraph node', () => {
    const node: Element = {
      type: 'code',
      children: [{ text: '{{ x }}' }],
    } as any;
    const ranges = decorate([node, [0]]);
    expect(ranges).toEqual([]);
  });

  it('returns jinjaKeyword/jinjaDelimiter ranges when paragraph contains inline code (e.g. {% if `x` %})', () => {
    const node: Element = {
      type: 'paragraph',
      children: [
        { text: '{% if ' },
        { text: 'x', code: true },
        { text: ' %}' },
      ],
    } as any;
    const ranges = decorate([node, [0]]);
    const keywordRanges = ranges.filter((r: any) => r.jinjaKeyword === true);
    const delimiterRanges = ranges.filter((r: any) => r.jinjaDelimiter === true);
    expect(keywordRanges.length).toBeGreaterThanOrEqual(1);
    expect(delimiterRanges.length).toBeGreaterThanOrEqual(2);
    expect(keywordRanges.some((r: any) => r.jinjaKeyword === true)).toBe(true);
  });
});
