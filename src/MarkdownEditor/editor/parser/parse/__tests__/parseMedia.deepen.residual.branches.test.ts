/**
 * parseMedia deepen：附件无 `>name</a>` 时 name 回退 attach.url。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

vi.mock('../parseHtml', () => ({
  decodeURIComponentUrl: (u: string) => u,
  findAttachment: (text: string) => {
    if (text.includes('download')) {
      return { url: 'https://fallback.bin', size: 1 };
    }
    return null;
  },
}));

import { handleAttachmentLink } from '../parseMedia';

describe('parseMedia deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 name 匹配时 name 回退为 attach.url', () => {
    const node = handleAttachmentLink({
      children: [{ value: 'download only' }],
    });
    expect(node?.name).toBe('https://fallback.bin');
  });
});
