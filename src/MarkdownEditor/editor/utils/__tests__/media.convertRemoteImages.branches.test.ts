/**
 * media.convertRemoteImages 分支。
 */
import { createEditor } from 'slate';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { convertRemoteImages } from '../media';

vi.mock('slate-react', () => ({
  ReactEditor: {
    findPath: (_editor: any, item: any) => {
      if (item?.__bad) throw new Error('path');
      return [0];
    },
  },
}));

describe('convertRemoteImages branches', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('空 store / 无 media 早退', async () => {
    await convertRemoteImages({} as any, {} as any);
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }] as any;
    await convertRemoteImages({} as any, { editor } as any);
  });

  it('http 图片扩展名 setNodes；无扩展名跳过；findPath 失败吞错', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const editor = createEditor();
    editor.children = [
      {
        type: 'media',
        url: 'https://cdn.example/a.png',
        children: [{ text: '' }],
      },
      {
        type: 'media',
        url: 'https://cdn.example/noext',
        children: [{ text: '' }],
      },
      {
        type: 'media',
        url: 'https://cdn.example/b.jpg',
        __bad: true,
        children: [{ text: '' }],
      },
      {
        type: 'blockquote',
        children: [
          {
            type: 'media',
            url: 'data:image/png;base64,xx',
            children: [{ text: '' }],
          },
        ],
      },
    ] as any;

    await convertRemoteImages({} as any, { editor } as any);
    expect(err).toHaveBeenCalled();
  });

  it('data url 非 image/video/audio 跳过', async () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'media',
        url: 'data:application/pdf;base64,xx',
        children: [{ text: '' }],
      },
    ] as any;
    await convertRemoteImages({} as any, { editor } as any);
  });
});
