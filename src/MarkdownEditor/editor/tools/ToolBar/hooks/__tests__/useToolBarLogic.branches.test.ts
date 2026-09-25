/**
 * useToolBarLogic：Editor.nodes 无 node 时 isCodeNode false。
 */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  useToolBarLogic,
  type UseToolBarLogicProps,
} from '../useToolBarLogic';

vi.mock('../../../../../editor/utils/editorUtils', () => ({
  EditorUtils: {
    isFormatActive: vi.fn(() => false),
    clearMarks: vi.fn(),
    highColor: vi.fn(),
    toggleFormat: vi.fn(),
  },
}));

vi.mock('../../../../../editor/utils/dom', () => ({
  getSelRect: vi.fn(() => null),
}));

vi.mock('../../../../../../Plugins/formatter', () => ({
  MarkdownFormatter: { format: vi.fn((x: string) => x) },
}));

const mockEditorNodes = vi.fn(() => [] as any[]);

vi.mock('slate', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    Editor: {
      ...actual.Editor,
      nodes: (...args: any[]) => mockEditorNodes(...args),
    },
  };
});

const baseProps: UseToolBarLogicProps = {
  markdownEditorRef: { current: { selection: null } as any },
  keyTask$: { next: vi.fn() },
  store: { getMDContent: vi.fn(), setMDContent: vi.fn() },
  openInsertLink$: { next: vi.fn() },
  setDomRect: vi.fn(),
  refreshFloatBar: {},
  domRect: null,
};

describe('useToolBarLogic branches', () => {
  it.skip('Editor.nodes 无匹配时 isCodeNode 为 false', () => {
    mockEditorNodes.mockReturnValue([]);
    const { result } = renderHook(() => useToolBarLogic(baseProps));
    expect(
      result.current.isCodeNode(baseProps.markdownEditorRef.current!),
    ).toBe(false);
  });
});
