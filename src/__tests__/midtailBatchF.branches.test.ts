/**
 * Midtail batch F：miss 2–12 纯函数 / 轻量 hook（避开 Editor/charts/FileComponent）。
 */
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  endsInsideUnclosedFence,
  INITIAL_FENCE_STATE,
  updateFenceStateForLine,
} from '../MarkdownRenderer/streaming/fenceTracker';
import { shouldResetRevisionProgress } from '../MarkdownRenderer/streaming/revisionPolicy';
import { useShallowMemo } from '../MarkdownRenderer/streaming/useShallowMemo';
import {
  getArrowRotation,
  getTaskStatusStyleKey,
  hasTaskContent,
  isTaskInProgress,
} from '../TaskList/constants';
import { easeInOutCubic } from '../Utils/easings';
import { formatTime } from '../Utils/formatTime';
import {
  hasDangerousUrlScheme,
  serializeHastElement,
  shouldRenderUrlAsPlainText,
} from '../Utils/htmlUrlSafety';

describe('midtail batch F pure branches', () => {
  it('fenceTracker：开闭围栏 / 未闭合 / 非围栏行', () => {
    let s = { ...INITIAL_FENCE_STATE };
    s = updateFenceStateForLine(s, '```js');
    expect(s.inFenced).toBe(true);
    s = updateFenceStateForLine(s, 'const x = 1');
    expect(s.inFenced).toBe(true);
    s = updateFenceStateForLine(s, '```');
    expect(s.inFenced).toBe(false);

    expect(endsInsideUnclosedFence('```\ncode')).toBe(true);
    expect(endsInsideUnclosedFence('```\ncode\n```')).toBe(false);
    expect(endsInsideUnclosedFence('plain')).toBe(false);

    const open = updateFenceStateForLine(
      { inFenced: true, fenceChar: '`', fenceLen: 3 },
      '~~~~',
    );
    expect(open.inFenced).toBe(true);
  });

  it('revisionPolicy：前缀 / 回退 / 无关修订', () => {
    expect(shouldResetRevisionProgress(undefined, 'a')).toBe(false);
    expect(shouldResetRevisionProgress('', 'a')).toBe(false);
    expect(shouldResetRevisionProgress('ab', 'ab')).toBe(false);
    expect(shouldResetRevisionProgress('ab', 'abc')).toBe(false);
    expect(shouldResetRevisionProgress('abc', 'ab')).toBe(false);
    expect(shouldResetRevisionProgress('ab', 'xy')).toBe(true);
  });

  it('useShallowMemo：同引用 / 浅相等 / 浅不等', () => {
    const { result, rerender } = renderHook(
      ({ v }) => useShallowMemo(v),
      { initialProps: { v: { a: 1 } as any } },
    );
    const first = result.current;
    rerender({ v: { a: 1 } });
    expect(result.current).toBe(first);
    rerender({ v: { a: 2 } });
    expect(result.current).not.toBe(first);
    rerender({ v: undefined as any });
    expect(result.current).toBeUndefined();
  });

  it('TaskList constants：进度态 / 箭头 / 内容', () => {
    expect(isTaskInProgress('pending')).toBe(true);
    expect(isTaskInProgress('loading')).toBe(true);
    expect(isTaskInProgress('success')).toBe(false);
    expect(getTaskStatusStyleKey('pending')).toBe('loading');
    expect(getTaskStatusStyleKey('error')).toBe('error');
    expect(getArrowRotation(true).transform).toContain('0deg');
    expect(getArrowRotation(false).transform).toContain('180deg');
    expect(hasTaskContent([])).toBe(false);
    expect(hasTaskContent(['x'])).toBe(true);
    expect(hasTaskContent('')).toBe(false);
    expect(hasTaskContent('hi')).toBe(true);
  });

  it('easings / formatTime / htmlUrlSafety', () => {
    expect(easeInOutCubic(0, 0, 100, 100)).toBe(0);
    expect(easeInOutCubic(50, 0, 100, 100)).toBeGreaterThan(0);
    expect(easeInOutCubic(100, 0, 100, 100)).toBe(100);
    expect(formatTime(Date.now())).toBe('2024-02-27 17:20:00');

    expect(hasDangerousUrlScheme('javascript:alert(1)')).toBe(true);
    expect(hasDangerousUrlScheme('https://ok')).toBe(false);
    expect(shouldRenderUrlAsPlainText('javascript:x')).toBe(true);
    expect(serializeHastElement({ tagName: 'br' })).toBe('<br>');
    expect(
      serializeHastElement({
        tagName: 'p',
        children: [{ type: 'text', value: undefined as any }],
      }),
    ).toBe('<p></p>');
  });
});
