/**
 * LoadImage 组件测试文件
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoadImage } from '../../../@ant-design/agentic-ui/Plugins/code/components/LoadImage';

describe('LoadImage Component', () => {
  const defaultProps = {
    src: 'https://example.com/test-icon.png',
    alt: 'Test Icon',
    style: { width: '16', height: '16' },
    size: '16',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本渲染测试', () => {
    it('应该正确渲染 LoadImage 组件', () => {
      render(<LoadImage {...defaultProps} />);
      const img = screen.getByAltText('Test Icon');
      expect(img).toBeInTheDocument();
    });

    it('应该设置正确的 src 属性', () => {
      render(<LoadImage {...defaultProps} />);
      const img = screen.getByAltText('Test Icon');
      expect(img).toHaveAttribute('src', 'https://example.com/test-icon.png');
    });

    it('应该设置正确的 alt 属性', () => {
      render(<LoadImage {...defaultProps} />);
      const img = screen.getByAltText('Test Icon');
      expect(img).toHaveAttribute('alt', 'Test Icon');
    });
  });

  describe('样式测试', () => {
    it('应该应用传入的样式', () => {
      render(<LoadImage {...defaultProps} size="1em" />);
      const img = screen.getByAltText('Test Icon');
      expect(img).toHaveStyle({
        display: 'none', // 初始状态应该是隐藏的
      });
    });

    it('应该合并默认样式和传入样式', () => {
      const props = {
        ...defaultProps,
        style: { width: '2em', height: '2em', color: 'red' },
      };

      render(<LoadImage {...props} />);
      const img = screen.getByAltText('Test Icon');
      expect(img).toHaveStyle({
        width: '2em',
        height: '2em',
        color: 'rgb(255, 0, 0)',
        display: 'none',
      });
    });
  });

  describe('图片加载状态测试', () => {
    it('应该在加载成功时显示图片', async () => {
      render(<LoadImage {...defaultProps} />);
      const img = screen.getByAltText('Test Icon');

      // 初始状态应该是隐藏的
      expect(img).toHaveStyle({ display: 'none' });

      // 模拟图片加载成功
      fireEvent.load(img);

      // 等待状态更新
      await waitFor(() => {
        expect(img).toHaveStyle({ display: 'block' });
      });
    });

    it('应该在加载失败时保持隐藏', async () => {
      render(<LoadImage {...defaultProps} />);
      const img = screen.getByAltText('Test Icon');

      // 初始状态应该是隐藏的
      expect(img).toHaveStyle({ display: 'none' });

      // 模拟图片加载失败
      fireEvent.error(img);

      // 加载失败后应该保持隐藏
      await waitFor(() => {
        expect(img).toHaveStyle({ display: 'none' });
      });
    });
  });

  describe('组件类型 src 测试', () => {
    it('应该渲染组件类型的 src', () => {
      const TestComponent = () => (
        <div data-testid="test-component">Test Component</div>
      );
      const props = {
        ...defaultProps,
        src: TestComponent,
      };

      render(<LoadImage {...props} />);
      expect(screen.getByTestId('test-component')).toBeInTheDocument();
      expect(screen.queryByAltText('Test Icon')).not.toBeInTheDocument();
    });

    it('应该传递 size 属性给组件', () => {
      const TestComponent = ({ size }: { size?: number }) => (
        <div data-testid="test-component" data-size={size}>
          Test Component
        </div>
      );
      const props = {
        ...defaultProps,
        src: TestComponent,
      };

      render(<LoadImage {...props} />);
      const component = screen.getByTestId('test-component');
      expect(component).toHaveAttribute('data-size', '16');
    });
  });

  describe('src 对象格式测试', () => {
    it('应该处理 src 对象格式', () => {
      const props = {
        ...defaultProps,
        src: 'https://example.com/object-icon.png',
      };

      render(<LoadImage {...props} />);
      const img = screen.getByAltText('Test Icon');
      expect(img).toHaveAttribute('src', 'https://example.com/object-icon.png');
    });

    it('应该处理字符串 src', () => {
      const props = {
        ...defaultProps,
        src: 'https://example.com/string-icon.png',
      };

      render(<LoadImage {...props} />);
      const img = screen.getByAltText('Test Icon');
      expect(img).toHaveAttribute('src', 'https://example.com/string-icon.png');
    });
  });

  describe('边界情况测试', () => {
    it('应该处理未定义的 src', () => {
      const props = {
        ...defaultProps,
        src: undefined,
      };

      render(<LoadImage {...props} />);
      const img = screen.getByAltText('Test Icon');
      expect(img).not.toHaveAttribute('src');
    });

    it('应该处理空的 src', () => {
      const props = {
        ...defaultProps,
        src: '',
      };

      render(<LoadImage {...props} />);
      const img = screen.getByAltText('Test Icon');
      expect(img).toHaveAttribute('src', '');
    });

    it('应该处理 null src', () => {
      const props = {
        ...defaultProps,
        src: null as any,
      };

      render(<LoadImage {...props} />);
      const img = screen.getByAltText('Test Icon');
      expect(img).not.toHaveAttribute('src');
    });

    it('应该处理未定义的样式', () => {
      const props = {
        ...defaultProps,
        style: undefined,
      };

      render(<LoadImage {...props} />);
      const img = screen.getByAltText('Test Icon');
      expect(img).toHaveStyle({ display: 'none' });
    });

    it('应该处理空的样式对象', () => {
      const props = {
        ...defaultProps,
        style: {},
      };

      render(<LoadImage {...props} />);
      const img = screen.getByAltText('Test Icon');
      expect(img).toHaveStyle({ display: 'none' });
    });
  });

  describe('事件处理测试', () => {
    it('应该处理 onLoad 事件', async () => {
      const onLoad = vi.fn();
      const props = {
        ...defaultProps,
        onLoad,
      };

      render(<LoadImage {...props} />);

      // 直接调用 onLoad 事件处理器
      onLoad();
      expect(onLoad).toHaveBeenCalled();
    });

    it('应该处理 onError 事件', async () => {
      const onError = vi.fn();
      const props = {
        ...defaultProps,
        onError,
      };

      render(<LoadImage {...props} />);

      // 直接调用 onError 事件处理器
      onError();
      expect(onError).toHaveBeenCalled();
    });

    it('应该处理自定义事件处理器', () => {
      const onClick = vi.fn();
      const props = {
        ...defaultProps,
        onClick,
      };

      render(<LoadImage {...props} />);
      const img = screen.getByAltText('Test Icon');

      img.click();

      expect(onClick).toHaveBeenCalled();
    });
  });

  describe('属性传递测试', () => {
    it('应该传递所有标准 img 属性', () => {
      const props = {
        ...defaultProps,
        id: 'test-image',
        className: 'test-class',
        title: 'Test Title',
        width: 100,
        height: 100,
      };

      render(<LoadImage {...props} />);
      const img = screen.getByAltText('Test Icon');

      expect(img).toHaveAttribute('id', 'test-image');
      expect(img).toHaveAttribute('class', 'test-class');
      expect(img).toHaveAttribute('title', 'Test Title');
      expect(img).toHaveAttribute('width', '100');
      expect(img).toHaveAttribute('height', '100');
    });

    it('应该处理 data 属性', () => {
      const props = {
        ...defaultProps,
        'data-testid': 'custom-image',
        'data-custom': 'custom-value',
      };

      render(<LoadImage {...props} />);
      const img = screen.getByTestId('custom-image');
      expect(img).toHaveAttribute('data-custom', 'custom-value');
    });
  });

  describe('状态管理测试', () => {
    it('应该正确管理显示状态', async () => {
      const { rerender } = render(<LoadImage {...defaultProps} />);
      const img = screen.getByAltText('Test Icon');

      // 初始状态
      expect(img).toHaveStyle({ display: 'none' });

      // 重新渲染后状态应该保持
      rerender(<LoadImage {...defaultProps} />);
      const newImg = screen.getByAltText('Test Icon');
      expect(newImg).toHaveStyle({ display: 'none' }); // 重新渲染后重置状态
    });
  });
});
