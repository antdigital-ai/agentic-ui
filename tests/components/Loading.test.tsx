import { cleanup, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Loading } from '../../src/Components/Loading';
import { CreativeSparkLoading } from '../../src/Components/Loading/CreativeSparkLoading';

// Mock LoadingLottie
vi.mock('../../src/Components/lotties/LoadingLottie', () => ({
  LoadingLottie: ({ size, style, autoplay, loop, className }: any) => (
    <div
      data-testid="lottie-animation"
      data-size={size}
      data-autoplay={autoplay}
      data-loop={loop}
      className={className}
      style={style}
    />
  ),
}));

// Mock CreativeSparkLottie
vi.mock('../../src/Components/lotties/CreativeSparkLottie', () => ({
  CreativeSparkLottie: ({ size, style, autoplay, loop, className }: any) => (
    <div
      data-testid="creative-spark-lottie"
      data-size={size}
      data-autoplay={autoplay}
      data-loop={loop}
      className={className}
      style={style}
    />
  ),
}));

// Mock Progress component from antd
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    Progress: ({ percent, type, strokeColor, size, showInfo }: any) => (
      <div
        data-testid="progress-circle"
        data-percent={percent}
        data-type={type}
        data-size={size}
        data-show-info={showInfo}
        data-stroke-color={JSON.stringify(strokeColor)}
      />
    ),
  };
});

