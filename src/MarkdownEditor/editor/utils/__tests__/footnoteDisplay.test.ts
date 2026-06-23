import { describe, expect, it } from 'vitest';
import {
  buildFootnoteDefinitionChangePayload,
  extractFootnoteDefinitionIdentifier,
  extractFootnoteRefIdentifier,
  formatFootnoteRefDisplayLabel,
  resolveFootnoteRefIdentifier,
} from '../footnoteDisplay';

describe('footnoteDisplay', () => {
  it('extractFootnoteRefIdentifier parses GFM reference', () => {
    expect(extractFootnoteRefIdentifier('[^1]')).toBe('1');
    expect(extractFootnoteRefIdentifier('text[^my-note]')).toBe('my-note');
    expect(extractFootnoteRefIdentifier('[^DOC_123]')).toBe('DOC_123');
  });

  it('resolveFootnoteRefIdentifier prefers string identifier', () => {
    expect(resolveFootnoteRefIdentifier('[^1]', 'from-leaf')).toBe('from-leaf');
  });

  it('formatFootnoteRefDisplayLabel returns identifier without legacy stripping', () => {
    expect(formatFootnoteRefDisplayLabel('[^DOC_123]')).toBe('DOC_123');
  });

  it('extractFootnoteDefinitionIdentifier parses definition prefix', () => {
    expect(extractFootnoteDefinitionIdentifier('[^9]: note')).toBe('9');
  });

  it('buildFootnoteDefinitionChangePayload maps definition blocks', () => {
    const payload = buildFootnoteDefinitionChangePayload([
      { type: 'paragraph', children: [] },
      {
        type: 'footnoteDefinition',
        id: 'a',
        identifier: '1',
        value: 'note',
        url: 'https://x.com',
      },
    ]);
    expect(payload).toEqual([
      {
        id: 'a',
        placeholder: '1',
        origin_text: 'note',
        url: 'https://x.com',
        origin_url: 'https://x.com',
      },
    ]);
  });
});
