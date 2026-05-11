import { genStyleHooks, type GenStyleFn } from '../Hooks/useStyle';

/**
 * 动画曲线常量集中维护：
 * - `enter`：标准缓出（material/expressive 推荐用于元素入场）
 * - `leave`：稍快的缓入，便于关闭时利落收起
 * 同时对应 keyframes 的命名也避免与其他组件冲突
 */
const ENTER_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';
const LEAVE_EASING = 'cubic-bezier(0.4, 0, 1, 1)';
const ENTER_DURATION = '240ms';
const LEAVE_DURATION = '200ms';

const genStyle: GenStyleFn<'AnswerAlert'> = (token) => {
  return {
    // ================== Keyframes ==================
    // 命名带 `${prefixCls}` 前缀防止全局冲突；为了兼容 cssinjs，
    // 这里直接使用稳定字面量，避免运行时拼接产生的多份 keyframes
    '@keyframes answerAlertFadeIn': {
      '0%': { opacity: 0, transform: 'translateY(-4px)' },
      '100%': { opacity: 1, transform: 'translateY(0)' },
    },
    '@keyframes answerAlertFadeOut': {
      '0%': {
        opacity: 1,
        transform: 'translateY(0) scale(1)',
        // 用一个足够大的 max-height 让收起平滑
        maxHeight: 200,
        marginBottom: 0,
      },
      '100%': {
        opacity: 0,
        transform: 'translateY(-4px) scale(0.98)',
        maxHeight: 0,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
      },
    },

    [token.componentCls]: {
      display: 'inline-flex',
      flexDirection: 'column',
      padding: '3px 4px 3px 8px',
      color: 'var(--color-gray-text-default)',
      background: 'var(--color-gray-bg-card-white)',
      borderRadius: 'var(--radius-control-base)',
      boxShadow: 'var(--shadow-control-base)',
      // 让 max-height 收起动画在 motion=false 时也不会出现剪裁瑕疵
      overflow: 'hidden',
      // 防止动画过程中宽度跳动
      willChange: 'opacity, transform, max-height',

      '&-content': {
        display: 'flex',
        alignItems: 'center',
      },

      '&-icon': {
        width: 14,
        height: 14,
        fontSize: 14,
      },

      '&-message': {
        flex: 1,
        paddingLeft: 8,
        paddingRight: 8,
        font: 'var(--font-text-body-emphasized-base)',
        letterSpacing: 'var(--letter-spacing-body-emphasized-base, normal)',
      },

      '&-description': {
        font: 'var(--font-text-paragraph-base)',
        letterSpacing: 'var(--letter-spacing-paragraph-base, normal)',
      },

      '&-close-icon': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 20,
        height: 20,
        padding: 0,
        backgroundColor: 'transparent',
        color: 'var(--color-gray-text-disabled)',
        borderRadius: 'var(--radius-control-sm)',
        fontSize: 14,
        border: 'none',
        outline: 'none',
        cursor: 'pointer',
        transition:
          'background-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1), color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1), transform 0.15s ease',

        '&:hover': {
          backgroundColor: 'var(--color-gray-control-fill-active)',
        },

        // 键盘焦点：用 focus-visible 而非 focus，避免鼠标点击后残留焦点框
        '&:focus-visible': {
          outline:
            '2px solid var(--color-primary-control-fill-active, #1677ff)',
          outlineOffset: 1,
        },

        // 微交互：按下时轻微缩放反馈
        '&:active': {
          transform: 'scale(0.92)',
        },
      },
    },

    // ================== Motion ==================
    // 仅在显式开启 motion 且不是关闭中时播放入场动画
    [`${token.componentCls}-motion:not(${token.componentCls}-closing)`]: {
      animation: `answerAlertFadeIn ${ENTER_DURATION} ${ENTER_EASING} both`,
    },

    // 关闭中：播放退出动画；JS 层在 animationend 后真正 unmount
    [`${token.componentCls}-closing`]: {
      animation: `answerAlertFadeOut ${LEAVE_DURATION} ${LEAVE_EASING} both`,
      // 关闭过程中阻止再次响应交互
      pointerEvents: 'none',
    },

    // 尊重用户系统的「减少动态效果」偏好：完全禁用动画
    '@media (prefers-reduced-motion: reduce)': {
      [`${token.componentCls}-motion, ${token.componentCls}-closing`]: {
        animation: 'none',
      },
      [`${token.componentCls} ${token.componentCls}-close-icon`]: {
        transition: 'none',
      },
    },

    // ================== With description ================
    [`${token.componentCls}-with-description`]: {
      display: 'flex',
      padding: '12px',
      borderRadius: 'var(--radius-card-base)',

      [`${token.componentCls}-content`]: {
        marginBottom: 8,
      },

      [`${token.componentCls}-icon`]: {
        width: 18,
        height: 18,
        fontSize: 18,
      },

      [`${token.componentCls}-message`]: {
        font: 'var(--font-text-h5-base)',
        letterSpacing: 'var(--letter-spacing-h5-base, normal)',
      },
    },

    // ================== Types ==================

    [`${token.componentCls}-success`]: {
      color: 'var(--color-green-text-secondary)',
      backgroundColor: 'var(--color-green-bg-tip)',
      boxShadow: 'none',

      [`${token.componentCls}-close-icon`]: {
        color: 'rgba(0, 176, 102, 0.81)',

        '&:hover': {
          backgroundColor: 'var(--color-green-control-fill-active)',
        },
      },
    },

    [`${token.componentCls}-warning`]: {
      color: 'var(--color-yellow-text-secondary)',
      backgroundColor: 'var(--color-yellow-bg-tip, rgba(250, 173, 20, 0.08))',
      boxShadow: 'none',

      [`${token.componentCls}-close-icon`]: {
        color: 'var(--color-yellow-text-secondary)',

        '&:hover': {
          backgroundColor: 'var(--color-yellow-control-fill-active)',
        },
      },
    },

    [`${token.componentCls}-error`]: {
      color: 'var(--color-red-text-secondary)',
      backgroundColor: 'var(--color-red-bg-tip)',
      boxShadow: 'none',

      [`${token.componentCls}-close-icon`]: {
        color: 'rgba(212, 23, 1, 0.48)',

        '&:hover': {
          backgroundColor: 'var(--color-red-control-fill-active)',
        },
      },
    },

    [`${token.componentCls}-info`]: {
      color: 'var(--color-blue-text-secondary)',
      backgroundColor: 'var(--color-blue-bg-tip)',
      boxShadow: 'none',

      [`${token.componentCls}-close-icon`]: {
        color: 'rgba(0, 101, 250, 0.55)',

        '&:hover': {
          backgroundColor: 'var(--color-blue-control-fill-active)',
        },
      },
    },

    [`${token.componentCls}-gray`]: {
      color: 'var(--color-gray-text-secondary)',
      backgroundColor: 'var(--color-gray-bg-tip)',
      boxShadow: 'none',

      [`${token.componentCls}-close-icon`]: {
        color: 'rgba(80, 94, 119, 0.32)',

        '&:hover': {
          backgroundColor: 'var(--color-gray-control-fill-active)',
        },
      },
    },
  };
};

const useGenStyle = genStyleHooks('AnswerAlert', genStyle);

export function useStyle(prefixCls?: string) {
  const [wrapSSR, hashId] = useGenStyle(prefixCls ?? 'answer-alert');
  return { wrapSSR, hashId };
}
