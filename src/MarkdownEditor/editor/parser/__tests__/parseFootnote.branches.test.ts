import { describe, expect, it } from 'vitest';
import {
  footnoteReferenceToTextLeaf,
  handleFootnoteReference,
  legacyFootnoteReferenceElementToTextLeaf,
} from '../parse/parseFootnote';

describe('parseFootnote 分支覆盖', () => {
  it('footnoteReferenceToTextLeaf 有 identifier', () => {
    expect(
      footnoteReferenceToTextLeaf({ identifier: 'note1' }),
    ).toMatchObject({
      text: '[^note1]',
      identifier: 'note1',
      fnc: true,
    });
  });

  it('footnoteReferenceToTextLeaf label 回退', () => {
    expect(footnoteReferenceToTextLeaf({ label: 'lbl' })).toMatchObject({
      text: '[^lbl]',
      identifier: 'lbl',
    });
  });

  it('footnoteReferenceToTextLeaf 空 identifier 时 text 为空', () => {
    expect(footnoteReferenceToTextLeaf({})).toMatchObject({
      text: '',
      identifier: undefined,
    });
  });

  it('footnoteReferenceToTextLeaf identifier null 时回退 label', () => {
    expect(
      footnoteReferenceToTextLeaf({ identifier: null as any, label: 'lbl' }),
    ).toMatchObject({
      text: '[^lbl]',
      identifier: 'lbl',
    });
  });

  it('footnoteReferenceToTextLeaf identifier 与 label 均缺失', () => {
    expect(
      footnoteReferenceToTextLeaf({ identifier: null as any, label: null as any }),
    ).toMatchObject({
      text: '',
      identifier: undefined,
    });
  });

  it('handleFootnoteReference 委托 footnoteReferenceToTextLeaf', () => {
    const result = handleFootnoteReference({ identifier: 'a' });
    expect(result.fnc).toBe(true);
    expect(result.text).toBe('[^a]');
  });

  it('legacyFootnoteReferenceElementToTextLeaf 从 identifier', () => {
    expect(
      legacyFootnoteReferenceElementToTextLeaf({ identifier: 'id1' }),
    ).toMatchObject({ identifier: 'id1', text: '[^id1]' });
  });

  it('legacyFootnoteReferenceElementToTextLeaf 从 text 解析', () => {
    expect(
      legacyFootnoteReferenceElementToTextLeaf({ text: '[^from-text]' }),
    ).toMatchObject({ identifier: 'from-text' });
  });

  it('legacyFootnoteReferenceElementToTextLeaf 从 children 拼接', () => {
    expect(
      legacyFootnoteReferenceElementToTextLeaf({
        children: [{ text: '[^child]' }],
      }),
    ).toMatchObject({ identifier: 'child' });
  });

  it('legacyFootnoteReferenceElementToTextLeaf 均无则空', () => {
    expect(
      legacyFootnoteReferenceElementToTextLeaf({ text: 'plain' }),
    ).toMatchObject({ text: '', identifier: undefined });
  });
});

describe('parseFootnote istanbul residual：label 优先 / 空 identifier', () => {
  it('label 与 identifier 组合', () => {
    expect(
      footnoteReferenceToTextLeaf({
        identifier: 'id',
        label: 'lab',
      } as any),
    ).toMatchObject({ text: '[^id]', identifier: 'id' });
    expect(
      handleFootnoteReference({ identifier: undefined, label: 'L' } as any)
        .text,
    ).toBe('[^L]');
    expect(
      footnoteReferenceToTextLeaf({ identifier: '', label: 'ignored' } as any)
        .text,
    ).toBe('');
  });
});
