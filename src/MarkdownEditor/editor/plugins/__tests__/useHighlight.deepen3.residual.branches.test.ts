/**
 * useHighlight deepen3：无 text 子节点、spanning null、
 * 纯数字变量名回退、footnote/html/link。
 */
import { Element } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useHighlight } from '../useHighlight';

vi.mock('../../utils/editorUtils', () => ({
  EditorUtils: {
    isDirtLeaf: vi.fn(() => false),
  },
}));

describe('useHighlight deepen3 residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('元素子节点无 text：spanning ?? 空串不抛', () => {
    const decorate = useHighlight(undefined, true);
    const node: Element = {
      type: 'paragraph',
      children: [
        { type: 'inline-code', children: [{ text: 'x' }] } as any,
        { text: '{% if ok %}' },
      ],
    };
    expect(() => decorate([node, [0]])).not.toThrow();
  });

  it('jinja 变量纯数字：varTokens 空仍加 variableName', () => {
    const decorate = useHighlight(undefined, true);
    const node: Element = {
      type: 'paragraph',
      children: [{ text: '{{ 12345 }}' }],
    };
    const ranges = decorate([node, [0]]);
    expect(ranges.some((r: any) => r.jinjaVariableName)).toBe(true);
  });

  it('footnote + html + link 同时匹配', () => {
    const decorate = useHighlight(undefined, false);
    const node: Element = {
      type: 'paragraph',
      children: [
        {
          text: 'see [^note] and <span>x</span> http://ex.test/n',
        },
      ],
    };
    const ranges = decorate([node, [0]]);
    expect(ranges.some((r: any) => r.fnc)).toBe(true);
    expect(ranges.some((r: any) => r.html)).toBe(true);
    expect(ranges.some((r: any) => r.link)).toBe(true);
  });

  it('jinja 标签占位符与空字符串 token', () => {
    const decorate = useHighlight(undefined, true);
    const node: Element = {
      type: 'paragraph',
      children: [{ text: '{% if $(ph:x) and "" %}' }],
    };
    const ranges = decorate([node, [0]]);
    expect(
      ranges.some(
        (r: any) => r.jinjaPlaceholder || r.jinjaString || r.jinjaKeyword,
      ),
    ).toBe(true);
  });

  it('``` 特殊段落与表格行高亮', () => {
    const decorate = useHighlight(undefined, false);
    const codeFence: Element = {
      type: 'paragraph',
      children: [{ text: '```js' }],
    };
    expect(decorate([codeFence, [0]]).some((r: any) => r.color)).toBe(true);

    const tableRow: Element = {
      type: 'paragraph',
      children: [{ text: '| a | b |' }],
    };
    expect(decorate([tableRow, [0]]).some((r: any) => r.color)).toBe(true);
  });
});
