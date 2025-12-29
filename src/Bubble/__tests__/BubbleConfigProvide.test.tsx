/**
 * BubbleConfigProvide 组件测试文件
 * 测试 BubbleConfigContext 的功能，特别是新增的 bubble 属性
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React, { useContext } from 'react';
import { describe, expect, it } from 'vitest';
import {
  BubbleConfigContext,
  ChatConfigType,
} from '../BubbleConfigProvide';
import { BubbleProps } from '../type';
import { cnLabels, enLabels } from '../../i18n/locales';

// 测试组件，用于获取 context 值
const TestComponent = () => {
  const context = useContext(BubbleConfigContext);
  return (
    <div>
      <div data-testid="standalone">{String(context?.standalone)}</div>
      <div data-testid="compact">{String(context?.compact)}</div>
      <div data-testid="locale-placeholder">
        {context?.locale?.['chat.inputArea.placeholder']}
      </div>
      <div data-testid="bubble-content">
        {context?.bubble?.originData?.content}
      </div>
      <div data-testid="bubble-uuid">{context?.bubble?.originData?.uuid}</div>
    </div>
  );
};

describe('BubbleConfigProvide', () => {
  describe('默认 locale 配置', () => {
    it('cnLabels 应该包含所有必需的 locale 键', () => {
      expect(cnLabels).toHaveProperty('chat.inputArea.placeholder');
      expect(cnLabels).toHaveProperty('chat.message.thinking');
      expect(cnLabels).toHaveProperty('chat.message.copy');
      expect(cnLabels['chat.inputArea.placeholder']).toBe('请输入问题');
      expect(cnLabels['chat.message.thinking']).toBe('思考中...');
    });

    it('enUS 应该包含所有必需的 locale 键', () => {
      expect(enLabels).toHaveProperty('chat.inputArea.placeholder');
      expect(enLabels).toHaveProperty('chat.message.thinking');
      expect(enLabels).toHaveProperty('chat.message.copy');
      expect(enLabels['chat.inputArea.placeholder']).toBe(
        'Please enter a question or "/" to get the template',
      );
      expect(enLabels['chat.message.thinking']).toBe('Thinking...');
    });
  });

  describe('BubbleConfigContext 功能', () => {
    it('应该提供默认的 context 值', () => {
      render(
        <BubbleConfigContext.Provider
          value={{
            standalone: false,
            locale: cnLabels,
          }}
        >
          <TestComponent />
        </BubbleConfigContext.Provider>,
      );

      expect(screen.getByTestId('standalone')).toHaveTextContent('false');
      expect(screen.getByTestId('locale-placeholder')).toHaveTextContent(
        '请输入问题',
      );
    });

    it('应该正确传递 bubble 属性', () => {
      const mockBubble: BubbleProps<{
        content: string;
        uuid: number;
      }> = {
        placement: 'left',
        originData: {
          content: '测试聊天内容',
          uuid: 12345,
          id: 'test-id',
          role: 'user',
          createAt: Date.now(),
          updateAt: Date.now(),
        },
      };

      const config: ChatConfigType = {
        standalone: true,
        compact: true,
        locale: cnLabels,
        bubble: mockBubble,
      };

      render(
        <BubbleConfigContext.Provider value={config}>
          <TestComponent />
        </BubbleConfigContext.Provider>,
      );

      expect(screen.getByTestId('standalone')).toHaveTextContent('true');
      expect(screen.getByTestId('compact')).toHaveTextContent('true');
      expect(screen.getByTestId('bubble-content')).toHaveTextContent(
        '测试聊天内容',
      );
      expect(screen.getByTestId('bubble-uuid')).toHaveTextContent('12345');
    });

    it('应该支持 thoughtChain 配置', () => {
      const config: ChatConfigType = {
        standalone: false,
        locale: enLabels,
        thoughtChain: {
          enable: true,
          alwaysRender: true,
          thoughtChainList: [],
          render: () => <div>Custom thought chain</div>,
        },
      };

      const context = config;
      expect(context.thoughtChain?.enable).toBe(true);
      expect(context.thoughtChain?.alwaysRender).toBe(true);
      expect(typeof context.thoughtChain?.render).toBe('function');
    });

    it('应该支持 tracert 配置', () => {
      const config: ChatConfigType = {
        standalone: false,
        locale: cnLabels,
        tracert: {
          enable: true,
        },
      };

      expect(config.tracert?.enable).toBe(true);
    });
  });

  describe('ChatConfigType 类型定义', () => {
    it('应该支持所有必需的属性', () => {
      const config: ChatConfigType = {
        agentId: 'test-agent',
        sessionId: 'test-session',
        standalone: true,
        compact: false,
        locale: cnLabels,
        bubble: {
          placement: 'right',
          originData: {
            content: 'test content',
            uuid: 999,
            id: 'test',
            role: 'assistant',
            createAt: Date.now(),
            updateAt: Date.now(),
          },
        },
        clientIdRef: { current: 'client-123' },
        thoughtChain: {
          enable: true,
          thoughtChainList: [],
        },
        tracert: {
          enable: false,
        },
      };

      expect(config.agentId).toBe('test-agent');
      expect(config.sessionId).toBe('test-session');
      expect(config.standalone).toBe(true);
      expect(config.compact).toBe(false);
      expect(config.bubble?.originData?.content).toBe('test content');
    });
  });
});
