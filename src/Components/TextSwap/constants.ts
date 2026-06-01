/**
 * TextSwap 组件、`textSwapEnter` keyframes（Markdown 表格 / 流式段落）共用一套数值。
 */

/** 过渡与 keyframes 时长（ms），与 `--text-swap-dur` 一致 */
export const DEFAULT_TEXT_SWAP_DURATION_MS = 200;

/** 入场自下方偏移（px），与 keyframes `translateY` 一致 */
export const TEXT_SWAP_TRANSLATE_Y_PX = 8;

/** 入场模糊半径（px），与 keyframes `blur` 一致 */
export const TEXT_SWAP_BLUR_PX = 2;

/** 缓动，与 keyframes / transition 一致 */
export const TEXT_SWAP_EASING = 'ease-out';
