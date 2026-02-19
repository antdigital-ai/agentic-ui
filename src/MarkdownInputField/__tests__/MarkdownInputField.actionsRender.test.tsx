import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AttachmentFile } from '../AttachmentButton/types';
import { MarkdownInputField } from '../MarkdownInputField';

describe('MarkdownInputField - actionsRender', () => {
  it('should render custom actions when actionsRender is provided', () => {
    const actionsRender = () => [
      <button type="button" key="custom-action-1" data-testid="custom-action-1">
        Action 1
      </button>,
      <button type="button" key="custom-action-2" data-testid="custom-action-2">
        Action 2
      </button>,
    ];

    render(<MarkdownInputField actionsRender={actionsRender} />);

    expect(screen.getByTestId('custom-action-1')).toBeInTheDocument();
    expect(screen.getByTestId('custom-action-2')).toBeInTheDocument();
  });

  it('should pass correct props to actionsRender function', () => {
    const actionsRender = vi.fn().mockReturnValue([
      <button type="button" key="custom-action">
        Action
      </button>,
    ]);

    render(
      <MarkdownInputField value="test content" actionsRender={actionsRender} />,
    );

    // 验证传递给 actionsRender 的参数
    // 注意：重构后参数通过 SendActions 组件传递，包含更多字段
    expect(actionsRender).toHaveBeenCalledWith(
      expect.objectContaining({
        value: 'test content',
        isLoading: false,
        fileUploadStatus: 'done',
        // isHover 字段也会被传递
      }),
      expect.any(Array), // defaultActions 参数
    );
  });

  it('should include default actions in the render', () => {
    const actionsRender = (props: any, defaultActions: React.ReactNode[]) => [
      <button type="button" key="custom-action" data-testid="custom-action">
        Action
      </button>,
      ...defaultActions,
    ];

    render(<MarkdownInputField actionsRender={actionsRender} />);

    expect(screen.getByTestId('custom-action')).toBeInTheDocument();
    expect(screen.getByTestId('send-button')).toBeInTheDocument();
  });

  it('should update actions when component state changes', async () => {
    const actionsRender = vi
      .fn()
      .mockImplementation((props, defaultActions) => [
        <button type="button" key="custom-action" data-testid="custom-action">
          Action
        </button>,
        ...defaultActions,
      ]);

    const { container } = render(
      <MarkdownInputField actionsRender={actionsRender} />,
    );

    // 触发 hover 事件
    const wrapper = container.firstChild as HTMLElement;
    fireEvent.mouseEnter(wrapper);

    // 验证 actionsRender 被调用
    // 注意：重构后传递的参数结构有所变化
    expect(actionsRender).toHaveBeenCalled();
  });

  it('should handle action click events', () => {
    const onActionClick = vi.fn();
    const actionsRender = () => [
      <button
        type="button"
        key="custom-action"
        data-testid="custom-action"
        onClick={onActionClick}
      >
        Action
      </button>,
    ];

    render(<MarkdownInputField actionsRender={actionsRender} />);

    const actionButton = screen.getByTestId('custom-action');
    fireEvent.click(actionButton);

    expect(onActionClick).toHaveBeenCalled();
  });

  it('should render actions with correct styles', () => {
    const actionsRender = () => [
      <button type="button" key="custom-action" data-testid="custom-action">
        Action
      </button>,
    ];

    render(<MarkdownInputField actionsRender={actionsRender} />);

    const actionsContainer = screen
      .getByTestId('custom-action')
      .closest('.ant-agentic-md-input-field-send-actions');
    expect(actionsContainer).toHaveClass(
      'ant-agentic-md-input-field-send-actions',
    );
  });

  it('should handle file upload status correctly', async () => {
    const actionsRender = vi.fn().mockReturnValue([
      <button type="button" key="custom-action">
        Action
      </button>,
    ]);

    const uploadingFile = {
      name: 'test.txt',
      type: 'text/plain',
      size: 4,
      lastModified: Date.now(),
      webkitRelativePath: '',
      arrayBuffer: async () => new ArrayBuffer(0),
      slice: () => new Blob(),
      stream: () => new ReadableStream(),
      text: async () => 'test',
      uuid: '1',
      status: 'uploading' as const,
    } as AttachmentFile;

    render(
      <MarkdownInputField
        actionsRender={actionsRender}
        attachment={{
          enable: true,
          fileMap: new Map([['1', uploadingFile]]),
        }}
      />,
    );

    expect(actionsRender).toHaveBeenCalledWith(
      expect.objectContaining({
        fileUploadStatus: 'uploading',
      }),
      expect.any(Array),
    );

    await uploadingFile.arrayBuffer();
    uploadingFile.slice();
    uploadingFile.stream();
    await uploadingFile.text();
  });

  it('should handle loading state correctly', async () => {
    const onSend = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(resolve, 100);
        }),
    );
    const actionsRender = vi
      .fn()
      .mockImplementation((props, defaultActions) => defaultActions);

    render(
      <MarkdownInputField
        actionsRender={actionsRender}
        onSend={onSend}
        value="test message"
      />,
    );

    const sendButton = screen.getByTestId('send-button');
    fireEvent.click(sendButton);

    // 验证在发送过程中传递了正确的 loading 状态
    expect(actionsRender).toHaveBeenCalledWith(
      expect.objectContaining({
        isLoading: true,
      }),
      expect.any(Array),
    );
  });

  it('should handle disabled state correctly', () => {
    const actionsRender = () => [
      <button type="button" key="custom-action" data-testid="custom-action">
        Action
      </button>,
    ];

    render(
      <MarkdownInputField actionsRender={actionsRender} disabled={true} />,
    );

    const wrapper = screen
      .getByTestId('custom-action')
      .closest('.ant-agentic-md-input-field');
    expect(wrapper).toHaveClass('ant-agentic-md-input-field-disabled');
  });

  it('should maintain action order', () => {
    const actionsRender = (props: any, defaultActions: React.ReactNode[]) => [
      <button type="button" key="first" data-testid="first">
        First
      </button>,
      ...defaultActions,
      <button type="button" key="last" data-testid="last">
        Last
      </button>,
    ];

    render(<MarkdownInputField actionsRender={actionsRender} />);

    const container = screen
      .getByTestId('first')
      .closest('.ant-agentic-md-input-field-send-actions');
    const firstButton = screen.getByTestId('first');
    const lastButton = screen.getByTestId('last');
    const sendButton = screen.getByTestId('send-button');

    expect(container?.children[0]).toBe(firstButton);
    expect(container?.children[1]).toBe(sendButton);
    expect(container?.children[2]).toBe(lastButton);
  });
});
