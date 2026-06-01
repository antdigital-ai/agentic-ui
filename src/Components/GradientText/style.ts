import { Keyframes } from '@ant-design/cssinjs';
import { genStyleHooks, type GenStyleFn } from '../../Hooks/useStyle';

const animateGradientText = new Keyframes('animateGradientText', {
  '0%': {
    backgroundPosition: '100%',
  },
  '100%': {
    backgroundPosition: '-100%',
  },
});

const genStyle: GenStyleFn<'GradientText'> = (token) => {
  return {
    [token.componentCls]: {
      position: 'relative',
      margin: '0 auto',
      display: 'flex',
      maxWidth: 'fit-content',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 500,
      overflow: 'hidden',

      ['&-text-content']: {
        display: 'inline-block',
        position: 'relative',
        zIndex: 2,
        backgroundSize: '200% 100%',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        animationName: animateGradientText,
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
      },
    },
  };
};

const useGenStyle = genStyleHooks('GradientText', genStyle);

export const useGradientTextStyle = (prefixCls: string) => {
  const [, hashId] = useGenStyle(prefixCls);
  return { hashId };
};
