/**
 * columnMatching deepen4：override 空串 alias continue。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveDocCardsFields } from '../columnMatching';

describe('columnMatching deepen4 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('多字段空 override 跳过', () => {
    const r = resolveDocCardsFields(['标题', '描述', '标签'], {
      title: '',
      description: '',
      tags: '',
    });
    expect(r?.title).toBeTruthy();
  });
});
