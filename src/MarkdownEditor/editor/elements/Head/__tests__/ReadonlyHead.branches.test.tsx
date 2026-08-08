/**
 * ReadonlyHead：Node.string 空时 data-head 与 empty class。
 */
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { ReadonlyHead } from '../ReadonlyHead';

describe('ReadonlyHead branches', () => {
  it('空标题时 data-head 为空串且带 empty 类', () => {
    const { container } = render(
      <ReadonlyHead
        attributes={{ 'data-slate-node': 'element' } as any}
        element={
          {
            type: 'head',
            level: 2,
            children: [{ text: '' }],
          } as any
        }
      >
        <span />
      </ReadonlyHead>,
    );
    const head = container.querySelector('h2');
    expect(head).toHaveAttribute('data-head', '');
    expect(head).toHaveClass('empty');
  });
});
