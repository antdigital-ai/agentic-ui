import type { CSSProperties } from 'react';
import { describe, expect, it } from 'vitest';
import { sanitizeEditorChromeStyle } from '../utils/sanitizeChromeStyle';

describe('sanitizeEditorChromeStyle', () => {
  it('removes empty padding longhands and empty --* custom properties', () => {
    expect(
      sanitizeEditorChromeStyle({
        paddingTop: '',
        padding: '8px',
        '--agentic-ui-content-padding': '',
        '--other-var': 'ok',
      } as CSSProperties),
    ).toEqual({
      padding: '8px',
      '--other-var': 'ok',
    });
  });

  it('returns empty object for undefined input', () => {
    expect(sanitizeEditorChromeStyle(undefined)).toEqual({});
  });
});
