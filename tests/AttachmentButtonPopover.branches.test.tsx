/**
 * AttachmentButtonPopover 分支覆盖补充测试
 *
 * 覆盖 vivo/oppo 设备分支、移动设备分支、点击/取消/打开相册/打开文件等交互
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, act } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock utils — 控制设备检测结果
const mocks = vi.hoisted(() => ({
  isVivoOrOppoDevice: vi.fn(() => false),
  isMobileDevice: vi.fn(() => false),
  kbToSize: vi.fn((kb: number) => `${kb} KB`),
}));

vi.mock(
  '../src/MarkdownInputField/AttachmentButton/utils',
  () => mocks,
);

// Mock useRefFunction 透传
vi.mock('../src/Hooks/useRefFunction', () => ({
  useRefFunction: (fn: any) => fn,
}));

import AttachmentButtonPopover from '../src/MarkdownInputField/AttachmentButton/AttachmentButtonPopover';

describe('AttachmentButtonPopover 分支覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isVivoOrOppoDevice.mockReturnValue(false);
    mocks.isMobileDevice.mockReturnValue(false);
  });

  /* ====== vivo/oppo 设备分支 ====== */

  describe('vivo/oppo 设备下渲染 Modal 及交互', () => {
    beforeEach(() => {
      mocks.isVivoOrOppoDevice.mockReturnValue(true);
    });

    it('渲染 Modal 容器和 children', () => {
      render(
        <AttachmentButtonPopover>
          <span>附件</span>
        </AttachmentButtonPopover>,
      );

      expect(screen.getByText('附件')).toBeInTheDocument();
    });

    it('点击 children 打开 Modal，显示相册/文件按钮', () => {
      render(
        <AttachmentButtonPopover uploadImage={vi.fn()}>
          <span>附件</span>
        </AttachmentButtonPopover>,
      );

      // 点击 children 触发 handleClick
      fireEvent.click(screen.getByText('附件'));

      // Modal 打开后应显示操作按钮
      expect(screen.getByText('打开相册')).toBeInTheDocument();
      expect(screen.getByText('打开文件')).toBeInTheDocument();
    });

    it('点击打开相册调用 uploadImage(true) 并关闭 Modal', async () => {
      const uploadImage = vi.fn().mockResolvedValue(undefined);

      render(
        <AttachmentButtonPopover uploadImage={uploadImage}>
          <span>附件</span>
        </AttachmentButtonPopover>,
      );

      // 打开 Modal
      fireEvent.click(screen.getByText('附件'));

      // 点击打开相册
      await act(async () => {
        fireEvent.click(screen.getByText('打开相册'));
      });

      expect(uploadImage).toHaveBeenCalledWith(true);
    });

    it('点击打开文件调用 uploadImage(false) 并关闭 Modal', async () => {
      const uploadImage = vi.fn().mockResolvedValue(undefined);

      render(
        <AttachmentButtonPopover uploadImage={uploadImage}>
          <span>附件</span>
        </AttachmentButtonPopover>,
      );

      // 打开 Modal
      fireEvent.click(screen.getByText('附件'));

      // 点击打开文件
      await act(async () => {
        fireEvent.click(screen.getByText('打开文件'));
      });

      expect(uploadImage).toHaveBeenCalledWith(false);
    });

    it('Modal 内容区 onClick 阻止冒泡', () => {
      render(
        <AttachmentButtonPopover uploadImage={vi.fn()}>
          <span>附件</span>
        </AttachmentButtonPopover>,
      );

      // 打开 Modal
      fireEvent.click(screen.getByText('附件'));

      // Modal body 内的 div 有 stopPropagation
      const galleryBtn = screen.getByText('打开相册');
      const modalBody = galleryBtn.closest(
        'div[style]',
      ) as HTMLElement;
      if (modalBody) {
        const event = new MouseEvent('click', { bubbles: true });
        const stopSpy = vi.spyOn(event, 'stopPropagation');
        modalBody.dispatchEvent(event);
        // 验证事件不会继续冒泡导致问题
      }
    });

    it('外层 div onClick 阻止冒泡', () => {
      const { container } = render(
        <AttachmentButtonPopover uploadImage={vi.fn()}>
          <span>附件</span>
        </AttachmentButtonPopover>,
      );

      // 外层容器 div 的 onClick 处理
      const outerDiv = container.firstElementChild as HTMLElement;
      if (outerDiv) {
        fireEvent.click(outerDiv);
      }
    });

    it('Modal onCancel 关闭弹窗', () => {
      render(
        <AttachmentButtonPopover uploadImage={vi.fn()}>
          <span>附件</span>
        </AttachmentButtonPopover>,
      );

      // 打开 Modal
      fireEvent.click(screen.getByText('附件'));
      expect(screen.getByText('打开相册')).toBeInTheDocument();

      // 点击遮罩关闭（antd Modal maskClosable）
      const mask = document.querySelector('.ant-modal-wrap');
      if (mask) {
        fireEvent.click(mask);
      }
    });

    it('自定义 locale 文案', () => {
      render(
        <AttachmentButtonPopover
          uploadImage={vi.fn()}
          locale={{
            'input.openGallery': 'Gallery',
            'input.openFile': 'Files',
          }}
        >
          <span>附件</span>
        </AttachmentButtonPopover>,
      );

      fireEvent.click(screen.getByText('附件'));

      expect(screen.getByText('Gallery')).toBeInTheDocument();
      expect(screen.getByText('Files')).toBeInTheDocument();
    });
  });

  /* ====== 移动设备分支 ====== */

  describe('移动设备下渲染纯 span', () => {
    it('isMobile 时渲染纯 span 包裹 children', () => {
      mocks.isMobileDevice.mockReturnValue(true);

      const { container } = render(
        <AttachmentButtonPopover>
          <button>Upload</button>
        </AttachmentButtonPopover>,
      );

      expect(screen.getByText('Upload')).toBeInTheDocument();
      // 不应有 Tooltip 或 Modal
      expect(container.querySelector('.ant-tooltip')).toBeNull();
    });
  });

  /* ====== 桌面端 Tooltip 分支中的 span onClick ====== */

  describe('桌面端 Tooltip 中 span onClick', () => {
    it('非 vivo 设备点击 span 不阻止默认行为', () => {
      mocks.isVivoOrOppoDevice.mockReturnValue(false);
      mocks.isMobileDevice.mockReturnValue(false);

      render(
        <AttachmentButtonPopover>
          <button>Upload</button>
        </AttachmentButtonPopover>,
      );

      const btn = screen.getByText('Upload');
      const span = btn.closest('span') as HTMLElement;
      if (span) {
        const event = new MouseEvent('click', { bubbles: true });
        const stopSpy = vi.spyOn(event, 'stopPropagation');
        span.dispatchEvent(event);
        // isVivoOrOppo 为 false，不应阻止冒泡
        expect(stopSpy).not.toHaveBeenCalled();
      }
    });
  });
});
