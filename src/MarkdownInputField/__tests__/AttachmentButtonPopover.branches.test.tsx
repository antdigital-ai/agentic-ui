/**
 * AttachmentButtonPopover 分支覆盖补充测试
 *
 * 覆盖设备分支、移动设备分支、提示层不拦截上传点击等交互
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock utils — 控制设备检测结果
const mocks = vi.hoisted(() => ({
  isVivoOrOppoDevice: vi.fn(() => false),
  isMobileDevice: vi.fn(() => false),
  kbToSize: vi.fn((kb: number) => `${kb} KB`),
}));

vi.mock('../AttachmentButton/utils', () => mocks);

import AttachmentButtonPopover from '../AttachmentButton/AttachmentButtonPopover';

describe('AttachmentButtonPopover 分支覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isVivoOrOppoDevice.mockReturnValue(false);
    mocks.isMobileDevice.mockReturnValue(false);
  });

  /* ====== vivo/oppo 设备分支 ====== */

  describe('vivo/oppo 设备下仍仅作为格式提示', () => {
    beforeEach(() => {
      mocks.isVivoOrOppoDevice.mockReturnValue(true);
    });

    it('渲染 children，不再展示二级 Modal 操作', () => {
      render(
        <AttachmentButtonPopover>
          <span>附件</span>
        </AttachmentButtonPopover>,
      );

      expect(screen.getByText('附件')).toBeInTheDocument();
      expect(screen.queryByText('打开相册')).not.toBeInTheDocument();
      expect(screen.queryByText('打开文件')).not.toBeInTheDocument();
    });

    it('点击 children 不阻止冒泡，也不在提示层内部调用上传', () => {
      const uploadImage = vi.fn().mockResolvedValue(undefined);

      render(
        <AttachmentButtonPopover uploadImage={uploadImage}>
          <span>附件</span>
        </AttachmentButtonPopover>,
      );

      const event = new MouseEvent('click', { bubbles: true });
      const stopSpy = vi.spyOn(event, 'stopPropagation');
      screen.getByText('附件').dispatchEvent(event);

      expect(stopSpy).not.toHaveBeenCalled();
      expect(uploadImage).not.toHaveBeenCalled();
    });
  });

  /* ====== 移动设备分支 ====== */

  describe('移动设备下使用 Popover 展示格式说明', () => {
    it('isMobile 时点击展开 Popover 展示支持格式', async () => {
      mocks.isMobileDevice.mockReturnValue(true);

      render(
        <AttachmentButtonPopover>
          <button type="button">Upload</button>
        </AttachmentButtonPopover>,
      );

      expect(screen.getByText('Upload')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Upload'));
      expect(await screen.findByText(/jpg/i)).toBeInTheDocument();
    });
  });

  /* ====== 桌面端 Tooltip 分支中的 span onClick ====== */

  describe('桌面端 Tooltip 中 span onClick', () => {
    it('非 vivo 设备点击 span 不阻止默认行为', () => {
      mocks.isVivoOrOppoDevice.mockReturnValue(false);
      mocks.isMobileDevice.mockReturnValue(false);

      render(
        <AttachmentButtonPopover>
          <button type="button">Upload</button>
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
