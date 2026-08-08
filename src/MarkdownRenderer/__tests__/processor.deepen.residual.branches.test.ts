/**
 * processor deepen：无额外插件 / 公式开关路径。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createHastProcessor } from '../processor';

describe('processor deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('默认配置可 parse', () => {
    const p = createHastProcessor();
    const tree = p.parse('# hi');
    expect(tree).toBeTruthy();
  });

  it('附加空插件数组', () => {
    const p = createHastProcessor([], {}, undefined, []);
    expect(p.parse('a')).toBeTruthy();
  });
});
