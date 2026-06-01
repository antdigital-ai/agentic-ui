import { Keyframes } from '@ant-design/cssinjs';
import { genStyleHooks, type GenStyleFn } from '../Hooks/useStyle';

// 定义旋转动画
const stopIconRotate = new Keyframes('stopIconRotate', {
  '0%': {
    transform: 'rotate(0deg)',
  },
  '100%': {
    transform: 'rotate(360deg)',
  },
});

const borderSpin = new Keyframes('borderSpin', {
  '0%': {
    backgroundPosition: '200% 50%',
  },
  '100%': {
    backgroundPosition: '0% 50%',
  },
});

/**
 * 生成任务运行组件的样式
 *
 * @param token - 主题令牌，包含全局样式变量
 * @returns CSS-in-JS 样式对象
 */
const genStyle: GenStyleFn<'AgentRunBar'> = (token) => {
  const { componentCls } = token;

  // 优先使用 antd token，回退到原有的 CSS 变量（兼容尚未注入 antd token 的旧主题）
  const colorText = `var(--color-gray-text-default, ${token.colorText})`;
  const colorTextSecondary = `var(--color-gray-text-light, ${token.colorTextSecondary})`;
  const colorTextTertiary = `var(--color-gray-text-secondary, ${token.colorTextTertiary})`;
  const colorBgContainer = `var(--color-gray-bg-card-white, ${token.colorBgContainer})`;
  const colorBgLayout = `var(--color-gray-bg-page-dark, ${token.colorBgLayout})`;
  const colorFillSecondary = `var(--color-gray-control-fill-secondary, ${token.colorFillSecondary})`;
  const colorFillTertiary = `var(--color-gray-control-fill-secondary-hover, ${token.colorFillTertiary})`;
  const colorFillActive = `var(--color-gray-control-fill-active, ${token.colorFillTertiary})`;
  const colorPrimary = `var(--color-primary-control-fill-primary, ${token.colorPrimary})`;
  const colorPrimaryBg = `var(--color-primary-control-fill-secondary, ${token.colorPrimaryBg})`;
  const borderRadiusLG = `var(--radius-card-lg, ${token.borderRadiusLG}px)`;
  const borderRadius = `var(--radius-control-base, ${token.borderRadius}px)`;
  const borderRadiusSM = `var(--radius-control-sm, ${token.borderRadiusSM}px)`;
  const boxShadowSecondary = `var(--shadow-popover-base, ${token.boxShadowSecondary})`;
  const boxShadow = `var(--shadow-control-base, ${token.boxShadow})`;
  const fontSize = `var(--font-size-base, ${token.fontSize}px)`;

  return {
    [componentCls]: {
      position: 'relative',
      minWidth: 398,
      width: 'max-content',
      maxWidth: 'min(800px,100%)',
      height: 58,
      padding: 8,
      gap: 12,
      zIndex: 2,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: borderRadiusLG,

      '&-border': {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        background:
          'linear-gradient(90deg, #D3FEFF 0%, #FFF16F 16%, rgba(82, 212, 255, 0.2329) 50%, #D3FEFF 75%, #D3FEFF 100%)',
        backgroundSize: '200% 50%',
        borderRadius: borderRadiusLG,
        opacity: 1,
        boxShadow: boxShadowSecondary,
        animationName: borderSpin,
        animationDuration: '8s',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
        pointerEvents: 'none',
        overflow: 'hidden',
        transitionProperty: 'background',
        transitionDuration: token.motionDurationMid,
        transitionTimingFunction: token.motionEaseInOut,
      },

      '&-background': {
        position: 'absolute',
        top: 2,
        left: 2,
        right: 2,
        bottom: 2,
        zIndex: -1,
        background: colorBgContainer,
        borderRadius: 14,
        pointerEvents: 'none',
      },

      '&-left': {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize,
        lineHeight: '20px',
        color: colorText,
        flex: 1,
        minWidth: 0,
      },

      '&-left-icon-wrapper': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 20,
        width: 40,
        height: 40,
      },

      '&-left-content': {
        display: 'flex',
        flexDirection: 'column',
        // 标题与描述的纵向间距由各自 lineHeight 控制（CSS gap 不接受负值，
        // 历史代码里的 gap: -2 等同于 0，已显式改为 0 以避免误导）
        gap: 0,
        overflow: 'hidden',

        // title
        [`${componentCls}-left-main-text`]: {
          color: colorText,
          lineHeight: '20px',
          font: 'var(--font-text-h6-base)',

          overflow: 'hidden',
          textOverflow: 'ellipsis',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2,
          display: '-webkit-box',
          margin: 0,
        },

        // description
        [`${componentCls}-left-text`]: {
          lineHeight: '20px',
          font: 'var(--font-text-body-sm)',
          alignItems: 'center',
          letterSpacing: 'var(--letter-spacing-body-sm, normal)',
          display: '-webkit-box',
          '-webkit-line-clamp': '1',
          lineClamp: 1,
          '-webkit-box-orient': 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          color: colorTextSecondary,
        },
      },

      '&-button-wrapper': {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        justifyContent: 'center',
        paddingRight: 4,
        '> * ': {
          cursor: 'pointer',
        },
      },

      // 圆形图标控制按钮（停止 / 暂停 / 继续）共用样式
      '&-pause, &-play': {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 32,
        height: 32,
        color: colorTextTertiary,
        fontSize: 16,
        background: colorFillSecondary,
        backdropFilter: 'blur(40px)',
        borderRadius: 200,
        zIndex: 0,
        cursor: 'pointer',
        transitionProperty: 'background-color, color',
        transitionDuration: token.motionDurationMid,
        transitionTimingFunction: token.motionEaseInOut,

        '&:hover': {
          background: colorFillTertiary,
        },

        '&:active': {
          color: colorPrimary,
          background: colorPrimaryBg,
        },
      },

      button: {
        borderRadius: 200,
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

    // with description
    [`${componentCls}-with-description`]: {
      [`${componentCls}-left-main-text`]: {
        textWrap: 'nowrap',
        '-webkit-line-clamp': '1',
        lineClamp: 1,
      },
    },

    // Status pause
    [`${componentCls}-status-pause`]: {
      [`${componentCls}-border`]: {
        background: colorBgContainer,
      },
    },

    // Simple variant
    [`${componentCls}${componentCls}-simple`]: {
      width: '100%',
      height: 39,
      padding: '8px 12px',
      borderRadius: 8,

      [`${componentCls}-border`]: {
        background: colorBgLayout,
        borderRadius,
        boxShadow,
      },

      [`${componentCls}-background`]: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: colorBgLayout,
        borderRadius: 8,
      },

      // title
      [`${componentCls}-left-main-text`]: {
        color: colorText,
        fontWeight: 'normal',
        lineHeight: '16px',
        font: 'var(--font-text-paragraph-base)',
        letterSpacing: 'var(--letter-spacing-paragraph-base, normal)',
      },

      [`${componentCls}-button-wrapper`]: {
        gap: 4,
      },

      [`${componentCls}-play, ${componentCls}-pause`]: {
        width: 28,
        height: 28,
        color: colorText,
        fontSize: 14,
        background: 'transparent',
        borderRadius: borderRadiusSM,
        cursor: 'pointer',

        '&:hover': {
          background: colorFillActive,
        },

        '&:active': {
          color: colorPrimary,
          background: colorPrimaryBg,
        },
      },
    },
  };
};

/**
 * 任务运行组件的样式 Hook
 *
 * 该 Hook 用于生成任务运行组件所需的样式，包括：
 * - 容器样式
 * - 左侧区域样式（图标、标题和描述）
 * - 按钮区域样式（暂停、操作按钮）
 * - 动画效果
 *
 * @param prefixCls - 组件类名前缀
 * @returns 包含 `hashId` 的对象
 *
 * @example
 * ```tsx
 * const { hashId } = useStyle('my-prefix');
 * ```
 */
const useGenStyle = genStyleHooks('AgentRunBar', genStyle);

export function useStyle(prefixCls?: string) {
  const [, hashId] = useGenStyle(prefixCls ?? 'agent-run-bar');
  return { hashId };
}
