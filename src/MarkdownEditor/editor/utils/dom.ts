/* eslint-disable no-param-reassign */
import { remove as removeDiacritics } from 'diacritics';
const rControl = /[\u0000-\u001f]/g;
const rSpecial = /[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'<>,.?/]+/g;

/**
 * Calculates the offset top of a DOM element relative to a target element.
 * @param dom The DOM element for which to calculate the offset top.
 * @param target The target element relative to which the offset top is calculated. Defaults to document.body.
 * @returns The offset top of the DOM element.
 */
export const getOffsetTop = (
  dom: HTMLElement,
  target: HTMLElement = document.body,
) => {
  let top = 0;
  while (target.contains(dom.offsetParent) && target !== dom) {
    top += dom.offsetTop;
    dom = dom.offsetParent as HTMLElement;
  }
  return top;
};

/**
 * Calculates the offset left of a given DOM element relative to a target element.
 * @param dom - The DOM element for which to calculate the offset left.
 * @param target - The target element relative to which the offset left is calculated. Defaults to `document.body`.
 * @returns The offset left of the DOM element relative to the target element.
 */
export const getOffsetLeft = (
  dom: HTMLElement,
  target: HTMLElement = document.body,
) => {
  let left = 0;
  while (target.contains(dom) && target !== dom) {
    left += dom.offsetLeft;
    dom = dom.offsetParent as HTMLElement;
  }
  return left;
};

/**
 * Converts a string to a slug by removing diacritics, special characters,
 * and ensuring it follows slug conventions.
 *
 * @param str - The string to be converted to a slug.
 * @returns The slugified string.
 */
export const slugify = (str: string): string => {
  return (
    removeDiacritics(str)
      // Remove control characters
      .replace(rControl, '')
      // Replace special characters
      .replace(rSpecial, '-')
      // Remove continuous separators
      .replace(/-{2,}/g, '-')
      // Remove prefixing and trailing separators
      .replace(/^-+|-+$/g, '')
      // ensure it doesn't start with a number (#121)
      .replace(/^(\d)/, '_$1')
      // lowercase
      .toLowerCase()
  );
};

/**
 * Determines the media type based on the file extension.
 * @param name - The name of the file.
 * @returns The media type of the file.
 */
export const getMediaType = (name?: string, alt?: string) => {
  // Handle blob URLs
  if (typeof name === 'string' && name.startsWith('blob:')) {
    if (alt) {
      if (alt.startsWith('data:')) return 'image';
      if (alt.startsWith('video:')) return 'video';
      if (alt.startsWith('audio:')) return 'audio';
      if (alt.startsWith('attachment:')) return 'attachment';
      if (alt === 'image') return 'image';
    }
    return 'image';
  }
  if (typeof name !== 'string') return 'other';
  if (alt) {
    if (alt.startsWith('data:')) return 'image';
    if (alt.startsWith('video:')) return 'video';
    if (alt.startsWith('audio:')) return 'audio';
    if (alt.startsWith('attachment:')) return 'attachment';
  }
  name = name || '';
  if (name?.startsWith?.('data:')) {
    const mimeMatch = name.match(/^data:([^/]+)\/[^;]+/);
    const mainType = mimeMatch?.[1]?.toLowerCase();
    if (mainType === 'image') return 'image';
    if (mainType === 'video') return 'video';
    if (mainType === 'audio') return 'audio';
    return 'other';
  }
  const originName = name.split('?')[0];
  const ext = originName.toLowerCase().match(/\.\w+$/)?.[0];
  if (!ext && originName !== name) return 'image';
  if (!ext) return 'other';
  if (['.md', '.markdown'].includes(ext)) return 'markdown';
  if (['.png', '.jpg', '.gif', '.svg', '.jpeg', '.webp'].includes(ext))
    return 'image';
  if (['.mp3', '.ogg', '.aac', '.wav', '.oga', '.m4a'].includes(ext))
    return 'audio';
  if (['.mpg', '.mp4', '.webm', '.mpeg', '.ogv', '.wmv', '.m4v'].includes(ext))
    return 'video';
  if (
    [
      '.pdf',
      '.doc',
      '.docx',
      '.xls',
      '.xlsx',
      '.ppt',
      '.pptx',
      '.txt',
      '.html',
    ].includes(ext)
  )
    return 'document';
  return 'other';
};

/**
 * Retrieves the bounding rectangle of the current selection.
 * @returns The bounding rectangle of the selection, or null if no selection exists.
 */
export const getSelRect = () => {
  if (typeof window === 'undefined') return null;
  const domSelection = window.getSelection();
  if (domSelection?.rangeCount === 0) return null;
  const domRange = domSelection?.getRangeAt(0);
  return domRange?.getBoundingClientRect() || null;
};