describe('Loading 组件', () => {
  afterEach(() => {
    cleanup();
  });

  describe('基础渲染', () => {
    it('应该渲染加载组件', () => {
      render(<Loading />);

      expect(screen.getByTestId('lottie-animation')).toBeInTheDocument();
    });

    it('应该使用默认尺寸 1em', () => {
      render(<Loading />);

      const lottie = screen.getByTestId('lottie-animation');
      const container = lottie.parentElement as HTMLElement;
      expect(container).toBeTruthy();
      expect(container).toHaveStyle({ fontSize: '1em' });
    });

    it('应该应用自定义类名', () => {
      const { container } = render(<Loading className="custom-loading" />);

      const loadingElement = container.querySelector(
        '[class*="loading"]',
      ) as HTMLElement;
      expect(loadingElement).toBeTruthy();
      expect(loadingElement).toBeInTheDocument();
      // 验证自定义类名是否被应用
      expect(loadingElement.className).toContain('custom-loading');
    });

    it('嵌套模式下应该应用自定义类名', () => {
      render(
        <Loading className="nested-custom-class">
          <div>Content</div>
        </Loading>,
      );

      // 在嵌套模式下，className 应用到内部的 loadingElement
      const lottie = screen.getByTestId('lottie-animation');
      const loadingElement = lottie.parentElement as HTMLElement;
      expect(loadingElement).toBeTruthy();
      expect(loadingElement.className).toContain('nested-custom-class');
    });

    it('应该应用自定义样式', () => {
      const customStyle = { margin: '20px', padding: '10px' };
      render(<Loading style={customStyle} />);

      // 获取加载元素的根容器（应用 style 的元素）
      const lottie = screen.getByTestId('lottie-animation');
      const container = lottie.parentElement as HTMLElement;
      expect(container).toBeTruthy();
      // 验证自定义样式是否被正确应用
      expect(container).toHaveStyle({
        margin: '20px',
        padding: '10px',
      });
    });

    it('嵌套模式下应该应用自定义样式', () => {
      const customStyle = { margin: '15px', padding: '5px' };
      render(
        <Loading style={customStyle}>
          <div>Content</div>
        </Loading>,
      );

      // 在嵌套模式下，style 应用到内部的 loadingElement
      const lottie = screen.getByTestId('lottie-animation');
      const loadingElement = lottie.parentElement as HTMLElement;
      expect(loadingElement).toBeTruthy();
      expect(loadingElement).toHaveStyle({
        margin: '15px',
        padding: '5px',
      });
    });

    it('style 的优先级应该高于 styles.root', () => {
      render(
        <Loading
          style={{ margin: '20px', padding: '10px' }}
          styles={{
            root: { margin: '30px', background: '#F8F9FA' },
          }}
        />,
      );

      const lottie = screen.getByTestId('lottie-animation');
      const container = lottie.parentElement as HTMLElement;
      // style 中的 margin 应该覆盖 styles.root 中的 margin
      expect(container).toHaveStyle({
        margin: '20px', // style 优先级更高
        padding: '10px',
        background: '#F8F9FA', // styles.root 中的其他样式仍然生效
      });
    });
  });

  describe('尺寸控制', () => {
    it('应该支持数字类型的 size', () => {
      render(<Loading size={64} />);

      const lottie = screen.getByTestId('lottie-animation');
      expect(lottie).toHaveAttribute('data-size', '64');
    });

    it('应该支持字符串类型的 size', () => {
      render(<Loading size="2rem" />);

      const lottie = screen.getByTestId('lottie-animation');
      expect(lottie).toHaveAttribute('data-size', '2rem');
    });

    it('嵌套模式下应该使用默认尺寸 32px', () => {
      render(
        <Loading>
          <div>Content</div>
        </Loading>,
      );

      const lottie = screen.getByTestId('lottie-animation');
      expect(lottie).toHaveAttribute('data-size', '32');
    });

    it('嵌套模式下应该优先使用自定义 size', () => {
      render(
        <Loading size={48}>
          <div>Content</div>
        </Loading>,
      );

      const lottie = screen.getByTestId('lottie-animation');
      expect(lottie).toHaveAttribute('data-size', '48');
    });
  });

  describe('提示文本', () => {
    it('应该显示提示文本', () => {
      render(<Loading tip="加载中..." />);

      expect(screen.getByText('加载中...')).toBeInTheDocument();
    });

    it('应该应用 tip 相关的类名', () => {
      const { container } = render(<Loading tip="加载中..." />);

      const tipElement = container.querySelector(
        '[class*="loading-with-tip"]',
      ) as HTMLElement;
      expect(tipElement).toBeTruthy();
      expect(tipElement).toBeInTheDocument();
    });

    it('应该支持 ReactNode 类型的 tip', () => {
      render(
        <Loading
          tip={
            <div>
              <span>自定义</span>
              <span>提示</span>
            </div>
          }
        />,
      );

      expect(screen.getByText('自定义')).toBeInTheDocument();
      expect(screen.getByText('提示')).toBeInTheDocument();
    });

    it('当 tip 为 false 时不应该显示提示', () => {
      render(<Loading tip={false} />);

      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
    });

    it('当 tip 为 null 时不应该显示提示', () => {
      render(<Loading tip={null} />);

      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
    });
  });

  describe('进度条模式', () => {
    it('应该显示进度条当设置了 percent', () => {
      render(<Loading percent={52} />);

      expect(screen.getByTestId('progress-circle')).toBeInTheDocument();
      expect(screen.getByTestId('progress-circle')).toHaveAttribute(
        'data-percent',
        '52',
      );
    });

    it('进度条应该隐藏信息显示', () => {
      render(<Loading percent={52} />);

      const progress = screen.getByTestId('progress-circle');
      expect(progress).toHaveAttribute('data-show-info', 'false');
    });

    it('当设置了 percent 但未设置 tip 时应该显示百分比文本', () => {
      render(<Loading percent={75} />);

      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('当同时设置了 percent 和 tip 时应该显示 tip 而不是百分比', () => {
      render(<Loading percent={75} tip="处理中..." />);

      expect(screen.getByText('处理中...')).toBeInTheDocument();
      expect(screen.queryByText('75%')).not.toBeInTheDocument();
    });

    it('当 percent 为 0 时应该显示 0%', () => {
      render(<Loading percent={0} />);

      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('当 percent 为 100 时应该显示 100%', () => {
      render(<Loading percent={100} />);

      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('自定义指示器', () => {
    it('应该使用自定义 indicator', () => {
      const CustomIndicator = () => (
        <div data-testid="custom-indicator">Custom</div>
      );

      render(<Loading indicator={<CustomIndicator />} />);

      expect(screen.getByTestId('custom-indicator')).toBeInTheDocument();
      expect(screen.queryByTestId('lottie-animation')).not.toBeInTheDocument();
    });

    it('应该支持使用 CreativeSparkLoading 作为 indicator', () => {
      render(<Loading indicator={<CreativeSparkLoading />} />);

      // CreativeSparkLoading 会被渲染
      expect(screen.getByTestId('creative-spark-lottie')).toBeInTheDocument();
    });
  });

  describe('嵌套模式', () => {
    it('应该启用嵌套模式当有 children 时', () => {
      const { container } = render(
        <Loading>
          <div data-testid="content">Content</div>
        </Loading>,
      );

      const nestedPattern = container.querySelector(
        '[class*="loading-nested-pattern"]',
      ) as HTMLElement;
      expect(nestedPattern).toBeTruthy();
      expect(nestedPattern).toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('嵌套模式下应该应用 with-children 类名', () => {
      const { container } = render(
        <Loading>
          <div>Content</div>
        </Loading>,
      );

      const withChildren = container.querySelector(
        '[class*="loading-with-children"]',
      ) as HTMLElement;
      expect(withChildren).toBeTruthy();
      expect(withChildren).toBeInTheDocument();
    });

    it('嵌套模式下应该渲染容器包裹 children', () => {
      const { container } = render(
        <Loading>
          <div data-testid="content">Content</div>
        </Loading>,
      );

      const loadingContainer = container.querySelector(
        '[class*="loading-container"]',
      ) as HTMLElement;
      expect(loadingContainer).toBeTruthy();
      expect(loadingContainer).toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('嵌套模式下应该同时显示加载动画和内容', () => {
      render(
        <Loading tip="加载中...">
          <div data-testid="content">Content</div>
        </Loading>,
      );

      expect(screen.getByTestId('lottie-animation')).toBeInTheDocument();
      expect(screen.getByText('加载中...')).toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  describe('样式定制', () => {
    it('应该支持通过 styles.root 定制根节点样式', () => {
      render(
        <Loading
          styles={{
            root: { background: '#F8F9FA', borderRadius: '8px' },
          }}
        />,
      );

      const lottie = screen.getByTestId('lottie-animation');
      const container = lottie.parentElement as HTMLElement;
      expect(container).toBeTruthy();
      expect(container).toHaveStyle({
        background: '#F8F9FA',
        borderRadius: '8px',
      });
    });

    it('应该支持通过 styles.tip 定制提示文本样式', () => {
      render(
        <Loading
          tip="加载中..."
          styles={{
            tip: { color: '#666', fontSize: '14px' },
          }}
        />,
      );

      const tip = screen.getByText('加载中...');
      expect(tip).toHaveStyle({ color: '#666', fontSize: '14px' });
    });

    it('应该支持通过 styles.wrapper 定制嵌套模式的包装器样式', () => {
      const { container } = render(
        <Loading
          styles={{
            wrapper: { padding: '20px' },
          }}
        >
          <div>Content</div>
        </Loading>,
      );

      const wrapper = container.querySelector(
        '[class*="loading-nested-pattern"]',
      ) as HTMLElement;
      expect(wrapper).toBeTruthy();
      expect(wrapper).toHaveStyle({ padding: '20px' });
    });
  });

  describe('ConfigProvider 集成', () => {
    it('应该使用 ConfigProvider 的 prefixCls', () => {
      const { container } = render(
        <ConfigProvider prefixCls="custom">
          <Loading />
        </ConfigProvider>,
      );

      expect(container.querySelector('.custom-loading')).toBeInTheDocument();
    });
  });

  describe('边界情况', () => {
    it('应该正确处理所有属性同时设置', () => {
      render(
        <Loading
          size={48}
          tip="处理中..."
          percent={60}
          className="custom-class"
          style={{ margin: '10px' }}
          styles={{
            root: { background: '#fff' },
            tip: { color: '#333' },
          }}
        >
          <div data-testid="content">Content</div>
        </Loading>,
      );

      // 当设置了 percent 时，会显示进度条而不是 lottie 动画
      expect(screen.getByTestId('progress-circle')).toBeInTheDocument();
      expect(screen.getByText('处理中...')).toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();

      // 验证 className 是否被应用到加载元素（在嵌套模式下，className 应用到内部的 loadingElement）
      const progress = screen.getByTestId('progress-circle');
      const loadingElement = progress.parentElement as HTMLElement;
      expect(loadingElement).toBeTruthy();
      expect(loadingElement.className).toContain('custom-class');

      // 验证 style 是否被应用（style 优先级高于 styles.root）
      expect(loadingElement).toHaveStyle({
        margin: '10px',
        background: '#fff', // styles.root 也会被应用
      });

      // 验证 styles.tip 是否被应用
      const tip = screen.getByText('处理中...');
      expect(tip).toHaveStyle({ color: '#333' });
    });

    it('当 percent 为 undefined 时不应该显示进度条', () => {
      render(<Loading percent={undefined} />);

      expect(screen.queryByTestId('progress-circle')).not.toBeInTheDocument();
    });

    it('当 percent 为 null 时不应该显示进度条', () => {
      render(<Loading percent={null as any} />);

      expect(screen.queryByTestId('progress-circle')).not.toBeInTheDocument();
    });
  });
});
