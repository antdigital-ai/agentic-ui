/**
 * useInputFieldRefContainer Hook 单元测试
 * 仅验证「持有 ref」单一职责：返回 4 个稳定的 ref 容器。
 */

import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useInputFieldRefContainer } from '../useInputFieldRefContainer';

describe('useInputFieldRefContainer', () => {
  it('返回 markdownEditorRef、quickActionsRef、actionsRef、isSendingRef 四个 ref', () => {
    const { result } = renderHook(() => useInputFieldRefContainer());

    expect(result.current.markdownEditorRef).toBeDefined();
    expect(result.current.quickActionsRef).toBeDefined();
    expect(result.current.actionsRef).toBeDefined();
    expect(result.current.isSendingRef).toBeDefined();
  });

  it('markdownEditorRef.current 初始为 undefined，DOM ref 初始为 null，isSendingRef 初始为 false', () => {
    const { result } = renderHook(() => useInputFieldRefContainer());

    expect(result.current.markdownEditorRef.current).toBeUndefined();
    expect(result.current.quickActionsRef.current).toBeNull();
    expect(result.current.actionsRef.current).toBeNull();
    expect(result.current.isSendingRef.current).toBe(false);
  });

  it('多次 rerender 后 ref 引用保持稳定（同一对象）', () => {
    const { result, rerender } = renderHook(() => useInputFieldRefContainer());

    const firstSnapshot = result.current;
    rerender();
    const secondSnapshot = result.current;

    expect(secondSnapshot.markdownEditorRef).toBe(
      firstSnapshot.markdownEditorRef,
    );
    expect(secondSnapshot.quickActionsRef).toBe(firstSnapshot.quickActionsRef);
    expect(secondSnapshot.actionsRef).toBe(firstSnapshot.actionsRef);
    expect(secondSnapshot.isSendingRef).toBe(firstSnapshot.isSendingRef);
  });
});
