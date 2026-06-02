import {
  CARD_RESIZE_DURATION_MS,
  CARD_RESIZE_EASING,
} from '../Constants/cardResizeMotion';
import { genStyleHooks, type GenStyleFn } from '../Hooks/useStyle';

const LIGHT_MODE_BACKDROP_FILTER = 'blur(12px)';

const genStyle: GenStyleFn<'ToolUseBarThink'> = (token) => {
  return {
    [token.componentCls]: {
      '--resize-dur': `${CARD_RESIZE_DURATION_MS}ms`,
      '--resize-ease': CARD_RESIZE_EASING,
      '@keyframes thinkSpin': {
        from: { '--think-rotate': '0deg' },
        to: { '--think-rotate': '360deg' },
      },
      '@keyframes thinkMaskSweep': {
        '0%': {
          maskPosition: '200% 0',
          WebkitMaskPosition: '200% 0',
        },
        '100%': {
          maskPosition: '-100% 0',
          WebkitMaskPosition: '-100% 0',
        },
      },
      position: 'relative',
      cursor: 'pointer',
      borderRadius: 'var(--radius-card-base)',
      boxSizing: 'border-box',
      border: 'var(--color-gray-border-light)',
      boxShadow: 'var(--shadow-border-base)',
      minHeight: '20px',
      width: 'auto',
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      gap: '8px',
      zIndex: 1,
      padding: '4px',
      paddingRight: '4px',
      marginBottom: '4px',

      '*': {
        boxSizing: 'border-box',
      },
      '&:hover': {
        background: 'var(--color-gray-control-fill-active)',
        boxSizing: 'border-box',
        boxShadow: 'var(--shadow-card-base)',
        [`${token.componentCls}-floating-expand`]: {
          opacity: 1,
          transform: 'translateY(0)',
        },
      },
      '&-expanded:not(&-light)': {
        borderRadius: 'var(--radius-card-base)',
        padding: 4,
        gap: 0,
        outline: 'none',
        '&:hover': {
          background: 'var(--color-gray-bg-card-light)',
          boxShadow: 'var(--shadow-border-base)',
        },
      },
      '&-loading': {
        boxSizing: 'border-box',
        boxShadow:
          '0px 0px 1px 0px rgba(0, 19, 41, 0.05),0px 2px 7px 0px rgba(0, 19, 41, 0.05),0px 2px 5px -2px rgba(0, 19, 41, 0.06)',
        '&:hover': {
          boxSizing: 'border-box',
          boxShadow:
            '0px 0px 1px 0px rgba(0, 19, 41, 0.05),0px 2px 7px 0px rgba(0, 19, 41, 0.05),0px 2px 5px -2px rgba(0, 19, 41, 0.06)',
        },
      },
      '&-success': {
        borderRadius: 'var(--radius-card-base)',
        boxShadow: 'inset 0px 0px 1px 0px rgba(0, 19, 41, 0.15)',
      },
      // Placed after &-success so light mode wins when both classes apply (success + light).
      '&-light': {
        boxShadow: 'none',
        border: 'none',
        borderRadius: '14px',
        padding: 4,
        backdropFilter: LIGHT_MODE_BACKDROP_FILTER,
        WebkitBackdropFilter: LIGHT_MODE_BACKDROP_FILTER,
        '&:hover': {
          // light 模式 hover 保持一致的浅色背景，避免与 container border-left 颜色不协调
          background: 'var(--color-gray-bg-card-light)',
          boxShadow: 'none',
          [`${token.componentCls}-header-left-icon-light`]: {
            color: 'var(--color-gray-text-secondary)',
          },
        },
      },
      '&-bar': {
        borderRadius: 'var(--radius-card-base)',
        minHeight: '24px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        zIndex: 1,
      },

      '&-header': {
        height: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        flex: 1,
        justifyContent: 'space-between',
        paddingRight: 4,
        '&-light': {
          gap: 4,
        },
      },

      '&-header-left-icon': {
        font: 'var(--font-text-body-emphasized-base)',
        color: 'var(--color-gray-text-default)',
        height: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-control-sm)',
        '&:hover': {
          backgroundColor: 'var(--color-gray-control-fill-hover)',
        },
        '&-light': {
          color: 'var(--color-gray-text-light)',
          '&:hover': {
            color: 'var(--color-gray-text-secondary)',
          },
        },
      },

      '&-expand': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '20px',
        height: '20px',
        color: 'var(--color-gray-text-disabled)',
        fontSize: 'var(--font-size-base)',
        cursor: 'pointer',
        borderRadius: '12px',
      },

      '&-name': {
        fontWeight: 500,
        lineHeight: '20px',
        font: 'var(--font-text-body-emphasized-sm)',
        letterSpacing: 'var(--letter-spacing-body-emphasized-sm, normal)',
        color: 'var(--color-gray-text-secondary)',
        '&-light': {
          color: 'var(--color-gray-text-secondary)',
          '&:hover': {
            color: 'var(--color-gray-text, var(--color-gray-text-default))',
          },
        },
      },

      '&-image-wrapper': {
        width: '24px',
        height: '24px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '4px',
        borderRadius: '200px',
        boxSizing: 'border-box',
        boxShadow: 'var(--shadow-border-base)',
        background: 'var(--color-gray-bg-card-white)',
        zIndex: 0,
        position: 'relative',
        color: 'var(--color-gray-text-secondary)',
        fontSize: 'var(--font-size-lg)',
        '& > svg, & > *:first-child': {
          position: 'relative',
          zIndex: 1,
        },
        '&-loading': {
          borderRadius: '50%',
          transition: 'border-radius 0.3s ease-in-out',
          animation: 'thinkSpin 1s linear infinite',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: '0',
            borderRadius: '50%',
            background:
              'conic-gradient(from var(--think-rotate, 0deg),transparent 0deg 0deg, #5EF050 35deg 55deg, #37ABFF 105deg 115deg,  #D7B9FF 135deg 135deg, transparent 165deg 360deg)',
            WebkitMask:
              'radial-gradient(50% 50% at 50% 50%, rgba(255, 0, 0, 0) 65%, #FF0000 100%)',
            mask: 'radial-gradient(50% 50% at 50% 50%, rgba(255, 0, 0, 0) 80%, #FF0000 80%, #FF0000 100%)',
          },
        },
      },

      '&-target': {
        lineHeight: '20px',
        flex: 1,
        marginRight: 30,
        font: 'var(--font-text-body-emphasized-sm)',
        letterSpacing: 'var(--letter-spacing-body-emphasized-sm, normal)',
        color: 'var(--color-gray-text-secondary)',
      },
      '&-time': {
        fontSize: 'var(--font-size-sm)',
        fontWeight: 'normal',
        lineHeight: '12px',
        letterSpacing: '0.04em',
        color: 'var(--color-gray-text-disabled)',
      },
      '&-think-collapse': {
        display: 'grid',
        gridTemplateRows: 'minmax(0, 0fr)',
        minHeight: 0,
        maxHeight: 0,
        overflow: 'hidden',
        width: '100%',
        pointerEvents: 'none',
        transition: [
          `grid-template-rows var(--resize-dur) var(--resize-ease)`,
          `max-height var(--resize-dur) var(--resize-ease)`,
        ].join(','),
        willChange: 'grid-template-rows, max-height',
      },
      '&-think-collapse-open': {
        gridTemplateRows: 'minmax(0, 1fr)',
        maxHeight: 800,
        pointerEvents: 'auto',
      },
      // 内容完全展开时，解除 collapse 和 inner 的 maxHeight/overflow 限制
      '&-think-collapse-content-expanded': {
        maxHeight: 'none',
        [`${token.componentCls}-think-collapse-inner`]: {
          maxHeight: 'none',
          overflow: 'visible',
        },
      },
      '&-think-collapse-inner': {
        minHeight: 0,
        maxHeight: '100%',
        overflow: 'hidden',
      },

      '&-root-think-collapsed': {
        gap: 0,
      },

      '&-container': {
        width: '100%',
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 700,
        overflow: 'hidden',
        overflowY: 'auto',
        position: 'relative',
        '&-light': {
          borderLeft: '1px solid var(--color-gray-border-light)',
          paddingLeft: 12,
          marginLeft: 16,
          marginTop: -10,
          backdropFilter: LIGHT_MODE_BACKDROP_FILTER,
          WebkitBackdropFilter: LIGHT_MODE_BACKDROP_FILTER,
        },
        // floatingExpanded 展开时让收起按钮始终可见，而非仅 hover 时显示
        '&-floating-expanded': {
          [`${token.componentCls}-floating-expand`]: {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      },
      '&-container-loading': {
        display: 'flex',
        width: '100%',
        flexDirection: 'column-reverse',
        maxHeight: 158,
        overflow: 'hidden',
        position: 'relative',
        '&-content': {
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
        },
        '&:hover': {
          [`&-floating-expand`]: {
            opacity: 1,
            visibility: 'visible',
          },
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          height: 48,
          right: 0,
          borderRadius: '12px',
          background:
            'linear-gradient(to bottom, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0) 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: 48,
          right: 0,
          borderRadius: '12px',
          background:
            'linear-gradient(to top, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0) 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        },
      },
      '&-header-right': {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flex: 1,
        '&-loading': {
          maskImage:
            'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,1) 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,1) 100%)',
          maskSize: '200% 100%',
          WebkitMaskSize: '200% 100%',
          animation: 'thinkMaskSweep 1.5s linear infinite',
        },
      },
      '&-content': {
        font: 'var(--font-text-paragraph-sm)',
        letterSpacing: 'var(--letter-spacing-paragraph-sm, normal)',
        color: 'var(--color-gray-text-secondary)',
        '&-light': {
          color: 'var(--color-gray-text-light)',
        },
      },
      '&-content-expand': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        marginTop: 8,
        padding: '8px 16px',
        fontSize: 'var(--font-size-base)',
        cursor: 'pointer',
        borderRadius: 'var(--radius-control-base)',
        background: 'transparent',
        color: 'var(--color-gray-text-secondary)',
        font: 'var(--font-text-body-emphasized-sm)',
        flexShrink: 0,
        '&:hover': {
          color: 'var(--color-gray-text-default)',
        },
      },
      '&-floating-expand': {
        position: 'absolute',
        bottom: '8px',
        right: 'calc(50% - 35px)',
        width: 70,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '32px',
        gap: 4,
        fontSize: 'var(--font-size-base)',
        cursor: 'pointer',
        borderRadius: '20px',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(0, 19, 41, 0.1)',
        boxShadow: '0px 2px 8px rgba(0, 19, 41, 0.15)',
        font: 'var(--font-text-body-emphasized-base)',
        color: 'var(--color-gray-text-default)',
        padding: '16px 5px',
        zIndex: 10,
        transform: 'translateY(100%)',
        opacity: 0,
        transition: 'transform 0.2s ease, opacity 0.2s ease',
        '&:hover': {
          boxShadow: 'var(--shadow-popover-base)',
        },
        '&:active': {
          transform: 'translateY(0px)',
        },
        '&-hover-visible': {
          opacity: 1,
          transform: 'translateY(0)',
        },
      },

      '@media (prefers-reduced-motion: reduce)': {
        '&-think-collapse': {
          transition: 'none !important',
          willChange: 'auto',
        },
      },
    },
  };
};

const useGenStyle = genStyleHooks('ToolUseBarThink', genStyle);

export function useStyle(prefixCls?: string) {
  const [, hashId] = useGenStyle(prefixCls ?? 'tool-use-bar-think');
  return { hashId };
}
