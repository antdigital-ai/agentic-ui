import React, { useContext, useMemo } from 'react';
import {
  ThoughtChainList,
  WhiteBoxProcessInterface,
} from '../ThoughtChainList';
import { BubbleConfigContext } from './BubbleConfigProvide';
import { BubbleProps } from './type';

interface BubbleBeforeNodeProps {
  bubble: BubbleProps;
  className?: string;
  style?: React.CSSProperties;
  /** @internal Already normalized by the parent bubble. */
  taskList?: WhiteBoxProcessInterface[];
}

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
  taskList: normalizedTaskList,
}) => {
  const context = useContext(BubbleConfigContext);
  const { placement, originData } = bubble;
  const whiteBoxProcess = originData?.extra?.white_box_process;
  const taskList = useMemo(
    () => normalizedTaskList ?? getTaskList(whiteBoxProcess),
    [normalizedTaskList, whiteBoxProcess],
  );
  const isFinished = originData?.isFinished || originData?.isAborted;
  // The built-in chain only reads lifecycle fields. Keep body tokens out of
  // its memo boundary while custom title renderers retain the whole message.
  const statusBubble = useMemo(
    () => ({
      id: originData?.id,
      isFinished,
      isAborted: originData?.isAborted,
      createAt: originData?.createAt,
      endTime: originData?.endTime,
    }),
    [
      originData?.id,
      isFinished,
      originData?.isAborted,
      originData?.createAt,
      originData?.endTime,
    ],
  );

  if (
    !canRenderThoughtChain(
      placement,
      originData?.role,
      context?.thoughtChain?.enable,
    )
  ) {
    return null;
  }

  if (taskList.length < 1 && !context?.thoughtChain?.alwaysRender) {
    return null;
  }

  if (context?.thoughtChain?.render) {
    return context.thoughtChain.render(bubble, taskList.join(','));
  }

  const isLoading = originData?.content === '...';
  const chainBubble =
    context?.thoughtChain?.titleRender ||
    context?.thoughtChain?.titleExtraRender
      ? { ...originData, isFinished }
      : statusBubble;

  return (
    <ThoughtChainList
      {...context?.thoughtChain}
      className={className}
      style={style}
      bubble={chainBubble}
      finishAutoCollapse={true}
      thoughtChainList={taskList.length ? taskList : DEFAULT_TASK_LIST}
      loading={isLoading}
    />
  );
};
