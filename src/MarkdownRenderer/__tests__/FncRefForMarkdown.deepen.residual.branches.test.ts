/**
 * FncRefForMarkdown deepen：extract 空/假值 / 多子节点。
 */
import React from 'react';
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
        React.createElement('a', { key: '1', href: '#user-content-fn-a' }, '1'),
        React.createElement('a', { key: '2', href: '#user-content-fn-b' }, '2'),
      ]),
    ).toBeUndefined();
  });
});
