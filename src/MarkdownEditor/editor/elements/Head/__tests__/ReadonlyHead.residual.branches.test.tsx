import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { ReadonlyHead } from '../ReadonlyHead';

describe('ReadonlyHead residual branches', () => {
  it('renders alignment, slug attributes, and empty headings', () => {
    const { rerender } = render(
      <ReadonlyHead
        attributes={{}}
        element={{ type: 'head', level: 2, align: 'center', children: [{ text: 'Hello World' }] } as any}
      >
        Hello World
      </ReadonlyHead>,
    );
    expect(screen.getByRole('heading', { level: 2 })).toHaveAttribute('data-align', 'center');
    rerender(
      <ReadonlyHead attributes={{}} element={{ type: 'head', level: 3, children: [{ text: '' }] } as any}>
        {''}
      </ReadonlyHead>,
    );
    expect(screen.getByRole('heading', { level: 3 })).toHaveClass('empty');
  });
});
