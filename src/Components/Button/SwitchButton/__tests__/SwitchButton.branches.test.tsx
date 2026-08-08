import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SwitchButton } from '../index';

vi.mock('../style', () => ({ useStyle: () => ({ hashId: 'hash' }) }));

describe('SwitchButton residual branches', () => {
  it('changes uncontrolled active state and calls onChange', () => {
    const onChange = vi.fn();
    render(
      <SwitchButton defaultActive={false} onChange={onChange}>
        Switch
      </SwitchButton>,
    );

    const button = screen.getByRole('button', { name: /Switch/i });
    fireEvent.click(button);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('does not change disabled buttons', () => {
    const onChange = vi.fn();
    render(
      <SwitchButton disabled onChange={onChange}>
        Disabled
      </SwitchButton>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Disabled/i }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
