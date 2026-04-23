import type { ChatTokenType, GenerateStyle } from '../../../Hooks/useStyle';
import { useEditorStyleRegister } from '../../../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  const { componentCls } = token;

  return {
    [componentCls]: {
      height: '100%',
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxSizing: 'border-box',
      padding: 'var(--margin-2x) var(--margin-3x)',

      [`${componentCls}-tree`]: {
        flex: 1,
        minHeight: 0,
        overflow: 'auto',
        background: 'transparent',
      },
    },
  };
};

export function useFileTreeStyle(prefixCls?: string) {
  return useEditorStyleRegister('WorkspaceFileTree', (token) => {
    const fileTreeToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };
    return [genStyle(fileTreeToken)];
  });
}
