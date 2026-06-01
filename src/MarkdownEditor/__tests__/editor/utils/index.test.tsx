import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import * as utils from '../../../editor/utils';

describe('MarkdownEditor Utils', () => {
  describe('copy', () => {
    it('应该正确深拷贝对象', () => {
      const original = { a: 1, b: { c: 2 } };
      const copied = utils.copy(original);

      expect(copied).toEqual(original);
      expect(copied).not.toBe(original);
      expect(copied.b).not.toBe(original.b);
    });

    it('应该正确深拷贝数组', () => {
      const original = [1, 2, [3, 4]];
      const copied = utils.copy(original);

      expect(copied).toEqual(original);
      expect(copied).not.toBe(original);
      expect(copied[2]).not.toBe(original[2]);
    });
  });

  describe('isMod', () => {
    it('应该检测 Ctrl 键', () => {
      const event = { ctrlKey: true, metaKey: false } as any;
      expect(utils.isMod(event)).toBe(true);
    });

    it('应该检测 Cmd 键 (Mac)', () => {
      const event = { ctrlKey: false, metaKey: true } as any;
      expect(utils.isMod(event)).toBe(true);
    });

    it('应该在没有修饰键时返回 false', () => {
      const event = { ctrlKey: false, metaKey: false } as any;
      expect(utils.isMod(event)).toBe(false);
    });
  });

  describe('download', () => {
    it('应该创建下载链接并触发点击事件', () => {
      // 模拟 DOM API
      const mockCreateElement = vi.spyOn(document, 'createElement');
      const mockCreateObjectURL = vi.fn().mockReturnValue('blob:url');
      const mockRevokeObjectURL = vi.fn();

      // @ts-ignore
      global.URL.createObjectURL = mockCreateObjectURL;
      // @ts-ignore
      global.URL.revokeObjectURL = mockRevokeObjectURL;

      const mockLink = document.createElement('a');
      mockLink.setAttribute = vi.fn();
      mockLink.addEventListener = vi.fn();
      mockLink.click = vi.fn();
      Object.defineProperty(mockLink, 'style', {
        value: { visibility: '' },
        writable: true,
      });

      mockCreateElement.mockImplementation((tagName) => {
        if (tagName === 'a') return mockLink as any;
        return document.createElement(tagName);
      });

      const mockAppendChild = vi
        .spyOn(document.body, 'appendChild')
        .mockImplementation(vi.fn());
      const mockRemoveChild = vi
        .spyOn(document.body, 'removeChild')
        .mockImplementation(vi.fn());

      // 测试 Blob 数据下载
      const blob = new Blob(['test'], { type: 'text/plain' });
      utils.download(blob, 'test.txt');

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockCreateObjectURL).toHaveBeenCalledWith(blob);
      expect(mockLink.setAttribute).toHaveBeenCalledWith('href', 'blob:url');
      expect(mockLink.setAttribute).toHaveBeenCalledWith(
        'download',
        'test.txt',
      );
      expect(mockLink.style.visibility).toBe('hidden');
      expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
      expect(mockLink.addEventListener).toHaveBeenCalledWith(
        'click',
        expect.any(Function),
      );

      // 触发 click 监听器，断言 stopPropagation 被调用
      const clickHandler = mockLink.addEventListener.mock.calls.find(
        (c: [string, (...args: unknown[]) => unknown]) => c[0] === 'click',
      )?.[1];
      const mockEvent = { stopPropagation: vi.fn() };
      clickHandler(mockEvent);
      expect(mockEvent.stopPropagation).toHaveBeenCalled();

      // 清理模拟
      mockCreateElement.mockRestore();
      mockAppendChild.mockRestore();
      mockRemoveChild.mockRestore();
    });

    it('应该处理 Uint8Array 数据', () => {
      // 模拟 DOM API
      const mockCreateElement = vi.spyOn(document, 'createElement');
      const mockCreateObjectURL = vi.fn().mockReturnValue('blob:url');

      // @ts-ignore
      global.URL.createObjectURL = mockCreateObjectURL;

      const mockLink = document.createElement('a');
      mockLink.setAttribute = vi.fn();
      mockLink.addEventListener = vi.fn();
      mockLink.click = vi.fn();
      Object.defineProperty(mockLink, 'style', {
        value: { visibility: '' },
        writable: true,
      });

      mockCreateElement.mockImplementation((tagName) => {
        if (tagName === 'a') return mockLink as any;
        return document.createElement(tagName);
      });

      const mockAppendChild = vi
        .spyOn(document.body, 'appendChild')
        .mockImplementation(vi.fn());
      const mockRemoveChild = vi
        .spyOn(document.body, 'removeChild')
        .mockImplementation(vi.fn());

      // 测试 Uint8Array 数据下载
      const uint8Array = new Uint8Array([1, 2, 3, 4, 5]);
      utils.download(uint8Array, 'test.bin');

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockLink.setAttribute).toHaveBeenCalledWith(
        'download',
        'test.bin',
      );
      expect(mockLink.click).toHaveBeenCalled();

      // 清理模拟
      mockCreateElement.mockRestore();
      mockAppendChild.mockRestore();
      mockRemoveChild.mockRestore();
    });
  });

  describe('debounce', () => {
    it('应该防抖执行函数', () => {
      vi.useFakeTimers();

      const mockFn = vi.fn();
      const debouncedFn = utils.debounce(mockFn, 100);

      // 连续调用多次
      debouncedFn();
      debouncedFn();
      debouncedFn();

      // 函数不应该立即执行
      expect(mockFn).not.toHaveBeenCalled();

      // 快进时间
      vi.advanceTimersByTime(100);

      // 函数应该只执行一次
      expect(mockFn).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it('应该支持 flush 方法立即执行', () => {
      vi.useFakeTimers();

      const mockFn = vi.fn();
      const debouncedFn = utils.debounce(mockFn, 100);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      // 立即执行
      debouncedFn.flush();
      expect(mockFn).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it('应该支持 cancel 方法取消执行', () => {
      vi.useFakeTimers();

      const mockFn = vi.fn();
      const debouncedFn = utils.debounce(mockFn, 100);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      // 取消执行
      debouncedFn.cancel();

      // 快进时间
      vi.advanceTimersByTime(100);

      // 函数不应该被执行
      expect(mockFn).not.toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('useGetSetState', () => {
    it('get/set 应更新状态', () => {
      const TestComp = () => {
        const [get, set] = utils.useGetSetState({ count: 0 });
        return (
          <div>
            <span data-testid="count">{get().count}</span>
            <button
              type="button"
              onClick={() => set({ count: get().count + 1 })}
              data-testid="inc"
            >
              +
            </button>
          </div>
        );
      };
      const { getByTestId } = render(<TestComp />);
      expect(getByTestId('count')).toHaveTextContent('0');
      fireEvent.click(getByTestId('inc'));
      expect(getByTestId('count')).toHaveTextContent('1');
    });

    it('set 传入 null/undefined 时直接返回不更新状态', () => {
      const TestComp = () => {
        const [get, set] = utils.useGetSetState({ a: 1 });
        return (
          <div>
            <span data-testid="val">{get().a}</span>
            <button
              type="button"
              onClick={() => set(null as any)}
              data-testid="set-null"
            >
              set null
            </button>
            <button
              type="button"
              onClick={() => set(undefined as any)}
              data-testid="set-undefined"
            >
              set undefined
            </button>
          </div>
        );
      };
      const { getByTestId } = render(<TestComp />);
      expect(getByTestId('val')).toHaveTextContent('1');
      fireEvent.click(getByTestId('set-null'));
      expect(getByTestId('val')).toHaveTextContent('1');
      fireEvent.click(getByTestId('set-undefined'));
      expect(getByTestId('val')).toHaveTextContent('1');
    });

    it('set 传入非对象时在开发环境报错', () => {
      const err = vi.spyOn(console, 'error').mockImplementation(() => {});
      const TestComp = () => {
        const [, set] = utils.useGetSetState({ a: 1 });
        return (
          <button type="button" onClick={() => set('not-object' as any)}>
            set
          </button>
        );
      };
      const { getByText } = render(<TestComp />);
      fireEvent.click(getByText('set'));
      if (process.env.NODE_ENV !== 'production') {
        expect(err).toHaveBeenCalledWith(
          'useGetSetState setter patch must be an object.',
        );
      }
      err.mockRestore();
    });

    it('初始状态非对象时在开发环境报错', () => {
      const err = vi.spyOn(console, 'error').mockImplementation(() => {});
      const TestComp = () => {
        utils.useGetSetState(1 as any);
        return <div>ok</div>;
      };
      render(<TestComp />);
      if (process.env.NODE_ENV !== 'production') {
        expect(err).toHaveBeenCalledWith(
          'useGetSetState initial state must be an object.',
        );
      }
      err.mockRestore();
    });
  });

  describe('MARKDOWN_EDITOR_EVENTS', () => {
    it('应该包含正确的事件常量', () => {
      expect(utils.MARKDOWN_EDITOR_EVENTS.SELECTIONCHANGE).toBe(
        'md-editor-selectionchange',
      );
      expect(utils.MARKDOWN_EDITOR_EVENTS.FOCUS).toBe('md-editor-focus');
      expect(utils.MARKDOWN_EDITOR_EVENTS.BLUR).toBe('md-editor-blur');
    });
  });
});
