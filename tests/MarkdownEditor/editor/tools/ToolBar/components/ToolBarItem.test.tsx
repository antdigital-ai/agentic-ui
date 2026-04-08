/**
 * ToolBarItem 组件测试
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ToolBarItem } from '../../../../../../src/MarkdownEditor/editor/tools/ToolBar/components/ToolBarItem';

describe('ToolBarItem', () => {
  it('应渲染并响应 onClick', () => {
    const onClick = vi.fn();
    render(
      <ToolBarItem
        title="Bold"
        icon={<span>B</span>}
        onClick={onClick}
      />,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('应响应 onMouseDown', () => {
    const onMouseDown = vi.fn();
    render(
      <ToolBarItem
        title="Bold"
        icon={<span>B</span>}
        onMouseDown={onMouseDown}
      />,
    );
    fireEvent.mouseDown(screen.getByRole('button'));
    expect(onMouseDown).toHaveBeenCalledTimes(1);
  });
});
