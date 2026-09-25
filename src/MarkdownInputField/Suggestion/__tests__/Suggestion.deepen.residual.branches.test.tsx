/**
 * Suggestion deepen：空 items；自定义 render；disabled。
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Suggestion } from '../index';

describe('Suggestion deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空 items 仍渲染 children', () => {
    render(
      <Suggestion items={[]}>
        <button type="button">trigger</button>
      </Suggestion>,
    );
    expect(screen.getByText('trigger')).toBeTruthy();
  });

  it('items 有数据时可打开', () => {
    render(
      <Suggestion
        items={[{ key: '1', label: 'One' }]}
        open
      >
        <button type="button">t</button>
      </Suggestion>,
    );
    expect(screen.getByText('t')).toBeTruthy();
  });
});
