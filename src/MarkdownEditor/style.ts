import { MOBILE_BREAKPOINT } from '../constants/mobile';
import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      boxSizing: 'border-box',
      height: 'max-content',
      maxWidth: '100%',
      outline: 'none',
      tabSize: 4,
      position: 'relative',
      lineHeight: 1.7,
      whiteSpace: 'normal',
      // 主容器默认样式
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '100%',
      font: 'var(--font-text-paragraph-lg)',
      letterSpacing: 'var(--letter-spacing-paragraph-lg, normal)',
      color: 'var(--color-gray-text-default)',
      // 全局样式
      '*': {
        scrollbarWidth: 'thin',
        scrollbarColor: 'hsl(240 5.9% 90%) transparent',
        boxSizing: 'border-box',
      },
      'div[data-composition] div:not([data-no-focus]).empty:first-child::before':
        {
          display: 'none',
        },
      '> *': {
        boxSizing: 'border-box',
        scrollbarWidth: 'thin',
        fontVariantNumeric: 'tabular-nums',
        WebkitTextSizeAdjust: '100%',
        msTextSizeAdjust: '100%',
        WebkitFontSmoothing: 'antialiased',
        scrollbarColor: 'hsl(#e4e4e7) transparent',
      },
      '&-edit-area': {
        outline: 'none !important',
      },
      '&-toolbar-container': {
        width: '100%',
        maxWidth: '100%',
        position: 'sticky',
        zIndex: 99,
        top: 0,
      },
      '&-container': {
        // 默认 padding，可以通过 contentStyle 覆盖
        // 使用 CSS 变量，允许通过内联样式覆盖
        padding: 'var(--content-padding, 4px 20px)',
        overflow: 'auto',
        display: 'flex',
        position: 'relative',
        gap: 24,
        outline: 'none',
        [`@media (max-width: ${MOBILE_BREAKPOINT})`]: {
          padding: 'var(--content-padding, 4px 4px)',
        },
      },
      '&-content': {},
      '&-focus': {
        height: 64,
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
  return useEditorStyleRegister('MarkdownEditor', (token) => {
    const editorToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [resetComponent(editorToken), genStyle(editorToken)];
  });
}
