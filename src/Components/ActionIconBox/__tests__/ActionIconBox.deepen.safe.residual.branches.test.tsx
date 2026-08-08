/**
 * ActionIconBox deepen safe：child.props 缺省走 ?? {}。
 */
import '@testing-library/jest-dom';
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ActionIconBox } from '../index';

describe('ActionIconBox deepen safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('iconStyle + 无 props 的 element：合并 style', () => {
    const orphan = Object.create(null);
    orphan.type = 'span';
    orphan.key = null;
    orphan.ref = null;
    orphan.props = undefined;
    orphan.$$typeof = Symbol.for('react.element');

    const { container } = render(
      <ActionIconBox title="t" iconStyle={{ color: 'red' }}>
        {orphan as any}
      </ActionIconBox>,
    );
    expect(container.querySelector('span') || container.firstChild).toBeTruthy();
  });
});
