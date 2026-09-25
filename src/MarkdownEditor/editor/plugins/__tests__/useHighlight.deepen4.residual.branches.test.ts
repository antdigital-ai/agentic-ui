/**
 * useHighlight deepen4：默认 props 参数、jinja continue 防御、
 * 空匹配与跨子节点 spanning。
 */
import { Element } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useHighlight } from '../useHighlight';

vi.mock('../../utils/editorUtils', () => ({
  EditorUtils: {
    isDirtLeaf: vi.fn(() => false),
  },
}));

describe('useHighlight deepen4 residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 props 默认参数：decorate 基础文本', () => {
    const decorate = useHighlight(undefined, false);
    const node: Element = {
      type: 'paragraph',
      children: [{ text: 'hello world' }],
    };
    expect(decorate([node, [0]])).toEqual([]);
  });

  it('jinja 注释 + 空变量体 + 空标签体', () => {
    const decorate = useHighlight(undefined, true);
    const node: Element = {
      type: 'paragraph',
      children: [
        {
          text: '{# comment #}{{ }}{% %}',
        },
      ],
    };
    const ranges = decorate([node, [0]]);
    expect(ranges.some((r: any) => r.jinjaComment || r.jinjaDelimiter)).toBe(
      true,
    );
  });

  it('跨多个 text 子节点的 jinja 变量', () => {
    const decorate = useHighlight(undefined, true);
    const node: Element = {
      type: 'paragraph',
      children: [
        { text: '{{ ' },
        { text: 'user' },
        { text: '.name }}' },
      ],
    };
    const ranges = decorate([node, [0]]);
    expect(ranges.length).toBeGreaterThan(0);
  });

  it('enableJinja false：不解析 jinja', () => {
    const decorate = useHighlight(undefined, false);
    const node: Element = {
      type: 'paragraph',
      children: [{ text: '{{ x }} {% if a %}' }],
    };
    const ranges = decorate([node, [0]]);
    expect(ranges.every((r: any) => !r.jinjaKeyword)).toBe(true);
  });
});
