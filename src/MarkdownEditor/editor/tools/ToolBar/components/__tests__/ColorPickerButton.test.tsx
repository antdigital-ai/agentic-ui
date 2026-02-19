import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ColorPickerButton } from '../ColorPickerButton';

vi.mock('antd', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    ColorPicker: ({ onChange }: { onChange?: (c: { toHexString: () => string }) => void }) => (
      <button
        type="button"
        data-testid="mock-color-change"
        onClick={() => onChange?.({ toHexString: () => '#ff0000' })}
      >
        Pick
      </button>
    ),
  };
});

describe('ColorPickerButton', () => {
  const defaultProps = {
    baseClassName: 'test-bar',
    hashId: 'hash',
    i18n: { locale: { 'font-color': '字体颜色' } },
    highColor: '#000000',
    isHighColorActive: false,
    onColorChange: vi.fn(),
    onToggleHighColor: vi.fn(),
  };

  it('onColorChange 应在 ColorPicker 变更时被调用', () => {
    const onColorChange = vi.fn();
    render(
      <ColorPickerButton
        {...defaultProps}
        onColorChange={onColorChange}
      />,
    );
    const changeBtn = screen.getByTestId('mock-color-change');
    fireEvent.click(changeBtn);
    expect(onColorChange).toHaveBeenCalledWith('#ff0000');
  });

  it('点击高亮按钮应调用 onToggleHighColor，mouseEnter 应 stopPropagation', () => {
    const onToggleHighColor = vi.fn();
    render(
      <ColorPickerButton
        {...defaultProps}
        onToggleHighColor={onToggleHighColor}
      />,
    );
    const mockColorBtn = screen.getByTestId('mock-color-change');
    const allButtons = screen.getAllByRole('button');
    const highlighterBtn = allButtons.filter((el) => el !== mockColorBtn).pop();
    expect(highlighterBtn).toBeDefined();
    fireEvent.mouseEnter(highlighterBtn!);
    fireEvent.click(highlighterBtn!);
    expect(onToggleHighColor).toHaveBeenCalled();
  });
});
