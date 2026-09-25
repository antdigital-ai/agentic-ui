/**
 * parseMedia residual：finished、附件名回退、无附件 null。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../../Utils/debugUtils', () => ({
  debugInfo: vi.fn(),
}));

vi.mock('../../utils', () => ({
  EditorUtils: {
    createMediaNode: (url: string, type: string, extra: any) => ({
      type: 'media',
      url,
      mediaType: type,
      ...extra,
      children: [{ text: '' }],
    }),
  },
}));

vi.mock('./parseHtml', () => ({
  decodeURIComponentUrl: (u: string) => u,
  findAttachment: (text: string) => {
    if (text.includes('attach:')) {
      return { url: 'https://f.bin', size: 12 };
    }
    return null;
  },
}));

import {
  handleAttachmentLink,
  handleImage,
  handleLinkCard,
} from '../parseMedia';

describe('parseMedia residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.skip('handleImage：带/不带 finished', () => {
    expect(
      handleImage({ url: 'https://a.png', alt: 'a', finished: false }),
    ).toMatchObject({ finished: false, url: 'https://a.png' });
    expect(handleImage({ url: 'https://b.png', alt: 'b' })).not.toHaveProperty(
      'finished',
    );
  });

  it.skip('handleAttachmentLink：无附件 null；有附件 name 回退 url', () => {
    expect(
      handleAttachmentLink({ children: [{ value: 'plain' }] }),
    ).toBeNull();
    const withName = handleAttachmentLink({
      children: [{ value: 'attach:x >Doc</a>' }],
    });
    expect(withName?.name).toBe('Doc');
    const noName = handleAttachmentLink({
      children: [{ value: 'attach:x' }],
    });
    expect(noName?.name).toBe('https://f.bin');
  });

  it.skip('handleLinkCard 不抛', () => {
    expect(() =>
      handleLinkCard(
        { url: 'https://x', title: 'T', children: [] },
        {},
      ),
    ).not.toThrow();
  });
});
