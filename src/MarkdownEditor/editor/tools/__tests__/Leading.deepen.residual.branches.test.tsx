/**
 * Leading deepen：TocHeading 空 schema 早退。
 */
import '@testing-library/jest-dom';
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../store', () => ({
  useEditorStore: () => ({
    markdownContainerRef: { current: document.createElement('div') },
  }),
}));

import { TocHeading } from '../Leading';

describe('Leading deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空 schema 可渲染', () => {
    const { container } = render(<TocHeading schema={[]} />);
    expect(container).toBeTruthy();
  });
});
