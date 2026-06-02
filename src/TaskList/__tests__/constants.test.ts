import { describe, expect, it } from 'vitest';
import { getTaskStatusStyleKey, isTaskInProgress } from '../constants';

describe('TaskList constants', () => {
  it('isTaskInProgress 合并 pending 与 loading', () => {
    expect(isTaskInProgress('loading')).toBe(true);
    expect(isTaskInProgress('pending')).toBe(true);
    expect(isTaskInProgress('success')).toBe(false);
    expect(isTaskInProgress('error')).toBe(false);
  });

  it('getTaskStatusStyleKey 将进行中态映射为 loading 样式类', () => {
    expect(getTaskStatusStyleKey('pending')).toBe('loading');
    expect(getTaskStatusStyleKey('loading')).toBe('loading');
    expect(getTaskStatusStyleKey('success')).toBe('success');
  });
});
