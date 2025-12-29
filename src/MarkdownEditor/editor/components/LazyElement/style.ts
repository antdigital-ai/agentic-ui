import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../../../../hooks/useStyle';

/**
 * LazyElement 样式生成器
 */
const genLazyElementStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [`${token.componentCls}`]: {
      position: 'relative',
      width: '100%',
    },
  };
};

/**
 * LazyElement 组件样式 Hook
 */
export const useStyle = (prefixCls?: string) => {
  return useEditorStyleRegister('LazyElement', (token) => {
    const componentToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };
    return [
      resetComponent(componentToken),
      genLazyElementStyle(componentToken),
    ];
  });
};
