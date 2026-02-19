import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ActionIconBox } from '../../src/Components/ActionIconBox';

describe('ActionIconBox targeted coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('覆盖单元素 cloneElement 异常分支（123,124）', () => {
    const cloneSpy = vi
      .spyOn(React, 'cloneElement')
      .mockImplementationOnce(() => {
        throw new Error('clone failed');
      });

    render(
      <ActionIconBox title="single-clone-error">
        <span data-testid="icon-single">icon</span>
      </ActionIconBox>,
    );

    expect(screen.getByTestId('icon-single')).toBeInTheDocument();
    expect(console.error).toHaveBeenCalled();
    cloneSpy.mockRestore();
  });

  it('覆盖多元素 map 分支与异常兜底（142,145,146）', () => {
    const cloneSpy = vi
      .spyOn(React, 'cloneElement')
      .mockImplementationOnce(() => {
        throw new Error('children clone failed');
      });

    render(
      <ActionIconBox title="multi-children-error">
        {[
          <span key="a" data-testid="icon-a">
            A
          </span>,
          'plain-text',
        ]}
      </ActionIconBox>,
    );

    expect(screen.getByText('plain-text')).toBeInTheDocument();
    expect(console.error).toHaveBeenCalled();
    cloneSpy.mockRestore();
  });

  it('覆盖多元素 map 中非元素 child 直接返回（142）', () => {
    render(
      <ActionIconBox title="multi-children-normal">
        {[
          <span key="b" data-testid="icon-b">
            B
          </span>,
          'text-child',
        ]}
      </ActionIconBox>,
    );
    expect(screen.getByText('text-child')).toBeInTheDocument();
  });

  it('覆盖 title 分支 onClick/onKeyDown catch 与 mouseLeave（181,195,202）', async () => {
    const onClick = vi.fn(async () => {
      throw new Error('click error');
    });
    render(
      <ActionIconBox title="title-branch" onClick={onClick}>
        <span data-testid="icon-title">T</span>
      </ActionIconBox>,
    );
    const button = screen.getByTestId('action-icon-box');

    fireEvent.mouseEnter(button);
    fireEvent.mouseLeave(button);

    await act(async () => {
      fireEvent.click(button);
      await Promise.resolve();
    });

    await act(async () => {
      fireEvent.keyDown(button, { key: 'Enter' });
      await Promise.resolve();
    });

    expect(onClick).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it('覆盖无 title 分支 onClick 主流程与 loading guard（231-237）', async () => {
    const onClick = vi.fn(async () => Promise.resolve());
    render(
      <ActionIconBox onClick={onClick}>
        <span data-testid="icon-no-title">N</span>
      </ActionIconBox>,
    );
    const button = screen.getByTestId('action-icon-box');

    await act(async () => {
      fireEvent.click(button);
      await Promise.resolve();
    });
    expect(onClick).toHaveBeenCalledTimes(1);

    const throwClick = vi.fn(async () => {
      throw new Error('no-title-click-error');
    });
    render(
      <ActionIconBox onClick={throwClick} data-testid="throw-click-btn">
        <span>TT</span>
      </ActionIconBox>,
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId('throw-click-btn'));
      await Promise.resolve();
    });
    expect(console.error).toHaveBeenCalled();

    render(
      <ActionIconBox isLoading onClick={onClick} data-testid="loading-btn">
        <span>L</span>
      </ActionIconBox>,
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId('loading-btn'));
      await Promise.resolve();
    });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('覆盖无 title 分支 onKeyDown 全路径与 hover（243-249,251,253,257,258）', async () => {
    const onClick = vi.fn(async (e: any) => {
      if (e.key === ' ') throw new Error('keydown error');
    });
    render(
      <ActionIconBox onClick={onClick} data-testid="kbd-btn">
        {(hover) => <span data-testid="hover-state">{String(hover)}</span>}
      </ActionIconBox>,
    );
    const button = screen.getByTestId('kbd-btn');

    fireEvent.mouseEnter(button);
    fireEvent.mouseLeave(button);

    await act(async () => {
      fireEvent.keyDown(button, { key: 'Enter' });
      await Promise.resolve();
    });
    await act(async () => {
      fireEvent.keyDown(button, { key: ' ' });
      await Promise.resolve();
    });
    fireEvent.keyDown(button, { key: 'a' });

    render(
      <ActionIconBox isLoading onClick={onClick} data-testid="kbd-loading-btn">
        <span>LL</span>
      </ActionIconBox>,
    );
    await act(async () => {
      fireEvent.keyDown(screen.getByTestId('kbd-loading-btn'), { key: 'Enter' });
      await Promise.resolve();
    });

    expect(onClick).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });
});

