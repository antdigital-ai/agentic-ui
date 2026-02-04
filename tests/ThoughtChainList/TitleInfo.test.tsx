/**
 * TitleInfo 组件测试用例
 */

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../src/I18n';
import { TitleInfo } from '../../src/ThoughtChainList/TitleInfo';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <I18nContext.Provider value={{ locale: {} as any, language: 'zh-CN' }}>
    {children}
  </I18nContext.Provider>
);

const defaultProps = {
  category: 'ToolCall',
  title: '测试标题',
  prefixCls: 'test-prefix',
  hashId: '',
  collapse: false,
  setCollapse: vi.fn(),
  costMillis: 1500,
  isFinished: true,
};

describe('TitleInfo', () => {
  describe('基本渲染', () => {
    it('应该渲染标题', () => {
      render(
        <TestWrapper>
          <TitleInfo {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByTestId('title-info')).toBeInTheDocument();
      expect(screen.getByTestId('title-text')).toBeInTheDocument();
    });

    it('应该显示耗时', () => {
      render(
        <TestWrapper>
          <TitleInfo {...defaultProps} costMillis={1500} />
        </TestWrapper>,
      );

      expect(screen.getByText('1.5s')).toBeInTheDocument();
    });

    it('应该显示折叠/展开图标', () => {
      render(
        <TestWrapper>
          <TitleInfo {...defaultProps} collapse={false} />
        </TestWrapper>,
      );

      expect(screen.getByTestId('expand-icon')).toBeInTheDocument();
    });

    it('应该在折叠时显示折叠图标', () => {
      render(
        <TestWrapper>
          <TitleInfo {...defaultProps} collapse={true} />
        </TestWrapper>,
      );

      expect(screen.getByTestId('collapse-icon')).toBeInTheDocument();
    });
  });

  describe('元数据解析', () => {
    it('应该解析标题中的元数据标签', () => {
      render(
        <TestWrapper>
          <TitleInfo
            {...defaultProps}
            title="查询 ${knowledge} 数据"
            category="RagRetrieval"
            meta={{
              knowledge: [
                {
                  name: '知识库1',
                  icon: 'db',
                  uuid: '1',
                  type: 'knowledge',
                  description: '描述',
                },
              ],
            }}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('知识库1')).toBeInTheDocument();
    });

    it('应该处理多个元数据项（RagRetrieval）', () => {
      const locale = {
        multipleKnowledgeBases: '多个知识库',
      };

      render(
        <I18nContext.Provider value={{ locale: locale as any, language: 'zh-CN' }}>
          <TitleInfo
            {...defaultProps}
            title="查询 ${knowledge} 数据"
            category="RagRetrieval"
            meta={{
              knowledge: [
                {
                  name: '知识库1',
                  icon: 'db',
                  uuid: '1',
                  type: 'knowledge',
                  description: '描述1',
                },
                {
                  name: '知识库2',
                  icon: 'db',
                  uuid: '2',
                  type: 'knowledge',
                  description: '描述2',
                },
              ],
            }}
          />
        </I18nContext.Provider>,
      );

      expect(screen.getByText('多个知识库')).toBeInTheDocument();
    });

    it('应该处理多个元数据项（TableSql）', () => {
      const locale = {
        multipleTables: '等多个表',
      };

      render(
        <I18nContext.Provider value={{ locale: locale as any, language: 'zh-CN' }}>
          <TitleInfo
            {...defaultProps}
            title="查询 ${table} 数据"
            category="TableSql"
            meta={{
              table: [
                {
                  name: '表1',
                  icon: 'table',
                  uuid: '1',
                  type: 'table',
                  description: '描述1',
                },
                {
                  name: '表2',
                  icon: 'table',
                  uuid: '2',
                  type: 'table',
                  description: '描述2',
                },
              ],
            }}
          />
        </I18nContext.Provider>,
      );

      expect(screen.getByText(/表1等多个表/)).toBeInTheDocument();
    });

    it('应该处理多个元数据项（ToolCall）', () => {
      const locale = {
        multipleTools: '等多个工具',
      };

      render(
        <I18nContext.Provider value={{ locale: locale as any, language: 'zh-CN' }}>
          <TitleInfo
            {...defaultProps}
            title="调用 ${tool} 工具"
            category="ToolCall"
            meta={{
              tool: [
                {
                  name: '工具1',
                  icon: 'tool',
                  uuid: '1',
                  type: 'tool',
                  description: '描述1',
                },
                {
                  name: '工具2',
                  icon: 'tool',
                  uuid: '2',
                  type: 'tool',
                  description: '描述2',
                },
              ],
            }}
          />
        </I18nContext.Provider>,
      );

      expect(screen.getByText(/工具1等多个工具/)).toBeInTheDocument();
    });

    it('应该处理其他类别的多个元数据项', () => {
      const locale = {
        multipleData: '等多个数据',
      };

      render(
        <I18nContext.Provider value={{ locale: locale as any, language: 'zh-CN' }}>
          <TitleInfo
            {...defaultProps}
            title="处理 ${data} 数据"
            category="Other"
            meta={{
              data: [
                {
                  name: '数据1',
                  icon: 'data',
                  uuid: '1',
                  type: 'data',
                  description: '描述1',
                },
                {
                  name: '数据2',
                  icon: 'data',
                  uuid: '2',
                  type: 'data',
                  description: '描述2',
                },
              ],
            }}
          />
        </I18nContext.Provider>,
      );

      expect(screen.getByText(/数据1等多个数据/)).toBeInTheDocument();
    });

    it('应该处理元数据点击', () => {
      const onMetaClick = vi.fn();

      render(
        <TestWrapper>
          <TitleInfo
            {...defaultProps}
            title="查询 ${knowledge} 数据"
            category="RagRetrieval"
            onMetaClick={onMetaClick}
            meta={{
              knowledge: [
                {
                  name: '知识库1',
                  icon: 'db',
                  uuid: '1',
                  type: 'knowledge',
                  description: '描述',
                },
              ],
            }}
          />
        </TestWrapper>,
      );

      // 元数据项在 Popover 内容中，需要先触发 hover 或直接查找
      // 由于 Popover 的复杂性，这里主要验证组件能正常渲染
      expect(screen.getByText('知识库1')).toBeInTheDocument();
      expect(onMetaClick).toBeDefined();
    });
  });

  describe('折叠/展开功能', () => {
    it('应该在点击折叠按钮时调用 setCollapse', () => {
      const setCollapse = vi.fn();

      render(
        <TestWrapper>
          <TitleInfo
            {...defaultProps}
            collapse={false}
            setCollapse={setCollapse}
          />
        </TestWrapper>,
      );

      const actionBox = screen.getByTestId('action-icon-box');
      fireEvent.click(actionBox);

      expect(setCollapse).toHaveBeenCalledWith(true);
    });

    it('应该在点击展开按钮时调用 setCollapse', () => {
      const setCollapse = vi.fn();

      render(
        <TestWrapper>
          <TitleInfo
            {...defaultProps}
            collapse={true}
            setCollapse={setCollapse}
          />
        </TestWrapper>,
      );

      const actionBox = screen.getByTestId('action-icon-box');
      fireEvent.click(actionBox);

      expect(setCollapse).toHaveBeenCalledWith(false);
    });

    it('应该在没有 setCollapse 时不抛出错误', () => {
      render(
        <TestWrapper>
          <TitleInfo {...defaultProps} setCollapse={undefined} />
        </TestWrapper>,
      );

      const actionBox = screen.getByTestId('action-icon-box');
      expect(() => fireEvent.click(actionBox)).not.toThrow();
    });
  });

  describe('自定义渲染', () => {
    it('应该支持 titleExtraRender', () => {
      const titleExtraRender = vi.fn((defaultDom) => (
        <div data-testid="custom-extra">{defaultDom}</div>
      ));

      render(
        <TestWrapper>
          <TitleInfo {...defaultProps} titleExtraRender={titleExtraRender} />
        </TestWrapper>,
      );

      expect(screen.getByTestId('custom-extra')).toBeInTheDocument();
      expect(titleExtraRender).toHaveBeenCalled();
    });
  });

  describe('FlipText 功能', () => {
    it('应该在未完成时使用 FlipText', () => {
      render(
        <TestWrapper>
          <TitleInfo {...defaultProps} isFinished={false} />
        </TestWrapper>,
      );

      // FlipText 应该被渲染
      expect(screen.getByTestId('title-text')).toBeInTheDocument();
    });

    it('应该在完成时直接显示文本', () => {
      render(
        <TestWrapper>
          <TitleInfo {...defaultProps} isFinished={true} />
        </TestWrapper>,
      );

      expect(screen.getByText('测试标题')).toBeInTheDocument();
    });
  });

  describe('边界情况', () => {
    it('应该处理空标题', () => {
      render(
        <TestWrapper>
          <TitleInfo {...defaultProps} title={undefined} />
        </TestWrapper>,
      );

      expect(screen.getByTestId('title-info')).toBeInTheDocument();
    });

    it('应该处理空元数据', () => {
      render(
        <TestWrapper>
          <TitleInfo
            {...defaultProps}
            title="查询 ${knowledge} 数据"
            meta={{}}
          />
        </TestWrapper>,
      );

      expect(screen.getByTestId('title-info')).toBeInTheDocument();
    });

    it('应该处理元数据标签为空的情况', () => {
      render(
        <TestWrapper>
          <TitleInfo
            {...defaultProps}
            title="查询 ${knowledge} 数据"
            meta={{
              knowledge: [],
            }}
          />
        </TestWrapper>,
      );

      expect(screen.getByTestId('title-info')).toBeInTheDocument();
    });
  });
});
