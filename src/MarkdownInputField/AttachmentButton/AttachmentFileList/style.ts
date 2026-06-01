import {
  genStyleHooks,
  resetComponent,
  type GenStyleFn,
} from '../../../Hooks/useStyle';

const genStyle: GenStyleFn<'AttachmentFileList'> = (token) => {
  return {
    [`${token.componentCls}`]: {
      maxWidth: '100%',
      display: 'flex',
      flexDirection: 'row',
      overflow: 'auto',
      gap: 'var(--margin-2x)',
      maxHeight: '128px',
      height: 'max-content',
      marginRight: '40px',
      borderRadius: 'inherit',
      padding: 'var(--padding-3x)',
      flexWrap: 'wrap',
      position: 'relative',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&::-webkit-scrollbar': {
        width: 'var(--padding-1-5x)',
      },
      // 小屏幕模式下横向滑动
      '@media (max-width: 768px)': {
        flexWrap: 'nowrap',
        overflowX: 'auto',
        overflowY: 'hidden',
        maxHeight: 'none',
        marginRight: '0',
        padding: 'var(--padding-2x)',
        paddingRight: '40px', // 为右侧关闭按钮预留空间
        '&::-webkit-scrollbar': {
          height: 'var(--padding-1x)',
        },
        '&::-webkit-scrollbar-thumb': {
          background:
            'var(--color-gray-border-default, var(--color-gray-border-light))',
          borderRadius: 'var(--radius-base, var(--radius-control-xs, 4px))',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
      },
      '&-close-icon': {
        width: 'var(--height-control-xs)',
        height: 'var(--height-control-xs)',
        fontSize: 'var(--font-size-lg)',
        position: 'absolute',
        top: 'var(--margin-3x)',
        right: 'var(--margin-3x)',
        color: 'var(--color-gray-text-light)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        '&:hover': {
          transform: 'scale(1.05)',
        },
      },
      '&-title': {
        width: '100%',
        flexBasis: '100%',
        color: 'var(--color-gray-text-light)',
        font: 'var(--font-text-body-sm)',
        lineHeight: '20px',
        marginBottom: 'var(--margin-0-5x)',
      },
      '&-item': {
        width: '168px',
        height: '48px',
        opacity: 1,
        borderRadius: 'var(--radius-card-base)',
        background: 'var(--color-gray-bg-card-white)',
        boxShadow: 'var(--shadow-control-base)',
        boxSizing: 'border-box',
        padding: 'var(--padding-1x)',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        cursor: 'pointer',
        gap: 'var(--margin-2x)',
        position: 'relative',
        // 小屏幕模式下固定宽度，防止收缩
        '@media (max-width: 768px)': {
          flexShrink: 0,
          minWidth: '168px',
        },
        '&:hover': {
          [`${token.componentCls}-item-close-icon`]: {
            display: 'flex',
          },
        },
        '&-file-icon': {
          width: '40px',
          height: '40px',
          minWidth: '40px',
          opacity: 1,
          '&-img': {
            width: '40px',
            height: '40px',
            opacity: 1,
            background: 'var(--color-gray-bg-card-white)',
            boxSizing: 'border-box',
            boxShadow: 'var(--shadow-control-base)',
            borderRadius: 'var(--radius-base, var(--radius-control-xs, 4px))',
            border: 'none',
            overflow: 'hidden',
            img: {
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 'inherit',
              transition: 'transform 0.3s',
            },
            '&:hover': {
              overflow: 'hidden',
              img: {
                transform: 'scale(1.1)',
                transition: 'transform 0.3s',
              },
            },
          },
          '>svg': {
            width: '40px',
            height: '40px',
          },
        },
        '&-file-info': {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 'var(--margin-0-5x)',
          flex: 1,
          minWidth: 0,
        },
        '&-file-name': {
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          lineHeight: 'var(--line-height-xs)',
          fontFamily: token.fontFamily,
          '&-text': {
            font: 'var(--font-text-body-emphasized-sm)',
            letterSpacing: 'var(--letter-spacing-body-emphasized-sm, normal)',
            color: 'var(--color-gray-text-default)',
            maxWidth: '112px',
            width: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            display: '-webkit-box',
            '-webkit-line-clamp': '1',
            lineClamp: 1,
            '-webkit-box-orient': 'vertical',
            textOverflow: 'ellipsis',
          },
        },
        '&-file-size': {
          font: 'var(--font-text-body-sm)',
          letterSpacing: 'var(--letter-spacing-body-sm, normal)',
          color: 'var(--color-gray-text-light)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          minWidth: 0,
          maxWidth: '100%',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          '&-error': {
            color: 'var(--color-red-a10)',
            minWidth: 0,
            maxWidth: '100%',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          },
          '&-item:not(:last-child)': {
            lineHeight: '9px',
            display: 'flex',
            gap: 4,
            alignItems: 'center',
            height: 12,
            '&:after': {
              content: '""',
              display: 'block',
              width: '1px',
              height: '12px',
              background: 'var(--color-gray-border-light)',
            },
          },
        },
        '&-close-icon': {
          width: 'var(--padding-4x)',
          height: 'var(--padding-4x)',
          backgroundColor: 'var(--color-gray-text-default)',
          fontSize: 'var(--font-size-sm)',
          position: 'absolute',
          top: 2,
          borderRadius: '50%',
          right: 2,
          color: 'var(--color-gray-contrast)',
          display: 'none',
          justifyContent: 'center',
          alignItems: 'center',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.05)',
          },
          // 小屏幕模式下常驻展示
          '@media (max-width: 768px)': {
            display: 'flex',
          },
        },
        '&-uploading-icon': {
          width: '40px',
          height: '40px',
          fontSize: '40px',
          display: 'flex',
        },
        '&-error-icon': {
          width: '40px',
          height: '40px',
          fontSize: '40px',
          display: 'flex',
        },
      },
      '&-item-meta-placeholder': {
        background: 'var(--color-gray-bg-card-light) !important',
        [`${token.componentCls}-item-file-name-text`]: {
          color:
            'var(--color-gray-text-light, rgba(80, 94, 119, 0.53)) !important',
        },
        [`${token.componentCls}-item-file-size`]: {
          color:
            'var(--color-gray-text-light, rgba(80, 94, 119, 0.53)) !important',
        },
      },
    },
    [`${token.componentCls}-container`]: {
      position: 'relative',
      background: 'var(--color-gray-bg-page)',
      '&-empty': {
        border: 'none',
      },
    },

    // 列表整体入场淡入（替代 framer-motion variants opacity 动画）
    // 原 framer-motion 父级 `staggerChildren: 0.1` 通过子项的 inline
    // `--attachment-item-delay` 等价实现，行为完全保留。
    [`${token.componentCls}-motion-fade-in`]: {
      animationName: `${token.componentCls}-attachmentFadeIn`,
      animationDuration: '0.3s',
      animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      animationFillMode: 'both',
    },
    // 单个文件项的入场/退出动画，由父组件通过 data-state="enter"|"exit" 切换。
    // 等价于 framer-motion 的 variants={hidden:{y:20,opacity:0}, visible:{y:0,opacity:1}, exit:{y:-20,opacity:0}}。
    // 退出动画通过父组件维护"正在退出"的影子状态 + setTimeout 延迟卸载实现，
    // 等价于 AnimatePresence 的退出延时卸载。
    [`${token.componentCls}-item-motion`]: {
      animationDuration: '0.25s',
      animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      animationFillMode: 'both',
      '&[data-state="enter"]': {
        animationName: `${token.componentCls}-attachmentItemSlideInUp`,
        animationDelay: 'var(--attachment-item-delay, 0s)',
      },
      '&[data-state="exit"]': {
        animationName: `${token.componentCls}-attachmentItemSlideOutUp`,
        pointerEvents: 'none',
      },
    },
    [`@keyframes ${token.componentCls}-attachmentFadeIn`]: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    [`@keyframes ${token.componentCls}-attachmentItemSlideInUp`]: {
      from: { transform: 'translateY(20px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
    },
    [`@keyframes ${token.componentCls}-attachmentItemSlideOutUp`]: {
      from: { transform: 'translateY(0)', opacity: 1 },
      to: { transform: 'translateY(-20px)', opacity: 0 },
    },
  };
};

/**
 * @param prefixCls
 * @returns
 */
const useGenStyle = genStyleHooks('AttachmentFileList', (token, info) => [
  resetComponent(token),
  genStyle(token, info),
]);

export function useStyle(prefixCls?: string) {
  const [, hashId] = useGenStyle(prefixCls ?? 'md-editor-attachment-file-list');
  return { hashId };
}
