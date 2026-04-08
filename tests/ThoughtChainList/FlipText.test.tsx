/**
 * FlipText 组件测试 - 覆盖非 test 环境下的 motion 分支
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FlipText } from '../../src/ThoughtChainList/FlipText';

describe('FlipText', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('在 test 环境下应渲染简化内容', () => {
    render(<FlipText word="Hi" />);
    expect(screen.getByText('Hi')).toBeInTheDocument();
  });

  it('在非 test 环境下应渲染 motion 动画分支', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const { container } = render(<FlipText word="AB" />);
    expect(container.querySelector('.flex')).toBeInTheDocument();
    const spans = container.querySelectorAll('span');
    expect(spans.length).toBeGreaterThan(0);
  });
});
