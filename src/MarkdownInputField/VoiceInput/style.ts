import {
  genStyleHooks,
  resetComponent,
  type GenStyleFn,
} from '../../Hooks/useStyle';

const genStyle: GenStyleFn<'VoiceInput'> = (token) => {
  return {
    [token.componentCls]: {
      height: '32px',
      minWidth: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '8px',
      cursor: 'pointer',
      borderRadius: '8px',
      backdropFilter: 'blur(20px)',
      fontSize: '16px',
      gap: '4px',
      color: 'var(--color-gray-text-secondary)',
      '&:hover': {
        background: 'var(--color-gray-control-fill-hover)',
      },
      '&&-disabled': {
        cursor: 'not-allowed',
        opacity: 0.5,
      },
      '&&-recording': {
        background: 'rgba(0, 116, 255, 0.09)',
      },
    },
  };
};

const useGenStyle = genStyleHooks('VoiceInput', (token, info) => [
  resetComponent(token),
  genStyle(token, info),
]);

export function useStyle(prefixCls?: string) {
  const [, hashId] = useGenStyle(prefixCls ?? 'VoiceInputButton');
  return { hashId };
}
