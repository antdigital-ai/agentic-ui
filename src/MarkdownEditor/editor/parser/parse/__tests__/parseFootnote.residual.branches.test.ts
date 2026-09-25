/**
 * parseFootnote residual：identifier/label 回退与 legacy 转换。
 */
import { describe, expect, it } from 'vitest';
import {
  footnoteReferenceToTextLeaf,
  handleFootnoteReference,
  legacyFootnoteReferenceElementToTextLeaf,
} from '../parseFootnote';

describe('parseFootnote residual branches', () => {
  it('footnoteReferenceToTextLeaf：identifier / label / 皆空', () => {
    expect(footnoteReferenceToTextLeaf({ identifier: 'a' })).toMatchObject({
      text: '[^a]',
      fnc: true,
      identifier: 'a',
    });
    expect(footnoteReferenceToTextLeaf({ label: 'L' }).text).toBe('[^L]');
    expect(footnoteReferenceToTextLeaf({}).text).toBe('');
  });

  it('handleFootnoteReference 委托转换', () => {
    expect(handleFootnoteReference({ identifier: 'x' }).fnc).toBe(true);
  });

  it('legacyFootnoteReferenceElementToTextLeaf', () => {
    expect(
      legacyFootnoteReferenceElementToTextLeaf({ identifier: 'id' }).text,
    ).toContain('id');
    expect(
      legacyFootnoteReferenceElementToTextLeaf({
        children: [{ text: '[^z]' }],
      }).text,
    ).toBeTruthy();
  });
});
