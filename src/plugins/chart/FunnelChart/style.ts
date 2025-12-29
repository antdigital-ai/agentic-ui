import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../../../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      '.chart-wrapper': {
        width: '100%',
        height: 'calc(100% - 120px)',
        minHeight: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      },
      canvas: {
        maxWidth: '100% !important',
        maxHeight: '100% !important',
      },
      '&-statistic-container': {
        display: 'flex',
        gap: '16px',
        marginBottom: '16px',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
      },
      '&-wrapper': {
        position: 'relative',
        width: '100%',
        height: '100%',
      },
      '@media (max-width: 768px)': {
        '.chart-wrapper': {
          height: 'calc(100% - 100px)',
          minHeight: 250,
        },
      },
      '@media (max-width: 375px)': {
        padding: 8,
        '.chart-wrapper': {
          minHeight: 220,
        },
      },
    },
  };
};

export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('FunnelChart', (token) => {
    const areaToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };
    return [genStyle(areaToken)];
  });
}
