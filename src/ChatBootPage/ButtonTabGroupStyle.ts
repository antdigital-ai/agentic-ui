import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '0',
      // disabled 样式统一由 ButtonTab 自身的 &-disabled 规则负责，此处不重复定义
    },
  };
};

/**
 * ButtonTabGroup 组件样式
 */
export const useStyle = (prefixCls?: string) => {
  return useEditorStyleRegister('ChatBootButtonTabGroup', (token) => {
    const buttonTabGroupToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genStyle(buttonTabGroupToken)];
  });
};
