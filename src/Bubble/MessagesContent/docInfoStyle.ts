import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      display: 'flex',
      gap: 4,
      flexWrap: 'wrap',
      flexDirection: 'column',
      padding: '4px 20px 4px',
      '&&-compact': {
        padding: '4px 12px 4px',
      },
      '&-label': {
        display: 'flex',
        color: 'rgba(0,0,0,0.85)',
        fontSize: '1em',
        width: '100%',
        gap: 4,
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      '&-list': {
        alignItems: 'center',
        flexDirection: 'column',
        borderRadius: 16,
        display: 'flex',
        flexWrap: 'nowrap',
        gap: 4,
        padding: '0px',
        overflow: 'hidden',
        '&-item': {
          display: 'flex',
          gap: 4,
          borderRadius: 8,
          padding: '2px 8px',
          fontSize: 12,
          lineHeight: '14px',
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'rgba(0,0,0,0.65)',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.02)',
          },
          '&-title': {
            display: 'flex',
            maxWidth: '100%',
            gap: 4,
            width: '100%',
          },
          '&-icon': {
            borderRadius: 4,
            width: 16,
            height: 16,
          },
        },
      },
    },
  };
};

/**
 * Probubble
 * @param prefixCls
 * @returns
 */
export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('DocInfo', (token) => {
    const proChatToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [resetComponent(proChatToken), genStyle(proChatToken)];
  });
}
