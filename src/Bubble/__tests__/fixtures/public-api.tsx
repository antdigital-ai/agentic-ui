import React from 'react';
import type {
  BubbleImperativeHandle,
  BubbleListProps,
  BubbleProps,
  ChatConfigType,
  MessageBubbleData,
} from '../../index';
import { AIBubble, Bubble, UserBubble } from '../../index';
import type { BubbleExtraProps } from '../../types/BubbleExtra';

const message: MessageBubbleData = {
  id: 'message',
  role: 'assistant',
  createAt: 1,
  updateAt: 1,
  content: 'Text body',
};

const quote: BubbleProps = {
  placement: 'right',
  originData: message,
  quote: { quoteDescription: 'Quoted message' },
  userBubbleProps: {
    quote: { quoteDescription: 'Role-specific quote' },
  },
};

const textContext: ChatConfigType = {
  standalone: false,
  bubble: {
    originData: message,
    bubbleRenderConfig: {
      titleRender: (props) => {
        // @ts-expect-error contextual callback props must retain the public contract
        props.missingProperty;
        return props.originData?.id;
      },
    },
  },
};

const nodeContext: ChatConfigType = {
  standalone: false,
  bubble: { originData: { ...message, content: <span>React body</span> } },
};

const legacyBubble: BubbleProps<{ content: string; uuid: number }> = {
  originData: { ...message, content: 'Legacy body', uuid: 1 },
  bubbleRenderConfig: {
    titleRender: (props) => props.originData?.uuid,
  },
};

const legacyContext: ChatConfigType = {
  standalone: false,
  bubble: legacyBubble,
};

const bubbleRef: BubbleProps['bubbleRef'] =
  React.createRef<BubbleImperativeHandle>();

const mixedStyles: BubbleProps = {
  styles: {
    root: { padding: 8 },
    content: { color: 'red' },
    bubbleAvatarTitleStyle: { gap: 4 },
  },
  classNames: {
    root: 'root',
    content: 'content',
    bubbleAvatarTitleClassName: 'avatar-title',
  },
};

const mixedList: BubbleListProps = {
  bubbleList: [message],
  styles: {
    root: { margin: 8 },
    bubbleListRightItemContentStyle: { padding: 4 },
  },
  classNames: { content: 'content', bubbleListItemClassName: 'item' },
};

const invalidHandle: BubbleProps = {
  // @ts-expect-error unrelated refs must not erase the imperative handle contract
  bubbleRef: React.createRef<{ invalidMethod: () => void }>(),
};

const speech: NonNullable<BubbleProps['useSpeech']> = () => ({
  isPlaying: false,
  rate: 1,
  setRate: () => {},
  start: () => {},
  stop: () => {},
  pause: () => {},
  resume: () => {},
});

const speechList: BubbleListProps = {
  bubbleList: [message],
  useSpeech: speech,
};

const speechExtra: BubbleExtraProps = {
  bubble: { originData: message },
  className: 'custom-extra',
  useSpeech: speech,
};

const nodeExtra: BubbleExtraProps = {
  bubble: { originData: { ...message, content: <span>React body</span> } },
};

const legacyExtra: BubbleExtraProps = {
  bubble: {
    originData: {
      ...message,
      content: 'Legacy body',
      uuid: 1,
      extra: { preMessage: { content: 'Prior body' } },
    },
  },
};

const invalidSpeech: BubbleExtraProps = {
  bubble: {},
  // @ts-expect-error adapters must provide the complete playback controls
  useSpeech: () => ({ isPlaying: false }),
};

const validComponents = [
  <Bubble key="bubble" originData={message} bubbleRef={bubbleRef} />,
  <AIBubble key="ai" originData={message} bubbleRef={bubbleRef} />,
  <UserBubble
    key="user"
    originData={message}
    bubbleRef={bubbleRef}
    quote={{ quoteDescription: 'Quoted text' }}
  />,
];

const wrongRef = React.createRef<{ invalidMethod: () => void }>();
const invalidComponents = [
  // @ts-expect-error public Bubble must preserve its imperative ref contract
  <Bubble key="bubble" bubbleRef={wrongRef} />,
  // @ts-expect-error public AIBubble must preserve its imperative ref contract
  <AIBubble key="ai" bubbleRef={wrongRef} />,
  // @ts-expect-error public UserBubble must preserve its imperative ref contract
  <UserBubble key="user" bubbleRef={wrongRef} />,
];

void [
  quote,
  textContext,
  nodeContext,
  legacyContext,
  bubbleRef,
  mixedStyles,
  mixedList,
  invalidHandle,
  speechList,
  speechExtra,
  nodeExtra,
  legacyExtra,
  invalidSpeech,
  validComponents,
  invalidComponents,
];
