/**
 * LinkButton / UndoRedoButtons：locale 回退与 isLinkActive 着色。
 */
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { LinkButton } from '../LinkButton';
import { UndoRedoButtons } from '../UndoRedoButtons';

vi.mock('antd', async () => {
  const actual = await vi.importActual<any>('antd');
  return {
    ...actual,
    Tooltip: ({ title, children }: any) => (
      <div data-testid={`tip-${title}`} data-title={title}>
        {children}
      </div>
    ),
  };
});

describe('LinkButton branches', () => {
  it('locale 回退默认标题；active 着色', () => {
    const onInsertLink = vi.fn();
    const { container } = render(
      <LinkButton
        baseClassName="tb"
        i18n={{}}
        onInsertLink={onInsertLink}
        isLinkActive
      />,
    );
    expect(screen.getByTestId('tip-插入链接')).toBeTruthy();
    fireEvent.click(screen.getByRole('button'));
    expect(onInsertLink).toHaveBeenCalled();
    expect(container.innerHTML).toContain('1677ff');
  });

  it('非 active 无强制色；自定义 locale', () => {
    const { container } = render(
      <LinkButton
        baseClassName="tb"
        i18n={{ locale: { insertLink: 'Insert' } }}
        onInsertLink={vi.fn()}
        isLinkActive={false}
      />,
    );
    expect(screen.getByTestId('tip-Insert')).toBeTruthy();
    expect(container.innerHTML).not.toContain('1677ff');
  });
});

describe('UndoRedoButtons branches', () => {
  it('locale 回退与点击', () => {
    const onUndo = vi.fn();
    const onRedo = vi.fn();
    render(
      <UndoRedoButtons
        baseClassName="tb"
        i18n={{}}
        onUndo={onUndo}
        onRedo={onRedo}
      />,
    );
    fireEvent.click(screen.getByTestId('tip-撤销').querySelector('[role="button"]')!);
    fireEvent.click(screen.getByTestId('tip-重做').querySelector('[role="button"]')!);
    expect(onUndo).toHaveBeenCalled();
    expect(onRedo).toHaveBeenCalled();
  });

  it('自定义 locale', () => {
    render(
      <UndoRedoButtons
        baseClassName="tb"
        i18n={{ locale: { undo: 'Undo', redo: 'Redo' } }}
        onUndo={vi.fn()}
        onRedo={vi.fn()}
      />,
    );
    expect(screen.getByTestId('tip-Undo')).toBeTruthy();
    expect(screen.getByTestId('tip-Redo')).toBeTruthy();
  });
});
