/**
 * parserSlateNodeToMarkdown deepen6：chartConfig {0:…}、list after code、
 * url+empty text、card children 非数组、img height:0、无 start list。
 */
import { describe, expect, it } from 'vitest';
import { parserSlateNodeToMarkdown } from '../parserSlateNodeToMarkdown';

describe('parserSlateNodeToMarkdown deepen6 residual', () => {
  it('chartConfig：数字键单对象 {0: cfg} 无顶层 chartType', () => {
    const out = parserSlateNodeToMarkdown([
      {
        type: 'code',
        language: 'chart',
        otherProps: {
          chartConfig: { '0': { chartType: 'bar', x: 'a', y: 'b' } },
        },
        children: [{ text: '' }],
      },
    ] as any);
    expect(out).toContain('bar');
  });

  it('code/media 后接 bulleted-list：list 双换行臂', () => {
    const afterCode = parserSlateNodeToMarkdown([
      {
        type: 'code',
        language: 'js',
        children: [{ text: 'x' }],
      },
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'li' }] }],
          },
        ],
      },
    ] as any);
    expect(afterCode).toContain('li');

    const afterMedia = parserSlateNodeToMarkdown([
      {
        type: 'media',
        url: 'https://ex.com/a.png',
        mediaType: 'image',
        children: [{ text: '' }],
      },
      {
        type: 'numbered-list',
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'n1' }] }],
          },
        ],
      },
    ] as any);
    expect(afterMedia).toContain('n1');
  });

  it('composeText：url + 空 text 需 tag 绕过早退；highColor', () => {
    const urlEmpty = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [
          { text: '', tag: true, url: 'https://ex.com/x' } as any,
        ],
      },
    ] as any);
    expect(urlEmpty).toContain('https://ex.com/x');

    const emptyItalic = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: '', italic: true }],
      },
    ] as any);
    expect(typeof emptyItalic).toBe('string');
  });

  it('card：children 非数组 → []；image height:0；list 无 start', () => {
    const cardBad = parserSlateNodeToMarkdown([
      {
        type: 'card',
        children: {} as any,
      },
    ] as any);
    expect(typeof cardBad).toBe('string');

    const imgH0 = parserSlateNodeToMarkdown([
      {
        type: 'media',
        url: 'https://ex.com/z.png',
        mediaType: 'image',
        height: 0,
        children: [{ text: '' }],
      },
    ] as any);
    expect(imgH0).toMatch(/img|!\[|https/);

    const noStart = parserSlateNodeToMarkdown([
      {
        type: 'list',
        order: true,
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'a' }] }],
          },
        ],
      },
    ] as any);
    expect(noStart).toContain('1.');
  });

  it('两段 paragraph：中间 \\n\\n；highColor 无 text', () => {
    const paras = parserSlateNodeToMarkdown([
      { type: 'paragraph', children: [{ text: 'p1' }] },
      { type: 'paragraph', children: [{ text: 'p2' }] },
    ] as any);
    expect(paras).toContain('p1');
    expect(paras).toContain('p2');

    const high = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: undefined as any, highColor: '#f00' }],
      },
    ] as any);
    expect(typeof high).toBe('string');
  });
});
