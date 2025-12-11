import { Keyframes } from '@ant-design/cssinjs';
import type { ChatTokenType, GenerateStyle } from '../../Hooks/useStyle';
import { useEditorStyleRegister } from '../../Hooks/useStyle';

const fadeInUp = new Keyframes('fadeInUp', {
  from: {
    opacity: 0,
    transform: 'translateY(8px)',
  },
  to: {
    opacity: 1,
    transform: 'translateY(0)',
  },
});

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  const { componentCls } = token;

  return {
    [componentCls]: {
      '&-suggestion': {
        '&:hover': {
          borderRadius: 'var(--radius-control-base)',
          background: 'var(--color-gray-control-fill-hover)',
        },
        [`${componentCls}-suggestion-content`]: {
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          width: '100%',
          overflow: 'hidden',
          [`${componentCls}-suggestion-icon`]: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            padding: 'var(--padding-1x)',
            borderRadius: '200px',
            border: '1px solid var(--color-gray-border-dark)',
            color: 'var(--color-gray-text-secondary)',
          },
          [`${componentCls}-suggestion-text`]: {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            font: 'var(--font-text-body-sm)',
            letterSpacing: 'var(--letter-spacing-body-sm, normal)',
            color: 'var(--color-gray-text-secondary)',
          },
        },
        '.ant-tag': {
          marginInlineEnd: '0',
        },
      },

      '&-header': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '48px',
        width: 'calc(100% - 20px)',
        padding: '4px',
        margin: '4px',
        '.ant-tag': {
          marginInlineEnd: '0',
        },
        [`${componentCls}-header-left`]: {
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          overflow: 'hidden',
          flex: 1,
          minWidth: 0,
          [`${componentCls}-header-title`]: {
            flex: 1,
            minWidth: 0,
            marginRight: '4px',
            fontWeight: 500,
            fontSize: '14px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: 'var(--color-gray-text-default)',
          },
        },
      },

      '&-header-wrapper': {
        marginLeft: '-16px',
        marginRight: '-16px',
      },

      '&-result-item': {
        width: '100%',
        overflow: 'hidden',
        padding: '4px',
        animationName: fadeInUp,
        animationDuration: '0.3s',
        animationTimingFunction: 'ease-out',
        animationFillMode: 'both',
        '&:hover': {
          borderRadius: '12px',
          background: 'var(--color-gray-control-fill-hover)',
        },
        [`${componentCls}-result-item-title`]: {
          fontSize: '12px',
          color: 'var(--color-gray-text-default)',
          display: 'block',
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
        [`${componentCls}-result-item-title-wrapper`]: {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: '14px',
          color: 'var(--color-gray-text-default)',
        },
        [`${componentCls}-result-item-site-text`]: {
          font: 'var(--font-text-paragraph-sm)',
          letterSpacing: 'var(--letter-spacing-paragraph-sm, normal)',
          color: 'var(--color-gray-text-light)',
        },
        [`${componentCls}-result-item-site`]: {
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: '12px',
          cursor: 'pointer',
        },
      },
    },
  };
};

export function useBrowserStyle(prefixCls?: string) {
  return useEditorStyleRegister('WorkspaceBrowser', (token) => {
    const browserToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };
    return [genStyle(browserToken)];
  });
}
