import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderEditorPlaceholder } from '../renderEditorPlaceholder';

describe('renderEditorPlaceholder', () => {
  it('应渲染 placeholder 文本并保留 data-slate-placeholder 属性', () => {
    render(
      renderEditorPlaceholder({
        children: '请输入内容...',
        attributes: {
          'data-slate-placeholder': true,
          contentEditable: false,
          style: { opacity: 0.333 },
        },
      }),
    );

    const node = screen.getByText('请输入内容...');
    expect(node).toHaveAttribute('data-slate-placeholder', 'true');
    expect(node).toHaveAttribute('contenteditable', 'false');
    expect(node).toHaveStyle({ opacity: '1' });
    expect(node).toHaveStyle({
      color: 'var(--color-gray-text-disabled, rgba(20, 22, 28, 0.25))',
    });
  });
});
