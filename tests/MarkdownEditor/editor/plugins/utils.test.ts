/**
 * plugins/utils isCardEmpty 测试
 */
import { describe, expect, it } from 'vitest';
import { isCardEmpty } from '@ant-design/agentic-ui/MarkdownEditor/editor/plugins/utils';

describe('isCardEmpty', () => {
  it('应在无节点或非 card 类型时返回 false', () => {
    expect(isCardEmpty(null)).toBe(false);
    expect(isCardEmpty(undefined)).toBe(false);
    expect(isCardEmpty({ type: 'paragraph', children: [] })).toBe(false);
    expect(isCardEmpty({ type: 'card' })).toBe(false);
    expect(isCardEmpty({ type: 'card', children: null })).toBe(false);
  });

  it('应在仅有 card-before/card-after 时返回 true', () => {
    const cardNode = {
      type: 'card',
      children: [
        { type: 'card-before', children: [] },
        { type: 'card-after', children: [] },
      ],
    };
    expect(isCardEmpty(cardNode)).toBe(true);
  });

  it('应在内容节点无 children 时视为空', () => {
    const cardNode = {
      type: 'card',
      children: [
        { type: 'block', children: [] },
        { type: 'block' },
      ],
    };
    expect(isCardEmpty(cardNode)).toBe(true);
  });
});
