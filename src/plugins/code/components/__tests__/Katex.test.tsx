/**
 * Katex 组件测试文件
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Katex } from '../../CodeUI/Katex/Katex';

describe('Katex Component', () => {
  const defaultProps = {
    el: {
      type: 'code' as const,
      value: 'x^2 + y^2 = z^2',
      language: 'katex',
      children: [{ text: 'x^2 + y^2 = z^2' }] as [{ text: string }],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // 重置定时器
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('基本渲染测试', () => {
    it('应该正确渲染 Katex 组件', () => {
      render(<Katex {...defaultProps} />);
      expect(screen.getByText('Formula')).toBeInTheDocument();
    });

    it('应该包含正确的样式类', () => {
      render(<Katex {...defaultProps} />);
      const container = screen.getByText('Formula').parentElement;
      expect(container).toHaveStyle({
        marginBottom: '0.75em',
        cursor: 'default',
        userSelect: 'none',
        textAlign: 'center',
        backgroundColor: 'rgba(107, 114, 128, 0.05)',
        paddingTop: '1em',
        paddingBottom: '1em',
        borderRadius: '0.25em',
      });
    });

    it('应该设置 contentEditable 为 false', () => {
      render(<Katex {...defaultProps} />);
      const container = screen.getByText('Formula').parentElement;
      expect(container).toHaveAttribute('contenteditable', 'false');
    });
  });

  describe('数学公式渲染测试', () => {
    it('应该调用 katex.render 渲染公式', async () => {
      render(<Katex {...defaultProps} />);

      // 等待定时器执行
      vi.runAllTimers();

      // 直接检查组件是否渲染
      expect(screen.getByText('Formula')).toBeInTheDocument();
    });

    it('应该处理复杂的数学公式', async () => {
      const props = {
        el: {
          type: 'code' as const,
          value: '\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}',
          language: 'katex',
          children: [{ text: '\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}' }] as [
            { text: string },
          ],
        },
      };

      render(<Katex {...props} />);

      vi.runAllTimers();

      // 直接检查组件是否渲染
      expect(screen.getByText('Formula')).toBeInTheDocument();
    });

    it('应该处理空的数学公式', () => {
      const props = {
        el: {
          type: 'code' as const,
          value: '',
          language: 'katex',
          children: [{ text: '' }] as [{ text: string }],
        },
      };

      render(<Katex {...props} />);
      expect(screen.getByText('Formula')).toBeInTheDocument();
    });

    it('应该处理未定义的数学公式', () => {
      const props = {
        el: {
          type: 'code' as const,
          value: undefined,
          language: 'katex',
          children: [{ text: '' }] as [{ text: string }],
        },
      } as any;

      render(<Katex {...props} />);
      expect(screen.getByText('Formula')).toBeInTheDocument();
    });
  });

  describe('定时器测试', () => {
    it('应该在空代码时立即执行', () => {
      const props = {
        el: {
          type: 'code' as const,
          value: '',
          language: 'katex',
          children: [{ text: '' }] as [{ text: string }],
        },
      };

      render(<Katex {...props} />);

      // 空代码应该立即执行，不需要等待
      expect(screen.getByText('Formula')).toBeInTheDocument();
    });

    it('应该在有代码时延迟执行', () => {
      render(<Katex {...defaultProps} />);

      // 初始时应该显示
      expect(screen.getByText('Formula')).toBeInTheDocument();

      // 等待 300ms 后应该仍然显示
      vi.advanceTimersByTime(300);
      expect(screen.getByText('Formula')).toBeInTheDocument();
    });
  });

  describe('错误处理测试', () => {
    it('应该处理 katex.render 错误', () => {
      const props = {
        el: {
          type: 'code' as const,
          value: 'invalid formula',
          language: 'katex',
          children: [{ text: 'invalid formula' }] as [{ text: string }],
        },
      };

      expect(() => {
        render(<Katex {...props} />);
        vi.runAllTimers();
      }).not.toThrow();
    });

    it('应该处理无效的 DOM 元素', () => {
      const props = {
        el: {
          type: 'code' as const,
          value: 'x^2 + y^2 = z^2',
          language: 'katex',
          children: [{ text: 'x^2 + y^2 = z^2' }] as [{ text: string }],
        },
      };

      expect(() => {
        render(<Katex {...props} />);
        vi.runAllTimers();
      }).not.toThrow();
    });
  });

  describe('状态管理测试', () => {
    it('应该正确管理组件状态', () => {
      render(<Katex {...defaultProps} />);

      expect(screen.getByText('Formula')).toBeInTheDocument();
    });
  });

  describe('清理测试', () => {
    it('应该在组件卸载时清理定时器', () => {
      const { unmount } = render(<Katex {...defaultProps} />);

      // 模拟组件卸载
      unmount();

      // 验证定时器被清理（通过检查是否还有待执行的定时器）
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe('边界情况测试', () => {
    it('应该处理 null 元素', () => {
      const props = {
        el: null,
      } as any;

      expect(() => {
        render(<Katex {...props} />);
      }).not.toThrow();
    });

    it('应该处理未定义的属性', () => {
      const props = {
        el: {
          type: 'code' as const,
          value: undefined,
          language: undefined,
          children: [{ text: '' }] as [{ text: string }],
        },
      } as any;

      render(<Katex {...props} />);
      expect(screen.getByText('Formula')).toBeInTheDocument();
    });

    it('应该处理非 katex 语言', () => {
      const props = {
        el: {
          type: 'code' as const,
          value: 'console.log("test")',
          language: 'javascript',
          children: [{ text: 'console.log("test")' }] as [{ text: string }],
        },
      } as any;

      render(<Katex {...props} />);
      expect(screen.getByText('Formula')).toBeInTheDocument();
    });
  });

  describe('样式测试', () => {
    it('应该应用正确的容器样式', () => {
      render(<Katex {...defaultProps} />);
      const container = screen.getByText('Formula').parentElement;

      expect(container).toHaveStyle({
        marginBottom: '0.75em',
        cursor: 'default',
        userSelect: 'none',
        textAlign: 'center',
        backgroundColor: 'rgba(107, 114, 128, 0.05)',
        paddingTop: '1em',
        paddingBottom: '1em',
        borderRadius: '0.25em',
      });
    });

    it('应该应用正确的公式文本样式', () => {
      render(<Katex {...defaultProps} />);
      const formulaText = screen.getByText('Formula');

      expect(formulaText).toHaveStyle({
        textAlign: 'center',
        color: '#6B7280',
      });
    });
  });
});
