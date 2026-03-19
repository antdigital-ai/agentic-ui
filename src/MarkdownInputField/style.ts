import { Keyframes } from '@ant-design/cssinjs';
import { MOBILE_BREAKPOINT, MOBILE_PADDING } from '../Constants/mobile';
import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../Hooks/useStyle';

// MarkdownInputField 样式常量
// Glow border effect constants - 辉光边框效果常量
const GLOW_BORDER_OFFSET = 2; // px - 辉光边框偏移量
const GLOW_BORDER_TOTAL_OFFSET = GLOW_BORDER_OFFSET * 2; // 2px - 总偏移量（上下左右）

// CSS helpers for glow border effect - 辉光边框效果的 CSS 助手函数
// const getGlowBorderOffset = () => `-${GLOW_BORDER_OFFSET}px`;
// 不需要 calc() 包裹的所有关键字
const DIRECT_RETURN_KEYWORDS: ReadonlySet<string> = new Set([
  'auto',
  'inherit',
  'initial',
  'unset',
  'revert',
  'revert-layer', // CSS 全局关键字
  'min-content',
  'max-content', // CSS 内在尺寸关键字
]);

// 为任意尺寸值添加辉光边框偏移 - Add glow border offset to any size value
export const addGlowBorderOffset = (size: string | number): string => {
  // 数字类型直接处理
  if (typeof size === 'number') return `${size + GLOW_BORDER_TOTAL_OFFSET}px`;

  const val = size.trim();

  // 空字符串防御
  if (val === '') return `${GLOW_BORDER_TOTAL_OFFSET}px`;

  const valLower = val.toLowerCase();

  // 直接返回的关键字或 fit-content() 函数（忽略大小写）
  if (
    DIRECT_RETURN_KEYWORDS.has(valLower) ||
    /^fit-content\s*\(.*\)$/i.test(val)
  ) {
    return val;
  }

  // 纯数字字符串 -> 添加偏移并转为 px
  if (/^-?\d+(\.\d+)?$/.test(val)) {
    return `${parseFloat(val) + GLOW_BORDER_TOTAL_OFFSET}px`;
  }

  // 其他值用 calc() 包裹
  return `calc(${val} + ${GLOW_BORDER_TOTAL_OFFSET}px)`;
};

// Input field padding constants - 输入字段内边距常量
const INPUT_FIELD_PADDING = {
  NONE: '0px',
  SMALL: `${GLOW_BORDER_OFFSET}px`,
} as const;

// 定义旋转动画
const stopIconRotate = new Keyframes('stopIconRotate', {
  '0%': {
    transform: 'rotate(0deg)',
  },
  '100%': {
    transform: 'rotate(360deg)',
  },
});
const genStyle: GenerateStyle<
  ChatTokenType & { disableHoverAnimation?: boolean }
