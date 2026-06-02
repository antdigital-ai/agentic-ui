import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ToolBar from '../ToolBar';

// Mock BaseToolBar component
vi.mock('../BaseBar', () => ({
  BaseToolBar: ({
    prefix,
    showEditor,
    showInsertAction,
    hashId,
    ...props
  }: any) => (
    <div data-testid="base-toolbar" data-prefix={prefix} data-hash-id={hashId}>
      <div data-testid="show-editor">{showEditor ? 'true' : 'false'}</div>
      <div data-testid="show-insert-action">
        {showInsertAction ? 'true' : 'false'}
      </div>
      <div data-testid="extra-count">{props.extra?.length || 0}</div>
      <div data-testid="min">{props.min ? 'true' : 'false'}</div>
      <div data-testid="hide-tools">{props.hideTools?.join(',') || ''}</div>
    </div>
  ),
  ToolsKeyType: ['bold', 'italic', 'underline'] as const,
}));

// Mock useStyle hook
vi.mock('../toolBarStyle', () => ({
  useStyle: () => ({
    hashId: 'test-hash-id',
  }),
}));

describe('ToolBar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders toolbar with default props', () => {
    render(
      <ConfigProvider>
        <ToolBar />
      </ConfigProvider>,
    );

    const toolbar = screen.getByTestId('base-toolbar');
    expect(toolbar).toBeInTheDocument();
    expect(screen.getByTestId('show-editor')).toHaveTextContent('true');
    expect(screen.getByTestId('show-insert-action')).toHaveTextContent('true');
  });

  it('renders with custom prefix', () => {
    render(
      <ConfigProvider>
        <ToolBar prefix="custom-prefix" />
      </ConfigProvider>,
    );

    const toolbar = screen.getByTestId('base-toolbar');
    expect(toolbar).toHaveAttribute('data-prefix', 'custom-prefix');
  });

  it('renders with extra components', () => {
    const extraComponents = [
      <div key="1" data-testid="extra-1">
        Extra 1
      </div>,
      <div key="2" data-testid="extra-2">
        Extra 2
      </div>,
    ];

    render(
      <ConfigProvider>
        <ToolBar extra={extraComponents} />
      </ConfigProvider>,
    );

    expect(screen.getByTestId('extra-count')).toHaveTextContent('2');
    // Extra components are passed to BaseToolBar but not rendered in our mock
    // We only test that the count is correct
  });

  it('renders with min prop', () => {
    render(
      <ConfigProvider>
        <ToolBar min={true} />
      </ConfigProvider>,
    );

    expect(screen.getByTestId('min')).toHaveTextContent('true');
  });

  it('renders with hideTools prop', () => {
    const hideTools = ['bold', 'italic'] as any;

    render(
      <ConfigProvider>
        <ToolBar hideTools={hideTools} />
      </ConfigProvider>,
    );

    expect(screen.getByTestId('hide-tools')).toHaveTextContent('bold,italic');
  });

  it('handles mouse down event correctly', () => {
    render(
      <ConfigProvider>
        <ToolBar />
      </ConfigProvider>,
    );

    const toolbar = screen.getByTestId('base-toolbar');
    const mouseDownEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    });

    fireEvent.mouseDown(toolbar, mouseDownEvent);

    // Verify that the event was handled (no errors thrown)
    expect(toolbar).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    render(
      <ConfigProvider>
        <ToolBar />
      </ConfigProvider>,
    );

    const toolbar = screen.getByTestId('base-toolbar');
    expect(toolbar).toHaveAttribute('data-hash-id', 'test-hash-id');
  });

  it('renders with all props combined', () => {
    const extraComponents = [<div key="1">Extra</div>];
    const hideTools = ['bold'] as any;

    render(
      <ConfigProvider>
        <ToolBar
          prefix="test-prefix"
          extra={extraComponents}
          min={true}
          hideTools={hideTools}
        />
      </ConfigProvider>,
    );

    const toolbar = screen.getByTestId('base-toolbar');
    expect(toolbar).toHaveAttribute('data-prefix', 'test-prefix');
    expect(screen.getByTestId('extra-count')).toHaveTextContent('1');
    expect(screen.getByTestId('min')).toHaveTextContent('true');
    expect(screen.getByTestId('hide-tools')).toHaveTextContent('bold');
  });

  it('renders without extra components', () => {
    render(
      <ConfigProvider>
        <ToolBar />
      </ConfigProvider>,
    );

    expect(screen.getByTestId('extra-count')).toHaveTextContent('0');
  });

  it('renders without hideTools', () => {
    render(
      <ConfigProvider>
        <ToolBar />
      </ConfigProvider>,
    );

    expect(screen.getByTestId('hide-tools')).toHaveTextContent('');
  });
});
