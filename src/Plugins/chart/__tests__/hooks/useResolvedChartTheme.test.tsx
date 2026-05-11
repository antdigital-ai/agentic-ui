import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../hooks/useDetectTheme', () => ({
  useDetectTheme: vi.fn(() => 'light'),
}));

import { useDetectTheme } from '../../hooks/useDetectTheme';
import { useResolvedChartTheme } from '../../hooks/useResolvedChartTheme';

describe('useResolvedChartTheme', () => {
  it('uses explicit theme when provided', () => {
    vi.mocked(useDetectTheme).mockReturnValue('dark');
    const { result } = renderHook(() => useResolvedChartTheme('light'));
    expect(result.current.resolvedTheme).toBe('light');
    expect(result.current.autoDetectTheme).toBe(false);
  });

  it('falls back to detected theme when theme is omitted', () => {
    vi.mocked(useDetectTheme).mockReturnValue('dark');
    const { result } = renderHook(() => useResolvedChartTheme(undefined));
    expect(result.current.resolvedTheme).toBe('dark');
    expect(result.current.autoDetectTheme).toBe(true);
  });
});
