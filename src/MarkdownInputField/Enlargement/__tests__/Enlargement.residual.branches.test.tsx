/**
 * Enlargement residual：放大/缩小文案与点击（locale 覆盖）。
 */
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import Enlargement from '../index';

vi.mock('../../../I18n', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../I18n')>();
  return {
    ...actual,
    useLocale: () => ({ enlarge: 'Enlarge', shrink: 'Shrink' }),
  };
});

describe('Enlargement residual branches', () => {
  it('locale 放大文案；点击回调', () => {
    const onEnlargeClick = vi.fn();
    render(<Enlargement onEnlargeClick={onEnlargeClick} />);
    fireEvent.click(screen.getByLabelText('Enlarge'));
    expect(onEnlargeClick).toHaveBeenCalled();
  });

  it('isEnlarged 显示缩小文案', () => {
    render(<Enlargement isEnlarged />);
    expect(screen.getByLabelText('Shrink')).toBeTruthy();
  });
});
