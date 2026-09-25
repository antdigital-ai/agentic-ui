/**
 * SearchInput：placeholder 三级回退、keyword ?? ''、onChange 可选。
 */
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SearchInput } from '../SearchInput';

describe('SearchInput branches', () => {
  it('优先使用 searchPlaceholder', () => {
    render(
      <SearchInput
        prefixCls="ws"
        hashId="h"
        searchPlaceholder="自定义"
        locale={{ 'workspace.searchPlaceholder': 'locale' }}
      />,
    );
    expect(screen.getByPlaceholderText('自定义')).toBeTruthy();
  });

  it('回退到 locale placeholder', () => {
    render(
      <SearchInput
        prefixCls="ws"
        hashId="h"
        locale={{ 'workspace.searchPlaceholder': '从locale' }}
      />,
    );
    expect(screen.getByPlaceholderText('从locale')).toBeTruthy();
  });

  it('最终回退到默认中文', () => {
    render(<SearchInput prefixCls="ws" hashId="h" />);
    expect(screen.getByPlaceholderText('搜索文件名')).toBeTruthy();
  });

  it('keyword undefined 视为空串；无 onChange 不抛错', () => {
    render(<SearchInput prefixCls="ws" hashId="h" keyword={undefined} />);
    const input = screen.getByRole('textbox');
    expect((input as HTMLInputElement).value).toBe('');
    expect(() => {
      fireEvent.change(input, { target: { value: 'a' } });
    }).not.toThrow();
  });

  it('onChange 收到输入值', () => {
    const onChange = vi.fn();
    render(
      <SearchInput prefixCls="ws" hashId="h" keyword="" onChange={onChange} />,
    );
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'file' },
    });
    expect(onChange).toHaveBeenCalledWith('file');
  });
});
