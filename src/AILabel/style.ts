import { genStyleHooks, type GenStyleFn } from '../Hooks/useStyle';

/**
 * AILabel 组件级 ComponentToken。
 *
 * 通过模块声明合并进 `AgenticComponentTokenMap`，使 `genStyleHooks('AILabel', ...)`
 * 的 token 参数自动具备这些类型。
 */
declare module '../Hooks/useStyle' {
  interface AgenticComponentTokenMap {
    // 与 antd `ComponentTokenMap` 一致：组件 token 声明为可选，
    // 由 `getDefaultToken` 补齐运行时值，避免对全局 `useToken()` 返回类型形成约束
    AILabel?: AILabelToken;
  }
}

export interface AILabelToken {
  /**
   * 标签 dot 默认描边色（偏冷的浅蓝半透明，与图标渐变呼应）。
   * 当前 design token 体系无完全等价 token，集中维护于此。
   */
  aiLabelDotBorderColor: string;
  /** watermark 状态下 dot 的描边色 */
  aiLabelWatermarkBorderColor: string;
  /** emphasis 状态下 dot 的背景渐变 */
  aiLabelEmphasisBackground: string;
  /** emphasis 状态下 dot 的描边色 */
  aiLabelEmphasisBorderColor: string;
  /** tooltip 打开时的高亮渐变 */
  aiLabelTooltipBackground: string;
}

const genStyle: GenStyleFn<'AILabel'> = (token) => ({
  [token.componentCls]: {
    position: 'relative',
    display: 'inline-block',
    width: 'fit-content',
    margin: 0,
    padding: 0,
    // 视觉规范固定为 11px / 4px 圆角，与设计稿对齐
    fontSize: 11,
    lineHeight: 1,
    listStyle: 'none',
    verticalAlign: 'middle',
    boxSizing: 'border-box',

    [`${token.componentCls}-dot`]: {
      display: 'inline-flex',
      justifyContent: 'center',
      padding: '3px 4px',
      textAlign: 'center',
      border: `1px solid ${token.aiLabelDotBorderColor}`,
      borderRadius: token.borderRadiusSM ?? 4,
      // 状态切换时统一过渡，避免在 emphasis / tooltip-visible 切换时跳变
      transition:
        'background 0.2s ease-in-out, border-color 0.2s ease-in-out',
    },

    [`&${token.componentCls}-status-watermark`]: {
      [`${token.componentCls}-dot`]: {
        background: 'transparent',
        border: `1px solid ${token.aiLabelWatermarkBorderColor}`,
        backdropFilter: 'blur(40px)',
      },
    },

    [`&${token.componentCls}-status-emphasis`]: {
      [`${token.componentCls}-dot`]: {
        background: token.aiLabelEmphasisBackground,
        border: `1px solid ${token.aiLabelEmphasisBorderColor}`,
      },
    },

    [`&${token.componentCls}-with-children`]: {
      [`${token.componentCls}-dot`]: {
        position: 'absolute',
        top: 0,
        insetInlineEnd: 0,
        transform: 'translate(50%, -50%)',
        transformOrigin: '100% 0%',
      },
    },

    // tooltip 打开时的高亮渐变。仅对 default / watermark 状态生效；
    // emphasis 已经有自己的强调渐变，不应被覆盖（视觉一致性 + 避免抢戏）
    [`&${token.componentCls}-tooltip-visible:not(${token.componentCls}-status-emphasis)`]:
      {
        [`${token.componentCls}-dot`]: {
          background: token.aiLabelTooltipBackground,
          backdropFilter: 'blur(40px)',
        },
      },
  },
});

/**
 * AILabel 默认 prefixCls。
 *
 * 也作为 `ConfigProvider.getPrefixCls(prefixCls)` 的入参，确保「样式注册」与「外部
 * prefix 推导」共享同一字符串字面量，避免散落的 magic string 不一致。
 */
export const prefixCls = 'ai-label';

const useGenStyle = genStyleHooks<'AILabel'>('AILabel', genStyle, () => ({
  aiLabelDotBorderColor: 'rgba(191, 215, 240, 0.25)',
  aiLabelWatermarkBorderColor: 'var(--color-gray-border-light)',
  aiLabelEmphasisBackground:
    'linear-gradient(180deg, var(--color-primary-bg-page-light) 0%, var(--color-primary-bg-page) 100%)',
  aiLabelEmphasisBorderColor: 'var(--color-gray-bg-card-white)',
  aiLabelTooltipBackground:
    'linear-gradient(293deg, var(--color-primary-bg-page-light) 39%, var(--color-primary-bg-page) 62%, var(--color-primary-bg-page-light) 91%)',
}));

/**
 * AILabel 样式 hook。返回结构与旧版一致（`{ wrapSSR, hashId }`），保持调用方零改动。
 *
 * @param customPrefixCls 实际拼接的类名前缀（通常为
 *   `ConfigProvider.getPrefixCls(prefixCls)` 的返回值，例如 `ant-ai-label`）。
 *   未传时回退到 {@link prefixCls}。
 */
export function useStyle(customPrefixCls?: string) {
  const [wrapSSR, hashId] = useGenStyle(customPrefixCls ?? prefixCls);
  return { wrapSSR, hashId };
}
