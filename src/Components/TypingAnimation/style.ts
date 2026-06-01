import { Keyframes } from '@ant-design/cssinjs';
import { genStyleHooks, type GenStyleFn } from '../../Hooks/useStyle';

const animation = new Keyframes('animation', {
  '0%': {
    opacity: 0,
  },
  '100%': {
    opacity: 1,
  },
});

const genStyle: GenStyleFn<'TypingAnimation'> = (token) => {
  return {
    [token.componentCls]: {
      ['&-cursor']: {
        display: 'inline-block',
      },

      ['&-cursor-blinking']: {
        animationName: animation,
        animationDuration: '1s',
        animationTimingFunction: 'steps(1, end)',
        animationIterationCount: 'infinite',
      },
    },
  };
};

const useGenStyle = genStyleHooks('TypingAnimation', genStyle);

export const useTypingAnimationStyle = (prefixCls: string) => {
  const [, hashId] = useGenStyle(prefixCls);
  return { hashId };
};
