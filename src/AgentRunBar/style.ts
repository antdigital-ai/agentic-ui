import { Keyframes } from '@ant-design/cssinjs';
import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../hooks/useStyle';

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
const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  const { componentCls } = token;

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
      borderRadius: 'var(--radius-card-lg)',

      '&-border': {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        // background:
        //   'conic-gradient(from 180deg at 50% 50%, #D3FEFF -31deg, #D3FEFF 82deg, #FFF16F 110deg, rgba(82, 212, 255, 0.2329) 221deg, #D3FEFF 329deg, #D3FEFF 427deg)',
        background:
          'linear-gradient(90deg, #D3FEFF 0%, #FFF16F 16%, rgba(82, 212, 255, 0.2329) 50%, #D3FEFF 75%, #D3FEFF 100%)',
        backgroundSize: '200% 50%',
        borderRadius: 'var(--radius-card-lg)',
        opacity: 1,
        boxShadow: 'var(--shadow-popover-base)',
        animationName: borderSpin,
        animationDuration: '8s',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
        pointerEvents: 'none',
        overflow: 'hidden',
        transition: 'background 0.25s cubic-bezier(0.645, 0.045, 0.355, 1)',
      },

      '&-background': {
        position: 'absolute',
        top: 2,
        left: 2,
        right: 2,
        bottom: 2,
        zIndex: -1,
        background: 'var(--color-gray-bg-card-white)',
        borderRadius: 14,
        pointerEvents: 'none',
      },

      '&-left': {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 'var(--font-size-base)',
        lineHeight: '20px',
        color: 'var(--color-gray-text-default)',
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
        gap: -2,
        overflow: 'hidden',

        // title
        [`${componentCls}-left-main-text`]: {
          color: 'var(--color-gray-text-default)',
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
          color: 'var(--color-gray-text-light)',
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

      // TODO: 抽离为公共图标按钮组件
      '&-pause, &-play': {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 32,
        height: 32,
        color: 'var(--color-gray-text-secondary)',
        fontSize: 16,
        background: 'var(--color-gray-control-fill-secondary)',
        backdropFilter: 'blur(40px)',
        borderRadius: 200,
        zIndex: 0,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',

        '&:hover': {
          background: 'var(--color-gray-control-fill-secondary-hover)',
        },

        '&:active': {
          color: 'var(--color-primary-control-fill-primary)',
          background: 'var(--color-primary-control-fill-secondary)',
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
        background: 'var(--color-gray-bg-card-white)',
      },
    },

    // Simple variant
    [`${componentCls}${componentCls}-simple`]: {
      width: '100%',
      height: 39,
      padding: '8px 12px',
      borderRadius: 8,

      [`${componentCls}-border`]: {
        background: 'var(--color-gray-bg-page-dark)',
        borderRadius: 'var(--radius-control-base)',
        boxShadow: 'var(--shadow-control-base)',
      },

      [`${componentCls}-background`]: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'var(--color-gray-bg-page-dark)',
        borderRadius: 8,
      },

      // title
      [`${componentCls}-left-main-text`]: {
        color: 'var(--color-gray-text-default)',
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
        color: 'var(--color-gray-text-default)',
        fontSize: 14,
        background: 'transparent',
        borderRadius: 'var(--radius-control-sm)',
        cursor: 'pointer',

        '&:hover': {
          background: 'var(--color-gray-control-fill-active)',
        },

        '&:active': {
          color: 'var(--color-primary-control-fill-primary)',
          background: 'var(--color-primary-control-fill-secondary)',
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
 * @returns 包含样式和 SSR 包装器的对象
 *
 * @example
 * ```tsx
 * const { wrapSSR, hashId } = useStyle('my-prefix');
 * ```
 */
export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('task-running', (token) => {
    const taskRunningToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };
    return [genStyle(taskRunningToken)];
  });
}
