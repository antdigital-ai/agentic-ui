import { Keyframes } from '@ant-design/cssinjs';
import { genStyleHooks, type GenStyleFn } from '../../../Hooks/useStyle';

// 定义闪光动画
const shine = new Keyframes('shine', {
  '0%': {
    backgroundPosition: '100%',
  },
  '100%': {
    backgroundPosition: '-100%',
  },
});

const genStyle: GenStyleFn<'TextLoading'> = (token) => {
  return {
    [token.componentCls]: {
      display: 'inline-block',
      backgroundSize: '200% 100%',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      // 文字颜色必须透明，背景渐变才能通过 background-clip: text 显示
      color: 'transparent',
      WebkitTextFillColor: 'transparent',
      animationName: shine,
      animationDuration: '1.2s',
      animationTimingFunction: 'linear',
      animationIterationCount: 'infinite',

      // 亮色主题：深色文字底色 + 亮色光泽扫过（适用于白色背景）
      '&-light': {
        backgroundImage: `linear-gradient(
          120deg,
          rgba(100, 100, 100, 1) 30%,
          rgba(180, 180, 180, 0.6) 50%,
          rgba(100, 100, 100, 1) 70%
        )`,
      },

      // 暗色主题：浅色文字底色 + 亮色光泽扫过（适用于黑色背景）
      '&-dark': {
        backgroundImage: `linear-gradient(
          120deg,
          rgba(180, 180, 180, 1) 30%,
          rgba(255, 255, 255, 0.9) 50%,
          rgba(180, 180, 180, 1) 70%
        )`,
      },

      '&-disabled': {
        animationName: 'none',
      },
    },
  };
};

const useGenStyle = genStyleHooks('TextLoading', genStyle);

export function useStyle(prefixCls: string) {
  const [, hashId] = useGenStyle(prefixCls);
  return { hashId };
}
