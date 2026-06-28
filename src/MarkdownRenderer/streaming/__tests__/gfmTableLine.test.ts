import { describe, expect, it } from 'vitest';
import { endsInsideGfmTable, isGfmTableLine } from '../gfmTableLine';

describe('isGfmTableLine', () => {
  it('detects leading-pipe and pipe-less GFM table rows', () => {
    expect(isGfmTableLine('| name | value |')).toBe(true);
    expect(isGfmTableLine('name | value')).toBe(true);
  });

  it('detects leading-pipe and pipe-less GFM table separators', () => {
    expect(isGfmTableLine('| :--- | ---: |')).toBe(true);
    expect(isGfmTableLine(':--- | ---:')).toBe(true);
  });

  it('ignores non-table text', () => {
    expect(isGfmTableLine('plain text without cells')).toBe(false);
  });
});

describe('endsInsideGfmTable', () => {
  it('treats a pipe-less table row as an active streaming table tail', () => {
    expect(endsInsideGfmTable('name | value\n--- | ---\nalpha | 1')).toBe(
      true,
    );
  });
});
