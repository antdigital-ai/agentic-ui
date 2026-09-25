/**
 * useHighlight deepen2：无 text 子节点、跨子 null range、空格分隔符、
 * 注释/空变量、比较符与单字符 delimiter。
 */
import { Element } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useHighlight } from '../useHighlight';

vi.mock('../../utils/editorUtils', () => ({
  EditorUtils: {
    isDirtLeaf: vi.fn(() => false),
  },
}));

describe('useHighlight deepen2 residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('jinja：注释块 + 空变量名跳过 + whitespace only inner', () => {
    const decorate = useHighlight(undefined, true);
    const node: Element = {
      type: 'paragraph',
      children: [{ text: '{# comment #} {{   }} {% if x %}{% endif %}' }],
    };
    const ranges = decorate([node, [0]]);
    expect(ranges.some((r: any) => r.jinjaComment)).toBe(true);
    expect(ranges.some((r: any) => r.jinjaDelimiter)).toBe(true);
  });

  it('jinja：单字符比较符与空格推进', () => {
    const decorate = useHighlight(undefined, true);
    const node: Element = {
      type: 'paragraph',
      children: [{ text: '{% if a < b > c = d %}' }],
    };
    const ranges = decorate([node, [0]]);
    expect(ranges.some((r: any) => r.jinjaDelimiter || r.jinjaKeyword)).toBe(
      true,
    );
  });

  it('jinja：跨空子节点时 spanning range 可能为 null 仍不抛', () => {
    const decorate = useHighlight(undefined, true);
    const node: Element = {
      type: 'paragraph',
      children: [
        { text: '' },
        { text: '' },
        { text: '{% if ok %}' },
      ],
    };
    expect(() => decorate([node, [0]])).not.toThrow();
  });

  it('默认 props 空对象创建 range（链接）', () => {
    const decorate = useHighlight(undefined, false);
    const node: Element = {
      type: 'paragraph',
      children: [{ text: 'see http://ex.com end' }],
    };
    const ranges = decorate([node, [0]]);
    expect(ranges.some((r: any) => r.link)).toBe(true);
  });

  it('jinja 变量仅空格：不添加 variableName', () => {
    const decorate = useHighlight(undefined, true);
    const node: Element = {
      type: 'paragraph',
      children: [{ text: '{{  }}' }],
    };
    const ranges = decorate([node, [0]]);
    expect(ranges.every((r: any) => !r.jinjaVariableName)).toBe(true);
  });
});
