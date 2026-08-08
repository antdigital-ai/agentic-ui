/**
 * parserSlateNodeToMarkdown deepen4：containerType、空 text/tag、
 * card 非 auto-rewrap、media height 缺省、嵌套/非嵌套 list。
 * 勿依赖 more.residual（exclusive 可能排除）。
 */
import { describe, expect, it } from 'vitest';
import { parserSlateNodeToMarkdown } from '../parserSlateNodeToMarkdown';

describe('parserSlateNodeToMarkdown deepen4 residual', () => {
  it('chartConfig 数字单键与无 chartType 对象包装', () => {
    const digit = parserSlateNodeToMarkdown([
      {
        type: 'code',
        language: 'chart',
        otherProps: {
          chartConfig: { 0: { chartType: 'line', x: 'a' } },
        },
        children: [{ text: '' }],
      },
    ] as any);
    expect(digit).toContain('line');

    const plain = parserSlateNodeToMarkdown([
      {
        type: 'code',
        language: 'chart',
        otherProps: { chartConfig: { x: 'n', y: 'v' } },
        children: [{ text: '' }],
      },
    ] as any);
    expect(plain).toContain('<!--');
  });

  it('textStyle/composeText 空 text 无 tag 早退；url 空 text', () => {
    const empty = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: '', bold: true }],
      },
    ] as any);
    expect(typeof empty).toBe('string');

    const tagEmpty = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: '', tag: true, placeholder: 'ph' }],
      },
    ] as any);
    expect(tagEmpty).toContain('placeholder');

    const urlEmpty = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: '', url: 'https://ex.com/x' }],
      },
    ] as any);
    expect(typeof urlEmpty).toBe('string');
  });

  it('list-item 内 blockquote 走 handleBlockquote containerType', () => {
    // 根级 blockquote 走主循环旁路；嵌在 list-item 才进 parserNode→handleBlockquote
    const titled = parserSlateNodeToMarkdown([
      {
        type: 'list-item',
        children: [
          {
            type: 'blockquote',
            otherProps: {
              markdownContainerType: 'tip',
              markdownContainerTitle: '  Hello  ',
            },
            children: [
              { type: 'paragraph', children: [{ text: 'inside' }] },
            ],
          },
        ],
      },
    ] as any);
    expect(titled).toContain(':::tip{title="Hello"}');
    expect(titled).toContain('inside');

    const noTitle = parserSlateNodeToMarkdown([
      {
        type: 'list-item',
        children: [
          {
            type: 'blockquote',
            otherProps: {
              markdownContainerType: 'info',
              markdownContainerTitle: '   ',
            },
            children: [
              { type: 'paragraph', children: [{ text: 'body' }] },
            ],
          },
        ],
      },
    ] as any);
    expect(noTitle).toContain(':::info');
    expect(noTitle).not.toContain('title=');

    const emptyChildren = parserSlateNodeToMarkdown([
      {
        type: 'list-item',
        children: [
          {
            type: 'blockquote',
            otherProps: { markdownContainerType: 'note' },
            children: [],
          },
        ],
      },
    ] as any);
    expect(emptyChildren).toContain(':::note');
  });

  it('card 含非 auto-rewrap 内容时保留 data-card', () => {
    const md = parserSlateNodeToMarkdown([
      {
        type: 'card',
        children: [
          { type: 'card-before', children: [{ text: '' }] },
          {
            type: 'paragraph',
            children: [{ text: 'card-para' }],
          },
          { type: 'card-after', children: [{ text: '' }] },
        ],
      },
    ] as any);
    expect(md).toContain('data-card');
    expect(md).toContain('card-para');
  });

  it('media height 存在时空 height fallback；image align', () => {
    const video = parserSlateNodeToMarkdown([
      {
        type: 'media',
        url: 'https://v.example/a.mp4',
        mediaType: 'video',
        height: 0,
        children: [{ text: '' }],
      },
    ] as any);
    expect(video).toContain('<video');

    const imgAlign = parserSlateNodeToMarkdown([
      {
        type: 'media',
        url: 'https://i.example/a.png',
        mediaType: 'image',
        height: 80,
        align: 'center',
        children: [{ text: '' }],
      },
    ] as any);
    expect(imgAlign).toContain('data-align="center"');
  });

  it('根级 list 非嵌套；numbered-list start 缺省', () => {
    const md = parserSlateNodeToMarkdown([
      {
        type: 'list',
        children: [{ type: 'list-item', children: [{ text: 'root-item' }] }],
      },
      {
        type: 'numbered-list',
        children: [
          { type: 'list-item', children: [{ text: 'one' }] },
          { type: 'list-item', children: [{ text: 'two' }] },
        ],
      },
      { type: 'paragraph', children: [{ text: 'after' }] },
    ] as any);
    expect(md).toContain('root-item');
    expect(md).toContain('1.');
    expect(md).toContain('after');
  });

  it('相邻 head 在 root 后追加换行；code 非末尾双换行', () => {
    const md = parserSlateNodeToMarkdown([
      { type: 'head', level: 1, children: [{ text: 'H1' }] },
      { type: 'paragraph', children: [{ text: 'p' }] },
      {
        type: 'code',
        language: 'js',
        children: [{ text: 'console.log(1)' }],
      },
      { type: 'paragraph', children: [{ text: 'tail' }] },
    ] as any);
    expect(md).toContain('H1');
    expect(md).toContain('tail');
  });
});
