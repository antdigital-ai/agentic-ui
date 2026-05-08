/**
 * TopOperatingArea 组件测试
 */
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import TopOperatingArea from '../../src/MarkdownInputField/TopOperatingArea';
import { ConfigProvider } from 'antd';

describe('TopOperatingArea', () => {
  it('应渲染默认结构', () => {
    const { container } = render(
      <ConfigProvider>
        <TopOperatingArea />
      </ConfigProvider>,
    );
    expect(container.querySelector('.ant-agentic-top-operating-area')).toBeInTheDocument();
  });

  it('传入 targetRef 时应将 target 传给 BackTo', () => {
    const targetRef = React.createRef<HTMLDivElement>();
    const { container } = render(
      <ConfigProvider>
        <TopOperatingArea isShowBackTo targetRef={targetRef} />
      </ConfigProvider>,
    );
    expect(container.querySelector('.ant-agentic-top-operating-area')).toBeInTheDocument();
  });
});
