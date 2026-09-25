/**
 * extractFootnoteDefinitions deepen3：无 label 回退 identifier。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { extractFootnoteDefinitionsFromMarkdown } from '../extractFootnoteDefinitions';

describe('extractFootnoteDefinitions deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('脚注 placeholder 回退 identifier', () => {
    const md = `Hi[^id1]

[^id1]: note body
`;
    const rows = extractFootnoteDefinitionsFromMarkdown(md);
    expect(rows[0]?.id).toBe('id1');
    expect(rows[0]?.placeholder).toBeTruthy();
  });
});
