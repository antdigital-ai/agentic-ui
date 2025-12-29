import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../../../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      padding: '6px 8px',
      width: '100%',
      borderBottom: '1px solid rgba(77, 77, 77, 0.03)',
      zIndex: 10,
      gap: '4px',
      '&-item': {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px',
        borderRadius: '12px',
        cursor: 'pointer',
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
  return useEditorStyleRegister('ChartAttr-' + prefixCls, (token) => {
    const editorToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genStyle(editorToken)];
  });
}
