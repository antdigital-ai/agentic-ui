import { MOBILE_BREAKPOINT } from '../../Constants/mobile';
import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../../Hooks/useStyle';
import './code.css';

// 导入统一的标签样式配置
import { TAG_STYLES } from './tagStyles';

const COMMENT_HIGHLIGHT_COLOR =
  'var(--agentic-comment-highlight-color, rgba(21, 0, 255, 0.15))';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    // 拖拽手柄样式
    '[data-drag-handle]': {
      position: 'absolute',
      display: 'flex',
      userSelect: 'none',
      alignItems: 'center',
      padding: '2px',
      borderRadius: '2px',
      opacity: 0,
      left: '-28px',
      boxSizing: 'border-box',
      top: 'calc(3px + 0.75em - 14px)',
    },

    // 拖拽图标样式
    '[data-drag-icon]': {
      display: 'flex',
      alignItems: 'center',
      borderRadius: '18px',
      cursor: 'pointer',
      padding: '4px',
      fontSize: 'var(--font-size-xl)',
      color: 'rgb(38, 38, 38)',

      '&:hover': {
        backgroundColor: 'rgb(244, 245, 245)',
      },
    },

    // 拖拽元素悬浮效果
    '[data-drag-el]:hover > [data-drag-handle]': {
      opacity: 1,
    },

    // 可调整大小组件样式
    '.react-resizable': {
      position: 'relative',
      transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
      boxSizing: 'border-box',
      border: '1px solid var(--color-gray-border-light)',
    },

    '.react-resizable-handle-hide': {
      display: 'none',
    },

    '.react-resizable-selected img': {
      transform: 'scale(1.02)',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
      borderRadius: '4px',
      outline: '2px solid var(--color-primary-control-fill-primary)',
      outlineOffset: '2px',
    },

    '.react-resizable-handle': {
      position: 'absolute',
      padding: '0 3px 3px 0',
      backgroundRepeat: 'no-repeat',
      backgroundOrigin: 'content-box',
      boxSizing: 'border-box',
      cursor: 'se-resize',
      zIndex: 9999,
      width: '14px',
      height: '14px',
      border: '2px solid var(--color-gray-bg-card-white)',
      backgroundColor: 'var(--color-primary-control-fill-primary)',
      borderRadius: '10px',
      bottom: '-7px',
      right: '-7px',
      pointerEvents: 'all',
    },

    // 移动标记样式
    '[data-move-mark]': {
      height: '0.125em',
      backgroundColor: 'var(--color-primary-control-fill-primary)',
      left: 0,
      zIndex: 1000,
      display: 'block',
      position: 'absolute',
      borderRadius: '0.25em',
      top: 0,
      transitionDuration: '200ms',
    },

    // 隐藏样式
    '[data-hidden]': {
      display: 'none',
    },

    // KaTeX容器样式
    '.katex-container': {
      '.newline': {
        margin: '4px 0',
      },
    },

    // 内联代码输入样式
    '.inline-code-input': {
      lineHeight: '1.3em',
      borderRadius: '0.125em',
      color: 'rgb(13 148 136 / 1)',
      fontFamily:
        'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", Segoe UI Symbol, "Noto Color Emoji"',

      '&:before, &:after': {
        content: "'$'",
        fontSize: '1em',
        color: 'rgb(107 114 128 / 1)',
      },

      '&:before': {
        marginRight: '2px',
      },

      '&:after': {
        marginLeft: '2px',
      },
    },

    [token.componentCls]: {
      boxSizing: 'border-box',
      caretColor: 'var(--color-primary-control-fill-primary)',
      color: 'inherit',
      font: 'var(--font-text-paragraph-lg)',
      outline: 'none !important',
      minWidth: '0px',
      width: '100%',
      margin: '0 auto',
      '::-webkit-scrollbar': { width: '8px', height: '8px' },
      '::-webkit-scrollbar-thumb': {
        backgroundColor: 'var(--color-gray-text-tertiary)',
        borderRadius: '20px',
      },
      '&-edit': {
        '> div.empty:first-child': {
          '[data-slate-zero-width="n"]': {
            display: 'inline-block',
            minWidth: 20,
          },
          '&::before': {
            cursor: 'text',
            content: 'attr(data-slate-placeholder)',
            color: 'rgba(0,0,0,0.45)',
            display: 'inline-block',
            position: 'absolute',
            width: 'max-content',
            maxWidth: '100%',
            fontSize: '1em',
            lineHeight: '21px',
            wordBreak: 'break-word',
            whiteSpace: 'wrap',
          },
        },
        '> div.empty:first-child [data-slate-node="text"]': {
          display: 'inline-block',
          minWidth: 20,
        },
      },

      '&> *:first-child': {
        marginTop: 0,
      },
      '& > .link': { textDecoration: 'underline' },
      '& > .attach': {
        padding: '3px 0',
      },
      '& >.attach:not(:last-child)': {
        marginBottom: '0.3em',
      },
      '.attach .file': {
        borderRadius: '12px',
        borderWidth: '1px',
        borderColor: 'rgb(229 231 235 / 1)',
        backgroundColor: 'rgb(249 250 251 / 1)',
        paddingTop: '0.5em',
        paddingBottom: '0.5em',
        paddingLeft: '0.75em',
        paddingRight: '0.75em',
        transitionDuration: '100ms',
      },
      '.attach .file.active': {
        borderColor: 'rgb(0 0 0 / 0.5)',
      },

      "[data-fnc='fnc']": {
        ...TAG_STYLES.fnc,
      },
      "[data-fnd='fnd']": {
        ...TAG_STYLES.fnd,
      },

      '&:last-child': {
        marginBottom: 0,
      },
      'pre,code,kbd,samp': {
        marginTop: '0',
        marginBottom: '0',
        fontFamily:
          'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace',
        fontSize: '0.9em',
        wordWrap: 'normal',
      },

      'div[data-be="paragraph"]': {
        position: 'relative',
        font: 'var(--font-text-paragraph-lg)',
        paddingTop: '0em',
        display: 'block',
        fontSize: '1em',
        lineHeight: '1.5em',
        margin: 'var(--margin-2x) 0',
      },
      'h1,h2,h3,h4,h5,h6': {
        position: 'relative',
        textWrap: 'balance',
        '[data-drag-handle]': {
          top: 'calc(3px + 0.05em) !important',
        },
      },
      h1: {
        fontSize: '30px',
        lineHeight: '38px',
        fontWeight: '600',
        margin: 'var(--margin-8x) 0',
        'a,span[data-url="url"]': {
          fontSize: '30px',
          fontWeight: '600',
        },
      },

      h2: {
        fontSize: '24px',
        lineHeight: '32px',
        fontWeight: '600',
        marginTop: 'var(--margin-8x)',
        marginBottom: 'var(--margin-4x)',
        'a,span[data-url="url"]': {
          fontSize: '24x',
          fontWeight: '600',
        },
      },

      h3: {
        fontSize: '18px',
        lineHeight: '26px',
        fontWeight: '600',
        marginTop: 'var(--margin-4x)',
        marginBottom: 'var(--margin-2x)',
        'a,span[data-url="url"]': {
          fontSize: '18x',
          fontWeight: '600',
        },
      },

      h4: {
        fontSize: '15px',
        lineHeight: '24px',
        fontWeight: '600',
        marginTop: 'var(--margin-2x)',
        'a,span[data-url="url"]': {
          fontSize: '15x',
          fontWeight: '600',
        },
      },

      h5: {
        fontSize: '15px',
        lineHeight: '24px',
        fontWeight: '600',
        marginTop: 'var(--margin-2x)',
        'a,span[data-url="url"]': {
          fontSize: '15x',
          fontWeight: '600',
        },
      },

      h6: {
        fontSize: '15px',
        lineHeight: '24px',
        fontWeight: '600',
        marginTop: 'var(--margin-2x)',
        'a,span[data-url="url"]': {
          fontSize: '15x',
          fontWeight: '600',
        },
      },

      'a,span[data-url="url"]': {
        lineHeight: '24px',
        position: 'relative',
        font: 'var(--font-text-body-lg)',
        color: 'var(--color-gray-text-default)',
        textDecoration: 'underline',
        textDecorationColor: 'var(--color-gray-border-light);',
        textUnderlineOffset: '4px',
        cursor: 'pointer',
        '&:hover': {
          textDecorationColor: 'var(--color-gray-text-default)',
        },
        '&::after': {
          content: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath d='M4.666667,4L11.33333,4C11.70152,4,12,4.298477,12,4.666667L12,11.33333C12,11.70152,11.70152,12,11.33333,12C10.96514,12,10.66667,11.70152,10.66667,11.33333L10.66667,6.27614L5.13828,11.80453C5.01305,11.92976,4.843478,12,4.666667,12C4.298477,12,4,11.70152,4,11.33333C4,11.15652,4.0702379,10.98695,4.195262,10.861930000000001L9.72386,5.33333L4.666667,5.33333C4.298477,5.33333,4,5.03486,4,4.666667C4,4.298477,4.298477,4,4.666667,4Z' fill-rule='evenodd' fill='rgba(0,1,3,0.45)'/%3E%3C/svg%3E")`,
          width: '16px',
          height: '16px',
          position: 'relative',
          marginLeft: '2px',
          top: '3px',
          pointerEvents: 'none', // 确保 ::after 不阻止点击事件传递到父元素
        },
        '&:hover::after': {
          content: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath d='M4.666667,4L11.33333,4C11.70152,4,12,4.298477,12,4.666667L12,11.33333C12,11.70152,11.70152,12,11.33333,12C10.96514,12,10.66667,11.70152,10.66667,11.33333L10.66667,6.27614L5.13828,11.80453C5.01305,11.92976,4.843478,12,4.666667,12C4.298477,12,4,11.70152,4,11.33333C4,11.15652,4.0702379,10.98695,4.195262,10.861930000001L9.72386,5.33333L4.666667,5.33333C4.298477,5.33333,4,5.03486,4,4.666667C4,4.298477,4.298477,4,4.666667,4Z' fill-rule='evenodd' fill='rgba(0,1,3,0.88)'/%3E%3C/svg%3E")`,
        },
      },
      'ol,ul': {
        paddingLeft: '1.8em',
        marginTop: 'var(--margin-2x)',
        marginBottom: 'var(--margin-4x)',
      },

      li: {
        position: 'relative',
        margin: 'var(--margin-2x) 0',

        '&::marker': {
          color: 'var(--color-gray-text-light)',
          fontWeight: 600,
          fontSize: '0.9rem',
          lineHeight: 'var(--line-height-base)',
          letterSpacing: 'var(--letter-spacing-base)',
          fontFamily: 'var(--font-family-base)',
        },

        'ul, ol': {
          margin: 0,
        },
      },

      'li:has(ul), li:has(ol), li:has(+ li ul), li:has(+ li ol), li:has(~ li ul), li:has(~ li ol)':
        {
          marginTop: 'var(--margin-4x)',
        },

      'li:has(ul) ~ li, li:has(ol) ~ li': {
        marginTop: 'var(--margin-4x)',
      },
      'li > p': { marginTop: '1em' },
      'li + li': { marginTop: '0.25em' },
      blockquote: {
        display: 'flex',
        padding: '8px 12px',
        gap: '10px',
        flexGrow: 1,
        zIndex: 1,
        fontSize: 'var(--font-size-base)',
        fontWeight: 'normal',
        lineHeight: '160%',
        letterSpacing: 'normal',
        position: 'relative',
        color: 'var(--color-gray-text-secondary)',
        margin: '0 !important',
        '&:before': {
          content: "''",
          left: '0',
          position: 'absolute',
          top: '11px',
          height: 'calc(100% - 22px)',
          borderRadius: '4px',
          width: '3px',
          display: 'flex',
          alignSelf: 'stretch',
          zIndex: 0,
          backgroundColor: 'var(--color-gray-control-fill-secondary)',
        },
      },
      '[data-be="media-container"], [data-be="image-container"]': {
        display: 'flex',
        minWidth: 0,
        maxWidth: '100%',
      },
      '@media screen and (max-width: 600px)': {
        h1: {
          fontSize: '1.5em',
        },
        h2: {
          fontSize: '1.25em',
        },
        h3: {
          fontSize: '1.125em',
        },
        h4: {
          fontSize: '1em',
        },
        'h1,h2': {
          marginTop: '1em',
          marginBottom: '1em',
        },
        'h3,h4,h5,h6': {
          marginTop: '0.8em',
          marginBottom: '0.8em',
        },
        'ol,ul': {
          paddingLeft: '1em',
        },
        // 移动端图片和视频响应式样式
        '[data-be="image"], [data-be="media"]': {
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden',
          '[data-be="media-container"]': {
            width: '100%',
            maxWidth: '100%',
            padding: '2px',
            boxSizing: 'border-box',
          },
          'img, video': {
            maxWidth: '100%',
            height: 'auto',
            display: 'block',
          },
          '[data-testid="resize-image-container"]': {
            maxWidth: '100%',
            width: '100% !important',
            boxSizing: 'border-box',
          },
          '[data-testid="video-element"]': {
            maxWidth: '100%',
            width: '100% !important',
            height: 'auto',
          },
        },
      },
      '[data-be]:not(p):not(data-be="list")': {
        position: 'relative',
        '*': {
          outline: 'none',
          boxSizing: 'border-box',
        },
      },
      '[data-be="list"] > ul': {
        marginTop: '0.25em',
        marginBottom: '0.25em',
      },
      '[data-be="chart"]': {
        marginTop: '0.5em',
        marginBottom: '0.5em',
      },
      '[data-be="card"]': {
        marginTop: '0.5em',
        marginBottom: '0.5em',
      },
      '& &-inline-code': {
        display: 'inline',
        fontFamily: `'Roboto,Mono SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace`,
        margin: '1px 3px',
        wordBreak: 'break-all',
        font: 'var(--font-text-code-base)',
        letterSpacing: 'normal',
        color: 'var(--color-gray-text-default)',
        alignItems: 'center',
        padding: '4px 6px',
        gap: '4px',
        zIndex: 1,
        borderRadius: '6px',
        background: 'var(--color-gray-bg-tip)',
      },
      '& &-comment-comment': {
        display: 'inline-block',
        background: `linear-gradient(transparent 65%, ${COMMENT_HIGHLIGHT_COLOR})`,
        cursor: 'pointer',
      },
      '& &-comment-highlight': {
        backgroundColor: COMMENT_HIGHLIGHT_COLOR,
        borderBottom: 0,
        cursor: 'pointer',
      },
      '& &-high-text': {
        borderRadius: '12px',
      },
      '& &-m-html': {
        color: 'rgba(0,0,0,0.45)',
      },
      '&:not(:last-child)': {
        marginBottom: '0.5em',
      },
      "h2 + [data-be='list'] ul": {
        marginTop: '0',
      },
      "h2 + [data-be='list'] ol": {
        marginTop: '0',
      },
      '[data-align="left"]': {
        textAlign: 'left',
      },
      '[data-align="center"]': {
        textAlign: 'center',
      },
      '[data-align="right"]': {
        textAlign: 'right',
      },
      // 分割线
      hr: {
        border: 'none',
        borderTop: '1px solid var(--color-gray-border-light)',
        padding: '0',
        height: '0',
        margin: 'var(--margin-8x) 0',
      },
    },
    [`${token.componentCls}-compact`]: {
      'div[data-be="paragraph"]': {
        paddingTop: '0px',
        paddingBottom: '0px',
        marginBottom: '0px',
      },
      '[data-be="list"]': {
        marginTop: '0.3em',
        marginBottom: '0.3em',
      },
    },
    [`@media (max-width: ${MOBILE_BREAKPOINT})`]: {
      'div[data-be="paragraph"]': {
        fontSize: '0.95em',
        lineHeight: '1.4em',
        margin: 'var(--margin-1x) 0',
      },
    },
  };
};

const genSlideStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [`${token.componentCls}-report`]: {
      '[data-be="chart"]': {
        width: '100%',
      },
      '[data-be="code"]': {
        marginBottom: '12px',
      },
      [`${token.componentCls}-description-table`]: {
        display: 'table',
        'th,td': {
          padding: '8px 16px',
          textAlign: 'left',
          borderBottom: '1px solid rgb(209 213 219 / 0.8)',
          borderRight: '1px solid rgb(209 213 219 / 0.8)',
        },
        'th:last-child,td:last-child': {
          borderRight: '1px solid var(--color-gray-border-light)',
        },
        'th:last-child': {
          borderTopRightRadius: 8,
        },
        'th:first-child': {
          borderTopLeftRadius: 8,
        },
        'tr:last-child th,tr:last-child td': {
          borderBottom: 'none',
        },
        th: {
          backgroundColor: 'rgb(229 231 235 / 0.5)',
        },
      },
    },
    [`${token.componentCls}-tag`]: {
      position: 'absolute',
      zIndex: 1000,
    },
  };
};

/**
 * BubbleChat
 * @param prefixCls
 * @returns
 */
export function useStyle(
  prefixCls: string,
  propsToken: Partial<ChatTokenType>,
) {
  return useEditorStyleRegister('editor-content', (token) => {
    const editorToken = {
      ...token,
      ...propsToken,
      componentCls: `.${prefixCls}`,
    };

    return [
      resetComponent(editorToken),
      genStyle(editorToken),
      genSlideStyle(editorToken),
    ];
  });
}
