import { MOBILE_BREAKPOINT } from '../Constants/mobile';
import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../Hooks/useStyle';

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
      '&-container': {
        // 默认 padding，可以通过 contentStyle 覆盖
        // 使用 CSS 变量，允许通过内联样式覆盖
        padding: 'var(--content-padding, 4px 20px)',
        [`@media (max-width: ${MOBILE_BREAKPOINT})`]: {
          padding: 'var(--content-padding, 4px 4px)',
        },
      },
      '&-content': {},
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
