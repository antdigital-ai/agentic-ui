import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../../../../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      position: 'relative',
      cursor: 'pointer',
      padding: '0px 4px',
      margin: '0 2px',
      display: 'inline-flex',
      font: 'var(--font-text-body-base)',
      color: 'var(--color-primary-text-secondary)',
      borderRadius: 'var(--radius-control-sm)',
      background: 'var(--color-primary-bg-tip)',

      '[data-tag-popup-input]': {
        '&:not([data-composition]).empty::before': {
          color: 'var(--color-primary-text-disabled)',
          content: 'attr(title)',
          userSelect: 'none',
          position: 'absolute',
          left: '4px',
          top: 0,
        },

        '&:hover::before': {
          opacity: 0.6,
        },
        '&.empty::after': {
          content: 'attr(title)',
          opacity: 0,
          overflow: 'hidden',
          userSelect: 'none',
        },
        '&-arrow': {
          position: 'absolute',
          right: '4px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--color-primary-text-disabled)',
          transition: 'transform 0.2s ease',
          '&.open': {
            transform: 'translateY(-50%) rotate(180deg)',
          },
        },
      },
      '&-tag-popup-input-has-arrow': {
        paddingRight: '12px',
      },
    },
  };
};

export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('editor-content-tag-popup', (token) => {
    const editorToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genStyle(editorToken)];
  });
}
