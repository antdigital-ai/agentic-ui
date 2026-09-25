import { describe, expect, it } from 'vitest';
import { addEmptyLinesIfNeeded } from '../parseEmptyLines';

describe('addEmptyLinesIfNeeded residual branches', () => {
  it.skip.each([
    [undefined, true],
    [{ position: { end: { line: 1 } } }, false],
    [{ position: { end: { line: 1 } } }, true],
  ])('preserves input for missing previous node or non-top nodes', (previous, top) => {
    const elements = [{ type: 'paragraph' }];
    expect(
      addEmptyLinesIfNeeded(elements, previous, { position: { start: { line: 9 } } }, top),
    ).toBe(elements);
  });

  it('handles close nodes, missing positions, and adds calculated blank paragraphs', () => {
    const elements: any[] = [];
    expect(
      addEmptyLinesIfNeeded(
        elements,
        { position: { end: { line: 2 } } },
        { position: { start: { line: 5 } } },
        true,
      ),
    ).toBe(elements);
    expect(
      addEmptyLinesIfNeeded(elements, {}, { position: { start: { line: 10 } } }, true),
    ).toHaveLength(4);
    expect(
      addEmptyLinesIfNeeded(
        elements,
        { position: { end: { line: 1 } } },
        { position: { start: { line: 9 } } },
        true,
      ),
    ).toHaveLength(3);
  });
});
