import { MOBILE_BREAKPOINT } from '../../../../../Constants/mobile';
import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../../../../../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      padding: '8px',
      verticalAlign: 'middle',
      wordWrap: 'break-word',
      wordBreak: 'break-all',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'pre-wrap',
      '&[data-select="true"]:after': {
        content: '" "',
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        zIndex: 2,
        pointerEvents: 'none',
        backgroundColor: 'var(--color-primary-control-fill-secondary-hover)',
      },
      [`@media (max-width: ${MOBILE_BREAKPOINT})`]: {
        padding: '2px',
      },
    },
  };
};

/**
 * Td 样式 hook
 * @param prefixCls 组件前缀类名
 * @returns 样式相关的对象
 */
export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('md-editor-table-td', (token) => {
    const editorToken = {
      ...token,
      componentCls: `.${prefixCls || 'md-editor-table-td'}`,
    };

    return [resetComponent(editorToken), genStyle(editorToken)];
  });
}
