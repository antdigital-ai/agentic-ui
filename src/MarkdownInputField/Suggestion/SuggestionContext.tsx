import React from 'react';

/**
 * 建议面板状态的 React 上下文
 *
 * 该上下文用于管理建议面板（Suggestion）的显示状态，允许组件树中的任何组件访问或修改面板的开关状态。
 * 注意：triggerNodeContext 类型使用 Record<string, any> 避免循环依赖（TagPopup ↔ Suggestion）。
 *
 * @interface
 * @property {boolean} [open] - 控制建议面板是否打开的状态
 * @property {function} [setOpen] - 设置建议面板开关状态的函数
 * @example
 * // 在消费组件中使用此上下文
 * const { open, setOpen } = useContext(SuggestionContext);
 * // 打开建议面板
 * setOpen?.(true);
 */
export const SuggestionContext = React.createContext<{
  open?: boolean;
  setOpen?: (open: boolean) => void;
  isRender: true;
  onSelectRef?: React.MutableRefObject<
    ((value: string) => void | undefined) | undefined
  >;
  triggerNodeContext?: React.MutableRefObject<
    | (Record<string, any> & {
        text?: string;
        placeholder?: string;
      })
    | undefined
  >;
}>({
  isRender: true,
});

/**
 * @deprecated 拼写错误的旧名，请使用 `SuggestionContext`。
 * 保留作为向后兼容别名，将在下一个大版本移除。
 */
export const SuggestionConnext = SuggestionContext;
