/**
 * useMEditor：update 使用 current || el 分支。
 */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useMEditor } from '../editor';

const mockSetNodes = vi.fn();
const mockFindPath = vi.fn(() => [0, 1]);

vi.mock('slate-react', () => ({
  useSlate: vi.fn(() => ({})),
  ReactEditor: {
    findPath: (...args: unknown[]) => mockFindPath(...args),
  },
}));

vi.mock('../editor/store', () => ({
  useEditorStore: vi.fn(),
}));

vi.mock('slate', () => ({
  Transforms: {
    setNodes: (...args: unknown[]) => mockSetNodes(...args),
  },
}));

describe('useMEditor branches', () => {
  it('update 未传 current 时对 el 调用 findPath', () => {
    const el = { type: 'paragraph', children: [{ text: '' }] };
    mockSetNodes.mockClear();
    mockFindPath.mockClear();
    const { result } = renderHook(() => useMEditor(el as any));
    const [, update] = result.current;
    update({ foo: 'bar' });
    expect(mockFindPath).toHaveBeenCalled();
    expect(mockSetNodes).toHaveBeenCalled();
  });
});
