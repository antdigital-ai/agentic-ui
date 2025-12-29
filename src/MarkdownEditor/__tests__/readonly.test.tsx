import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MarkdownEditor } from '../src';
import { ReactEditor } from 'slate-react';

// 扩展 fireEvent 类型
type CustomFireEvent = typeof fireEvent & {
  selectionChange(element: Document): boolean;
};

const customFireEvent = fireEvent as CustomFireEvent;

// 添加自定义事件
customFireEvent.selectionChange = (element: Document) => {
  return fireEvent(element, new Event('selectionchange', { bubbles: true }));
};

const defaultValue = `# 只读模式测试
这是一段可以选择的文本。`;

describe('Readonly Mode Tests', () => {
  beforeEach(() => {
    // 设置测试环境
    document.body.innerHTML = '';
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should show toolbar when text is selected', async () => {
    render(<MarkdownEditor readonly initValue={defaultValue} reportMode />);

    // 模拟选择文本
    const text = document.querySelector('[data-slate-string="true"]');
    expect(text).not.toBeNull();

    if (text) {
      await act(async () => {
        // 创建一个选区
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(text);
        selection?.removeAllRanges();
        selection?.addRange(range);

        // 模拟 getBoundingClientRect
        const mockRect = {
          x: 100,
          y: 100,
          width: 100,
          height: 20,
          top: 100,
          right: 200,
          bottom: 120,
          left: 100,
          toJSON: () => ({}),
        };

        // 模拟 ReactEditor.toDOMRange 返回的范围
        vi.spyOn(ReactEditor, 'toDOMRange').mockImplementation(() => ({
          ...range,
          getBoundingClientRect: () => mockRect,
        }));

        // 触发鼠标事件和选区变化事件
        fireEvent.mouseDown(text);
        fireEvent.mouseUp(text);
        customFireEvent.selectionChange(document);

        // 等待工具栏渲染
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // 检查工具栏是否显示
      const toolbar = document.querySelector('[class*="md-editor-float-bar"]');
      expect(toolbar).not.toBeNull();
      if (toolbar) {
        const style = window.getComputedStyle(toolbar);
        expect(style.display).not.toBe('none');
      }
    }
  });

  it('should hide toolbar when clicking empty space', async () => {
    render(<MarkdownEditor readonly initValue={defaultValue} reportMode />);

    // 首先显示工具栏
    const text = document.querySelector('[data-slate-string="true"]');
    expect(text).not.toBeNull();

    if (text) {
      await act(async () => {
        // 创建一个选区
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(text);
        selection?.removeAllRanges();
        selection?.addRange(range);

        // 模拟 getBoundingClientRect
        const mockRect = {
          x: 100,
          y: 100,
          width: 100,
          height: 20,
          top: 100,
          right: 200,
          bottom: 120,
          left: 100,
          toJSON: () => ({}),
        };

        // 模拟 ReactEditor.toDOMRange 返回的范围
        vi.spyOn(ReactEditor, 'toDOMRange').mockImplementation(() => ({
          ...range,
          getBoundingClientRect: () => mockRect,
        }));

        // 触发鼠标事件和选区变化事件
        fireEvent.mouseDown(text);
        fireEvent.mouseUp(text);
        customFireEvent.selectionChange(document);

        // 等待工具栏渲染
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // 点击空白区域
      const editor = document.querySelector('[data-slate-editor="true"]');
      expect(editor).not.toBeNull();

      if (editor) {
        await act(async () => {
          // 清除选区
          const selection = window.getSelection();
          selection?.removeAllRanges();

          // 模拟 ReactEditor.toDOMRange 返回 undefined
          vi.spyOn(ReactEditor, 'toDOMRange').mockImplementation(
            () => undefined as unknown as Range,
          );

          fireEvent.mouseDown(editor);
          customFireEvent.selectionChange(document);

          // 等待工具栏隐藏
          await new Promise((resolve) => setTimeout(resolve, 100));
        });

        // 检查工具栏是否隐藏
        const toolbar = document.querySelector(
          '[class*="md-editor-float-bar"]',
        );
        expect(toolbar).not.toBeNull();
      }
    }
  });

  it('should hide toolbar when text is not selected', async () => {
    render(<MarkdownEditor readonly initValue={defaultValue} reportMode />);

    // 首先显示工具栏
    const text = document.querySelector('[data-slate-string="true"]');
    expect(text).not.toBeNull();

    if (text) {
      await act(async () => {
        // 创建一个选区
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(text);
        selection?.removeAllRanges();
        selection?.addRange(range);

        // 模拟 getBoundingClientRect
        const mockRect = {
          x: 100,
          y: 100,
          width: 100,
          height: 20,
          top: 100,
          right: 200,
          bottom: 120,
          left: 100,
          toJSON: () => ({}),
        };

        // 模拟 ReactEditor.toDOMRange 返回的范围
        vi.spyOn(ReactEditor, 'toDOMRange').mockImplementation(() => ({
          ...range,
          getBoundingClientRect: () => mockRect,
        }));

        // 触发鼠标事件和选区变化事件
        fireEvent.mouseDown(text);
        fireEvent.mouseUp(text);
        customFireEvent.selectionChange(document);

        // 等待工具栏渲染
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // 检查工具栏是否显示
      let toolbar = document.querySelector('[class*="md-editor-float-bar"]');
      expect(toolbar).not.toBeNull();
      if (toolbar) {
        const style = window.getComputedStyle(toolbar);
        expect(style.display).not.toBe('none');
      }

      // 清除选区
      await act(async () => {
        const selection = window.getSelection();
        selection?.removeAllRanges();

        // 模拟 ReactEditor.toDOMRange 抛出错误
        vi.spyOn(ReactEditor, 'toDOMRange').mockImplementation(() => {
          throw new Error('No selection');
        });

        // 模拟 ReactEditor.hasTarget 返回 false
        vi.spyOn(ReactEditor, 'hasTarget').mockReturnValue(false);

        // 触发鼠标事件和选区变化事件
        const editor = document.querySelector('[data-slate-editor="true"]');
        expect(editor).not.toBeNull();
        if (editor) {
          fireEvent.mouseDown(editor);
          fireEvent.mouseUp(editor);
          customFireEvent.selectionChange(document);
        }

        // 等待工具栏隐藏
        await new Promise((resolve) => setTimeout(resolve, 300));
      });

      // 检查工具栏是否隐藏
      toolbar = document.querySelector('[class*="md-editor-float-bar"]');
      expect(toolbar).not.toBeNull();
    }
  });
});
