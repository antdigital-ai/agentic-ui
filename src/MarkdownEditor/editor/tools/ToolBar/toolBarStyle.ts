import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../../../../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      borderTopLeftRadius: '0.5em',
      borderTopRightRadius: '0.5em',
      borderBottom: '1px solid rgb(229 231 235 / 0.8)',
      overflow: 'hidden',
      height: '42px',
      fontSize: '1.05em',
      color: 'rgb(107 114 128 / 80%)',
      backdropFilter: 'blur(8px)',
      boxSizing: 'border-box',
      backgroundColor: 'rgb(255 255 255)',
      padding: '6px 4px',
      '&-item': {
        display: 'flex',
        height: '32px',
        fontSize: '1.05em',
        borderRadius: '4px',
        lineHeight: '32px',
        padding: '0 6px',
        boxSizing: 'border-box',
        alignItems: 'center',
        gap: '2px',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'rgb(229 231 235 / 0.65)',
        },
      },
      '&-item-min-plus-icon': {
        color: '#1677ff',
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
  return useEditorStyleRegister('ToolBar-' + prefixCls, (token) => {
    const editorToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [resetComponent(editorToken), genStyle(editorToken)];
  });
}
