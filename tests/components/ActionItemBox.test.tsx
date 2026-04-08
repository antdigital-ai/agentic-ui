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

  it('渲染 size small/large/default 与 flex 样式', () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <ConfigProvider>
        <ActionItemBox title="Small" onClick={onClick} size="small" />
      </ConfigProvider>,
    );
    expect(screen.getByText('Small')).toBeInTheDocument();

    rerender(
      <ConfigProvider>
        <ActionItemBox title="Large" onClick={onClick} size="large" />
      </ConfigProvider>,
    );
    expect(screen.getByText('Large')).toBeInTheDocument();

    rerender(
      <ConfigProvider>
        <ActionItemBox title="Default" onClick={onClick} size="default" />
      </ConfigProvider>,
    );
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('渲染 icon 为 http URL 时使用 img', () => {
    render(
      <ConfigProvider>
        <ActionItemBox
          title="带图"
          onClick={() => {}}
          icon="http://example.com/icon.png"
        />
      </ConfigProvider>,
    );
    const img = document.querySelector('img[alt="action-box-icon"]');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'http://example.com/icon.png');
  });

  it('渲染 icon 为非 URL 字符串时使用 span', () => {
    render(
      <ConfigProvider>
        <ActionItemBox title="图标" onClick={() => {}} icon="🔧" />
      </ConfigProvider>,
    );
    expect(screen.getByText('🔧')).toBeInTheDocument();
  });

  it('支持 iconSize', () => {
    const { container } = render(
      <ConfigProvider>
        <ActionItemBox
          title="图标尺寸"
          onClick={() => {}}
          icon="x"
          iconSize={32}
        />
      </ConfigProvider>,
    );
    const iconWrap = container.querySelector('.ant-agentic-chat-action-item-box-icon');
    expect(iconWrap).toHaveStyle({ width: '32px', height: '32px' });
  });

  it('compact 时不渲染 icon 区域', () => {
    const { container } = render(
      <ConfigProvider>
        <ActionItemBox title="紧凑" onClick={() => {}} icon="i" compact />
      </ConfigProvider>,
    );
    const iconWrap = container.querySelector('.ant-agentic-chat-action-item-box-icon');
    expect(iconWrap).not.toBeInTheDocument();
  });

  it('有 description 时渲染描述且不 compact 时显示', () => {
    render(
      <ConfigProvider>
        <ActionItemBox
          title="标题"
          description="描述文案"
          onClick={() => {}}
        />
      </ConfigProvider>,
    );
    expect(screen.getByText('标题')).toBeInTheDocument();
    expect(screen.getByText('描述文案')).toBeInTheDocument();
  });

  it('compact 时不渲染 description', () => {
    render(
      <ConfigProvider>
        <ActionItemBox
          title="标题"
          description="描述"
          onClick={() => {}}
          compact
        />
      </ConfigProvider>,
    );
    expect(screen.getByText('标题')).toBeInTheDocument();
    expect(screen.queryByText('描述')).not.toBeInTheDocument();
  });

  it('standalone 时应用对应 class', () => {
    const { container } = render(
      <ConfigProvider>
        <ActionItemBox title="独立" onClick={() => {}} standalone />
      </ConfigProvider>,
    );
    expect(
      container.querySelector('.ant-agentic-chat-action-item-box-standalone'),
    ).toBeInTheDocument();
  });

  it('hoverBg 为 false 时不应用 hover-bg class', () => {
    const { container } = render(
      <ConfigProvider>
        <ActionItemBox title="无悬停" onClick={() => {}} hoverBg={false} />
      </ConfigProvider>,
    );
    expect(
      container.querySelector('.ant-agentic-chat-action-item-box-container-hover-bg'),
    ).not.toBeInTheDocument();
  });

  it('disabled 时点击不触发 onClick', () => {
    const onClick = vi.fn();
    render(
      <ConfigProvider>
        <ActionItemBox title="禁用" onClick={onClick} disabled />
      </ConfigProvider>,
    );
    fireEvent.click(screen.getByText('禁用'));
    expect(onClick).not.toHaveBeenCalled();
  });
});
