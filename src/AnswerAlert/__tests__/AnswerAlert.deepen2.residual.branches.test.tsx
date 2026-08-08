/**
 * AnswerAlert deepen2：无 node 早退。
 */
import { render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AnswerAlert } from '../index';

describe('AnswerAlert deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('基础渲染', () => {
    render(<AnswerAlert type="info" message="m" />);
    expect(document.body.textContent).toContain('m');
  });
});
