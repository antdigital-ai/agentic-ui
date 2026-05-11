import {
  genStyleHooks,
  resetComponent,
  type GenStyleFn,
} from '../Hooks/useStyle';

const genStyle: GenStyleFn<'ThoughtChainList'> = (token) => {
  return {
    '@keyframes thoughtChainSpin': {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' },
    },
    [token.componentCls]: {
      padding: '12px',
      '*': {
        boxSizing: 'border-box',
      },
      width: '100%',
      borderRadius: '6px 12px 12px 12px',
      marginBottom: 8,
      boxShadow: '0px 1px 3px 0px rgba(25, 33, 61, 0.1)',
      overflow: 'hidden',
      minWidth: 320,
      position: 'relative',
      maxWidth: '100%',
      '.empty': {
        display: 'none',
      },
      '&-container': {
        width: '100%',
        borderRadius: '6px 12px 0px 0px',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&&-loading': {
          padding: 2,
          '&:before': {
            content: "''",
            position: 'absolute',
            top: '-2px',
            left: '-2px',
            filter: 'blur(24px)',
            width: 'calc(100% + 4px)',
            height: 'calc(100% + 4px)',
            zIndex: 1,
            backgroundSize: '150%',
            backgroundPosition: '0 0',
            backgroundImage: `conic-gradient(
    rgba(46, 255, 127, 0.7) 0deg,
    rgba(120, 133, 255, 1) 90deg,
    rgba(255, 0, 153, 0.4) 180deg,
    rgba(0, 221, 255, 0.62) 270deg,
    rgba(46, 255, 127, 0.7) 360deg
  )`,
            transformOrigin: 'center center',
            willChange: 'transform',
            animationName: 'thoughtChainSpin',
            animationDuration: '2s',
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
          },
        },
      },
      '&-title': {
        backgroundImage:
          'url(https://mdn.alipayobjects.com/huamei_ptjqan/afts/img/A*9adeRKwfQrEAAAAAAAAAAAAADkN6AQ/original)',
        backgroundSize: '100% 100%',
        height: '100%',
        width: '100%',
        zIndex: 2,
        backgroundColor: 'var(--color-gray-bg-card-white)',
        fontWeight: 500,
        color: 'var(--color-gray-text-default)',
        padding: 'var(--padding-3x)',
        overflow: 'hidden',
        display: 'flex',
        gap: 12,
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        fontSize: '1em',
        borderTopLeftRadius: 6,
        borderTopRightRadius: 12,
        '&-icon': {
          width: 15,
          height: 15,
          color: 'var(--color-green-text-default)',
        },
        '&&-collapse': {
          borderRadius: '6px 12px 12px 12px',
        },
        '&&-compact': {
          padding: 8,
          minHeight: 24,
        },
        '&-progress': {
          fontSize: '1em',
          textWrap: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          lineHeight: 1,
        },
        '&&-extra': {
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flex: 1,
          fontSize: '1em',
          justifyContent: 'flex-end',
        },
        '> div': {
          maxWidth: 'min(860px,calc(100% - 42px))',
          display: 'flex',
          width: '100%',
          gap: 8,
          alignItems: 'center',
          flex: 1,
        },
      },
      '&-content-wrapper': {
        backgroundColor: 'var(--color-gray-bg-card-white)',
        position: 'relative',
        borderRadius: '6px 12px 12px 12px',
        zIndex: 9,
      },
      '&-content': {
        backgroundColor: 'var(--color-gray-bg-card-white)',
        borderRadius: '0px 0px 12px 12px',
        maxHeight: '566px',
        padding: '12px 12px',
        opacity: 1,
        transition:
          'max-height 0.16s cubic-bezier(0.4, 0, 0.2, 1), padding 0.16s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.12s linear',
        overflow: 'auto',
        '&&-compact': {
          padding: 8,
        },
        '&&-collapse': {
          maxHeight: '0px',
          padding: '0',
          opacity: 0,
          overflow: 'hidden',
        },
        '&-list': {
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          '&-item': {
            lineHeight: '2em',
            color: 'var(--color-gray-a9)',
            display: 'flex',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            fontSize: '1em',
            width: '100%',
            gap: 8,
            '*:last-child': {
              margin: 0,
            },
            pre: {
              backgroundColor: 'var(--color-gray-control-fill-secondary)',
              borderRadius: 12,
              padding: '4px 8px',
            },
            '&:hover': {
              [`${token.componentCls}-content-list-item-info-action`]: {
                opacity: 1,
              },
            },
            '& code[class*="language-"], pre[class*="language-"]': {
              whiteSpace: 'break-spaces!important',
              color: 'var(--color-gray-a9)',
              fontFamily:
                'SFMono-Regular, Consolas, Liberation Mono, Menlo, Courier, monospace, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Helvetica Neue, Helvetica, Arial, sans-serif, Segoe UI-MONOSPACE',
            },
            '&-info': {
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '6px',
              borderRadius: '12px',
              height: '2em',
              fontSize: '1em',
              wordBreak: 'break-all',
              wordWrap: 'break-word',
              maxWidth: '100%',
              flexWrap: 'wrap',
              '&-tag': {
                padding: '0px 6px',
                background:
                  'radial-gradient(22% 66% at 96% 113%, rgba(255, 255, 245, 0.52) 0%, rgba(230, 238, 255, 0) 100%), radial-gradient(14% 234% at 100% 50%, rgba(162, 255, 255, 0.28) 0%, rgba(153, 202, 255, 0.1193) 13%, rgba(229, 189, 255, 0.0826) 38%, rgba(235, 255, 245, 0) 100%), var(--color-gray-bg-card-white)',
                border: '1px solid rgba(227, 230, 234, 0.65)',
                lineHeight: '26px',
              },
              '&-tag-text': {
                overflow: 'hidden',
                textWrap: 'nowrap',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: '26px',
              },
              '&-title': {
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: '4px',
                fontSize: '1em',
                fontWeight: 'normal',
                lineHeight: '2em',
                flexWrap: 'wrap',
                letterSpacing: '0px',
                color: 'var(--color-gray-text-default)',
              },
              '&-action': {
                opacity: 0,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              },
            },
            '&-icon': {
              width: '28px',
              height: '28px',
              minWidth: '28px',
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '1.2em',
              '&-success': {
                color: 'var(--color-green-text-default)',
              },
              '&-loading': {
                color: 'var(--color-orange-text-default)',
              },
            },
          },
        },
      },
    },
  };
};

