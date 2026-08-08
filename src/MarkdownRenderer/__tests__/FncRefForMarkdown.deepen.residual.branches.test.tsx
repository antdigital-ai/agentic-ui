/**
 * FncRefForMarkdown deepen：extract 空/假值子节点。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { extractFootnoteRefFromSupChildren } from '../FncRefForMarkdown';

describe('FncRefForMarkdown deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('null / 多子节点 → undefined', () => {
    expect(extractFootnoteRefFromSupChildren(null)).toBeUndefined();
    expect(
      extractFootnoteRefFromSupChildren([
        <a key="1" href="#user-content-fn-a">
          1
        </a>,
        <a key="2" href="#user-content-fn-b">
          2
        </a>,
      ] as any),
    ).toBeUndefined();
  });
});
