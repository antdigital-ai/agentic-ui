/**
 * ThinkBlock 国际化测试
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { cnLabels, enLabels, I18nContext } from '../../../../src/I18n';
import { ThinkBlock } from '../../../../src/Plugins/code/components/ThinkBlock';

// Mock CodeNode for testing
const mockElement = {
  value: 'This is a thinking content',
  type: 'code' as const,
  language: 'think',
  children: [{ text: '' }] as [{ text: string }],
};

const mockLoadingElement = {
  value: 'This is a thinking content...',
  type: 'code' as const,
  language: 'think',
  children: [{ text: '' }] as [{ text: string }],
};

describe('ThinkBlock 国际化', () => {
  it('应该在中文环境下显示中文文本', () => {
    render(
      <I18nContext.Provider value={{ locale: cnLabels, language: 'zh-CN' }}>
        <ThinkBlock
          element={mockElement}
          attributes={{ 'data-slate-node': 'element' as const, ref: null }}
          // eslint-disable-next-line react/no-children-prop
          children={<span>children</span>}
        />
      </I18nContext.Provider>,
    );

    // 检查是否显示中文"深度思考"
    expect(screen.getByText('深度思考')).toBeInTheDocument();
  });

  it('应该在英文环境下显示英文文本', () => {
    render(
      <I18nContext.Provider value={{ locale: enLabels, language: 'en-US' }}>
        <ThinkBlock
          element={mockElement}
          attributes={{ 'data-slate-node': 'element' as const, ref: null }}
          // eslint-disable-next-line react/no-children-prop
          children={<span>children</span>}
        />
      </I18nContext.Provider>,
    );

    // 检查是否显示英文"Deep Thinking"
    expect(screen.getByText('Deep Thinking')).toBeInTheDocument();
  });

  it('应该在中文环境下显示加载状态的中文文本', () => {
    render(
      <I18nContext.Provider value={{ locale: cnLabels, language: 'zh-CN' }}>
        <ThinkBlock
          element={mockLoadingElement}
          attributes={{ 'data-slate-node': 'element' as const, ref: null }}
          // eslint-disable-next-line react/no-children-prop
          children={<span>children</span>}
        />
      </I18nContext.Provider>,
    );

    // 检查是否显示中文"深度思考..."
    expect(screen.getByText('深度思考...')).toBeInTheDocument();
  });

  it('应该在英文环境下显示加载状态的英文文本', () => {
    render(
      <I18nContext.Provider value={{ locale: enLabels, language: 'en-US' }}>
        <ThinkBlock
          element={mockLoadingElement}
          attributes={
            { 'data-slate-node': 'element' as const, ref: null }}
          // eslint-disable-next-line react/no-children-prop
          children={<span>children</span>}
        />
      </I18nContext.Provider>,
    );

    // 检查是否显示英文"Deep Thinking..."
    expect(screen.getByText('Deep Thinking...')).toBeInTheDocument();
  });

  it('应该在没有国际化上下文时使用默认中文', () => {
    render(
      // eslint-disable-next-line react/no-children-prop
      <ThinkBlock
        element={mockElement}
        attributes={{ 'data-slate-node': 'element' as const, ref: null }}
        // eslint-disable-next-line react/no-children-prop
        children={<span>children</span>}
      />,
    );

    // 应该显示默认的中文"深度思考"
    expect(screen.getByText('深度思考')).toBeInTheDocument();
  });

  it('应该在没有国际化上下文时使用默认中文（加载状态）', () => {
    render(
      <ThinkBlock
        element={mockLoadingElement}
        attributes={{ 'data-slate-node': 'element' as const, ref: null }}
        // eslint-disable-next-line react/no-children-prop
        children={<span>children</span>}
      />,
    );

    // 应该显示默认的中文"深度思考..."
    expect(screen.getByText('深度思考...')).toBeInTheDocument();
  });
});
