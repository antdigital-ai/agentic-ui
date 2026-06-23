import { describe, expect, it } from 'vitest';
import { resolveInitialCodeBlockViewMode } from '../resolveInitialCodeBlockViewMode';

describe('resolveInitialCodeBlockViewMode', () => {
  it('uses code view for editable markdown code blocks', () => {
    expect(
      resolveInitialCodeBlockViewMode({
        readonly: false,
        language: 'markdown',
        shouldDisableHtmlPreview: false,
      }),
    ).toBe('code');
  });

  it('uses preview for readonly markdown code blocks', () => {
    expect(
      resolveInitialCodeBlockViewMode({
        readonly: true,
        language: 'markdown',
        shouldDisableHtmlPreview: false,
      }),
    ).toBe('preview');
  });

  it('uses code for editable html when preview disabled', () => {
    expect(
      resolveInitialCodeBlockViewMode({
        readonly: false,
        language: 'html',
        shouldDisableHtmlPreview: true,
      }),
    ).toBe('code');
  });
});
