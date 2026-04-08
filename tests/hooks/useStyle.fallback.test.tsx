/**
 * 覆盖 useEditorStyleRegister 当 genStyles 返回空值时的兜底分支
 */
import { renderHook } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@ant-design/theme-token', () => ({
  createStyleRegister: () => () => null,
}));

import { useEditorStyleRegister } from '../../src/Hooks/useStyle';

describe('useEditorStyleRegister 兜底分支', () => {
  it('应在 genStyles 返回空值时返回 wrapSSR 与 hashId 兜底', () => {
    const { result } = renderHook(
      () => useEditorStyleRegister('fallback-component', () => ({})),
      {
        wrapper: ({ children }) => <ConfigProvider>{children}</ConfigProvider>,
      },
    );

    expect(result.current.wrapSSR).toBeDefined();
    expect(typeof result.current.wrapSSR).toBe('function');
    expect(result.current.hashId).toBe('');
    expect(result.current.wrapSSR(<div />)).toEqual(<div />);
  });
});
