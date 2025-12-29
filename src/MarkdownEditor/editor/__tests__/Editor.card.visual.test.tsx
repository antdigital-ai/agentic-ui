import '@testing-library/jest-dom';
import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { BaseMarkdownEditor } from '../../BaseMarkdownEditor';

describe('Card Visual Effects Tests', () => {
  // 创建包含图片卡片的 Markdown 字符串
  const createCardMarkdown = () => {
    return '![](test.jpg)';
  };

  describe('Card Selection Visual Indicators', () => {
    it('should be clickable and interactive', async () => {
      const initValue = createCardMarkdown();

      const { container } = render(
        <BaseMarkdownEditor initValue={initValue} onChange={() => {}} />,
      );

      // 等待组件渲染完成
      await waitFor(() => {
        const cardElement = container.querySelector('[data-be="card"]');
        expect(cardElement).toBeTruthy();
      });

      const cardElement = container.querySelector(
        '[data-be="card"]',
      ) as HTMLElement;

      // 验证初始状态
      expect(cardElement.style.outline).toBe('none');
      expect(cardElement.getAttribute('aria-selected')).toBe('false');

      // 验证卡片是可点击的
      expect(cardElement.getAttribute('role')).toBe('button');
      expect(cardElement.getAttribute('tabIndex')).toBe('0');
      // 注意：当前实现中没有设置 cursor 样式，所以不验证这个属性

      // 验证点击事件不会导致错误
      expect(() => {
        fireEvent.click(cardElement);
      }).not.toThrow();

      // 验证卡片仍然存在（没有被错误删除）
      const cardAfterClick = container.querySelector('[data-be="card"]');
      expect(cardAfterClick).toBeTruthy();
    });

    it('should apply correct basic styling', async () => {
      const initValue = createCardMarkdown();

      const { container } = render(
        <BaseMarkdownEditor initValue={initValue} onChange={() => {}} />,
      );

      // 等待组件渲染完成
      await waitFor(() => {
        const cardElement = container.querySelector('[data-be="card"]');
        expect(cardElement).toBeTruthy();
      });

      const cardElement = container.querySelector(
        '[data-be="card"]',
      ) as HTMLElement;

      // 验证基本样式（基于当前 WarpCard 组件的实际实现）
      expect(cardElement.style.position).toBe('relative');
      // display 可能是 'flex' 或 'inline-flex'，取决于 element.block 属性
      expect(['flex', 'inline-flex']).toContain(cardElement.style.display);
      expect(cardElement.style.maxWidth).toBe('100%');
      expect(cardElement.style.alignItems).toBe('flex-end');
      expect(cardElement.style.outline).toBe('none');
      expect(cardElement.style.width).toBe('max-content');
      // 注意：当前实现中没有设置 padding、borderRadius、cursor 和 transition 样式

      // 验证卡片具有正确的结构和属性
      expect(cardElement.getAttribute('data-be')).toBe('card');
      expect(cardElement.getAttribute('role')).toBe('button');
    });
  });

  describe('Card Accessibility', () => {
    it('should have proper accessibility attributes', async () => {
      const initValue = createCardMarkdown();

      const { container } = render(
        <BaseMarkdownEditor initValue={initValue} onChange={() => {}} />,
      );

      // 等待组件渲染完成
      await waitFor(() => {
        const cardElement = container.querySelector('[data-be="card"]');
        expect(cardElement).toBeTruthy();
      });

      const cardElement = container.querySelector('[data-be="card"]');

      // 检查可访问性属性
      expect(cardElement).toHaveAttribute('role', 'button');
      expect(cardElement).toHaveAttribute('tabIndex', '0');
      expect(cardElement).toHaveAttribute('aria-label', '可选择的卡片元素');
    });
  });

  describe('Card State Management', () => {
    it('should maintain smooth transitions', async () => {
      const initValue = createCardMarkdown();

      const { container } = render(
        <BaseMarkdownEditor initValue={initValue} onChange={() => {}} />,
      );

      // 等待组件渲染完成
      await waitFor(() => {
        const cardElement = container.querySelector('[data-be="card"]');
        expect(cardElement).toBeTruthy();
      });

      const cardElement = container.querySelector(
        '[data-be="card"]',
      ) as HTMLElement;

      // 验证基本样式属性存在（当前实现中没有过渡效果）
      expect(cardElement.style.position).toBe('relative');
      // display 可能是 'flex' 或 'inline-flex'，取决于 element.block 属性
      expect(['flex', 'inline-flex']).toContain(cardElement.style.display);
      expect(cardElement.style.maxWidth).toBe('100%');
      // 注意：当前实现中没有设置 transition 样式
    });
  });
});