> = (token) => {
  const hoverStyle = token.disableHoverAnimation
    ? {}
    : {
        '&:hover': {
          boxShadow:
            '0px 0px 1px 0px rgba(10, 48, 104, 0.25), 0px 2px 7px 0px rgba(10, 48, 104, 0.05), 0px 2px 5px -2px rgba(10, 48, 104, 0.06)',
        },
      };

  return {
    [token.componentCls]: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: INPUT_FIELD_PADDING.NONE,
      borderRadius: '12px',
      minHeight: '48px',
      maxWidth: 980,
      position: 'relative',
      transition: 'box-shadow 0.3s',
      '> * ': {
        boxSizing: 'border-box',
      },
      '&:active,&.active': {
        outline: '1px solid transparent',
        outlineColor: 'var(--mif-active-outline-color, transparent)',
      },
      boxShadow:
        '0px 0px 1px 0px rgba(10, 48, 104, 0.15), 0px 1.5px 4px -1px rgba(10, 48, 104, 0.04)',
      ...hoverStyle,
      '&-focused': {
        boxShadow:
          '0px 0px 1px 0px rgba(10, 48, 104, 0.25), 0px 2px 7px 0px rgba(10, 48, 104, 0.05), 0px 2px 5px -2px rgba(10, 48, 104, 0.06)',
      },

      '&-enlarged': {
        [`${token.componentCls}-editor`]: {
          flex: 1,
          height: '100%',
          maxHeight: 'none',
          overflow: 'hidden',
          width: '100%',
        },
        [`${token.componentCls}-editor-content`]: {
          flex: 1,
          height: '100%',
          minHeight: '100%',
          maxHeight: 'none',
          overflow: 'auto',
          width: '100%',
        },
      },

      '&-border-wrapper': {
        width: '100%',
        zIndex: 9,
        height: '100%',
        boxSizing: 'border-box',
      },
      '&-content-wrapper': {
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        borderRadius: 'inherit',
      },
      '&-editor': {
        boxSizing: 'border-box',
        borderRadius: 'inherit',
        backgroundColor: 'var(--color-gray-bg-card-white)',
        width: '100%',
        zIndex: 9,
        maxHeight: 400,
        height: '100%',
        overflowY: 'visible',
        scrollbarColor: 'var(--color-gray-text-tertiary) transparent',
        scrollbarWidth: 'thin',
        '&&-disabled': {
          backgroundColor: 'rgba(0,0,0,0.04)',
          cursor: 'not-allowed',
        },
        'div[data-be="paragraph"]': {
          margin: '0 !important',
          padding: '0 !important',
        },
      },
      '&-editor-content': {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        maxHeight: 'inherit',
        minHeight: 0,
        borderRadius: 'inherit',
        overflow: 'hidden',
        [`@media (max-width: ${MOBILE_BREAKPOINT})`]: {
          padding: `${MOBILE_PADDING} !important`,
        },
      },
      '&-has-tools-wrapper': {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
      },
      '&&-disabled': {
        backgroundColor: 'rgba(0,0,0,0.04)',
        cursor: 'not-allowed',
        opacity: 0.5,
        padding: 0,
      },
      '&-loading': {
        cursor: 'not-allowed',
      },
      '&-send-tools': {
        boxSizing: 'border-box',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        font: 'var(--font-text-body-base)',
        color: 'var(--color-gray-text-default)',
      },
      '&-skill-mode &-editor-content': {
        borderRadius: 0,
      },
      '&-tools-wrapper': {
        backgroundColor: '#fff',
        display: 'flex',
        boxSizing: 'border-box',
        borderRadius: 0,
        borderBottomLeftRadius: 'inherit',
        borderBottomRightRadius: 'inherit',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        width: '100%',
        paddingLeft: 'var(--padding-3x)',
        paddingRight: 'var(--padding-3x)',
        paddingBottom: 'var(--padding-3x)',
        [`@media (max-width: ${MOBILE_BREAKPOINT})`]: {
          paddingLeft: MOBILE_PADDING,
          paddingRight: MOBILE_PADDING,
          paddingBottom: MOBILE_PADDING,
        },
      },
      '&-send-actions': {
        position: 'absolute',
        userSelect: 'none',
        right: 12,
        bottom: 8,
        boxSizing: 'border-box',
        zIndex: 99,
        display: 'flex',
        gap: '4px',
        alignItems: 'center',
        font: 'var(--font-text-body-base)',
        color: 'var(--color-gray-text-default)',
      },
      '&-quick-actions': {
        position: 'absolute',
        userSelect: 'none',
        width: '32px',
        top: 12,
        right: 12,
        boxSizing: 'border-box',
        zIndex: 99,
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        justifyContent: 'center',
        '&-vertical': {
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          height: 'auto',
          minHeight: '60px', // 确保有足够的高度显示多个按钮
        },
      },
      '&-send-has-tools': {
        boxSizing: 'border-box',
        position: 'relative',
        left: 'inherit',
        right: 'inherit',
        bottom: 'inherit',
        top: 'inherit',
      },

      // 旋转动画样式
      '.stop-icon-ring': {
        transition: 'transform 0.1s ',
        transformOrigin: '16px 16px',
        animationName: stopIconRotate,
        animationDuration: '1s',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
      },
    },
    [`${token.componentCls}-before-tools`]: {
      display: 'flex',
      gap: 8,
      width: '100%',
      maxWidth: '980px',
      marginBottom: '12px',
      font: 'var(--font-text-body-base)',
      color: 'var(--color-gray-text-default)',
      '> div': {
        cursor: 'pointer',
      },
    },

    [`${token.componentCls}-top-area`]: {
      display: 'flex',
      width: '100%',
      maxWidth: '980px',
      marginBottom: '8px',
      font: 'var(--font-text-body-base)',
      color: 'var(--color-gray-text-default)',
    },
  };
};

/**
 * Probubble
 * @param prefixCls
 * @param disableHoverAnimation 是否禁用 hover 动画
 * @returns
 */
export function useStyle(prefixCls?: string, disableHoverAnimation?: boolean) {
  return useEditorStyleRegister('MarkdownInputField', (token) => {
    const proChatToken = {
      ...token,
      componentCls: `.${prefixCls}`,
      disableHoverAnimation,
    };

    return [resetComponent(proChatToken), genStyle(proChatToken)];
  });
}
