/**
 * Enlargement 组件测试
 */

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import Enlargement from '../../src/MarkdownInputField/Enlargement';

describe('Enlargement', () => {
  it('未放大时应显示放大标题和 ExpandAlt 图标', () => {
    render(<Enlargement isEnlarged={false} onEnlargeClick={vi.fn()} />);

    expect(screen.getByRole('button', { name: '放大' })).toBeInTheDocument();
  });

  it('放大时应显示缩小标题和 FoldAlt 图标', () => {
    render(<Enlargement isEnlarged={true} onEnlargeClick={vi.fn()} />);

    expect(screen.getByRole('button', { name: '缩小' })).toBeInTheDocument();
  });

  it('点击时应调用 onEnlargeClick', () => {
    const onEnlargeClick = vi.fn();
    render(<Enlargement isEnlarged={false} onEnlargeClick={onEnlargeClick} />);

    fireEvent.click(screen.getByRole('button', { name: '放大' }));

    expect(onEnlargeClick).toHaveBeenCalledTimes(1);
  });

  it('不传 isEnlarged 时默认为 false 并显示放大', () => {
    render(<Enlargement onEnlargeClick={vi.fn()} />);
    expect(screen.getByRole('button', { name: '放大' })).toBeInTheDocument();
  });
});
