import { describe, expect, it, vi } from 'vitest';

vi.mock('slate', () => ({}));
vi.mock('slate-react', () => ({}));
vi.mock('slate-history', () => ({}));

describe('Suggestion debug', () => {
  it('should import Suggestion without hanging', async () => {
    console.log('[DEBUG] before import');
    const mod = await import('../src/MarkdownInputField/Suggestion');
    console.log('[DEBUG] after import');
    expect(mod.Suggestion).toBeDefined();
  });
});
