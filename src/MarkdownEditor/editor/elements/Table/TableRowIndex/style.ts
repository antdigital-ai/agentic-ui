import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../../../../../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      // 行索引行的基础样式
      display: 'table-row',
    },
  };
};

/**
 * TableRowIndex 样式 hook
 * @param prefixCls 组件前缀类名
 * @returns 样式相关的对象
 */
export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('md-editor-table-row-index', (token) => {
    const editorToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [resetComponent(editorToken), genStyle(editorToken)];
  });
}
