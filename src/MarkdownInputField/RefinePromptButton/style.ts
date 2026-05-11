import { Keyframes } from '@ant-design/cssinjs';
import { genStyleHooks, resetComponent, type GenStyleFn } from '../../Hooks/useStyle';

const spinnerRotate = new Keyframes('refineSpinnerRotate', {
  '0%': {
    transform: 'rotate(0deg)',
  },
  '100%': {
    transform: 'rotate(360deg)',
  },
});

const genStyle: GenStyleFn<'RefinePromptButton'> = (token) => {
  return {
    [token.componentCls]: {
      width: 20,
      height: 20,
      borderRadius: 'var(--radius-control-sm)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      cursor: 'pointer',
      color: 'var(--color-gray-text-light)',
      transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)',
      '&:hover': {
        backgroundColor: 'var(--color-gray-bg-card-light)',
        color: 'var(--color-gray-text-default)',
      },
      '&&-disabled': {
        cursor: 'not-allowed',
        opacity: 0.6,
      },
      '.refine-icon-ring': {
        opacity: 0.15,
      },
      '.refine-icon-spinner': {
        transformOrigin: '16px 16px',
        animationName: spinnerRotate,
        animationDuration: '1s',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
      },
    },
  };
};

const useGenStyle = genStyleHooks('RefinePromptButton', (token, info) => [
  resetComponent(token),
  genStyle(token, info),
]);

export function useStyle(prefixCls?: string) {
  const [wrapSSR, hashId] = useGenStyle(prefixCls ?? 'RefinePromptButton');
  return { wrapSSR, hashId };
}
