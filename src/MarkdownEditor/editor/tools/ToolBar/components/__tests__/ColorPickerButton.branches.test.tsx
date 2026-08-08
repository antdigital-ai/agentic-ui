import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ColorPickerButton } from '../ColorPickerButton';

vi.mock('antd', async () => {
  const actual = await vi.importActual<any>('antd');
  return {
    ...actual,
    ColorPicker: ({ onChange }: any) => (
      <button
        type="button"
        data-testid="picker"
        onClick={() => onChange({ toHexString: () => '#123456' })}
      >
        picker
      </button>
    ),
    Tooltip: ({ title, children }: any) => (
      <div data-testid="tooltip" data-title={title}>
        {children}
      </div>
    ),
  };
});

describe('ColorPickerButton residual branches', () => {
  it('uses fallback title, forwards selected color, and toggles highlighting', () => {
    const onColorChange = vi.fn();
    const onToggle = vi.fn();
    render(
      <ColorPickerButton
        baseClassName="toolbar"
        highColor={null}
        isHighColorActive={false}
        i18n={{}}
        onColorChange={onColorChange}
        onToggleHighColor={onToggle}
      />,
    );
    expect(screen.getByTestId('tooltip')).toHaveAttribute(
      'data-title',
      '字体颜色',
    );
    fireEvent.click(screen.getByTestId('picker'));
    const toggle = screen
      .getByTestId('tooltip')
      .querySelector('div[role="button"] > div[role="button"]');
    fireEvent.click(toggle!);
    expect(onColorChange).toHaveBeenCalledWith('#123456');
    expect(onToggle).toHaveBeenCalled();
  });

  it('自定义 locale 与高亮态', () => {
    const { container } = render(
      <ColorPickerButton
        baseClassName="toolbar"
        highColor="#ff0000"
        isHighColorActive
        i18n={{ locale: { 'font-color': 'Font Color' } }}
        onColorChange={vi.fn()}
        onToggleHighColor={vi.fn()}
      />,
    );
    expect(screen.getByTestId('tooltip')).toHaveAttribute(
      'data-title',
      'Font Color',
    );
    expect(container.innerHTML).toContain('bold');
  });
});
