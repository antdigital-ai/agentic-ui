import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useMarkdownInputFieldRefs } from '../hooks/useMarkdownInputFieldRefs';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal MarkdownEditorInstance mock with a controllable setMDContent spy. */
const makeMockEditorInstance = (isFocused = false) => {
  const setMDContent = vi.fn();
  return {
    store: { setMDContent },
    markdownEditorRef: {
      current: {
        // Returned by ReactEditor.isFocused() via the hook
        _focused: isFocused,
      },
    },
  } as unknown as import('../../MarkdownEditor').MarkdownEditorInstance;
};

// ReactEditor.isFocused reads from internal Slate state.  We mock the module
// so we can control the focused state without mounting a real Slate editor.
vi.mock('slate-react', async () => {
  const actual = await vi.importActual<typeof import('slate-react')>('slate-react');
  return {
    ...actual,
    ReactEditor: {
      ...actual.ReactEditor,
      isFocused: vi.fn().mockReturnValue(false),
    },
  };
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useMarkdownInputFieldRefs — setMDContent sync guard', () => {
  it('calls setMDContent when props.value changes and did not originate from the editor', async () => {
    const setValue = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }) =>
        useMarkdownInputFieldRefs({ value, setValue }),
      { initialProps: { value: '' } },
    );

    // Wire up a mock editor instance
    const mockEditor = makeMockEditorInstance(false);
    act(() => {
      result.current.markdownEditorRef.current = mockEditor;
    });

    // Simulate an external value change (e.g. programmatic reset from parent)
    rerender({ value: 'external update' });

    await act(async () => {});

    expect(mockEditor.store.setMDContent).toHaveBeenCalledWith('external update');
  });

  it('skips setMDContent when props.value matches the last editor-emitted value', async () => {
    const setValue = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }) =>
        useMarkdownInputFieldRefs({ value, setValue }),
      { initialProps: { value: '' } },
    );

    const mockEditor = makeMockEditorInstance(false);
    act(() => {
      result.current.markdownEditorRef.current = mockEditor;
    });

    // Record a value as if the editor just emitted it
    act(() => {
      result.current.onEditorChange('hello');
    });

    // Parent echoes that same value back as props.value (normal controlled flow)
    rerender({ value: 'hello' });

    await act(async () => {});

    // setMDContent must NOT be called — editor already has this content
    expect(mockEditor.store.setMDContent).not.toHaveBeenCalled();
  });

  it('skips setMDContent when the editor is focused (prevents stale delayed update)', async () => {
    const { ReactEditor } = await import('slate-react');
    // Simulate editor being focused
    vi.mocked(ReactEditor.isFocused).mockReturnValue(true);

    const setValue = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }) =>
        useMarkdownInputFieldRefs({ value, setValue }),
      { initialProps: { value: 'a' } },
    );

    const mockEditor = makeMockEditorInstance(true);
    act(() => {
      result.current.markdownEditorRef.current = mockEditor;
    });

    // A stale props.value arrives while the editor is actively focused/typing
    rerender({ value: 'ab' });

    await act(async () => {});

    expect(mockEditor.store.setMDContent).not.toHaveBeenCalled();

    // Restore
    vi.mocked(ReactEditor.isFocused).mockReturnValue(false);
  });

  it('calls setMDContent with empty string when props.value is undefined and editor is not focused', async () => {
    const setValue = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }: { value: string | undefined }) =>
        useMarkdownInputFieldRefs({ value, setValue }),
      { initialProps: { value: '' as string | undefined } },
    );

    const mockEditor = makeMockEditorInstance(false);
    act(() => {
      result.current.markdownEditorRef.current = mockEditor;
      // Mark '' as the last editor-emitted value
      result.current.onEditorChange('');
    });

    // Parent initially set value to 'hello', then cleared it to undefined
    act(() => {
      result.current.onEditorChange('hello');
    });
    rerender({ value: 'hello' });

    // Now an external reset arrives: parent sets value to undefined
    rerender({ value: undefined });

    await act(async () => {});

    // 'hello' !== undefined, so the sync fires and ?? '' converts undefined to ''
    expect(mockEditor.store.setMDContent).toHaveBeenCalledWith('');
  });
});
