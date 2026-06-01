/**
 * History 组件内部使用的语义常量集合。
 *
 * 之前这些值散落在 HistoryItem.tsx / HistoryList.tsx 顶部，
 * 既无法跨文件共享（多份硬编码），也让组件文件被工具型常量稀释。
 * 抽到独立模块后，意图明确、易于单测、未来可由 ConfigProvider 透传覆盖。
 */

/**
 * 文本溢出时左侧渐隐遮罩，配合 `WebkitMaskImage` / `maskImage` 使用，
 * 让滚动文本在容器边界处优雅淡出，避免硬切割。
 */
export const FADE_OUT_GRADIENT =
  'linear-gradient(to left, transparent, black 20%)';

/**
 * 文本滚动动画的额外偏移量（px）。
 * 滚动到末尾时多走这段距离，可让动画收尾更自然，不至于"啪"地停在边缘。
 */
export const EXTRA_SCROLL_OFFSET = 100;

/**
 * 分组最小条目数。少于此数量的分组不展示分组标题，直接平铺为普通条目，
 * 避免出现"今日（1 条）"这种视觉噪音。
 */
export const MIN_GROUP_SIZE = 3;

/**
 * 文本溢出时的 mask 内联样式工厂。
 *
 * 为了引用稳定性：当 `isOverflow` 不变时返回同一对象，
 * 避免下游 `style={{ ...other, ...getMaskStyle(isOverflow) }}` 每次都新建对象。
 */
const MASK_STYLE_OVERFLOW: React.CSSProperties = {
  WebkitMaskImage: FADE_OUT_GRADIENT,
  maskImage: FADE_OUT_GRADIENT,
};

const MASK_STYLE_CLEAR: React.CSSProperties = {
  WebkitMaskImage: 'none',
  maskImage: 'none',
};

export const getMaskStyle = (isOverflow: boolean): React.CSSProperties =>
  isOverflow ? MASK_STYLE_OVERFLOW : MASK_STYLE_CLEAR;
