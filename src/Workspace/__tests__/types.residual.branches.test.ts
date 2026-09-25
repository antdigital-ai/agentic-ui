/**
 * Workspace types residual：getFileType / mime / category / name 回退。
 */
import { describe, expect, it } from 'vitest';
import {
  FILE_TYPES,
  FileCategory,
  getFileCategory,
  getFileType,
  getFileTypeName,
  getMimeType,
} from '../types';

describe('Workspace types residual branches', () => {
  it('按扩展名识别；未知回退 plainText', () => {
    expect(getFileType('photo.JPEG')).toBeTruthy();
    expect(getFileType('archive.ZIP')).toBeTruthy();
    expect(getFileType('noext')).toBe('plainText');
    expect(getFileType('x.unknownextzzz')).toBe('plainText');
  });

  it('getMimeType / getFileCategory', () => {
    const t = getFileType('doc.pdf');
    expect(getMimeType(t).length).toBeGreaterThan(0);
    expect(Object.values(FileCategory)).toContain(getFileCategory(t));
  });

  it('getFileTypeName：locale 命中与 nameKey 回退；未知类型', () => {
    const t = getFileType('a.js');
    const key = FILE_TYPES[t].nameKey;
    expect(getFileTypeName(t, { [key]: '脚本' })).toBe('脚本');
    expect(getFileTypeName(t)).toBe(key);
    expect(getFileTypeName('not-a-real-type' as any)).toBe('not-a-real-type');
  });
});
