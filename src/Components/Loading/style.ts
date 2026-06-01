import { Keyframes } from '@ant-design/cssinjs';
import { genStyleHooks, type GenStyleFn } from '../../Hooks/useStyle';

const beforeAnimation = new Keyframes('beforeAnimation', {
  '0%, 100%': { transform: 'translate(0, 0)' },
  '25%': { transform: 'translate(20%, 10%)' },
  '50%': { transform: 'translate(30%, 20%)' },
  '75%': { transform: 'translate(15%, 15%)' },
});

const afterAnimation = new Keyframes('afterAnimation', {
  '0%, 100%': { transform: 'translate(0, 0)' },
  '25%': { transform: 'translate(-20%, 10%)' },
  '50%': { transform: 'translate(-30%, -15%)' },
  '75%': { transform: 'translate(-15%, -10%)' },
});

const genStyle: GenStyleFn<'Loading'> = (token) => {
  return {
    [token.componentCls]: {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      textAlign: 'center',
      verticalAlign: 'middle',

      [`${token.componentCls}-with-tip`]: {
        alignItems: 'center',
      },

      [`${token.componentCls}-with-children`]: {
        alignItems: 'center',
      },

      [`${token.componentCls}-tip`]: {
        color: 'var(--color-gray-text-secondary)',
        font: 'var(--font-text-body-emphasized-base)',
        letterSpacing: 'var(--letter-spacing-body-emphasized-base, normal)',
      },
    },

    [`${token.componentCls}-nested-pattern`]: {
      position: 'relative',

      [`&${token.componentCls}-spinning`]: {
        background: 'var(--color-primary-bg-page)',
        borderRadius: 'var(--radius-card-lg, 22px)',
        overflow: 'hidden',

        '&:before, &:after': {
          content: "''",
          position: 'absolute',
          borderRadius: '50%',
          willChange: 'transform',
          pointerEvents: 'none',
        },

        '&::before': {
          width: '120%',
          height: '160%',
          top: '-30%',
          left: '-40%',
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, var(--color-sub2-2) 0%, transparent 70%)',
          animationName: beforeAnimation,
          animationDuration: '6s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
        },

        '&::after': {
          width: '100%',
          height: '140%',
          top: '-30%',
          right: '-40%',
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, var(--color-sub1-2) 0%, transparent 60%)',
          filter: 'blur(60px)',
          animationName: afterAnimation,
          animationDuration: '7s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
        },

        [`& > ${token.componentCls}`]: {
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          width: '100%',
          height: '100%',
        },
      },

      // Dark theme
      '&-dark': {
        [`&${token.componentCls}-spinning`]: {
          background: 'var(--color-gray-bg-page-dark)',

          '&::before': {
            background:
              'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(22, 96, 255, 0.15) 0%, transparent 70%)',
          },

          '&::after': {
            background:
              'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(135, 87, 255, 0.15) 0%, transparent 60%)',
          },
        },

        [`${token.componentCls}-tip`]: {
          color: 'var(--color-gray-text-light)',
        },
      },
    },
  };
};

export const prefixCls = 'loading';

const useGenStyle = genStyleHooks('Loading', genStyle);

export function useStyle(prefixCls?: string) {
  const [, hashId] = useGenStyle(prefixCls ?? 'loading');
  return { hashId };
}
