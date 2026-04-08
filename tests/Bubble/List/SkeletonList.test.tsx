import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import SkeletonList from '../../../src/Bubble/List/SkeletonList';

describe('SkeletonList', () => {
  it('应渲染骨架屏列表', () => {
    const { container } = render(<SkeletonList />);
    expect(container.querySelector('.ant-flex')).toBeInTheDocument();
    expect(container.querySelectorAll('.ant-skeleton')).toHaveLength(2);
  });
});
