/**
 * useKeyboardHandler residual：IME Enter stopPropagation；Home/End/Ctrl+A。
 */
import { renderHook } from '@testing-library/react';
import { createEditor } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useKeyboardHandler } from '../useKeyboardHandler';

vi.mock('../../../Hooks/useRefFunction', () => ({
  useRefFunction: (fn: any) => fn,
}));

const mockIsMobileDevice = vi.fn(() => false);
vi.mock('../../AttachmentButton/utils', () => ({
  isMobileDevice: () => mockIsMobileDevice(),
}));

function makeParams(overrides: Record<string, any> = {}) {
  const editor = createEditor();
  editor.children = [
    { type: 'paragraph', children: [{ text: 'hello' }] },
  ] as any;
  editor.selection = {
    anchor: { path: [0, 0], offset: 2 },
    focus: { path: [0, 0], offset: 2 },
  };
  return {
    props: {
      triggerSendKey: 'Mod+Enter' as const,
      onSend: vi.fn(),
    },
    markdownEditorRef: {
      current: {
        store: { inputComposition: false },
        markdownEditorRef: { current: editor },
      },
    } as any,
    sendMessage: vi.fn(),
    editor,
    ...overrides,
  };
}

describe('useKeyboardHandler residual branches', () => {
  beforeEach(() => {
    mockIsMobileDevice.mockReturnValue(false);
  });

  it('IME composition 时 Enter 仅 stopPropagation', () => {
    const params = makeParams();
    params.markdownEditorRef.current.store.inputComposition = true;
    const { result } = renderHook(() =>
      useKeyboardHandler({
        props: params.props,
        markdownEditorRef: params.markdownEditorRef,
        sendMessage: params.sendMessage,
      }),
    );
    const e = {
      key: 'Enter',
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      target: document.createElement('div'),
      nativeEvent: {},
    } as any;
    result.current.handleKeyDown(e);
    expect(e.stopPropagation).toHaveBeenCalled();
    expect(params.sendMessage).not.toHaveBeenCalled();
  });

  it('Home / End / Ctrl+A 移动选区', () => {
    const params = makeParams();
    const { result } = renderHook(() =>
      useKeyboardHandler({
        props: params.props,
        markdownEditorRef: params.markdownEditorRef,
        sendMessage: params.sendMessage,
      }),
    );
    const base = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      target: document.createElement('div'),
      nativeEvent: {},
    };
    result.current.handleKeyDown({ ...base, key: 'Home' } as any);
    expect(params.editor.selection?.anchor.offset).toBe(0);

    result.current.handleKeyDown({ ...base, key: 'End' } as any);
    expect(params.editor.selection?.anchor.offset).toBe(5);

    result.current.handleKeyDown({
      ...base,
      key: 'a',
      ctrlKey: true,
    } as any);
    expect(params.editor.selection).toEqual({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    });
  });
});
