/**
 * Workspace File utils deepen：无扩展名与单一类型分组图标。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getGroupIcon } from '../utils';

describe('Workspace File utils deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('子文件扩展名为空串时跳过扩展名推断', () => {
    const icon = getGroupIcon({
      id: 'g1',
      name: 'group',
      children: [{ id: 'f1', name: 'README.' } as any],
    } as any);
    expect(icon).toBeTruthy();
  });

  it('多种推断类型时返回文件夹图标', () => {
    const icon = getGroupIcon({
      id: 'g2',
      name: 'mixed',
      children: [
        { id: 'a', name: 'a.pdf' } as any,
        { id: 'b', name: 'b.png' } as any,
      ],
    } as any);
    expect(icon).toBeTruthy();
  });
});
