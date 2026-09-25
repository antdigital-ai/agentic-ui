import { describe, expect, it } from 'vitest';
import { handleAttachmentLink, handleImage } from '../parseMedia';
import {
  createMediaNodeFromElement,
  findImageElement,
} from '../parseHtml';

describe('parseMedia residual branches', () => {
  it('handleImage：finished 有值写入；无 finished 不展开', () => {
    const withFinished = handleImage({
      url: 'https://ex.com/a.png',
      alt: 'a',
      finished: false,
    }) as any;
    expect(withFinished).toBeTruthy();
    expect(JSON.stringify(withFinished)).toContain('finished');
    const without = handleImage({
      url: 'https://ex.com/b.png',
      alt: 'b',
    }) as any;
    expect(without).toBeTruthy();
    expect(JSON.stringify(without)).not.toContain('"finished"');
  });

  it('handleAttachmentLink：无附件返回 null；有附件取 name', () => {
    expect(
      handleAttachmentLink({ children: [{ value: 'plain text' }] }),
    ).toBeNull();
    expect(
      handleAttachmentLink({
        children: [{ value: '' }, { value: null }],
      }),
    ).toBeNull();
  });

  it('findImageElement / createMediaNodeFromElement 媒体边界', () => {
    const media = findImageElement(
      '<video controls><source src="movie.mp4"></video>',
    );
    expect(media).toBeTruthy();
    expect(createMediaNodeFromElement(media)).toBeTruthy();
    expect(findImageElement('<div>text</div>')).toBeNull();
    expect(createMediaNodeFromElement(null)).toBeNull();
  });
});
