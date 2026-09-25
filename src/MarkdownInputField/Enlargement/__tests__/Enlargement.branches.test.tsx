/**
 * Enlargement：isEnlarged 文案与图标分支。
 */
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import Enlargement from '../index';

describe('Enlargement branches', () => {
  it('默认放大态文案', () => {
    render(<Enlargement />);
    expect(screen.getByLabelText('放大')).toBeTruthy();
    expect(screen.getByTestId('action-icon-box')).toHaveAttribute(
      'data-title',
      '放大',
    );
  });

  it('缩小态文案与点击', () => {
    const onClick = vi.fn();
    render(<Enlargement isEnlarged onEnlargeClick={onClick} />);
    expect(screen.getByLabelText('缩小')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('缩小'));
    expect(onClick).toHaveBeenCalled();
  });
});
