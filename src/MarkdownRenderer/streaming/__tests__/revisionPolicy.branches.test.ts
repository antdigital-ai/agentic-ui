import { describe, expect, it } from 'vitest';
import { shouldResetRevisionProgress } from '../revisionPolicy';

describe('revisionPolicy 分支覆盖', () => {
  it('previous undefined 或空串时不重置', () => {
    expect(shouldResetRevisionProgress(undefined, 'next')).toBe(false);
    expect(shouldResetRevisionProgress('', 'next')).toBe(false);
  });

  it('next 与 previous 相等时不重置', () => {
    expect(shouldResetRevisionProgress('same', 'same')).toBe(false);
  });

  it('next 为 previous 前缀增长时不重置', () => {
    expect(shouldResetRevisionProgress('hello', 'hello world')).toBe(false);
  });

  it('next 为 previous 前缀缩短时不重置', () => {
    expect(shouldResetRevisionProgress('hello world', 'hello')).toBe(false);
  });

  it('非前缀修订时应重置', () => {
    expect(shouldResetRevisionProgress('hello', 'world')).toBe(true);
  });
});

describe('revisionPolicy istanbul residual：!previous 早退', () => {
  it.skip('previous 假值臂全覆盖', () => {
    // if (!previous) return false;
    expect(shouldResetRevisionProgress(undefined, '')).toBe(false);
    expect(shouldResetRevisionProgress(null as any, 'x')).toBe(false);
  });
});
