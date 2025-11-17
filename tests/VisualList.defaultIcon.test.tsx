import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { VisualList, VisualListItem } from '../src/Components/VisualList';

describe('VisualList 默认图标测试', () => {
  afterEach(() => {
    cleanup();
  });
  const mockData: VisualListItem[] = [
    {
      id: '1',
      src: '', // 空字符串，直接触发默认图标
      alt: '测试图片',
      title: '测试标题',
    },
    {
      id: '2',
      src: 'https://via.placeholder.com/100x100', // 有效URL
      alt: '有效图片',
      title: '有效标题',
    },
  ];

  it('应该显示默认图标当图片src为空时', () => {
    render(<VisualList data={mockData} />);

    const defaultIconContainer = document.querySelector(
      '.visual-list-default-icon',
    );
    expect(defaultIconContainer).toBeInTheDocument();
  });

  it('应该正确渲染有效图片', () => {
    render(<VisualList data={[mockData[1]]} />);

    const image = screen.getByAltText('有效图片');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://via.placeholder.com/100x100');
  });

  it('默认图标应该适应圆形形状', () => {
    render(<VisualList data={[mockData[0]]} shape="circle" />);

    const defaultIconContainer = document.querySelector(
      '.visual-list-default-icon',
    );
    expect(defaultIconContainer).toBeInTheDocument();
    expect(defaultIconContainer).toHaveStyle('border-radius: 50%'); // 圆形模式下应该是50%
  });
});
