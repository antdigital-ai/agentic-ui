import {
  useEditorStyleRegister,
  type ChatTokenType,
  type GenerateStyle,
} from '../../hooks/useStyle';

export const prefixCls = 'top-operating-area';

// 样式生成函数
const genTopOperatingAreaStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      position: 'relative' as const,
      display: 'grid',
      gridTemplateColumns: '1fr auto 1fr', // 使用grid布局确保绝对居中
      alignItems: 'center',
      height: 32,
      marginBottom: 8,
      width: '100%',

      ['&-left']: {
        // 左侧占位，保持空白
      },

      ['&-center']: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gridColumn: 2, // 固定在中间列

        ['&-buttons']: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: token.marginXS,
          height: '100%',
        },
      },

      ['&-right']: {
        display: 'flex',
        alignItems: 'center',
        gap: token.marginXS,
        justifyContent: 'flex-end',
        gridColumn: 3, // 固定在右侧列
        minWidth: 40, // 为BackTo按钮预留最小空间，防止布局抖动
      },

      ['&-back-buttons']: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        transition: 'opacity 0.3s ease',

        // 显示状态
        '&-visible': {
          visibility: 'visible',
          opacity: 1,
        },

        // 隐藏状态
        '&-hidden': {
          visibility: 'hidden',
          opacity: 0,
        },
      },
    },
  };
};

export const useStyle = (prefixCls: string) => {
  return useEditorStyleRegister(prefixCls, (token) => {
    const topOperatingAreaToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };
    return [genTopOperatingAreaStyle(topOperatingAreaToken)];
  });
};
