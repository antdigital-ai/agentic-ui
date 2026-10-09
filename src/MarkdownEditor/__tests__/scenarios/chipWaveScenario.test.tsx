/**
 * Tag chip 插入波浪动画（对齐 dtcoder-ide composerChipShimmer）端到端链路：
 * Suggestion 选中 → elements/index.tsx onSelect（Transforms 插入 + mark）→
 * TagPopup path 同步 effect 认领 → ChipWave 渲染波形态 → animationend 退出。
 */

import '@testing-library/jest-dom';
import { act, render, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { MarkdownEditor } from '../..';

(globalThis as any).ace = {
  define: () => {},
  require: () => {},
};

vi.mock('ace-builds', () => {
  const mockEditor = {
    setTheme: vi.fn(),
    setValue: vi.fn(),
    getValue: vi.fn(() => ''),
    clearSelection: vi.fn(),
    destroy: vi.fn(),
    on: vi.fn(),
    selection: { on: vi.fn(), clearSelection: vi.fn() },
    session: { setMode: vi.fn() },
    commands: { addCommand: vi.fn() },
    getCursorPosition: vi.fn(() => ({ row: 0, column: 0 })),
    focus: vi.fn(),
    renderer: { scroller: document.createElement('div') },
  };
  return {
    default: {
      edit: vi.fn(() => mockEditor),
      config: { set: vi.fn(), loadModule: vi.fn() },
    },
    Ace: {},
  };
});
vi.mock('ace-builds/src-noconflict/theme-chaos', () => ({}));
vi.mock('ace-builds/src-noconflict/theme-github', () => ({}));
vi.mock('ace-builds/src-noconflict/ext-modelist', () => ({
  default: { modes: [] },
}));
vi.mock('../../editor/utils/ace', () => ({
  modeMap: new Map([['markdown', 'markdown']]),
  getAceLangs: vi.fn(() => Promise.resolve(new Set(['markdown']))),
}));

const items = [{ key: 'optimize', label: '优化' }];

describe('TagPopup chip 插入波浪动画（端到端）', () => {
  it('选中命令后 chip 渲染波形态，动画结束后恢复普通渲染', async () => {
    const { container } = render(
      <MarkdownEditor
        initValue="前缀 `${placeholder:目标}` 后缀"
        toolBar={{ enable: false }}
        floatBar={{ enable: false }}
        tagInputProps={{
          enable: true,
          type: 'dropdown',
          items,
        }}
      />,
    );

    // 等待 tag chip（TagPopup 容器）出现
    const tagPopup = await waitFor(
      () => {
        const el = container.querySelector(
          '.ant-agentic-md-editor-tag-popup [data-tag-popup-input]',
        ) as HTMLElement | null;
        expect(el).toBeInTheDocument();
        return el!;
      },
      { timeout: 8000 },
    );

    // 初始为普通渲染（未认领，无波形态）
    expect(container.querySelector('[data-chip-wave="active"]')).toBeNull();

    // 打开 dropdown：click tag chip，等待菜单项渲染
    await act(async () => {
      tagPopup.click();
    });
    const menuItem = await waitFor(
      () => {
        const item = Array.from(
          document.querySelectorAll('.ant-dropdown-menu-item'),
        ).find((el) => el.textContent === '优化') as HTMLElement | undefined;
        expect(item).toBeTruthy();
        return item!;
      },
      { timeout: 8000 },
    );
    await act(async () => {
      menuItem.click();
    });

    // chip 更新为选中值并进入波形态
    await waitFor(
      () => {
        expect(
          container.querySelector('[data-chip-wave="active"]'),
        ).not.toBeNull();
      },
      { timeout: 8000 },
    );
    // 波形态逐字渲染：leaf 文本 "$optimize "（含尾空格）逐 grapheme 拆分
    const chars = container.querySelectorAll('[class*="-chip-wave-char"]');
    expect(chars.length).toBe('$optimize '.length);
    expect(chars[0]).toHaveTextContent('$');

    // 最后一个字符的动画结束 → 退出播放态
    const lastChar = chars[chars.length - 1];
    await act(async () => {
      lastChar.dispatchEvent(
        new AnimationEvent('animationend', {
          animationName: 'chipWave',
          bubbles: true,
        }),
      );
    });
    await waitFor(() => {
      expect(container.querySelector('[data-chip-wave="active"]')).toBeNull();
    });
  });
});
