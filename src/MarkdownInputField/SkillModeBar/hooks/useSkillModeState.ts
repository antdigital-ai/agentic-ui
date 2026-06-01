import { useRef } from 'react';
import { useUpdateEffect } from 'react-use';
import type { SkillModeConfig } from '../';
import { useRefFunction } from '../../../Hooks/useRefFunction';

/**
 * 技能模式状态管理 Hook
 *
 * @description 处理技能模式的状态变化，对外承诺「无论外部 prop 变化还是内部 click，
 * 都会触发一次 `onSkillModeOpenChange`」。这是公开行为契约（已被单测覆盖），
 * 不可改动，否则属于 breaking change。
 *
 * 实现细节：
 * - 内部 click（`handleInternalSkillModeChange`）会先调用 `onSkillModeOpenChange`，
 *   随后调用方通常会把新的 `skillMode.open` 透回组件，这会触发 `useUpdateEffect`
 *   的 prop 变化分支，导致同一个用户操作被回调两次。
 * - 因此使用 `skipNextCallbackRef` 作为「上一次回调由内部触发」的标记，
 *   下一次 effect 跳过一次回调即可去重。
 * - 这是受控/内部双向通知模式下不可避免的去重门禁；如果未来允许 breaking change，
 *   推荐改为单向（仅暴露 `onSkillModeOpenChange`，不再监听 prop）。
 *
 * @param skillMode 技能模式配置
 * @param onSkillModeOpenChange 状态变化回调函数
 * @returns 内部状态变化处理函数
 *
 * @example
 * ```tsx
 * const handleInternalChange = useSkillModeState(skillMode, onSkillModeOpenChange);
 *
 * // 在内部操作时使用
 * const handleCloseClick = () => {
 *   handleInternalChange(false); // 避免重复回调
 * };
 * ```
 */
export function useSkillModeState(
  skillMode?: SkillModeConfig,
  onSkillModeOpenChange?: (open: boolean) => void,
): (open: boolean) => void {
  // 追踪技能模式状态变化
  const prevSkillModeOpenRef = useRef<boolean | undefined>(skillMode?.open);

  // 重复回调防护：标记下一次外部 prop 变化是由内部 click 引起，应跳过一次回调
  const skipNextCallbackRef = useRef<boolean>(false);

  // 内部 click 触发的状态变化处理
  const handleInternalSkillModeChange = useRefFunction((open: boolean) => {
    if (onSkillModeOpenChange) {
      skipNextCallbackRef.current = true;
      onSkillModeOpenChange(open);
    }
  });

  // 监听外部 prop 变化（跳过初始化）
  useUpdateEffect(() => {
    const currentOpen = skillMode?.open;
    const prevOpen = prevSkillModeOpenRef.current;

    if (currentOpen !== prevOpen) {
      prevSkillModeOpenRef.current = currentOpen;

      // 如果该次 prop 变化由内部 click 触发（已经回调过），跳过此次回调
      if (skipNextCallbackRef.current) {
        skipNextCallbackRef.current = false;
        return;
      }

      // 真正的外部状态变化，回调通知
      onSkillModeOpenChange?.(!!currentOpen);
    }
  }, [skillMode?.open, onSkillModeOpenChange]);

  return handleInternalSkillModeChange;
}
