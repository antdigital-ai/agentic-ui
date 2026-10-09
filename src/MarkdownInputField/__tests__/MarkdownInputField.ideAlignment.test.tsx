import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as AttachmentUtils from '../AttachmentButton/utils';
import { MarkdownInputField } from '../MarkdownInputField';

// BorderBeamAnimation 依赖 ResizeObserver，测试环境统一 mock 掉
vi.mock('../BorderBeamAnimation', () => ({
  BorderBeamAnimation: () => null,
}));

/**
 * 受控包装：外部 state 驱动输入内容，
 * 让"输入 → 发送 → 历史回溯"链路走真实组件逻辑。
 */
const ControlledField: React.FC<{
  onSend?: (v: string) => Promise<void>;
  inputHistoryEnable?: boolean;
  followupsItems?: { text: string; fillOnly?: boolean }[];
  attachment?: Record<string, unknown>;
  typing?: boolean;
  value?: string;
}> = ({
  onSend,
  inputHistoryEnable,
  followupsItems,
  attachment,
  typing,
  value,
}) => {
  const [innerValue, setInnerValue] = React.useState(value ?? '');
  return (
    <MarkdownInputField
      value={value ?? innerValue}
      onChange={setInnerValue}
      onSend={onSend}
      inputHistory={inputHistoryEnable ? { enable: true } : undefined}
      followups={followupsItems ? { items: followupsItems } : undefined}
      attachment={attachment as never}
      typing={typing}
    />
  );
};

/** 获取组件根节点 */
function getRoot(container: HTMLElement) {
  return container.querySelector(
    '[data-testid="markdown-input-field"]',
  ) as HTMLElement;
}

/** 构造携带文件的 DataTransfer */
function createFileDataTransfer(name: string): DataTransfer {
  const dt = new DataTransfer();
  dt.items.add(new File(['file-content'], name, { type: 'image/png' }));
  return dt;
}

