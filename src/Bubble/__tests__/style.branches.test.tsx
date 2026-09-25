import { renderHook } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { useStyle } from '../style';

/** GENERATED_STYLE_BRANCHES */
describe('src/Bubble/style.ts branches', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ConfigProvider>{children}</ConfigProvider>
  );

  it('无 classNames 时 salt 走 ListItem 默认臂', () => {
    const { result } = renderHook(() => useStyle('agentic-bubble'), {
      wrapper,
    });
    expect(result.current).toBeDefined();
  });

  it('提供 bubbleNameClassName 时 salt 走拼接臂', () => {
    const { result } = renderHook(
      () =>
        useStyle('agentic-bubble', {
          bubbleNameClassName: 'custom-bubble-name',
        }),
      { wrapper },
    );
    expect(result.current).toBeDefined();
  });
});
