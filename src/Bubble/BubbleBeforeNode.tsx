import React, { useContext } from 'react';
import {
  ThoughtChainList,
  WhiteBoxProcessInterface,
} from '../ThoughtChainList';
import { BubbleConfigContext } from './BubbleConfigProvide';
import { BubbleProps } from './type';

type BubbleBeforeNodeProps = {
  bubble: BubbleProps<{
    content: string;
    uuid: number;
    extra: {
      white_box_process: WhiteBoxProcessInterface[] | WhiteBoxProcessInterface;
      preMessage: {
        content: string;
      };
    };
  }>;
  className?: string;
  style?: React.CSSProperties;
};

const DEFAULT_TASK_LIST = [{ info: '理解问题' }];

const getTaskList = (
  whiteBoxProcess:
    | WhiteBoxProcessInterface[]
    | WhiteBoxProcessInterface
    | undefined,
): WhiteBoxProcessInterface[] => {
  return ([whiteBoxProcess].flat(2) as WhiteBoxProcessInterface[]).filter(
    (item) => item?.info,
  );
};

const canRenderThoughtChain = (
  placement: string | undefined,
  role: string | undefined,
  thoughtChainEnabled: boolean | undefined,
): boolean => {
  if (placement !== 'left') return false;
  if (role === 'bot') return false;
  if (thoughtChainEnabled === false) return false;
  return true;
};

/**
 * BubbleBeforeNode 组件
 *
 * 在聊天气泡之前渲染思维链或任务列表，显示AI的思考过程
 *
 * @example
 * ```tsx
 * <BubbleBeforeNode bubble={bubbleData} />
 * ```
 */
export const BubbleBeforeNode: React.FC<BubbleBeforeNodeProps> = ({
  bubble,
  className,
  style,
}) => {
  const context = useContext(BubbleConfigContext);
  const { placement, originData } = bubble;

  if (
    !canRenderThoughtChain(
      placement,
      originData?.role,
      context?.thoughtChain?.enable,
    )
  ) {
    return null;
  }

  const taskList = getTaskList(originData?.extra?.white_box_process);

  if (taskList.length < 1 && !context?.thoughtChain?.alwaysRender) {
    return null;
  }

  if (context?.thoughtChain?.render) {
    // BubbleConfigContext.thoughtChain.render 形参声明为 BubbleProps<Record<string, any>>，
    // 此处 bubble 的 T 是其更具体的子集（含 white_box_process 等字段），TS 默认不允许直接转换；
    // 但运行时只读取 BubbleProps 的公共字段，因此用 unknown 中间断言安全消除类型差异。
    return context.thoughtChain.render(
      bubble as unknown as Parameters<typeof context.thoughtChain.render>[0],
      taskList.join(','),
    );
  }

  const isFinished = originData?.isFinished || originData?.isAborted;
  const isLoading = originData?.content === '...';

  return (
    <ThoughtChainList
      {...context?.thoughtChain}
      className={className}
      style={style}
      bubble={{ ...originData, isFinished }}
      finishAutoCollapse={true}
      thoughtChainList={taskList.length ? taskList : DEFAULT_TASK_LIST}
      loading={isLoading}
    />
  );
};
