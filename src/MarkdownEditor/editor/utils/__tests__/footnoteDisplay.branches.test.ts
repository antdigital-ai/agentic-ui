/**
 * footnoteDisplay 残余分支：空 text、boolean identifier、def 回退、id ?? index。
 */
import { describe, expect, it } from 'vitest';
import {
  buildFootnoteDefinitionChangePayload,
  extractFootnoteDefinitionIdentifier,
  extractFootnoteRefIdentifier,
  formatFootnoteRefDisplayLabel,
  resolveFootnoteRefIdentifier,
} from '../footnoteDisplay';

describe('footnoteDisplay branches', () => {
  it('空 text 提取 identifier 为 undefined', () => {
    expect(extractFootnoteRefIdentifier()).toBeUndefined();
    expect(extractFootnoteRefIdentifier('')).toBeUndefined();
    expect(extractFootnoteDefinitionIdentifier()).toBeUndefined();
    expect(extractFootnoteDefinitionIdentifier('')).toBeUndefined();
  });

  it('boolean / 空 string leafIdentifier 回退到 text 解析', () => {
    expect(resolveFootnoteRefIdentifier('[^ab]', true)).toBe('ab');
    expect(resolveFootnoteRefIdentifier('[^ab]', '')).toBe('ab');
    expect(resolveFootnoteRefIdentifier('[^ab]', false)).toBe('ab');
  });

  it('无 identifier 时 format 回退 text 或空串', () => {
    expect(formatFootnoteRefDisplayLabel('plain')).toBe('plain');
    expect(formatFootnoteRefDisplayLabel()).toBe('');
  });

  it('definition 无前缀时回退 ref 解析', () => {
    expect(extractFootnoteDefinitionIdentifier('see [^z]')).toBe('z');
  });

  it('payload 无 id 时用 index', () => {
    const payload = buildFootnoteDefinitionChangePayload([
      { type: 'footnoteDefinition', identifier: 'x', value: 'v' },
    ]);
    expect(payload[0].id).toBe(0);
  });
});
