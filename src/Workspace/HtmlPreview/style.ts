import type { ChatTokenType, GenerateStyle } from '../../hooks/useStyle';
import { useEditorStyleRegister } from '../../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [`${token.componentCls}`]: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',

      [`${token.componentCls}-actions`]: {
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '8px 0',
      },

      [`${token.componentCls}-content`]: {
        position: 'relative',
        width: '100%',
        height: '100%',
      },

      [`${token.componentCls}-iframe`]: {
        width: '100%',
        height: '100%',
        minHeight: '240px',
        border: 'none',
        background: '#fff',
      },

      [`${token.componentCls}-overlay`]: {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,

        [`&--loading`]: {
          background: 'rgba(255, 255, 255, 0.6)',
        },

        [`&--error`]: {
          background: 'rgba(255, 245, 245, 0.6)',
          color: '#cb1e1e',
        },
      },

      [`${token.componentCls}-empty`]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: '240px',
        padding: '24px',
        textAlign: 'center',
      },
    },
  };
};

export function useHtmlPreviewStyle(prefixCls?: string) {
  return useEditorStyleRegister('WorkspaceHtmlPreview', (token) => {
    const htmlPreviewToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genStyle(htmlPreviewToken)];
  });
}
