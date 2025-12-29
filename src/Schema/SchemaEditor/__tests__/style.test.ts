import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { useStyle } from '../../@ant-design/agentic-ui/Schema/SchemaEditor/style';

describe('SchemaEditor style', () => {
  describe('useStyle hook', () => {
    it('应该返回样式注册函数', () => {
      const { result } = renderHook(() => useStyle('schema-editor'));

      expect(result.current).toBeDefined();
      expect(result.current.wrapSSR).toBeDefined();
      expect(result.current.hashId).toBeDefined();
      expect(typeof result.current.wrapSSR).toBe('function');
      expect(typeof result.current.hashId).toBe('string');
    });

    it('应该使用自定义前缀类名', () => {
      const { result } = renderHook(() => useStyle('custom-prefix'));

      expect(result.current.hashId).toBeDefined();
    });

    it('应该使用默认前缀', () => {
      const { result } = renderHook(() => useStyle());

      expect(result.current).toBeDefined();
    });

    it('应该生成hashId', () => {
      const { result: result1 } = renderHook(() => useStyle('editor-1'));
      const { result: result2 } = renderHook(() => useStyle('editor-2'));

      // hashId 应该正确注册
      expect(result1.current.hashId).toBeDefined();
      expect(result2.current.hashId).toBeDefined();
    });
  });

  describe('样式生成', () => {
    it('应该生成主容器样式', () => {
      const { result } = renderHook(() => useStyle('schema-editor'));

      // wrapSSR 应该是一个函数
      expect(typeof result.current.wrapSSR).toBe('function');
    });

    it('应该可以包装组件', () => {
      const { result } = renderHook(() => useStyle('schema-editor'));
      const TestComponent = React.createElement('div', null, 'Test');

      const wrappedComponent = result.current.wrapSSR(TestComponent);
      expect(wrappedComponent).toBeDefined();
    });
  });
});

