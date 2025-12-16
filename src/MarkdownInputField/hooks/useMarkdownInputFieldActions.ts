import type { MarkdownInputFieldProps } from '../types/MarkdownInputFieldProps';

/**
 * 动作计算 Hook
 * 计算组件中各种动作相关的布尔值和计数
 */
export const useMarkdownInputFieldActions = (
  props: Pick<
    MarkdownInputFieldProps,
    | 'enlargeable'
    | 'refinePrompt'
    | 'quickActionRender'
    | 'actionsRender'
    | 'toolsRender'
  >,
) => {
  const hasEnlargeAction = !!props?.enlargeable?.enable;
  const hasRefineAction = !!props?.refinePrompt?.enable;
  const hasCustomQuickAction = !!props?.quickActionRender;
  const hasActionsRender = !!props?.actionsRender;
  const hasToolsRender = !!props?.toolsRender;

  const quickActionCount =
    Number(hasEnlargeAction) +
    Number(hasRefineAction) +
    Number(hasCustomQuickAction);
  const auxiliaryActionCount =
    Number(hasActionsRender) + Number(hasToolsRender);
  const totalActionCount = quickActionCount + auxiliaryActionCount;

  // 是否需要多行布局
  const isMultiRowLayout = totalActionCount > 0;

  return {
    hasEnlargeAction,
    hasRefineAction,
    hasCustomQuickAction,
    hasActionsRender,
    hasToolsRender,
    quickActionCount,
    auxiliaryActionCount,
    totalActionCount,
    isMultiRowLayout,
  };
};
