import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { FncLeafMobileModal } from '../FncLeafMobileModal';

describe('FncLeafMobileModal 分支覆盖', () => {
  it('无 definition 且无 identifier 显示暂无说明', () => {
    render(
      <FncLeafMobileModal
        open
        onClose={vi.fn()}
        displayLabel=""
      />,
    );
    expect(screen.getByText('暂无脚注说明')).toBeInTheDocument();
    expect(screen.getByText('脚注')).toBeInTheDocument();
  });

  it('无 definition 有 identifier 显示未找到文案', () => {
    render(
      <FncLeafMobileModal
        open
        onClose={vi.fn()}
        displayLabel="1"
        identifier="missing"
      />,
    );
    expect(
      screen.getByText('未找到脚注「missing」的定义内容'),
    ).toBeInTheDocument();
    expect(screen.getByText('脚注 1')).toBeInTheDocument();
  });

  it('definition.value 优先于 Node.string', () => {
    render(
      <FncLeafMobileModal
        open
        onClose={vi.fn()}
        displayLabel="2"
        definition={
          {
            type: 'footnoteDefinition',
            identifier: 'a',
            value: 'from-value',
            children: [{ text: 'ignored' }],
          } as any
        }
      />,
    );
    expect(screen.getByText('from-value')).toBeInTheDocument();
  });

  it('无 value 时用 Node.string；Node.string 抛错回退空', () => {
    render(
      <FncLeafMobileModal
        open
        onClose={vi.fn()}
        displayLabel="3"
        definition={
          {
            type: 'footnoteDefinition',
            identifier: 'b',
            children: [{ text: 'from-node' }],
          } as any
        }
      />,
    );
    expect(screen.getByText('from-node')).toBeInTheDocument();

    render(
      <FncLeafMobileModal
        open
        onClose={vi.fn()}
        displayLabel="4"
        identifier="broken"
        definition={
          {
            type: 'footnoteDefinition',
            identifier: 'c',
            get children() {
              throw new Error('bad');
            },
          } as any
        }
      />,
    );
    expect(
      screen.getByText('未找到脚注「broken」的定义内容'),
    ).toBeInTheDocument();
  });

  it('url 来自 definition.url；openInNewTab false 不设 target', () => {
    render(
      <FncLeafMobileModal
        open
        onClose={vi.fn()}
        displayLabel="5"
        definition={
          {
            type: 'footnoteDefinition',
            identifier: 'd',
            value: 'body',
            url: 'https://example.com',
            children: [{ text: '' }],
          } as any
        }
        linkConfig={{ openInNewTab: false }}
      />,
    );
    const link = screen.getByText('查看来源');
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).not.toHaveAttribute('target');
  });

  it('leafUrl 回退；linkConfig.onClick 返回 false 阻止默认', () => {
    const onClick = vi.fn(() => false);
    render(
      <FncLeafMobileModal
        open
        onClose={vi.fn()}
        displayLabel="6"
        leafUrl="https://leaf.test"
        linkConfig={{ onClick }}
      />,
    );
    const link = screen.getByText('查看来源');
    fireEvent.click(link);
    expect(onClick).toHaveBeenCalledWith('https://leaf.test');
  });

  it('renderMobileModal 覆盖默认内容', () => {
    render(
      <FncLeafMobileModal
        open
        onClose={vi.fn()}
        displayLabel="7"
        fncProps={{
          renderMobileModal: () => (
            <div data-testid="custom-mobile-modal">custom</div>
          ),
        }}
      />,
    );
    expect(screen.getByTestId('custom-mobile-modal')).toBeInTheDocument();
  });
});
