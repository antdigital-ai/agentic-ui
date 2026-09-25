/**
 * MarkdownRenderer deepen：streaming 缺省 false。
 */
import '@testing-library/jest-dom';
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MarkdownRenderer } from '../index';

describe('MarkdownRenderer deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('省略 streaming：默认 false 仍渲染', () => {
    const { container } = render(
      <MarkdownRenderer content="hello world" />,
    );
    expect(container.textContent).toContain('hello');
  });
});
