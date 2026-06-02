/**
 * plugins/utils isCardEmpty 测试
 */
import { isCardEmpty } from '@ant-design/agentic-ui/MarkdownEditor/editor/plugins/utils';
import { describe, expect, it } from 'vitest';

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
      children: [{ type: 'block', children: [] }, { type: 'block' }],
    };
    expect(isCardEmpty(cardNode)).toBe(true);
  });

  it.each([
    'image',
    'media',
    'attach',
    'link-card',
    'code',
    'mermaid',
    'katex',
    'inline-katex',
    'hr',
    'break',
    'table',
    'schema',
    'apaasify',
    'agentic-ui-task',
    'agentic-ui-toolusebar',
    'agentic-ui-usertoolbar',
    'agentic-ui-filemap',
  ])('atomic 内容节点 %s 即便 children 是 [{ text: "" }] 也不算空', (type) => {
    const cardNode = {
      type: 'card',
      children: [
        { type: 'card-before', children: [{ text: '' }] },
        { type, children: [{ text: '' }] },
        { type: 'card-after', children: [{ text: '' }] },
      ],
    };
    expect(isCardEmpty(cardNode)).toBe(false);
  });

  it('atomic 节点 + 空 paragraph 兄弟时仍然视为非空（至少一个内容有意义）', () => {
    const cardNode = {
      type: 'card',
      children: [
        { type: 'card-before', children: [{ text: '' }] },
        { type: 'image', url: 'x.png', children: [{ text: '' }] },
        { type: 'paragraph', children: [{ text: '' }] },
        { type: 'card-after', children: [{ text: '' }] },
      ],
    };
    // contentNodes 全部 every 为 false（image 触发 atomic 分支 → false）
    expect(isCardEmpty(cardNode)).toBe(false);
  });

  it('普通段落内容为空时仍判定为空（保持旧行为）', () => {
    const cardNode = {
      type: 'card',
      children: [
        { type: 'card-before', children: [{ text: '' }] },
        { type: 'paragraph', children: [{ text: '' }] },
        { type: 'card-after', children: [{ text: '' }] },
      ],
    };
    expect(isCardEmpty(cardNode)).toBe(true);
  });
});
