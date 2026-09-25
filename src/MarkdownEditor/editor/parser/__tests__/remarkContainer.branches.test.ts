import { describe, expect, it } from 'vitest';
import { remarkContainer } from '../remarkContainer';

function mkParagraph(firstChild: unknown) {
  return {
    type: 'paragraph',
    children: firstChild === null || firstChild === undefined ? [] : [firstChild],
  };
}

describe('remarkContainer 分支覆盖', () => {
  it('istanbul one-miss: isLiteralNode 对 falsy firstChild 返回 false', () => {
    const tree = {
      type: 'root',
      children: [mkParagraph(null)],
    };
    remarkContainer()(tree);
    expect(tree.children).toHaveLength(1);
    expect(tree.children[0].type).toBe('paragraph');
  });

  it('istanbul one-miss: isLiteralNode 对非 string value 返回 false', () => {
    const tree = {
      type: 'root',
      children: [mkParagraph({ type: 'text', value: 42 })],
    };
    remarkContainer()(tree);
    expect(tree.children[0].type).toBe('paragraph');
  });

  it('istanbul one-miss: 无 options 时使用默认配置', () => {
    const tree = {
      type: 'root',
      children: [
        mkParagraph({ type: 'text', value: ':::info' }),
        mkParagraph({ type: 'text', value: 'body' }),
        mkParagraph({ type: 'text', value: ':::' }),
      ],
    };
    const transform = remarkContainer();
    transform(tree);
    expect(tree.children[0].data.hProperties.className).toContain(
      'markdown-container',
    );
  });
});
