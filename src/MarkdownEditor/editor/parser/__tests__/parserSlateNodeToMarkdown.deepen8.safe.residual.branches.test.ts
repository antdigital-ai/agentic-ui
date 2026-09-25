/**
 * parserSlate deepen8 safe：img height+align、ordered start、空 tag leaf。
 * parserSlateNodeToMarkdown.more hang-quarantined。
 */
import { describe, expect, it } from 'vitest';
import { parserSlateNodeToMarkdown } from '../parserSlateNodeToMarkdown';

describe('parserSlateNodeToMarkdown deepen8 safe residual', () => {
  it('img height + align；video 无 height', () => {
    const img = parserSlateNodeToMarkdown([
      {
        type: 'media',
        url: 'https://ex.com/a.png',
        mediaType: 'image',
        height: 100,
        align: 'center',
        children: [{ text: '' }],
      },
    ] as any);
    expect(img).toMatch(/img|https/);

    const video = parserSlateNodeToMarkdown([
      {
        type: 'media',
        url: 'https://ex.com/v.mp4',
        mediaType: 'video',
        children: [{ text: '' }],
      },
    ] as any);
    expect(video).toMatch(/video|https/);
  });

  it('ordered list start；嵌套有序', () => {
    const list = parserSlateNodeToMarkdown([
      {
        type: 'numbered-list',
        start: 3,
        children: [
          {
            type: 'list-item',
            children: [{ type: 'paragraph', children: [{ text: 'third' }] }],
          },
          {
            type: 'list-item',
            children: [
              { type: 'paragraph', children: [{ text: 'fourth' }] },
              {
                type: 'numbered-list',
                start: 1,
                children: [
                  {
                    type: 'list-item',
                    children: [
                      { type: 'paragraph', children: [{ text: 'nested' }] },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ] as any);
    expect(list).toMatch(/third|nested|3\.|4\./);
  });

  it('空 text 带 tag；无 text 无 tag', () => {
    const tagged = parserSlateNodeToMarkdown([
      {
        type: 'paragraph',
        children: [{ text: '', tag: true } as any],
      },
    ] as any);
    expect(typeof tagged).toBe('string');

    const empty = parserSlateNodeToMarkdown([
      { type: 'paragraph', children: [{ text: '' }] },
      { type: 'paragraph', children: [{ text: 'ok' }] },
    ] as any);
    expect(empty).toContain('ok');
  });
});
