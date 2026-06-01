/**
 * MarkdownInputField 模块共享常量
 *
 * 集中放置散落在 `MarkdownInputField.tsx`、`useInputFieldGeometry`、各子组件
 * 中的 magic number / 默认值。每一项都附带「来源」与「单位」说明，避免后续
 * 调整时无据可循。
 *
 * 命名规则：
 * - 尺寸常量统一以 `_PX` 结尾
 * - 断点常量以 `BREAKPOINT_` 开头
 * - 默认值以 `DEFAULT_` 开头
 */

// ============================================================
// 容器外观
// ============================================================

/** 输入框默认圆角；见 `MarkdownInputField.tsx` 主容器 props 默认值与 BorderBeamAnimation 落点。 */
export const DEFAULT_BORDER_RADIUS_PX = 16;

/** 旧版兼容回退圆角；当外部传入 `borderRadius=0`/`undefined` 时部分场景使用 12。 */
export const FALLBACK_BORDER_RADIUS_PX = 12;

/** 主容器的 tabIndex；与 BaseMarkdownEditor / Suggestion 的焦点链路对齐。 */
export const ROOT_TAB_INDEX = 1;

// ============================================================
// 折叠 / 放大尺寸
// ============================================================

/** 折叠态默认高度上限（即 `maxHeight` 缺省值）。 */
export const COLLAPSED_HEIGHT_BASE_PX = 114;

/** 启用附件区时折叠态额外预留高度（用于附件缩略图行）。 */
export const ATTACHMENT_EXTRA_HEIGHT_PX = 90;

/** 放大态最小高度。 */
export const ENLARGED_MIN_HEIGHT_PX = 280;

/** 放大态默认目标高度，可被 `enlargeable.height` 覆盖。 */
export const ENLARGED_DEFAULT_HEIGHT_PX = 980;

// ============================================================
// 最小高度档位（按按钮组合命中）
// ============================================================

/** 同时存在「放大 + 提示词优化」按钮时的最小高度。 */
export const MIN_HEIGHT_WITH_ENLARGE_AND_REFINE_PX = 140;

/** 仅有 1 个 action 按钮时的最小高度。 */
export const MIN_HEIGHT_SINGLE_ACTION_PX = 90;

/** 多行布局兜底最小高度。 */
export const MIN_HEIGHT_MULTI_ROW_PX = 106;

// ============================================================
// 右侧 padding 与折叠断点
// ============================================================

/** 编辑器初始右内边距，用于在 SendActions onResize 上报真实宽度前占位。 */
export const DEFAULT_EDITOR_RIGHT_PADDING_PX = 64;

/** 当 SendActions 未上报有效宽度且没有 toolsRender 时的兜底右内边距。 */
export const SEND_ACTIONS_FALLBACK_RIGHT_PADDING_PX = 52;

/**
 * 视口宽度断点：小于该值时初始化即折叠 SendActions。
 * 注意：与下方 `BREAKPOINT_COLLAPSE_CONTAINER_PX` 仅相差 21px，但语义不同：
 * - VIEWPORT 用于挂载时一次性判断（无 ResizeObserver 之前）
 * - CONTAINER 用于 ResizeObserver 持续观察容器宽度
 */
export const BREAKPOINT_COLLAPSE_VIEWPORT_PX = 460;

/** 容器宽度断点：ResizeObserver 测得容器小于该值时折叠 SendActions。 */
export const BREAKPOINT_COLLAPSE_CONTAINER_PX = 481;
