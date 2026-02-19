import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActionItemBox } from '../../src/Components/ActionItemBox';

describe('ActionItemBox 组件', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('在 ConfigProvider 下正确渲染并应用 prefixCls / useStyle / wrapSSR', () => {
    const onClick = vi.fn();

    render(
      <ConfigProvider>
        <ActionItemBox title="测试标题" onClick={onClick} />
      </ConfigProvider>,
    );

    expect(screen.getByText('测试标题')).toBeInTheDocument();
    fireEvent.click(screen.getByText('测试标题'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('挂载时调用 onInit 一次', () => {
    const onInit = vi.fn();
    const onClick = vi.fn();

    render(
      <ConfigProvider>
        <ActionItemBox title="测试" onClick={onClick} onInit={onInit} />
      </ConfigProvider>,
    );

    expect(onInit).toHaveBeenCalledTimes(1);
  });
});
