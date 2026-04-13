import { describe, expect, it } from 'vitest';
import { getMediaType, slugify } from '../dom';

describe('getMediaType', () => {
  it('detects image by extension', () => {
    expect(getMediaType('photo.png')).toBe('image');
    expect(getMediaType('photo.jpg')).toBe('image');
    expect(getMediaType('photo.gif')).toBe('image');
    expect(getMediaType('photo.svg')).toBe('image');
    expect(getMediaType('photo.jpeg')).toBe('image');
    expect(getMediaType('photo.webp')).toBe('image');
  });

  it('detects video by extension', () => {
    expect(getMediaType('video.mp4')).toBe('video');
    expect(getMediaType('video.webm')).toBe('video');
    expect(getMediaType('video.mpeg')).toBe('video');
  });

  it('detects audio by extension', () => {
    expect(getMediaType('audio.mp3')).toBe('audio');
    expect(getMediaType('audio.ogg')).toBe('audio');
    expect(getMediaType('audio.wav')).toBe('audio');
  });

  it('detects document by extension', () => {
    expect(getMediaType('file.pdf')).toBe('document');
    expect(getMediaType('file.docx')).toBe('document');
    expect(getMediaType('file.xlsx')).toBe('document');
  });

  it('detects markdown by extension', () => {
    expect(getMediaType('file.md')).toBe('markdown');
    expect(getMediaType('file.markdown')).toBe('markdown');
  });

  it('returns other for unknown extension', () => {
    expect(getMediaType('file.xyz')).toBe('other');
  });

  it('returns other for no extension and no query', () => {
    expect(getMediaType('noextension')).toBe('other');
  });

  it('returns image for URL with query but no extension', () => {
    expect(getMediaType('noextension?width=200')).toBe('image');
  });

  it('returns other for non-string name', () => {
    expect(getMediaType(undefined)).toBe('other');
    expect(getMediaType(123 as any)).toBe('other');
  });

  it('handles blob URLs without alt', () => {
    expect(getMediaType('blob:http://example.com/abc')).toBe('image');
  });

  it('handles blob URLs with alt data: prefix', () => {
    expect(getMediaType('blob:http://example.com/abc', 'data:image/png')).toBe(
      'image',
    );
  });

  it('handles blob URLs with alt video: prefix', () => {
    expect(getMediaType('blob:http://x.com/abc', 'video:test')).toBe('video');
  });

  it('handles blob URLs with alt audio: prefix', () => {
    expect(getMediaType('blob:http://x.com/abc', 'audio:test')).toBe('audio');
  });

  it('handles blob URLs with alt attachment: prefix', () => {
    expect(getMediaType('blob:http://x.com/abc', 'attachment:test')).toBe(
      'attachment',
    );
  });

  it('handles blob URLs with alt=image', () => {
    expect(getMediaType('blob:http://x.com/abc', 'image')).toBe('image');
  });

  it('handles alt data: prefix for non-blob URL', () => {
    expect(getMediaType('http://x.com/test', 'data:image/png')).toBe('image');
  });

  it('handles alt video: prefix for non-blob URL', () => {
    expect(getMediaType('http://x.com/test', 'video:test')).toBe('video');
  });

  it('handles alt audio: prefix for non-blob URL', () => {
    expect(getMediaType('http://x.com/test', 'audio:test')).toBe('audio');
  });

  it('handles alt attachment: prefix for non-blob URL', () => {
    expect(getMediaType('http://x.com/test', 'attachment:test')).toBe(
      'attachment',
    );
  });

  it('handles data: URL for image', () => {
    expect(getMediaType('data:image/png;base64,abc')).toBe('image');
  });

  it('handles data: URL for video', () => {
    expect(getMediaType('data:video/mp4;base64,abc')).toBe('video');
  });

  it('handles data: URL for audio', () => {
    expect(getMediaType('data:audio/mp3;base64,abc')).toBe('audio');
  });

  it('handles data: URL for other type', () => {
    expect(getMediaType('data:text/plain;base64,abc')).toBe('other');
  });
});

describe('slugify', () => {
  it('converts to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('test@#$%')).toBe('test');
  });

  it('prefixes number-starting slugs', () => {
    expect(slugify('123abc')).toBe('_123abc');
  });

  it('removes diacritics', () => {
    expect(slugify('café')).toBe('cafe');
  });
});
