import { renderHook } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import {
  genComponentStyleHook,
  genStyleHooks,
  genSubStyleComponent,
  type GenStyleFn,
} from '../useStyle';

declare module '../useStyle' {
  interface AgenticComponentTokenMap {
    TestBubble: { bubbleMaxWidth: number };
  }
}

describe('genStyleHooks 基础设施', () => {
  it('应返回 [wrapSSR, hashId, cssVarCls] 三元组', () => {
    const genStyle: GenStyleFn<'TestBubble'> = (token) => ({
      [token.componentCls]: {
        padding: token.padding,
        maxWidth: token.bubbleMaxWidth,
      },
    });

    const useStyle = genStyleHooks('TestBubble', genStyle, () => ({
      bubbleMaxWidth: 668,
    }));

    const { result } = renderHook(() => useStyle('agentic-test-bubble'), {
      wrapper: ({ children }) => <ConfigProvider>{children}</ConfigProvider>,
    });

    const [wrapSSR, hashId, cssVarCls] = result.current;
    expect(typeof wrapSSR).toBe('function');
    expect(hashId).toBe('');
    // 未启用 cssVar 时返回 undefined，启用时为字符串；此处只校验类型兼容
    expect(['string', 'undefined']).toContain(typeof cssVarCls);
  });

  it('styleFn 接收的 token 暴露 componentCls / antCls / iconCls / calc 等通用字段', () => {
    let captured: Record<string, any> | undefined;

    const useStyle = genStyleHooks('TestTokenShape' as any, (token) => {
      captured = token;
      return {};
    });

    renderHook(() => useStyle('agentic-shape'), {
      wrapper: ({ children }) => <ConfigProvider>{children}</ConfigProvider>,
    });

    expect(captured?.componentCls).toBe('.agentic-shape');
    expect(captured?.prefixCls).toBe('agentic-shape');
    expect(captured?.antCls).toMatch(/^\./);
    expect(captured?.iconCls).toMatch(/^\./);
    expect(typeof captured?.calc).toBe('function');
  });

  it('genComponentStyleHook 返回 [wrapSSR, hashId]', () => {
    const useStyle = genComponentStyleHook(
      'TestSubComp' as any,
      (token) => ({
        [token.componentCls]: { color: token.colorText },
      }),
    );

    const { result } = renderHook(() => useStyle('agentic-sub'), {
      wrapper: ({ children }) => <ConfigProvider>{children}</ConfigProvider>,
    });

    expect(typeof result.current[0]).toBe('function');
    expect(result.current[1]).toBe('');
  });

  it('genSubStyleComponent 返回 SubStyle React 组件', () => {
    const SubStyle = genSubStyleComponent(
      'TestSubStyle' as any,
      (token) => ({ [token.componentCls]: {} }),
    );
    expect(typeof SubStyle).toBe('function');
  });

  it('wrapSSR 应为 identity 函数：不包 Fragment、不动节点', () => {
    const useStyle = genStyleHooks(
      'TestIdentityWrap' as any,
      (token) => ({ [token.componentCls]: { color: token.colorText } }),
    );

    const { result } = renderHook(() => useStyle('agentic-identity'), {
      wrapper: ({ children }) => <ConfigProvider>{children}</ConfigProvider>,
    });

    const [wrapSSR] = result.current;
    const node = <div data-testid="payload" />;
    // 严格相等：identity 不应创建新的 React 元素
    expect(wrapSSR(node)).toBe(node);
  });

  it('useStyle 调用本身已注入样式到 document.head，无需 wrapSSR 触发', () => {
    const styleId = 'agentic-side-effect-injection';
    const useStyle = genStyleHooks('TestSideEffect' as any, (token) => ({
      [token.componentCls]: {
        // 通过该字段在 document.head 里搜索注入痕迹
        '--agentic-side-effect-marker': `"${styleId}"`,
      },
    }));

    renderHook(() => useStyle(styleId), {
      wrapper: ({ children }) => <ConfigProvider>{children}</ConfigProvider>,
    });

    const injected = Array.from(document.head.querySelectorAll('style')).some(
      (el) => el.textContent?.includes(styleId),
    );
    expect(injected).toBe(true);
  });
});
