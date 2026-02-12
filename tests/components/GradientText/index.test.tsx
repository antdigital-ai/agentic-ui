import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { GradientText } from '../../../src/Components/GradientText';

describe('GradientText', () => {
  it('应正确渲染并应用 prefixCls、gradientStyle、wrapSSR', () => {
    render(
      <ConfigProvider>
        <GradientText>Hello Gradient</GradientText>
      </ConfigProvider>,
    );

    expect(screen.getByText('Hello Gradient')).toBeInTheDocument();
  });

  it('应支持自定义 colors 和 animationSpeed', () => {
    render(
      <ConfigProvider>
        <GradientText colors={['#ff0000', '#00ff00']} animationSpeed={5}>
          Custom
        </GradientText>
      </ConfigProvider>,
    );

    const content = screen.getByText('Custom').closest('div');
    expect(content).toHaveStyle({
      backgroundImage: 'linear-gradient(to right, #ff0000, #00ff00)',
      animationDuration: '5s',
    });
  });

  it('应支持传入 style 和 className', () => {
    const { container } = render(
      <ConfigProvider>
        <GradientText className="my-class" style={{ marginTop: 8 }}>
          Styled
        </GradientText>
      </ConfigProvider>,
    );

    const wrapper = container.querySelector('.my-class');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveStyle({ marginTop: 8 });
  });
});
