/**
 * parseEmptyLines deepen：start.line 缺省走 `|| 0`。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { addEmptyLinesIfNeeded } from '../parseEmptyLines';

describe('parseEmptyLines deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('currentElement.position.start.line 缺省时按 0 计算间距', () => {
    const preNode = { position: { end: { line: 1 } } };
    const current = { position: { start: {} } };
    const out = addEmptyLinesIfNeeded([], preNode, current, true);
    expect(out).toEqual([]);
  });

  it('start.line 为 0 时走 || 0 右臂仍可算出空行', () => {
    const preNode = { position: { end: { line: 1 } } };
    const current = { position: { start: { line: 0 } } };
    expect(addEmptyLinesIfNeeded([], preNode, current, true)).toEqual([]);
  });
});
