import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      position: 'relative',
      display: 'inline-block',
      width: 'fit-content',
      margin: 0,
      padding: 0,
      fontSize: 11,
      lineHeight: 1,
      listStyle: 'none',
      verticalAlign: 'middle',
      boxSizing: 'border-box',

      [`${token.componentCls}-dot`]: {
        display: 'inline-flex',
        justifyContent: 'center',
        padding: '3px 4px',
        textAlign: 'center',
        border: '1px solid rgba(191, 215, 240, 0.25)',
        borderRadius: 4,
      },

      [`&${token.componentCls}-status-watermark`]: {
        [`${token.componentCls}-dot`]: {
          background: 'transparent',
          border: '1px solid var(--color-gray-border-light)',
          backdropFilter: 'blur(40px)',
        },
      },

      [`&${token.componentCls}-status-emphasis`]: {
        [`${token.componentCls}-dot`]: {
          background: 'linear-gradient(180deg, #ECF2FF 0%, #F3F7FF 100%)',
          border: '1px solid #FFFFFF',
        },
      },

      [`&${token.componentCls}-with-children`]: {
        [`${token.componentCls}-dot`]: {
          position: 'absolute',
          top: 0,
          insetInlineEnd: '0',
          transform: 'translate(50%, -50%)',
          transformOrigin: '100% 0%',
        },
      },

      [`&${token.componentCls}-tooltip-visible`]: {
        [`${token.componentCls}-dot`]: {
          background:
            'linear-gradient(293deg, #EBECFF 39%, #F0F4FF 62%, #EBF5FF 91%)',
          backdropFilter: 'blur(40px)',
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
  };
};

export const prefixCls = 'ai-label';

export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('ai-label', (token) => {
    const badgeToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };
    return [genStyle(badgeToken)];
  });
}
