import { describe, expect, it } from 'vitest';

import {
  footnoteReferenceToTextLeaf,
  handleFootnoteReference,
  legacyFootnoteReferenceElementToTextLeaf,
} from '../parseFootnote';

describe('parseFootnote', () => {
  it('footnoteReferenceToTextLeaf produces fnc text leaf', () => {
    expect(footnoteReferenceToTextLeaf({ identifier: '1' })).toEqual({
      text: '[^1]',
      identifier: '1',
      fnc: true,
    });
  });

  it('legacyFootnoteReferenceElementToTextLeaf reads identifier', () => {
    expect(
      legacyFootnoteReferenceElementToTextLeaf({
        identifier: '2',
        children: [{ text: '2' }],
      } as any),
    ).toEqual({
      text: '[^2]',
      identifier: '2',
      fnc: true,
    });
  });

  it('handleFootnoteReference matches footnoteReferenceToTextLeaf', () => {
    expect(handleFootnoteReference({ identifier: 'a' })).toEqual(
      footnoteReferenceToTextLeaf({ identifier: 'a' }),
    );
  });
});
