import { describe, expect, it } from 'vitest';
import remarkDirectiveContainer from '../remarkDirectiveContainer';

function runPlugin(tree: any, options?: Parameters<typeof remarkDirectiveContainer>[0]) {
  const plugin = remarkDirectiveContainer(options);
  plugin(tree);
  return tree;
}

describe('remarkDirectiveContainer 分支覆盖', () => {
  it('istanbul one-miss: 不传 options 时使用默认空对象', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'containerDirective',
          name: 'info',
          children: [{ type: 'paragraph', children: [{ type: 'text', value: 'b' }] }],
        },
      ],
    };
    const plugin = remarkDirectiveContainer();
    plugin(tree);
    expect(tree.children[0].data.hName).toBe('div');
    expect(tree.children[0].data.hProperties.className).toEqual([
      'markdown-container',
      'info',
    ]);
  });

  it('containerDirective 默认 note 类名', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'containerDirective',
          name: 'info',
          children: [{ type: 'paragraph', children: [{ type: 'text', value: 'body' }] }],
        },
      ],
    };
    runPlugin(tree);
    const node = tree.children[0];
    expect(node.data.hName).toBe('div');
    expect(node.data.hProperties.className).toEqual(['markdown-container', 'info']);
  });

  it('带 title 属性时在 children 前插入标题段落', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'containerDirective',
          name: 'warning',
          attributes: { title: '  Warn  ' },
          children: [{ type: 'paragraph' }],
        },
      ],
    };
    runPlugin(tree);
    expect(tree.children[0].children[0].data.hName).toBe('div');
    expect(tree.children[0].children[0].children[0].value).toBe('Warn');
  });

  it('title 非字符串时 String 转换', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'containerDirective',
          name: 'tip',
          attributes: { title: 42 },
          children: [],
        },
      ],
    };
    runPlugin(tree);
    expect(tree.children[0].children[0].children[0].value).toBe('42');
  });

  it('无 children 数组时创建仅含标题', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'containerDirective',
          name: 'note',
          attributes: { title: 'T' },
        },
      ],
    };
    runPlugin(tree);
    expect(tree.children[0].children).toHaveLength(1);
  });

  it('空 title 不插入标题节点', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'containerDirective',
          name: 'note',
          attributes: { title: '   ' },
          children: [{ type: 'paragraph' }],
        },
      ],
    };
    runPlugin(tree);
    expect(tree.children[0].children).toHaveLength(1);
  });

  it('自定义 className 与 containerTag', () => {
    const tree = {
      type: 'root',
      children: [{ type: 'containerDirective', name: 'x', children: [] }],
    };
    runPlugin(tree, { className: 'custom', containerTag: 'section' });
    expect(tree.children[0].data).toMatchObject({
      hName: 'section',
      hProperties: { className: ['custom', 'x'] },
    });
  });

  it('无 name 时回退 note', () => {
    const tree = {
      type: 'root',
      children: [{ type: 'containerDirective', children: [] }],
    };
    runPlugin(tree);
    expect(tree.children[0].data.hProperties.className[1]).toBe('note');
  });

  it('titleElement null 时使用默认 titleProps', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'containerDirective',
          name: 'a',
          attributes: { title: 'Hi' },
          children: [],
        },
      ],
    };
    runPlugin(tree, { titleElement: null });
    expect(tree.children[0].children[0].data.hProperties.className).toContain(
      'markdown-container__title',
    );
  });
});
