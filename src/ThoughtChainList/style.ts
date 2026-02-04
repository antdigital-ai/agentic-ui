import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
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
    from var(--angle) at 50% 50%,
    rgba(46, 255, 127, 0.7) 0deg,
    rgba(120, 133, 255, 1) 90deg,
    rgba(255, 0, 153, 0.4) 180deg,
    rgba(0, 221, 255, 0.62) 270deg,
    rgba(46, 255, 127, 0.7) 360deg
  )`,
            animationName: 'spin',
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
      '&-content': {
        backgroundColor: 'var(--color-gray-bg-card-white)',
        borderRadius: '0px 0px 12px 12px',
        maxHeight: '566px',
        padding: '12px 12px',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'auto',
        '&&-compact': {
          padding: 8,
        },
        '&&-collapse': {
          maxHeight: '0px',
          padding: '0',
          opacity: 0,
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
              color: 'rgb(102, 111, 141)',
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
                  'radial-gradient(22% 66% at 96% 113%, rgba(255, 255, 245, 0.52) 0%, rgba(230, 238, 255, 0) 100%), radial-gradient(14% 234% at 100% 50%, rgba(162, 255, 255, 0.28) 0%, rgba(153, 202, 255, 0.1193) 13%, rgba(229, 189, 255, 0.0826) 38%, rgba(235, 255, 245, 0) 100%), #FFFFFF',
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
                color: 'rgba(0, 0, 0, 0.85)',
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
 * BubbleChat
 * @param prefixCls
 * @returns
 */
export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('ThoughtChainList', (token) => {
    const proChatToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [resetComponent(proChatToken), genStyle(proChatToken)];
  });
}