describe('MarkdownInputField 对齐 dtcoder-ide 输入框能力', () => {
  beforeEach(() => {
    vi.spyOn(AttachmentUtils, 'isMobileDevice').mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('输入历史导航（inputHistory）', () => {
    it('发送成功后按 ↑ 拦截并回溯历史（preventDefault 生效）', async () => {
      const onSend = vi.fn().mockResolvedValue(undefined);
      const { container, rerender } = render(
        <ControlledField
          onSend={onSend}
          inputHistoryEnable
          value="第一条消息"
        />,
      );
      const root = getRoot(container);

      // 发送第一条
      fireEvent.keyDown(root, { key: 'Enter' });
      await waitFor(() => expect(onSend).toHaveBeenCalledTimes(1));

      // 受控 value 更新为第二条再发送
      rerender(
        <ControlledField
          onSend={onSend}
          inputHistoryEnable
          value="第二条消息"
        />,
      );
      fireEvent.keyDown(root, { key: 'Enter' });
      await waitFor(() => expect(onSend).toHaveBeenCalledTimes(2));

      // 发送后编辑器已清空（内容为空 → 光标在开头），↑ 应被历史导航拦截
      const evt = new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        bubbles: true,
        cancelable: true,
      });
      root.dispatchEvent(evt);
      expect(evt.defaultPrevented).toBe(true);
    });

    it('历史为空时 ↑ 放行默认行为', () => {
      const onSend = vi.fn().mockResolvedValue(undefined);
      const { container } = render(
        <ControlledField onSend={onSend} inputHistoryEnable value="" />,
      );
      const root = getRoot(container);

      const evt = new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        bubbles: true,
        cancelable: true,
      });
      root.dispatchEvent(evt);
      expect(evt.defaultPrevented).toBe(false);
    });

    it('未启用 inputHistory 时 ↑ 放行默认行为', () => {
      const { container } = render(
        <ControlledField onSend={vi.fn()} value="任意内容" />,
      );
      const root = getRoot(container);

      const evt = new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        bubbles: true,
        cancelable: true,
      });
      root.dispatchEvent(evt);
      expect(evt.defaultPrevented).toBe(false);
    });
  });

  describe('followups 建议问题区', () => {
    it('渲染建议问题，点击非 fillOnly 条目直接发送', async () => {
      const onSend = vi.fn().mockResolvedValue(undefined);
      render(
        <ControlledField
          onSend={onSend}
          followupsItems={[
            { text: '解释这段代码' },
            { text: '补充单元测试', fillOnly: true },
          ]}
        />,
      );

      const followups = screen.getByTestId('markdown-input-field-followups');
      expect(followups.querySelectorAll('button')).toHaveLength(2);

      fireEvent.click(followups.querySelectorAll('button')[0]);
      await waitFor(() => {
        expect(onSend).toHaveBeenCalledWith('解释这段代码');
      });
    });

    it('fillOnly 条目仅回填输入框，不触发发送', () => {
      const onSend = vi.fn().mockResolvedValue(undefined);
      render(
        <ControlledField
          onSend={onSend}
          followupsItems={[{ text: '补充单元测试', fillOnly: true }]}
        />,
      );

      const followups = screen.getByTestId('markdown-input-field-followups');
      fireEvent.click(followups.querySelectorAll('button')[0]);

      expect(onSend).not.toHaveBeenCalled();
    });

    it('items 为空时不渲染建议区', () => {
      render(<ControlledField followupsItems={[]} onSend={vi.fn()} />);
      expect(
        screen.queryByTestId('markdown-input-field-followups'),
      ).not.toBeInTheDocument();
    });
  });

  describe('拖拽上传（drop zone）', () => {
    it('attachment 未启用时不显示覆盖层、不触发上传', async () => {
      const upload = vi.fn().mockResolvedValue('blob:url');
      const { container } = render(
        <ControlledField onSend={vi.fn()} attachment={{ upload }} />,
      );
      const root = getRoot(container);

      const dt = createFileDataTransfer('a.png');
      fireEvent.dragEnter(root, { dataTransfer: dt });
      fireEvent.dragOver(root, { dataTransfer: dt });

      expect(
        screen.queryByTestId('markdown-input-field-dnd-overlay'),
      ).not.toBeInTheDocument();

      fireEvent.drop(root, { dataTransfer: dt });
      await waitFor(() => expect(upload).not.toHaveBeenCalled());
    });

    it('attachment.enable + upload 时拖入显示覆盖层并上传', async () => {
      const upload = vi.fn().mockResolvedValue('blob:url');
      const { container } = render(
        <ControlledField
          onSend={vi.fn()}
          attachment={{ enable: true, upload }}
        />,
      );
      const root = getRoot(container);

      const dt = createFileDataTransfer('hello.png');
      fireEvent.dragEnter(root, { dataTransfer: dt });
      fireEvent.dragOver(root, { dataTransfer: dt });

      await waitFor(() => {
        expect(
          screen.getByTestId('markdown-input-field-dnd-overlay'),
        ).toBeInTheDocument();
      });

      fireEvent.drop(root, { dataTransfer: dt });
      await waitFor(() => {
        expect(upload).toHaveBeenCalled();
      });
    });

    it('typing 状态下不显示覆盖层', () => {
      const upload = vi.fn().mockResolvedValue('blob:url');
      const { container } = render(
        <ControlledField
          typing
          onSend={vi.fn()}
          attachment={{ enable: true, upload }}
        />,
      );
      const root = getRoot(container);

      const dt = createFileDataTransfer('a.png');
      fireEvent.dragEnter(root, { dataTransfer: dt });
      fireEvent.dragOver(root, { dataTransfer: dt });

      expect(
        screen.queryByTestId('markdown-input-field-dnd-overlay'),
      ).not.toBeInTheDocument();
    });
  });
});
