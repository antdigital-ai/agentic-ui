import { describe, expect, it } from 'vitest';
import {
  createMediaNodeFromElement,
  findImageElement,
  isStandardHtmlElement,
  preprocessNonStandardHtmlTags,
} from '../parseHtml';

describe('parseHtml media residual branches', () => {
  it('parses media dimensions and optional attributes', () => {
    const media = findImageElement(
      '<img src="photo.png" width="10" height="20" alt="photo" />',
    );
    expect(media).toMatchObject({
      tagName: 'img',
      url: 'photo.png',
      width: 10,
      height: 20,
      alt: 'photo',
    });
    expect(createMediaNodeFromElement(media)).toBeTruthy();
  });

  it('keeps standard tags but unwraps non-standard tag pairs', () => {
    expect(isStandardHtmlElement('</DIV>')).toBe(true);
    expect(isStandardHtmlElement('not a tag')).toBe(false);
    expect(preprocessNonStandardHtmlTags('<custom><p>x</p></custom>')).toBe(
      '<p>x</p>',
    );
  });
});
