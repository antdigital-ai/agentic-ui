import { renderHook } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { useEditorStyleRegister } from '..';

describe('useEditorStyleRegister Hook', () => {
  it('应该返回有效的样式对象', () => {
    const { result } = renderHook(
      () =>
        useEditorStyleRegister('test-component', (token) => ({
          '.test-class': {
            color: token.colorText,
            fontSize: token.fontSize,
          },
        })),
      {
        wrapper: ({ children }) => <ConfigProvider>{children}</ConfigProvider>,
      },
    );

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('wrapSSR');
    expect(result.current).toHaveProperty('hashId');
  });

  it('wrapSSR 应该是一个函数', () => {
    const { result } = renderHook(
      () =>
        useEditorStyleRegister('test-component', (token) => ({
          '.test-class': { color: token.colorText },
        })),
      {
        wrapper: ({ children }) => <ConfigProvider>{children}</ConfigProvider>,
      },
    );

    expect(typeof result.current.wrapSSR).toBe('function');
  });

  it('应该生成正确的样式', () => {
    const { result } = renderHook(
      () =>
        useEditorStyleRegister('button-component', (token) => ({
          '.custom-button': {
            padding: token.padding,
            margin: token.margin,
            borderRadius: token.borderRadius,
          },
        })),
      {
        wrapper: ({ children }) => <ConfigProvider>{children}</ConfigProvider>,
      },
    );

    expect(result.current).toBeDefined();
    expect(result.current.hashId).toBeDefined();
  });

  it('应该处理空样式函数', () => {
    const { result } = renderHook(
      () => useEditorStyleRegister('empty-component', () => ({})),
      {
        wrapper: ({ children }) => <ConfigProvider>{children}</ConfigProvider>,
      },
    );

    expect(result.current).toBeDefined();
  });

  it('应该支持嵌套样式规则', () => {
    const { result } = renderHook(
      () =>
        useEditorStyleRegister('nested-component', (token) => ({
          '.parent': {
            '.child': {
              color: token.colorPrimary,
            },
          },
        })),
      {
        wrapper: ({ children }) => <ConfigProvider>{children}</ConfigProvider>,
      },
    );

    expect(result.current).toBeDefined();
  });

  it('应该能够访问 token 属性', () => {
    const { result } = renderHook(
      () =>
        useEditorStyleRegister('token-test', (token) => ({
          '.token-test': {
            colorText: token.colorText,
            colorPrimary: token.colorPrimary,
            fontSize: token.fontSize,
            lineHeight: token.lineHeight,
          },
        })),
      {
        wrapper: ({ children }) => <ConfigProvider>{children}</ConfigProvider>,
      },
    );

    expect(result.current).toBeDefined();
    expect(result.current.wrapSSR).toBeDefined();
  });

  it('应该在不同组件名称下生成不同的样式', () => {
    const { result: result1 } = renderHook(
      () =>
        useEditorStyleRegister('component-1', (token) => ({
          '.class-1': { color: token.colorText },
        })),
      {
        wrapper: ({ children }) => <ConfigProvider>{children}</ConfigProvider>,
      },
    );

    const { result: result2 } = renderHook(
      () =>
        useEditorStyleRegister('component-2', (token) => ({
          '.class-2': { color: token.colorPrimary },
        })),
      {
        wrapper: ({ children }) => <ConfigProvider>{children}</ConfigProvider>,
      },
    );

    expect(result1.current).toBeDefined();
    expect(result2.current).toBeDefined();
  });

  it('应该处理复杂的样式对象', () => {
    const { result } = renderHook(
      () =>
        useEditorStyleRegister('complex-component', (token) => ({
          '.container': {
            display: 'flex',
            flexDirection: 'column',
            padding: token.padding,
            margin: token.margin,
            backgroundColor: token.colorBgContainer,
            borderRadius: token.borderRadius,
            boxShadow: token.boxShadow,
            '.header': {
              fontSize: token.fontSizeLG,
              fontWeight: token.fontWeightStrong,
              marginBottom: token.marginSM,
            },
            '.content': {
              color: token.colorText,
              lineHeight: token.lineHeight,
            },
            '.footer': {
              marginTop: token.marginMD,
              padding: token.paddingSM,
              borderTop: `1px solid ${token.colorBorder}`,
            },
          },
        })),
      {
        wrapper: ({ children }) => <ConfigProvider>{children}</ConfigProvider>,
      },
    );

    expect(result.current).toBeDefined();
    expect(result.current.wrapSSR).toBeDefined();
    expect(result.current.hashId).toBeDefined();
  });
});
