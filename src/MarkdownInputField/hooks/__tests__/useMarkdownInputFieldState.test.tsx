import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useMarkdownInputFieldState } from '../useMarkdownInputFieldState';

describe('useMarkdownInputFieldState', () => {
  it('notifies once when a programmatic change is echoed by the editor', () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }) => useMarkdownInputFieldState({ value, onChange }),
      { initialProps: { value: 'draft' } },
    );
    act(() => result.current.setValue(''));
    act(() => result.current.setValue(''));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toBe('');
    rerender({ value: '' });
    act(() => result.current.setValue(''));
    expect(onChange).toHaveBeenCalledTimes(1);
    rerender({ value: 'restored draft' });
    act(() => result.current.setValue(''));
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('retains the latest controlled draft when control is released, then permits editing', () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }) => useMarkdownInputFieldState({ value, onChange }),
      { initialProps: { value: 'first' as string | undefined } },
    );
    rerender({ value: 'latest' });
    rerender({ value: undefined });
    expect(result.current.value).toBe('latest');
    expect(onChange).not.toHaveBeenCalled();
    act(() => result.current.setValue('uncontrolled edit'));
    expect(result.current.value).toBe('uncontrolled edit');
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
