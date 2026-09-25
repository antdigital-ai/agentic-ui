import { describe, expect, it, vi } from 'vitest';
import { extractTagsFromHtml, imagePastingListener } from '../utils';

describe('docx utility residual branches', () => {
  it('extracts zero or multiple image sources', () => {
    expect(extractTagsFromHtml('<p>none</p>')).toEqual([]);
    expect(extractTagsFromHtml('<img src="a"><img src="b">')).toEqual(['a', 'b']);
  });

  it('returns undefined for RTF without supported image records', () => {
    expect(imagePastingListener('{\\rtf1 no images}', '<img src="file://x">')).toBeUndefined();
  });

  it('does not map image data when HTML and RTF image counts differ', () => {
    const createObjectURL = vi.fn(() => 'blob:one');
    Object.defineProperty(window, 'URL', { configurable: true, value: { createObjectURL } });
    const rtf = '{\\pict\\pngblip\\bliptag1 89504e47}';
    expect(imagePastingListener(rtf, '<img src="file://a"><img src="file://b">')).toEqual({});
  });
});
