import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BubbleConfigContext } from '../../../src/Bubble/BubbleConfigProvide';
import { PureBubbleList } from '../../../src/Bubble/List/PureBubbleList';
import type { MessageBubbleData } from '../../../src/Bubble/type';

interface CapturedBubbleProps {
  id: string;
  originData: MessageBubbleData;
}

const mockState = vi.hoisted(() => ({
  captured: [] as CapturedBubbleProps[],
}));

vi.mock('../../../src/Bubble/PureBubble', () => {
  const MockBubble: React.FC<{
    id: string;
    originData: MessageBubbleData;
    children?: React.ReactNode;
  }> = ({ id, originData }) => {
    mockState.captured.push({ id, originData });
    return <div data-testid={`mock-bubble-${id}`}>{originData.content}</div>;
  };

  return {
    PureAIBubble: MockBubble,
    PureUserBubble: MockBubble,
  };
});

const BubbleConfigProvide: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ConfigProvider>
    <BubbleConfigContext.Provider
      value={{ standalone: false, compact: false, locale: {} as any }}
    >
      {children}
    </BubbleConfigContext.Provider>
  </ConfigProvider>
);

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

describe('PureBubbleList originData flags', () => {
  beforeEach(() => {
    mockState.captured = [];
  });

  it('应为每个气泡注入 isLast / isLatest，且不修改原始 bubbleList 项', () => {
    const firstBubble = createMockBubbleData('1', 'assistant', 'first');
    const secondBubble = createMockBubbleData('2', 'user', 'second');
    const bubbleList: MessageBubbleData[] = [firstBubble, secondBubble];

    render(
      <BubbleConfigProvide>
        <PureBubbleList bubbleList={bubbleList} />
      </BubbleConfigProvide>,
    );

    expect(mockState.captured).toHaveLength(2);

    const byId = new Map(mockState.captured.map((item) => [item.id, item]));
    const firstCaptured = byId.get('1');
    const secondCaptured = byId.get('2');

    expect(firstCaptured?.originData).toMatchObject({
      isLast: false,
      isLatest: false,
    });
    expect(secondCaptured?.originData).toMatchObject({
      isLast: true,
      isLatest: true,
    });

    expect(firstCaptured?.originData).not.toBe(firstBubble);
    expect(secondCaptured?.originData).not.toBe(secondBubble);
    expect('isLast' in firstBubble).toBe(false);
    expect('isLatest' in firstBubble).toBe(false);
    expect('isLast' in secondBubble).toBe(false);
    expect('isLatest' in secondBubble).toBe(false);
  });
});
