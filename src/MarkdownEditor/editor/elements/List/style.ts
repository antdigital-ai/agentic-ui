import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../../../../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      listStyle: 'disc',
      marginBottom: '0',
      marginTop: '0',
      '&-container': {
        marginTop: '0.5em',
        marginBottom: '0.5em',
      },
      'div[data-be="paragraph"]': {
        display: 'block',
        marginBottom: '0 !important',
        marginTop: '0 !important',
        paddingTop: '0 !important',
        paddingBottom: '0 !important',
      },
      [`li:not(${token.componentCls}-task) > :first-child [data-drag-handle]`]:
        {
          paddingLeft: '2px',
          paddingRight: '12px',
          left: '-44px !important',
        },
      [`li${token.componentCls}-task > :nth-child(2) [data-drag-handle]`]: {
        paddingLeft: '2px',
        paddingRight: '10px',
        left: '-50px !important',
      },
      '&-check-item': {
        display: 'flex',
        alignItems: 'center',
        position: 'absolute',
        userSelect: 'none',
        height: '1.87em',
        left: '0',
        top: '0',
        zIndex: 10,
      },
      '&-item': {
        position: 'relative',
        wordBreak: 'break-all',
        gap: '4px',
        "> [data-be='list']": {
          marginBottom: '0',
        },
        [`&${token.componentCls}-task`]: {
          paddingLeft: '24px',
          display: 'flex',
          alignItems: 'center',
        },
      },
      '&.ol': {
        '&::marker': {
          color: 'var(--color-gray-text-light)',
        },
        [`&${token.componentCls}`]: {
          listStyle: 'decimal',
          [`& ol${token.componentCls}`]: {
            listStyle: 'lower-alpha',
            paddingLeft: 'var(--padding-4x)',
            [`& ol${token.componentCls}`]: {
              listStyle: 'lower-roman',
              [`& ol${token.componentCls}`]: {
                listStyle: 'decimal',
              },
            },
          },
        },
      },
      '&.ul': {
        [`&${token.componentCls}`]: {
          listStyle: 'disc',

          [`& ul${token.componentCls}`]: {
            listStyle: 'circle',
            paddingLeft: 'var(--padding-4x)',
            [`& ul${token.componentCls}`]: {
              listStyle: 'square',
              [`& ul${token.componentCls}`]: {
                listStyle: 'disc',
              },
            },
          },
        },
      },
      '&[data-task]': {
        listStyle: 'none !important',
        paddingLeft: '0',
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
  return useEditorStyleRegister('editor-content-list', (token) => {
    const editorToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genStyle(editorToken)];
  });
}
