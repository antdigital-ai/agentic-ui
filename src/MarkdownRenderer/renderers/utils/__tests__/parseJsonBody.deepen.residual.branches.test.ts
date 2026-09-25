/**
 * parseJsonBody deepen：json5 抛错且 code 为空时 partialParse 走 `|| '{}'`。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('json5', () => ({
  default: {
    parse: () => {
      throw new Error('forced-json5-fail');
    },
  },
}));

vi.mock('../../../../MarkdownEditor/editor/parser/json-parse', () => ({
  default: (code: string) => {
    if (code === '{}') return { ok: true };
    throw new Error('partial-fail');
  },
}));

import { parseJsonBody } from '../parseJsonBody';

describe('parseJsonBody deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空串 json5 失败后 partialParse 使用 {}', () => {
    expect(parseJsonBody('')).toEqual({ ok: true });
  });
});
