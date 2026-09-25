/**
 * useMarkdownToReact deepen：markdownToReactSync 空 content → null。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { markdownToReactSync } from '../useMarkdownToReact';

describe('useMarkdownToReact deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空字符串 / falsy → null', () => {
    expect(markdownToReactSync('')).toBeNull();
    expect(markdownToReactSync(null as any)).toBeNull();
  });
});
