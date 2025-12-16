/**
 * CostMillis 组件测试用例
 */

import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { I18nContext } from '../../src/I18n';
import { CostMillis } from '../../src/ThoughtChainList/CostMillis';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' }}>
    {children}
  </I18nContext.Provider>
);

describe('CostMillis', () => {
  describe('基本渲染', () => {
    it('应该在 costMillis 为 undefined 时返回 null', () => {
      const { container } = render(
        <TestWrapper>
          <CostMillis costMillis={undefined} />
        </TestWrapper>,
      );

      expect(container.firstChild).toBeNull();
    });

    it('应该渲染毫秒数（小于1000ms）', () => {
      render(
        <TestWrapper>
          <CostMillis costMillis={500} />
        </TestWrapper>,
      );

      expect(screen.getByText('500ms')).toBeInTheDocument();
    });

    it('应该渲染秒数（小于60秒）', () => {
      render(
        <TestWrapper>
          <CostMillis costMillis={1500} />
        </TestWrapper>,
      );

      expect(screen.getByText('1.5s')).toBeInTheDocument();
    });

    it('应该渲染分钟和秒（小于60分钟）', () => {
      render(
        <TestWrapper>
          <CostMillis costMillis={65000} />
        </TestWrapper>,
      );

      // 65秒 = 1分钟5秒
      expect(screen.getByText(/1m.*5s/)).toBeInTheDocument();
    });

    it('应该渲染小时、分钟和秒（小于24小时）', () => {
      render(
        <TestWrapper>
          <CostMillis costMillis={3665000} />
        </TestWrapper>,
      );

      // 3665秒 = 1小时1分钟5秒
      expect(screen.getByText(/1H.*1m.*5s/)).toBeInTheDocument();
    });

    it('应该渲染天、小时、分钟和秒（大于24小时）', () => {
      render(
        <TestWrapper>
          <CostMillis costMillis={90061000} />
        </TestWrapper>,
      );

      // 90061秒 = 1天1小时1分钟1秒
      expect(screen.getByText(/1D.*1H.*1m.*1s/)).toBeInTheDocument();
    });
  });

  describe('国际化支持', () => {
    it('应该使用自定义的国际化单位', () => {
      const customLocale = {
        seconds: '秒',
        minutes: '分钟',
        hours: '小时',
        days: '天',
      };

      render(
        <I18nContext.Provider
          value={{ locale: customLocale, language: 'zh-CN' }}
        >
          <CostMillis costMillis={1500} />
        </I18nContext.Provider>,
      );

      expect(screen.getByText('1.5秒')).toBeInTheDocument();
    });

    it('应该在 locale 为空时使用默认单位', () => {
      render(
        <I18nContext.Provider
          value={{ locale: null as any, language: 'zh-CN' }}
        >
          <CostMillis costMillis={1500} />
        </I18nContext.Provider>,
      );

      expect(screen.getByText('1.5s')).toBeInTheDocument();
    });
  });

  describe('Tooltip 功能', () => {
    it('应该正确渲染组件（包含 Tooltip 包装）', () => {
      render(
        <TestWrapper>
          <CostMillis costMillis={1500} />
        </TestWrapper>,
      );

      // 检查组件是否正确渲染，包含时间文本
      // Ant Design Tooltip 在测试环境中可能不会立即渲染 tooltip DOM
      expect(screen.getByText('1.5s')).toBeInTheDocument();
    });
  });

  describe('边界情况', () => {
    it('应该处理 0 毫秒', () => {
      render(
        <TestWrapper>
          <CostMillis costMillis={0} />
        </TestWrapper>,
      );

      expect(screen.getByText('0ms')).toBeInTheDocument();
    });

    it('应该处理 999 毫秒', () => {
      render(
        <TestWrapper>
          <CostMillis costMillis={999} />
        </TestWrapper>,
      );

      expect(screen.getByText('999ms')).toBeInTheDocument();
    });

    it('应该处理 1000 毫秒（正好1秒）', () => {
      render(
        <TestWrapper>
          <CostMillis costMillis={1000} />
        </TestWrapper>,
      );

      expect(screen.getByText('1.0s')).toBeInTheDocument();
    });

    it('应该处理 60000 毫秒（正好1分钟）', () => {
      render(
        <TestWrapper>
          <CostMillis costMillis={60000} />
        </TestWrapper>,
      );

      expect(screen.getByText(/1m.*0s/)).toBeInTheDocument();
    });

    it('应该处理 3600000 毫秒（正好1小时）', () => {
      render(
        <TestWrapper>
          <CostMillis costMillis={3600000} />
        </TestWrapper>,
      );

      expect(screen.getByText(/1H.*0m.*0s/)).toBeInTheDocument();
    });

    it('应该处理 86400000 毫秒（正好1天）', () => {
      render(
        <TestWrapper>
          <CostMillis costMillis={86400000} />
        </TestWrapper>,
      );

      expect(screen.getByText(/1D.*0H.*0m.*0s/)).toBeInTheDocument();
    });
  });
});
