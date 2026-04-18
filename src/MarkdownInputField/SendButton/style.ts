import { Keyframes } from '@ant-design/cssinjs';
import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../../Hooks/useStyle';

// 定义旋转动画
const pauseIconRotate = new Keyframes('pauseIconRotate', {
  '0%': {
    transform: 'rotate(0deg)',
  },
  '100%': {
    transform: 'rotate(360deg)',
  },
});

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      fontSize: '32px',
      height: 32,
      display: 'flex',
      alignItems: 'center',
      lineHeight: '32px',
      cursor: 'pointer',
      marginLeft: 4,
      [`${token.componentCls}:not(${token.componentCls}-typing)`]: {
        svg: {
          circle: {
            fill:
              'var(--color-primary-control-fill-primary, #1677ff) !important',
          },
          path: {
            fill: 'var(--color-gray-bg-card-white, #ffffff) !important',
          },
        },
      },
      '&-typing': {
        color:
          'var(--color-primary-control-fill-primary, #1677ff) !important',
        [`svg > g > g:first-child > path:first-child`]: {
          fill: 'var(--color-gray-bg-card-white, #ffffff) !important',
        },
        [`svg > g > g:first-child > path:last-child`]: {
          fill:
            'var(--color-primary-control-fill-primary, #1677ff) !important',
        },
      },
      '&&-disabled': {
        cursor: 'not-allowed',
        opacity: 1,
      },
      // 旋转动画样式
      '.pause-icon-ring': {
        transition: 'transform 0.1s ',
        transformOrigin: '16px 16px',
        animationName: pauseIconRotate,
        animationDuration: '1s',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
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
  return useEditorStyleRegister('SendButton', (token) => {
    const proChatToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [resetComponent(proChatToken), genStyle(proChatToken)];
  });
}
