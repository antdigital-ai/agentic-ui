import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MarkdownRenderer from '../../MarkdownRenderer';
import { installRafStub } from '../installRafStub';

const content = Array.from(
  { length: 30 },
  (_, index) => `Paragraph ${index}`,
).join('\n\n');
const hiddenDescriptor = Object.getOwnPropertyDescriptor(document, 'hidden');

describe('completed message progressive rendering', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    installRafStub();
    vi.stubGlobal('requestIdleCallback', undefined);
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: false,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    if (hiddenDescriptor) {
      Object.defineProperty(document, 'hidden', hiddenDescriptor);
    } else {
      Reflect.deleteProperty(document, 'hidden');
    }
  });

  it('keeps the initial batch for a normal static completed message', () => {
    const { container } = render(
      <MarkdownRenderer content={content} streaming={false} isFinished />,
    );
    expect(container.querySelectorAll('[data-be="paragraph"]')).toHaveLength(8);
  });

  it('shows every block when explicitly mounted as a completed stream', () => {
    const { container } = render(
      <MarkdownRenderer content={content} streaming isFinished />,
    );
    expect(container.querySelectorAll('[data-be="paragraph"]')).toHaveLength(
      30,
    );
  });

  it('shows all buffered blocks when streaming is disabled at completion', () => {
    const { container, rerender } = render(
      <MarkdownRenderer
        content="Paragraph 0"
        streaming
        isFinished={false}
        throttleOptions={{ enabled: false }}
      />,
    );
    rerender(
      <MarkdownRenderer content={content} streaming={false} isFinished />,
    );
    expect(container.querySelectorAll('[data-be="paragraph"]')).toHaveLength(
      30,
    );
    expect(container.querySelectorAll('.stream-token')).toHaveLength(0);
  });
});
