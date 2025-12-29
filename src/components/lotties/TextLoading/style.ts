import { Keyframes } from '@ant-design/cssinjs';
import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../../../hooks/useStyle';

// 定义闪光动画
const shine = new Keyframes('shine', {
  '0%': {
    backgroundPosition: '100%',
  },
  '100%': {
    backgroundPosition: '-100%',
  },
});

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      display: 'inline-block',
      animationName: shine,
      animationDuration: '1.2s',
      animationTimingFunction: 'linear',
      animationIterationCount: 'infinite',

      // 亮色主题：深色文字 + 亮色光泽（适用于白色背景）
      '&-light': {
        color: '#00000066',
        backgroundImage: `linear-gradient(
          120deg,
          rgba(255, 255, 255, 0.8) 40%,
          rgba(15, 14, 14, 0.8) 50%,
          rgba(255, 255, 255, 0.8) 60%
        )`,
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
      },

      // 暗色主题：浅色文字 + 深色光泽（适用于黑色背景）
      '&-dark': {
        color: '#ffffff40',
        backgroundImage: `linear-gradient(
          120deg,
          rgba(255, 255, 255, 0) 40%,
          rgba(255, 255, 255, 0.8) 50%,
          rgba(255, 255, 255, 0) 60%
        )`,
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
      },

      '&-disabled': {
        animationName: 'none',
      },
    },
  };
};

export function useStyle(prefixCls: string) {
  return useEditorStyleRegister('TextLoading', (token) => {
    const textLoadingToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genStyle(textLoadingToken)];
  });
}
