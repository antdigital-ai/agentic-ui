/**
 * ActionIconBox deepen2：child.props 缺省。
 */
import { render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ActionIconBox } from '../index';

describe('ActionIconBox deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 props 子节点', () => {
    const Child = () => <span>x</span>;
    render(
      <ActionIconBox title="t">
        <Child />
      </ActionIconBox>,
    );
    expect(document.body.textContent).toContain('x');
  });
});