/**
 * 思维链项入场动画样式：替代 framer-motion 的
 * `variants={{ hidden:{y:8,opacity:0}, visible:{y:0,opacity:1, delay:0.1*i} }}`。
 *
 * 通过 CSS keyframes + inline `animation-delay` 实现按 index 的 stagger 入场，
 * 在测试环境（process.env.NODE_ENV === 'test'）下由组件层禁用动画。
 */
const genMotionStyle: GenStyleFn<'ThoughtChainList'> = (token) => {
  return {
    [`${token.componentCls}-content-list-item-motion`]: {
      animationName: `${token.componentCls}-thoughtChainItemFadeInUp`,
      animationDuration: '0.3s',
      animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      animationFillMode: 'both',
    },
    [`@keyframes ${token.componentCls}-thoughtChainItemFadeInUp`]: {
      from: { transform: 'translateY(8px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
    },
  };
};

/**
 * BubbleChat
 * @param prefixCls
 * @returns
 */
const useGenStyle = genStyleHooks('ThoughtChainList', (token, info) => [
  resetComponent(token),
  genStyle(token, info),
  genMotionStyle(token, info),
]);

export function useStyle(prefixCls?: string) {
  const [wrapSSR, hashId] = useGenStyle(prefixCls ?? 'ThoughtChainList');
  return { wrapSSR, hashId };
}
