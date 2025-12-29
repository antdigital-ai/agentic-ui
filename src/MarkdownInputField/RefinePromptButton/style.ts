import { Keyframes } from '@ant-design/cssinjs';
import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../../hooks/useStyle';

const spinnerRotate = new Keyframes('refineSpinnerRotate', {
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

export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('RefinePromptButton', (token) => {
    const proChatToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [resetComponent(proChatToken), genStyle(proChatToken)];
  });
}
