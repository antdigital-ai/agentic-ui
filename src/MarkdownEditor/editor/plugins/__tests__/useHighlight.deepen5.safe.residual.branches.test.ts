/**
 * useHighlight deepen5 safe：default props 臂、footnote/html/link index、
 * jinja comment/variable continue、len>0 addToken。
 */
import { Element } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useHighlight } from '../useHighlight';

vi.mock('../../utils/editorUtils', () => ({
  EditorUtils: {
    isDirtLeaf: vi.fn(() => false),
  },
}));

describe('useHighlight deepen5 safe residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('footnote + html + link：typeof index number 臂', () => {
    const decorate = useHighlight(undefined, false);
    const node: Element = {
      type: 'paragraph',
      children: [
        {
          text: '[^1] <b>x</b> [label](https://ex.test)',
        },
      ],
    };
    const ranges = decorate([node, [0]]);
    expect(ranges.some((r: any) => r.fnc)).toBe(true);
    expect(ranges.some((r: any) => r.html)).toBe(true);
    expect(ranges.some((r: any) => r.link)).toBe(true);
  });

  it('jinja 注释 + 空变量体 fallback variableName', () => {
    const decorate = useHighlight(undefined, true);
    const comment: Element = {
      type: 'paragraph',
      children: [{ text: '{# note #}{{   }}' }],
    };
    const ranges = decorate([comment, [0]]);
    expect(ranges.some((r: any) => r.jinjaComment || r.jinjaVariableName)).toBe(
      true,
    );
  });

  it('jinja 标签：filter/number/placeholder token len>0', () => {
    const decorate = useHighlight(undefined, true);
    const tag: Element = {
      type: 'paragraph',
      children: [{ text: '{% if $(ph:a) | upper and 42 == 1 %}' }],
    };
    const ranges = decorate([tag, [0]]);
    expect(
      ranges.some(
        (r: any) =>
          r.jinjaKeyword ||
          r.jinjaFilter ||
          r.jinjaNumber ||
          r.jinjaPlaceholder,
      ),
    ).toBe(true);
  });

  it('跨子节点 spanning：default props 默认 {}', () => {
    const decorate = useHighlight(undefined, true);
    const node: Element = {
      type: 'paragraph',
      children: [{ text: '{{ ' }, { text: 'user.name' }, { text: ' }}' }],
    };
    const ranges = decorate([node, [0]]);
    expect(ranges.length).toBeGreaterThan(0);
  });

  it('无 store 默认参数 decorate', () => {
    const decorate = useHighlight();
    const node: Element = {
      type: 'paragraph',
      children: [{ text: 'plain' }],
    };
    expect(decorate([node, [0]])).toEqual([]);
  });
});
