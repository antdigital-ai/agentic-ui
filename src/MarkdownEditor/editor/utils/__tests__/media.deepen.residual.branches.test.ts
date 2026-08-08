/**
 * media deepen：非 http/data URL 的 media 节点跳过转换。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { convertRemoteImages } from '../media';

describe('media deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('相对路径 media 不触发 setNodes', async () => {
    const store = {
      editor: {
        children: [
          { type: 'media', url: '/local.png', children: [{ text: '' }] },
          { type: 'paragraph', children: [{ text: 'x' }] },
        ],
      },
    } as any;
    await convertRemoteImages({} as any, store);
    expect(store.editor.children[0].url).toBe('/local.png');
  });
});
