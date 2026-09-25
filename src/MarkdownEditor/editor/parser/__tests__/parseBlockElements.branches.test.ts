import { describe, expect, it, vi } from 'vitest';
import {
  applyInlineFormatting,
  handleBlockquote,
  handleContainerDirective,
  handleFootnoteDefinition,
  handleHeading,
  handleList,
  handleListItem,
  handleParagraph,
  processParagraphChildren,
} from '../parse/parseBlockElements';

const parseNodes = vi.fn((nodes: any[]) =>
  nodes.map((n) =>
    n.type === 'text'
      ? { text: n.value ?? '' }
      : { type: n.type, children: [{ text: n.value ?? '' }] },
  ),
);

describe('parseBlockElements 分支覆盖', () => {
  it('handleHeading 无 children 时插入空文本', () => {
    const result = handleHeading({ depth: 2 }, parseNodes);
    expect(result).toMatchObject({ type: 'head', level: 2 });
    expect(result.children).toEqual([{ text: '' }]);
  });

  it('handleHeading 有 children 时 parseNodes', () => {
    const result = handleHeading(
      { depth: 1, children: [{ type: 'text', value: 'T' }] },
      parseNodes,
    );
    expect(result.children).toHaveLength(1);
  });

  it('handleList 有序列表带 start 与 finished', () => {
    const result = handleList(
      {
        ordered: true,
        start: 3,
        finished: false,
        children: [{ type: 'listItem', children: [] }],
      },
      parseNodes,
    );
    expect(result).toMatchObject({
      type: 'numbered-list',
      start: 3,
      finished: false,
    });
  });

  it('handleList 任务列表设置 task', () => {
    parseNodes.mockReturnValueOnce([{ checked: true, type: 'list-item' }]);
    const result = handleList(
      { ordered: false, children: [{ type: 'listItem' }] },
      parseNodes,
    );
    expect(result.task).toBe(true);
  });

  it('handleList 无序列表', () => {
    parseNodes.mockReturnValueOnce([{ type: 'list-item' }]);
    const result = handleList(
      { ordered: false, children: [{ type: 'listItem' }] },
      parseNodes,
    );
    expect(result.type).toBe('bulleted-list');
    expect(result.start).toBeUndefined();
  });

  it('handleFootnoteDefinition 解析链接子节点', () => {
    parseNodes.mockReturnValueOnce([
      { children: [{ text: 'ref', url: 'https://x.com' }] },
    ]);
    const result = handleFootnoteDefinition(
      { identifier: 'fn1', children: [{ type: 'paragraph' }] },
      parseNodes,
    );
    expect(result).toMatchObject({
      type: 'footnoteDefinition',
      identifier: 'fn1',
      url: 'https://x.com',
    });
  });

  it('handleListItem 无 children 时默认空段落', () => {
    const result = handleListItem({}, parseNodes);
    expect(result.type).toBe('list-item');
    expect(result.children).toHaveLength(1);
  });

  it('handleListItem checked 属性保留', () => {
    parseNodes.mockReturnValueOnce([{ type: 'paragraph', children: [] }]);
    const result = handleListItem({ checked: true }, parseNodes);
    expect(result.checked).toBe(true);
  });

  it('processParagraphChildren 图片分段', () => {
    const result = processParagraphChildren(
      {
        children: [
          { type: 'text', value: 'before' },
          { type: 'image', url: 'https://img.png', alt: 'a' },
        ],
      },
      parseNodes,
    );
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result[1].type).toBeTruthy();
  });

  it('processParagraphChildren 跳过媒体结束标签', () => {
    const result = processParagraphChildren(
      {
        children: [{ type: 'html', value: '</img>' }],
      },
      parseNodes,
    );
    expect(result).toHaveLength(0);
  });

  it('handleParagraph 混合内容走 processParagraphChildren', () => {
    const result = handleParagraph(
      { children: [{ type: 'text', value: 'p' }] },
      {},
      parseNodes,
    );
    expect(Array.isArray(result)).toBe(true);
  });

  it('handleListItem 提取 mentions（含 id 查询参数）', () => {
    parseNodes.mockReturnValueOnce([
      {
        type: 'paragraph',
        children: [
          { text: 'Alice', url: 'https://u.test/a?id=42' },
          { text: ' rest' },
        ],
      },
    ]);
    const result = handleListItem(
      {
        children: [
          {
            type: 'paragraph',
            children: [
              { type: 'link', url: 'https://u.test/a?id=42' },
              { type: 'text', value: ' rest' },
            ],
          },
        ],
      },
      parseNodes,
    );
    expect(result.mentions?.[0]).toMatchObject({
      name: 'Alice',
      id: '42',
    });
  });

  it('handleListItem mentions 无 id 时为 undefined', () => {
    parseNodes.mockReturnValueOnce([
      {
        type: 'paragraph',
        children: [
          { text: 'Bob', url: 'https://u.test/b' },
          { text: ' x' },
        ],
      },
    ]);
    const result = handleListItem(
      {
        children: [
          {
            type: 'paragraph',
            children: [
              { type: 'link', url: 'https://u.test/b' },
              { type: 'text', value: ' x' },
            ],
          },
        ],
      },
      parseNodes,
    );
    expect(result.mentions?.[0]?.id).toBeUndefined();
  });

  it('handleParagraph 附件链接失败回退混合内容', () => {
    const result = handleParagraph(
      {
        children: [
          { type: 'html', value: '<a href="x">file</a>' },
          { type: 'text', value: 'after' },
        ],
      },
      {},
      parseNodes,
    );
    expect(Array.isArray(result)).toBe(true);
  });

  it('handleParagraph config.type card 走链接卡片', () => {
    const result = handleParagraph(
      {
        children: [
          {
            type: 'link',
            url: 'https://card.test',
            children: [{ type: 'text', value: 'Card' }],
          },
        ],
      },
      { type: 'card' },
      parseNodes,
    );
    expect(result).toBeTruthy();
  });

  it('processParagraphChildren html 非媒体写入 textNodes', () => {
    const result = processParagraphChildren(
      {
        children: [
          { type: 'html', value: '<span>x</span>' },
          { type: 'text', value: 't' },
        ],
      },
      parseNodes,
    );
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0].type).toBe('paragraph');
  });

  it('processParagraphChildren 图片 finished 透传', () => {
    const result = processParagraphChildren(
      {
        children: [
          { type: 'image', url: 'https://i.png', alt: 'a', finished: false },
        ],
      },
      parseNodes,
    );
    // createMediaNode 返回 card，finished 在内部 image 子节点上
    const imageNode = result[0]?.children?.find(
      (child: { type?: string }) => child.type === 'image',
    );
    expect(imageNode?.finished).toBe(false);
  });

  it('handleBlockquote 无 children 插入空段落', () => {
    const result = handleBlockquote({}, parseNodes);
    expect(result).toMatchObject({
      type: 'blockquote',
      children: [{ type: 'paragraph', children: [{ text: '' }] }],
    });
  });

  it('handleBlockquote 有 children 时 parseNodes', () => {
    parseNodes.mockReturnValueOnce([
      { type: 'paragraph', children: [{ text: 'q' }] },
    ]);
    const result = handleBlockquote(
      { children: [{ type: 'paragraph' }] },
      parseNodes,
    );
    expect(result.children).toHaveLength(1);
  });

  it('handleContainerDirective 默认 name note 并过滤 ::: 段落', () => {
    parseNodes.mockReturnValueOnce([
      { type: 'paragraph', children: [{ text: 'body' }] },
    ]);
    const result = handleContainerDirective(
      {
        children: [
          { type: 'paragraph', children: [{ type: 'text', value: ':::' }] },
          {
            type: 'paragraph',
            children: [{ type: 'text', value: 'body' }],
          },
        ],
      },
      parseNodes,
    );
    expect(result.otherProps).toMatchObject({
      markdownContainerType: 'note',
    });
    expect(result.children).toHaveLength(1);
  });

  it('handleContainerDirective title 字符串与非字符串 coerce', () => {
    const withStr = handleContainerDirective(
      {
        name: 'TIP',
        attributes: { title: ' 提示 ' },
        children: [],
      },
      parseNodes,
    );
    expect(withStr.otherProps).toMatchObject({
      markdownContainerType: 'tip',
      markdownContainerTitle: '提示',
    });

    const withNum = handleContainerDirective(
      {
        name: 'info',
        attributes: { title: 123 },
        children: [],
      },
      parseNodes,
    );
    expect(withNum.otherProps?.markdownContainerTitle).toBe('123');
  });

  it('handleContainerDirective 空 title 不写入', () => {
    const result = handleContainerDirective(
      {
        name: 'warning',
        attributes: { title: '   ' },
        children: [],
      },
      parseNodes,
    );
    expect(result.otherProps?.markdownContainerTitle).toBeUndefined();
  });

  it('applyInlineFormatting strong/emphasis/delete/link', () => {
    expect(
      applyInlineFormatting({ text: 'a' }, { type: 'strong' }),
    ).toMatchObject({ bold: true });
    expect(
      applyInlineFormatting({ text: 'a' }, { type: 'emphasis' }),
    ).toMatchObject({ italic: true });
    expect(
      applyInlineFormatting({ text: 'a' }, { type: 'delete' }),
    ).toMatchObject({ strikethrough: true });
    expect(
      applyInlineFormatting(
        { text: 'a' },
        { type: 'link', url: 'https://x.com', finished: false },
      ),
    ).toMatchObject({
      url: 'https://x.com',
      otherProps: expect.objectContaining({ target: '_blank', finished: false }),
    });
    expect(
      applyInlineFormatting(
        { text: 'a' },
        { type: 'link', url: 'https://y.com' },
        { openLinksInNewTab: true },
      ),
    ).toMatchObject({
      otherProps: expect.objectContaining({ target: '_blank' }),
    });
    expect(
      applyInlineFormatting({ text: 'a' }, { type: 'unknown' }),
    ).toEqual({ text: 'a' });
  });
});
