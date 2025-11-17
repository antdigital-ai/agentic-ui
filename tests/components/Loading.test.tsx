import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { Loading } from '../../src/Components/Loading';

describe('Loading 组件', () => {
  afterEach(() => {
    cleanup();
  });
  it('应该渲染加载组件', () => {
    render(<Loading />);

    expect(screen.getByTestId('lottie-animation')).toBeInTheDocument();
  });
});
