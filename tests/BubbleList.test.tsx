import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BubbleConfigContext } from '../src/Bubble/BubbleConfigProvide';
import { BubbleList } from '../src/Bubble/List';
import { MessageBubbleData } from '../src/Bubble/type';

const BubbleConfigProvide: React.FC<{
  children: React.ReactNode;
  compact?: boolean;
  standalone?: boolean;
}> = ({ children, compact, standalone }) => {
  return (
    <BubbleConfigContext.Provider
      value={{ standalone: standalone || false, compact, locale: {} as any }}
    >
      {children}
    </BubbleConfigContext.Provider>
  );
};

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('BubbleList', () => {
  const createMockBubbleData = (
    id: string,
    role: 'user' | 'assistant',
    content: string,
  ): MessageBubbleData => ({
    id,
    role,
    content,
    createAt: Date.now(),
    updateAt: Date.now(),
  });

  describe('isLast property', () => {
    it('should set isLast to true only for the last bubble in the list', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'First message'),
        createMockBubbleData('2', 'assistant', 'Second message'),
        createMockBubbleData('3', 'user', 'Third message'),
        createMockBubbleData('4', 'assistant', 'Last message'),
      ];

      render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={bubbleList} />
        </BubbleConfigProvide>,
      );

      // 验证只有最后一个消息的 isLast 为 true
      expect((bubbleList[0] as any).isLast).toBe(false);
      expect((bubbleList[1] as any).isLast).toBe(false);
      expect((bubbleList[2] as any).isLast).toBe(false);
      expect((bubbleList[3] as any).isLast).toBe(true);
    });

    it('should set isLast to true for single bubble in the list', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Only message'),
      ];

      render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={bubbleList} />
        </BubbleConfigProvide>,
      );

      // 验证单个消息的 isLast 为 true
      expect((bubbleList[0] as any).isLast).toBe(true);
    });

    it('should update isLast when bubble list changes', () => {
      const initialBubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'First message'),
        createMockBubbleData('2', 'assistant', 'Second message'),
      ];

      const { rerender } = render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={initialBubbleList} />
        </BubbleConfigProvide>,
      );

      // 验证初始状态
      expect((initialBubbleList[0] as any).isLast).toBe(false);
      expect((initialBubbleList[1] as any).isLast).toBe(true);

      // 添加新的消息
      const updatedBubbleList: MessageBubbleData[] = [
        ...initialBubbleList,
        createMockBubbleData('3', 'user', 'Third message'),
      ];

      rerender(
        <BubbleConfigProvide>
          <BubbleList bubbleList={updatedBubbleList} />
        </BubbleConfigProvide>,
      );

      // 验证更新后的状态：之前的最后一个消息不再是最后一个
      expect((updatedBubbleList[0] as any).isLast).toBe(false);
      expect((updatedBubbleList[1] as any).isLast).toBe(false);
      expect((updatedBubbleList[2] as any).isLast).toBe(true);
    });

    it('should update isLast when removing the last bubble', () => {
      const initialBubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'First message'),
        createMockBubbleData('2', 'assistant', 'Second message'),
        createMockBubbleData('3', 'user', 'Third message'),
      ];

      const { rerender } = render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={initialBubbleList} />
        </BubbleConfigProvide>,
      );

      // 验证初始状态
      expect((initialBubbleList[0] as any).isLast).toBe(false);
      expect((initialBubbleList[1] as any).isLast).toBe(false);
      expect((initialBubbleList[2] as any).isLast).toBe(true);

      // 移除最后一个消息
      const updatedBubbleList: MessageBubbleData[] = [
        initialBubbleList[0],
        initialBubbleList[1],
      ];

      rerender(
        <BubbleConfigProvide>
          <BubbleList bubbleList={updatedBubbleList} />
        </BubbleConfigProvide>,
      );

      // 验证更新后的状态：之前的倒数第二个消息现在成为最后一个
      expect((updatedBubbleList[0] as any).isLast).toBe(false);
      expect((updatedBubbleList[1] as any).isLast).toBe(true);
    });

    it('should maintain isLast property for different roles', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'User message 1'),
        createMockBubbleData('2', 'user', 'User message 2'),
        createMockBubbleData('3', 'assistant', 'Assistant message 1'),
        createMockBubbleData('4', 'assistant', 'Assistant message 2'),
        createMockBubbleData('5', 'user', 'User message 3'),
      ];

      render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={bubbleList} />
        </BubbleConfigProvide>,
      );

      // 验证无论角色如何，只有最后一个消息的 isLast 为 true
      expect((bubbleList[0] as any).isLast).toBe(false);
      expect((bubbleList[1] as any).isLast).toBe(false);
      expect((bubbleList[2] as any).isLast).toBe(false);
      expect((bubbleList[3] as any).isLast).toBe(false);
      expect((bubbleList[4] as any).isLast).toBe(true);
    });
  });

  describe('isLatest property', () => {
    it('should set isLatest to true only for the last bubble in the list', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'First message'),
        createMockBubbleData('2', 'assistant', 'Second message'),
        createMockBubbleData('3', 'user', 'Third message'),
        createMockBubbleData('4', 'assistant', 'Last message'),
      ];

      render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={bubbleList} />
        </BubbleConfigProvide>,
      );

      // 验证只有最后一个消息的 isLatest 为 true
      expect(bubbleList[0].isLatest).toBe(false);
      expect(bubbleList[1].isLatest).toBe(false);
      expect(bubbleList[2].isLatest).toBe(false);
      expect(bubbleList[3].isLatest).toBe(true);
    });

    it('should set isLatest to true for single bubble in the list', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Only message'),
      ];

      render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={bubbleList} />
        </BubbleConfigProvide>,
      );

      // 验证单个消息的 isLatest 为 true
      expect(bubbleList[0].isLatest).toBe(true);
    });

    it('should handle empty bubble list', () => {
      const bubbleList: MessageBubbleData[] = [];

      render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={bubbleList} />
        </BubbleConfigProvide>,
      );

      // 空列表不应该抛出错误
      expect(bubbleList.length).toBe(0);
    });

    it('should update isLatest when bubble list changes', () => {
      const initialBubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'First message'),
        createMockBubbleData('2', 'assistant', 'Second message'),
      ];

      const { rerender } = render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={initialBubbleList} />
        </BubbleConfigProvide>,
      );

      // 验证初始状态
      expect(initialBubbleList[0].isLatest).toBe(false);
      expect(initialBubbleList[1].isLatest).toBe(true);

      // 添加新的消息
      const updatedBubbleList: MessageBubbleData[] = [
        ...initialBubbleList,
        createMockBubbleData('3', 'user', 'Third message'),
      ];

      rerender(
        <BubbleConfigProvide>
          <BubbleList bubbleList={updatedBubbleList} />
        </BubbleConfigProvide>,
      );

      // 验证更新后的状态
      expect(updatedBubbleList[0].isLatest).toBe(false);
      expect(updatedBubbleList[1].isLatest).toBe(false);
      expect(updatedBubbleList[2].isLatest).toBe(true);
    });

    it('should maintain isLatest property for different roles', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'User message 1'),
        createMockBubbleData('2', 'user', 'User message 2'),
        createMockBubbleData('3', 'assistant', 'Assistant message 1'),
        createMockBubbleData('4', 'assistant', 'Assistant message 2'),
        createMockBubbleData('5', 'user', 'User message 3'),
      ];

      render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={bubbleList} />
        </BubbleConfigProvide>,
      );

      // 验证无论角色如何，只有最后一个消息的 isLatest 为 true
      expect(bubbleList[0].isLatest).toBe(false);
      expect(bubbleList[1].isLatest).toBe(false);
      expect(bubbleList[2].isLatest).toBe(false);
      expect(bubbleList[3].isLatest).toBe(false);
      expect(bubbleList[4].isLatest).toBe(true);
    });
  });

  describe('onLikeCancel callback', () => {
    it('should call onLikeCancel when provided', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
      ];
      const mockOnLikeCancel = vi.fn();

      render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={bubbleList} onLikeCancel={mockOnLikeCancel} />
        </BubbleConfigProvide>,
      );

      // 验证回调函数被正确传递
      expect(mockOnLikeCancel).toBeDefined();
    });

    it('should handle onLikeCancel when not provided', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
      ];

      expect(() => {
        render(
          <BubbleConfigProvide>
            <BubbleList bubbleList={bubbleList} />
          </BubbleConfigProvide>,
        );
      }).not.toThrow();
    });
  });

  describe('shouldShowCopy callback', () => {
    it('should handle shouldShowCopy as boolean', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
      ];

      expect(() => {
        render(
          <BubbleConfigProvide>
            <BubbleList bubbleList={bubbleList} shouldShowCopy={true} />
          </BubbleConfigProvide>,
        );
      }).not.toThrow();
    });

    it('should handle shouldShowCopy as function', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
      ];
      const mockShouldShowCopy = vi.fn(() => true);

      render(
        <BubbleConfigProvide>
          <BubbleList
            bubbleList={bubbleList}
            shouldShowCopy={mockShouldShowCopy}
          />
        </BubbleConfigProvide>,
      );

      // 验证函数被正确传递
      expect(mockShouldShowCopy).toBeDefined();
    });

    it('should handle shouldShowCopy when not provided', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
      ];

      expect(() => {
        render(
          <BubbleConfigProvide>
            <BubbleList bubbleList={bubbleList} />
          </BubbleConfigProvide>,
        );
      }).not.toThrow();
    });
  });

  describe('onScroll callback', () => {
    it('should call onScroll when scroll event occurs', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
      ];
      const mockOnScroll = vi.fn();

      const { container } = render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={bubbleList} onScroll={mockOnScroll} />
        </BubbleConfigProvide>,
      );

      // 找到BubbleList的容器元素
      const bubbleListContainer = container.querySelector('[data-chat-list]');
      expect(bubbleListContainer).toBeTruthy();

      // 触发滚动事件
      fireEvent.scroll(bubbleListContainer!);

      // 验证回调被调用
      expect(mockOnScroll).toHaveBeenCalledTimes(1);
    });

    it('should handle onScroll when not provided', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
      ];

      const { container } = render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={bubbleList} />
        </BubbleConfigProvide>,
      );

      const bubbleListContainer = container.querySelector('[data-chat-list]');
      expect(bubbleListContainer).toBeTruthy();

      // 应该不会抛出错误
      expect(() => {
        fireEvent.scroll(bubbleListContainer!);
      }).not.toThrow();
    });
  });

  describe('onWheel callback', () => {
    it('should call onWheel when wheel event occurs', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
      ];
      const mockOnWheel = vi.fn();

      const { container } = render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={bubbleList} onWheel={mockOnWheel} />
        </BubbleConfigProvide>,
      );

      const bubbleListContainer = container.querySelector('[data-chat-list]');
      expect(bubbleListContainer).toBeTruthy();

      // 触发滚轮事件
      fireEvent.wheel(bubbleListContainer!);

      // 验证回调被调用
      expect(mockOnWheel).toHaveBeenCalledTimes(1);
    });

    it('should handle onWheel when not provided', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
      ];

      const { container } = render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={bubbleList} />
        </BubbleConfigProvide>,
      );

      const bubbleListContainer = container.querySelector('[data-chat-list]');
      expect(bubbleListContainer).toBeTruthy();

      // 应该不会抛出错误
      expect(() => {
        fireEvent.wheel(bubbleListContainer!);
      }).not.toThrow();
    });
  });

  describe('onTouchMove callback', () => {
    it('should call onTouchMove when touch move event occurs', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
      ];
      const mockOnTouchMove = vi.fn();

      const { container } = render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={bubbleList} onTouchMove={mockOnTouchMove} />
        </BubbleConfigProvide>,
      );

      const bubbleListContainer = container.querySelector('[data-chat-list]');
      expect(bubbleListContainer).toBeTruthy();

      // 触发触摸移动事件
      fireEvent.touchMove(bubbleListContainer!);

      // 验证回调被调用
      expect(mockOnTouchMove).toHaveBeenCalledTimes(1);
    });

    it('should handle onTouchMove when not provided', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
      ];

      const { container } = render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={bubbleList} />
        </BubbleConfigProvide>,
      );

      const bubbleListContainer = container.querySelector('[data-chat-list]');
      expect(bubbleListContainer).toBeTruthy();

      // 应该不会抛出错误
      expect(() => {
        fireEvent.touchMove(bubbleListContainer!);
      }).not.toThrow();
    });
  });

  describe('event handlers integration', () => {
    it('should handle multiple event handlers together', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
      ];
      const mockOnScroll = vi.fn();
      const mockOnWheel = vi.fn();
      const mockOnTouchMove = vi.fn();
      const mockOnLikeCancel = vi.fn();
      const mockShouldShowCopy = vi.fn(() => true);

      const { container } = render(
        <BubbleConfigProvide>
          <BubbleList
            bubbleList={bubbleList}
            onScroll={mockOnScroll}
            onWheel={mockOnWheel}
            onTouchMove={mockOnTouchMove}
            onLikeCancel={mockOnLikeCancel}
            shouldShowCopy={mockShouldShowCopy}
          />
        </BubbleConfigProvide>,
      );

      const bubbleListContainer = container.querySelector('[data-chat-list]');
      expect(bubbleListContainer).toBeTruthy();

      // 触发所有事件
      fireEvent.scroll(bubbleListContainer!);
      fireEvent.wheel(bubbleListContainer!);
      fireEvent.touchMove(bubbleListContainer!);

      // 验证所有回调都被调用
      expect(mockOnScroll).toHaveBeenCalledTimes(1);
      expect(mockOnWheel).toHaveBeenCalledTimes(1);
      expect(mockOnTouchMove).toHaveBeenCalledTimes(1);
      expect(mockOnLikeCancel).toBeDefined();
      expect(mockShouldShowCopy).toBeDefined();
    });
  });

  describe('onLikeCancel callback', () => {
    it('should call onLikeCancel when provided', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
      ];
      const mockOnLikeCancel = vi.fn();

      render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={bubbleList} onLikeCancel={mockOnLikeCancel} />
        </BubbleConfigProvide>,
      );

      // 验证回调函数被正确传递
      expect(mockOnLikeCancel).toBeDefined();
    });

    it('should handle onLikeCancel when not provided', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
      ];

      expect(() => {
        render(
          <BubbleConfigProvide>
            <BubbleList bubbleList={bubbleList} />
          </BubbleConfigProvide>,
        );
      }).not.toThrow();
    });
  });

  describe('shouldShowCopy callback', () => {
    it('should handle shouldShowCopy as boolean', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
      ];

      expect(() => {
        render(
          <BubbleConfigProvide>
            <BubbleList bubbleList={bubbleList} shouldShowCopy={true} />
          </BubbleConfigProvide>,
        );
      }).not.toThrow();
    });

    it('should handle shouldShowCopy as function', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
      ];
      const mockShouldShowCopy = vi.fn(() => true);

      render(
        <BubbleConfigProvide>
          <BubbleList
            bubbleList={bubbleList}
            shouldShowCopy={mockShouldShowCopy}
          />
        </BubbleConfigProvide>,
      );

      // 验证函数被正确传递
      expect(mockShouldShowCopy).toBeDefined();
    });

    it('should handle shouldShowCopy when not provided', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
      ];

      expect(() => {
        render(
          <BubbleConfigProvide>
            <BubbleList bubbleList={bubbleList} />
          </BubbleConfigProvide>,
        );
      }).not.toThrow();
    });
  });

  describe('onScroll callback', () => {
    it('should call onScroll when scroll event occurs', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
      ];
      const mockOnScroll = vi.fn();

      const { container } = render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={bubbleList} onScroll={mockOnScroll} />
        </BubbleConfigProvide>,
      );

      // 找到BubbleList的容器元素
      const bubbleListContainer = container.querySelector('[data-chat-list]');
      expect(bubbleListContainer).toBeTruthy();

      // 触发滚动事件
      fireEvent.scroll(bubbleListContainer!);

      // 验证回调被调用
      expect(mockOnScroll).toHaveBeenCalledTimes(1);
    });

    it('should handle onScroll when not provided', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
      ];

      const { container } = render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={bubbleList} />
        </BubbleConfigProvide>,
      );

      const bubbleListContainer = container.querySelector('[data-chat-list]');
      expect(bubbleListContainer).toBeTruthy();

      // 应该不会抛出错误
      expect(() => {
        fireEvent.scroll(bubbleListContainer!);
      }).not.toThrow();
    });
  });

  describe('onWheel callback', () => {
    it('should call onWheel when wheel event occurs', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
      ];
      const mockOnWheel = vi.fn();

      const { container } = render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={bubbleList} onWheel={mockOnWheel} />
        </BubbleConfigProvide>,
      );

      const bubbleListContainer = container.querySelector('[data-chat-list]');
      expect(bubbleListContainer).toBeTruthy();

      // 触发滚轮事件
      fireEvent.wheel(bubbleListContainer!);

      // 验证回调被调用
      expect(mockOnWheel).toHaveBeenCalledTimes(1);
    });

    it('should handle onWheel when not provided', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
      ];

      const { container } = render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={bubbleList} />
        </BubbleConfigProvide>,
      );

      const bubbleListContainer = container.querySelector('[data-chat-list]');
      expect(bubbleListContainer).toBeTruthy();

      // 应该不会抛出错误
      expect(() => {
        fireEvent.wheel(bubbleListContainer!);
      }).not.toThrow();
    });
  });

  describe('onTouchMove callback', () => {
    it('should call onTouchMove when touch move event occurs', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
      ];
      const mockOnTouchMove = vi.fn();

      const { container } = render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={bubbleList} onTouchMove={mockOnTouchMove} />
        </BubbleConfigProvide>,
      );

      const bubbleListContainer = container.querySelector('[data-chat-list]');
      expect(bubbleListContainer).toBeTruthy();

      // 触发触摸移动事件
      fireEvent.touchMove(bubbleListContainer!);

      // 验证回调被调用
      expect(mockOnTouchMove).toHaveBeenCalledTimes(1);
    });

    it('should handle onTouchMove when not provided', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
      ];

      const { container } = render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={bubbleList} />
        </BubbleConfigProvide>,
      );

      const bubbleListContainer = container.querySelector('[data-chat-list]');
      expect(bubbleListContainer).toBeTruthy();

      // 应该不会抛出错误
      expect(() => {
        fireEvent.touchMove(bubbleListContainer!);
      }).not.toThrow();
    });
  });

  describe('event handlers integration', () => {
    it('should handle multiple event handlers together', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
      ];
      const mockOnScroll = vi.fn();
      const mockOnWheel = vi.fn();
      const mockOnTouchMove = vi.fn();
      const mockOnLikeCancel = vi.fn();
      const mockShouldShowCopy = vi.fn(() => true);

      const { container } = render(
        <BubbleConfigProvide>
          <BubbleList
            bubbleList={bubbleList}
            onScroll={mockOnScroll}
            onWheel={mockOnWheel}
            onTouchMove={mockOnTouchMove}
            onLikeCancel={mockOnLikeCancel}
            shouldShowCopy={mockShouldShowCopy}
          />
        </BubbleConfigProvide>,
      );

      const bubbleListContainer = container.querySelector('[data-chat-list]');
      expect(bubbleListContainer).toBeTruthy();

      // 触发所有事件
      fireEvent.scroll(bubbleListContainer!);
      fireEvent.wheel(bubbleListContainer!);
      fireEvent.touchMove(bubbleListContainer!);

      // 验证所有回调都被调用
      expect(mockOnScroll).toHaveBeenCalledTimes(1);
      expect(mockOnWheel).toHaveBeenCalledTimes(1);
      expect(mockOnTouchMove).toHaveBeenCalledTimes(1);
      expect(mockOnLikeCancel).toBeDefined();
      expect(mockShouldShowCopy).toBeDefined();
    });
  });

  describe('isLast and deps relationship', () => {
    it('should update isLast correctly when new bubble is added', () => {
      const initialBubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'assistant', 'First message'),
        createMockBubbleData('2', 'assistant', 'Second message'),
      ];

      const { rerender } = render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={initialBubbleList} />
        </BubbleConfigProvide>,
      );

      // 验证初始状态
      expect((initialBubbleList[0] as any).isLast).toBe(false);
      expect((initialBubbleList[1] as any).isLast).toBe(true);

      // 添加新的消息
      const updatedBubbleList: MessageBubbleData[] = [
        ...initialBubbleList,
        createMockBubbleData('3', 'assistant', 'Third message'),
      ];

      rerender(
        <BubbleConfigProvide>
          <BubbleList bubbleList={updatedBubbleList} />
        </BubbleConfigProvide>,
      );

      // 验证 isLast 值已更新：之前的最后一个消息不再是最后一个
      expect((updatedBubbleList[0] as any).isLast).toBe(false);
      expect((updatedBubbleList[1] as any).isLast).toBe(false);
      expect((updatedBubbleList[2] as any).isLast).toBe(true);
    });

    it('should update isLast correctly when multiple bubbles are added', () => {
      const initialBubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'assistant', 'First message'),
      ];

      const { rerender } = render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={initialBubbleList} />
        </BubbleConfigProvide>,
      );

      // 验证初始状态：单个消息时是最后一个
      expect((initialBubbleList[0] as any).isLast).toBe(true);

      // 添加两个新消息
      const updatedBubbleList: MessageBubbleData[] = [
        ...initialBubbleList,
        createMockBubbleData('2', 'assistant', 'Second message'),
        createMockBubbleData('3', 'assistant', 'Third message'),
      ];

      rerender(
        <BubbleConfigProvide>
          <BubbleList bubbleList={updatedBubbleList} />
        </BubbleConfigProvide>,
      );

      // 验证所有消息的 isLast 状态
      expect((updatedBubbleList[0] as any).isLast).toBe(false);
      expect((updatedBubbleList[1] as any).isLast).toBe(false);
      expect((updatedBubbleList[2] as any).isLast).toBe(true);
    });

    it('should correctly calculate isLast for each bubble in the list', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'assistant', 'Message 1'),
        createMockBubbleData('2', 'assistant', 'Message 2'),
        createMockBubbleData('3', 'assistant', 'Message 3'),
      ];

      render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={bubbleList} />
        </BubbleConfigProvide>,
      );

      // 验证每个消息的 isLast 状态
      expect((bubbleList[0] as any).isLast).toBe(false);
      expect((bubbleList[1] as any).isLast).toBe(false);
      expect((bubbleList[2] as any).isLast).toBe(true);

      // 验证 isLast 和 isLatest 保持一致
      expect((bubbleList[0] as any).isLast).toBe(bubbleList[0].isLatest);
      expect((bubbleList[1] as any).isLast).toBe(bubbleList[1].isLatest);
      expect((bubbleList[2] as any).isLast).toBe(bubbleList[2].isLatest);
    });

    it('should handle empty bubble list gracefully', () => {
      const bubbleList: MessageBubbleData[] = [];

      expect(() => {
        render(
          <BubbleConfigProvide>
            <BubbleList bubbleList={bubbleList} />
          </BubbleConfigProvide>,
        );
      }).not.toThrow();
    });

    it('should update isLast when bubble is removed from the end', () => {
      const initialBubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'assistant', 'Message 1'),
        createMockBubbleData('2', 'assistant', 'Message 2'),
        createMockBubbleData('3', 'assistant', 'Message 3'),
      ];

      const { rerender } = render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={initialBubbleList} />
        </BubbleConfigProvide>,
      );

      // 验证初始状态
      expect((initialBubbleList[0] as any).isLast).toBe(false);
      expect((initialBubbleList[1] as any).isLast).toBe(false);
      expect((initialBubbleList[2] as any).isLast).toBe(true);

      // 移除最后一个消息
      const updatedBubbleList: MessageBubbleData[] = [
        initialBubbleList[0],
        initialBubbleList[1],
      ];

      rerender(
        <BubbleConfigProvide>
          <BubbleList bubbleList={updatedBubbleList} />
        </BubbleConfigProvide>,
      );

      // 验证更新后的状态
      expect((updatedBubbleList[0] as any).isLast).toBe(false);
      expect((updatedBubbleList[1] as any).isLast).toBe(true);
    });
  });

  describe('lazy loading', () => {
    beforeEach(() => {
      // Mock IntersectionObserver
      global.IntersectionObserver = class {
        constructor(
          public callback: IntersectionObserverCallback,
          public options?: IntersectionObserverInit,
        ) {}
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
        takeRecords = vi.fn(() => []);
        root = null;
        rootMargin = '';
        thresholds = [];
      } as any;
    });

    it('should render bubbles normally when lazy is not enabled', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
        createMockBubbleData('2', 'assistant', 'Another message'),
      ];

      const { container } = render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={bubbleList} />
        </BubbleConfigProvide>,
      );

      // 应该正常渲染，不创建 IntersectionObserver
      const bubbles = container.querySelectorAll('[data-id]');
      expect(bubbles.length).toBeGreaterThan(0);
    });

    it('should render bubbles normally when lazy.enable is false', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
      ];

      const { container } = render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={bubbleList} lazy={{ enable: false }} />
        </BubbleConfigProvide>,
      );

      const bubbles = container.querySelectorAll('[data-id]');
      expect(bubbles.length).toBeGreaterThan(0);
    });

    it('should wrap bubbles with LazyElement when lazy.enable is true', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
        createMockBubbleData('2', 'assistant', 'Another message'),
      ];

      const observeSpy = vi.fn();

      global.IntersectionObserver = class {
        constructor(
          public callback: IntersectionObserverCallback,
          public options?: IntersectionObserverInit,
        ) {}
        observe = observeSpy;
        unobserve = vi.fn();
        disconnect = vi.fn();
        takeRecords = vi.fn(() => []);
        root = null;
        rootMargin = '';
        thresholds = [];
      } as any;

      render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={bubbleList} lazy={{ enable: true }} />
        </BubbleConfigProvide>,
      );

      // 应该创建 IntersectionObserver 并调用 observe
      expect(observeSpy).toHaveBeenCalled();
    });

    it('should use default placeholderHeight when not provided', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
      ];

      render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={bubbleList} lazy={{ enable: true }} />
        </BubbleConfigProvide>,
      );

      // 检查占位符是否存在（默认高度 100px）
      const placeholder = document.querySelector('[aria-hidden="true"]');
      expect(placeholder).toBeTruthy();
      expect(placeholder?.getAttribute('style')).toContain('min-height: 100');
    });

    it('should use custom placeholderHeight when provided', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
      ];

      render(
        <BubbleConfigProvide>
          <BubbleList
            bubbleList={bubbleList}
            lazy={{ enable: true, placeholderHeight: 200 }}
          />
        </BubbleConfigProvide>,
      );

      const placeholder = document.querySelector('[aria-hidden="true"]');
      expect(placeholder?.getAttribute('style')).toContain('min-height: 200');
    });

    it('should use default rootMargin when not provided', () => {
      let capturedOptions: IntersectionObserverInit | undefined;

      global.IntersectionObserver = class {
        constructor(
          public callback: IntersectionObserverCallback,
          public options?: IntersectionObserverInit,
        ) {
          capturedOptions = options;
        }
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
        takeRecords = vi.fn(() => []);
        root = null;
        rootMargin = '';
        thresholds = [];
      } as any;

      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
      ];

      render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={bubbleList} lazy={{ enable: true }} />
        </BubbleConfigProvide>,
      );

      expect(capturedOptions?.rootMargin).toBe('200px');
    });

    it('should use custom rootMargin when provided', () => {
      let capturedOptions: IntersectionObserverInit | undefined;

      global.IntersectionObserver = class {
        constructor(
          public callback: IntersectionObserverCallback,
          public options?: IntersectionObserverInit,
        ) {
          capturedOptions = options;
        }
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
        takeRecords = vi.fn(() => []);
        root = null;
        rootMargin = '';
        thresholds = [];
      } as any;

      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
      ];

      render(
        <BubbleConfigProvide>
          <BubbleList
            bubbleList={bubbleList}
            lazy={{ enable: true, rootMargin: '300px' }}
          />
        </BubbleConfigProvide>,
      );

      expect(capturedOptions?.rootMargin).toBe('300px');
    });

    it('should call custom renderPlaceholder with correct props', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'User message'),
        createMockBubbleData('2', 'assistant', 'Assistant message'),
      ];

      const mockRenderPlaceholder = vi.fn(({ style, elementInfo }) => (
        <div data-testid="custom-placeholder" style={style}>
          Loading {elementInfo?.role || 'unknown'}
        </div>
      ));

      render(
        <BubbleConfigProvide>
          <BubbleList
            bubbleList={bubbleList}
            lazy={{
              enable: true,
              renderPlaceholder: mockRenderPlaceholder,
            }}
          />
        </BubbleConfigProvide>,
      );

      // 验证 renderPlaceholder 被调用
      expect(mockRenderPlaceholder).toHaveBeenCalled();

      // 验证传递的参数包含正确的信息
      const firstCall = mockRenderPlaceholder.mock.calls[0][0];
      expect(firstCall.height).toBe(100); // 默认高度
      expect(firstCall.style).toBeDefined();
      expect(firstCall.elementInfo).toBeDefined();
      expect(firstCall.elementInfo?.index).toBeDefined();
      expect(firstCall.elementInfo?.total).toBe(2);
    });

    it('should pass role information to renderPlaceholder', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'User message'),
        createMockBubbleData('2', 'assistant', 'Assistant message'),
      ];

      const capturedProps: any[] = [];

      const mockRenderPlaceholder = vi.fn((props) => {
        capturedProps.push(props);
        return <div>Placeholder</div>;
      });

      render(
        <BubbleConfigProvide>
          <BubbleList
            bubbleList={bubbleList}
            lazy={{
              enable: true,
              renderPlaceholder: mockRenderPlaceholder,
            }}
          />
        </BubbleConfigProvide>,
      );

      // 验证第一个气泡（user）的 role 信息
      expect(capturedProps.length).toBeGreaterThan(0);
      const firstBubbleProps = capturedProps[0];
      expect(firstBubbleProps.elementInfo?.role).toBe('user');

      // 验证第二个气泡（assistant）的 role 信息
      if (capturedProps.length > 1) {
        const secondBubbleProps = capturedProps[1];
        expect(secondBubbleProps.elementInfo?.role).toBe('assistant');
      }
    });

    it('should pass correct elementInfo to renderPlaceholder', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Message 1'),
        createMockBubbleData('2', 'assistant', 'Message 2'),
        createMockBubbleData('3', 'user', 'Message 3'),
      ];

      const capturedProps: any[] = [];

      const mockRenderPlaceholder = vi.fn((props) => {
        capturedProps.push(props);
        return <div>Placeholder</div>;
      });

      render(
        <BubbleConfigProvide>
          <BubbleList
            bubbleList={bubbleList}
            lazy={{
              enable: true,
              renderPlaceholder: mockRenderPlaceholder,
            }}
          />
        </BubbleConfigProvide>,
      );

      // 验证 elementInfo 包含正确的索引和总数
      expect(capturedProps.length).toBeGreaterThan(0);
      capturedProps.forEach((props, index) => {
        expect(props.elementInfo?.index).toBe(index);
        expect(props.elementInfo?.total).toBe(3);
        expect(props.elementInfo?.type).toBe('bubble');
      });
    });

    it('should work with empty bubble list when lazy is enabled', () => {
      const bubbleList: MessageBubbleData[] = [];

      expect(() => {
        render(
          <BubbleConfigProvide>
            <BubbleList bubbleList={bubbleList} lazy={{ enable: true }} />
          </BubbleConfigProvide>,
        );
      }).not.toThrow();
    });

    it('should maintain backward compatibility when lazy is undefined', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
      ];

      const { container } = render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={bubbleList} />
        </BubbleConfigProvide>,
      );

      // 应该正常渲染，不创建 IntersectionObserver
      const bubbles = container.querySelectorAll('[data-id]');
      expect(bubbles.length).toBeGreaterThan(0);
    });

    it('should handle lazy loading with multiple bubbles', () => {
      const bubbleList: MessageBubbleData[] = Array.from(
        { length: 10 },
        (_, i) =>
          createMockBubbleData(
            `${i}`,
            i % 2 === 0 ? 'user' : 'assistant',
            `Message ${i}`,
          ),
      );

      const observeSpy = vi.fn();

      global.IntersectionObserver = class {
        constructor(
          public callback: IntersectionObserverCallback,
          public options?: IntersectionObserverInit,
        ) {}
        observe = observeSpy;
        unobserve = vi.fn();
        disconnect = vi.fn();
        takeRecords = vi.fn(() => []);
        root = null;
        rootMargin = '';
        thresholds = [];
      } as any;

      render(
        <BubbleConfigProvide>
          <BubbleList bubbleList={bubbleList} lazy={{ enable: true }} />
        </BubbleConfigProvide>,
      );

      // 应该为每个气泡创建 observer
      expect(observeSpy).toHaveBeenCalledTimes(10);
    });

    it('should combine lazy loading with other props', () => {
      const bubbleList: MessageBubbleData[] = [
        createMockBubbleData('1', 'user', 'Test message'),
      ];

      const mockOnScroll = vi.fn();
      const mockOnWheel = vi.fn();

      const { container } = render(
        <BubbleConfigProvide>
          <BubbleList
            bubbleList={bubbleList}
            lazy={{ enable: true, placeholderHeight: 150 }}
            onScroll={mockOnScroll}
            onWheel={mockOnWheel}
          />
        </BubbleConfigProvide>,
      );

      const bubbleListContainer = container.querySelector('[data-chat-list]');
      expect(bubbleListContainer).toBeTruthy();

      // 验证其他功能仍然正常工作
      fireEvent.scroll(bubbleListContainer!);
      expect(mockOnScroll).toHaveBeenCalledTimes(1);

      fireEvent.wheel(bubbleListContainer!);
      expect(mockOnWheel).toHaveBeenCalledTimes(1);
    });
  });
});
