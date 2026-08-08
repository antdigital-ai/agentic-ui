/**
 * HistoryActionsBox midtail：无 agent / enabled / children。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import { HistoryActionsBox } from '../HistoryActionsBox';

vi.mock('../../../Components/ActionIconBox', () => ({
  ActionIconBox: ({ children, onClick, title }: any) => (
    <button type="button" title={title} onClick={onClick}>
      {typeof children === 'function' ? children(false) : children}
    </button>
  ),
}));

describe('HistoryActionsBox midtail branches', () => {
  it('无 agent.enabled 仍渲染 children', () => {
    render(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
        <HistoryActionsBox item={{ sessionId: 's1' } as any}>
          <span data-testid="child">c</span>
        </HistoryActionsBox>
      </I18nContext.Provider>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('agent.enabled + favorite 点击', async () => {
    const onFavorite = vi.fn(async () => undefined);
    const { container } = render(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
        <HistoryActionsBox
          item={{ sessionId: 's1', isFavorite: false } as any}
          agent={{ enabled: true }}
          onFavorite={onFavorite}
        >
          <span>time</span>
        </HistoryActionsBox>
      </I18nContext.Provider>,
    );
    fireEvent.mouseEnter(container.firstChild as Element);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    fireEvent.click(buttons[0]);
    expect(onFavorite).toHaveBeenCalled();
  });
});
