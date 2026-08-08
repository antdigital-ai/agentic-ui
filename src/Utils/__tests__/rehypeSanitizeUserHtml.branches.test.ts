/**
 * rehypeSanitizeUserHtml 分支覆盖：直接 hast 树各清理路径。
 */
import { describe, expect, it } from 'vitest';
import { rehypeSanitizeUserHtml } from '../rehypeSanitizeUserHtml';

const sanitize = (tree: any) => {
  rehypeSanitizeUserHtml()(tree);
  return tree;
};

describe('rehypeSanitizeUserHtml branches', () => {
  it('doctype 节点移除', () => {
    const tree = { type: 'root', children: [{ type: 'doctype' }] };
    sanitize(tree);
    expect(tree.children).toHaveLength(0);
  });

  it('strip 元素整棵移除', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'script',
          properties: {},
          children: [{ type: 'text', value: 'alert(1)' }],
        },
      ],
    };
    sanitize(tree);
    expect(tree.children).toHaveLength(0);
  });

  it('非 checkbox input 移除', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'input',
          properties: { type: 'text' },
          children: [],
        },
      ],
    };
    sanitize(tree);
    expect(tree.children).toHaveLength(0);
  });

  it('checkbox input 保留', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'input',
          properties: { type: 'checkbox', disabled: true },
          children: [],
        },
      ],
    };
    sanitize(tree);
    expect(tree.children[0].tagName).toBe('input');
  });

  it('unwrap body 保留子节点', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'body',
          properties: {},
          children: [
            {
              type: 'element',
              tagName: 'p',
              properties: {},
              children: [{ type: 'text', value: 'ok' }],
            },
          ],
        },
      ],
    };
    sanitize(tree);
    expect(tree.children[0].tagName).toBe('p');
  });

  it('unwrap 后无子节点返回 null', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'form',
          properties: {},
          children: [
            {
              type: 'element',
              tagName: 'script',
              properties: {},
              children: [],
            },
          ],
        },
      ],
    };
    sanitize(tree);
    expect(tree.children).toHaveLength(0);
  });

  it('危险 on* 属性删除', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'div',
          properties: { onclick: 'evil()', className: 'x' },
          children: [{ type: 'text', value: 't' }],
        },
      ],
    };
    sanitize(tree);
    expect(tree.children[0].properties.onclick).toBeUndefined();
    expect(tree.children[0].properties.className).toBe('x');
  });

  it('javascript: href 降级为纯文本', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'a',
          properties: { href: 'javascript:alert(1)' },
          children: [{ type: 'text', value: 'x' }],
        },
      ],
    };
    sanitize(tree);
    expect(tree.children[0].type).toBe('text');
  });

  it('危险 img src 降级为纯文本', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'img',
          properties: { src: 'javascript:void(0)' },
          children: [],
        },
      ],
    };
    sanitize(tree);
    expect(tree.children[0].type).toBe('text');
  });

  it('无 properties 时不抛错', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'span',
          children: [{ type: 'text', value: 'x' }],
        },
      ],
    };
    expect(() => sanitize(tree)).not.toThrow();
  });
});
