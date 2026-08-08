/**
 * ActionIconBox：补 1–2 miss（title null / children 函数）。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { ActionIconBox } from '../index';

describe('ActionIconBox extra branches', () => {
  it('title=null 时不设置 aria-label', () => {
    render(
      <ActionIconBox title={null} data-testid="aib">
        <span>x</span>
      </ActionIconBox>,
    );
    expect(screen.getByTestId('aib')).not.toHaveAttribute('aria-label');
  });

  it('非 element 子节点 + iconStyle 时原样返回', () => {
    render(
      <ActionIconBox title="t" iconStyle={{ color: 'red' }} data-testid="aib">
        text
      </ActionIconBox>,
    );
    expect(screen.getByTestId('aib')).toHaveTextContent('text');
  });

  it('children 为函数时按 hover 渲染', () => {
    render(
      <ActionIconBox title="t" data-testid="aib-fn">
        {(hovered) => <span data-testid="child">{hovered ? 'h' : 'n'}</span>}
      </ActionIconBox>,
    );
    expect(screen.getByTestId('child')).toHaveTextContent('n');
  });
});
