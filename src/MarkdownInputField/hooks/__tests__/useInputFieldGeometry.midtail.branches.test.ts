/**
 * useInputFieldGeometry mid-tail：padding / collapsedHeight / minHeight / enlarged。
 */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  ATTACHMENT_EXTRA_HEIGHT_PX,
  COLLAPSED_HEIGHT_BASE_PX,
  MIN_HEIGHT_MULTI_ROW_PX,
  MIN_HEIGHT_SINGLE_ACTION_PX,
  MIN_HEIGHT_WITH_ENLARGE_AND_REFINE_PX,
  SEND_ACTIONS_FALLBACK_RIGHT_PADDING_PX,
} from '../../constants';
import { useInputFieldGeometry } from '../useInputFieldGeometry';

const base = {
  isEnlarged: false,
  hasEnlargeAction: false,
  hasRefineAction: false,
  totalActionCount: 0,
  isMultiRowLayout: false,
};

describe('useInputFieldGeometry midtail branches', () => {
  it('hasTools 时 bottom overlay padding 为 0；否则用初始/回退右内边距', () => {
    const { result } = renderHook(() =>
      useInputFieldGeometry({ ...base, hasTools: true }),
    );
    expect(result.current.computedRightPadding).toBe(0);

    const { result: r2 } = renderHook(() =>
      useInputFieldGeometry({ ...base, hasTools: false }),
    );
    // rightPadding 初始为 DEFAULT_EDITOR_RIGHT_PADDING_PX（64）
    expect(r2.current.computedRightPadding).toBe(64);

    act(() => {
      r2.current.onSendActionsResize(0);
    });
    expect(r2.current.computedRightPadding).toBe(
      SEND_ACTIONS_FALLBACK_RIGHT_PADDING_PX,
    );

    act(() => {
      r2.current.onSendActionsResize(120);
      r2.current.onQuickActionsResize(10, 5);
    });
    expect(r2.current.computedRightPadding).toBe(120);
  });

  it('collapsedHeight：maxHeight number / 可解析字符串 / 非法回默认；附件加高', () => {
    const { result: n } = renderHook(() =>
      useInputFieldGeometry({ ...base, maxHeight: 200 }),
    );
    expect(n.current.collapsedHeightPx).toBe(200);

    const { result: s } = renderHook(() =>
      useInputFieldGeometry({
        ...base,
        style: { maxHeight: '180px' },
      }),
    );
    expect(s.current.collapsedHeightPx).toBe(180);

    const { result: bad } = renderHook(() =>
      useInputFieldGeometry({
        ...base,
        style: { maxHeight: 'abc' },
      }),
    );
    expect(bad.current.collapsedHeightPx).toBe(COLLAPSED_HEIGHT_BASE_PX);

    const { result: att } = renderHook(() =>
      useInputFieldGeometry({
        ...base,
        maxHeight: 100,
        attachment: { enable: true },
      }),
    );
    expect(att.current.collapsedHeightPx).toBe(100 + ATTACHMENT_EXTRA_HEIGHT_PX);
  });

  it('computedMinHeight：enlarged / style / enlarge+refine / 单按钮 / 多行', () => {
    expect(
      renderHook(() =>
        useInputFieldGeometry({ ...base, isEnlarged: true }),
      ).result.current.computedMinHeight,
    ).toBe('auto');

    expect(
      renderHook(() =>
        useInputFieldGeometry({
          ...base,
          style: { minHeight: 66 },
        }),
      ).result.current.computedMinHeight,
    ).toBe(66);

    expect(
      renderHook(() =>
        useInputFieldGeometry({
          ...base,
          hasEnlargeAction: true,
          hasRefineAction: true,
        }),
      ).result.current.computedMinHeight,
    ).toBe(MIN_HEIGHT_WITH_ENLARGE_AND_REFINE_PX);

    expect(
      renderHook(() =>
        useInputFieldGeometry({ ...base, totalActionCount: 1 }),
      ).result.current.computedMinHeight,
    ).toBe(MIN_HEIGHT_SINGLE_ACTION_PX);

    expect(
      renderHook(() =>
        useInputFieldGeometry({ ...base, isMultiRowLayout: true }),
      ).result.current.computedMinHeight,
    ).toBe(MIN_HEIGHT_MULTI_ROW_PX);
  });

  it('enlargedStyle 仅在放大态有值', () => {
    const { result } = renderHook(() =>
      useInputFieldGeometry({ ...base, isEnlarged: true }),
    );
    expect(result.current.enlargedStyle.maxHeight).toBeTruthy();
    expect(
      renderHook(() => useInputFieldGeometry(base)).result.current.enlargedStyle,
    ).toEqual({});
  });
});
