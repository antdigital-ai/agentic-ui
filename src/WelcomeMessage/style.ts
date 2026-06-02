import { genStyleHooks, type GenStyleFn } from '../Hooks/useStyle';

const genStyle: GenStyleFn<'WelcomeMessage'> = (token) => {
  return {
    [token.componentCls]: {
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,

      [`${token.componentCls}-title`]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        color: 'var(--color-gray-text-default)',
        font: 'var(--font-text-h2-base)',
        letterSpacing: 'var(--letter-spacing-h2-base, normal)',
      },

      [`${token.componentCls}-description`]: {
        color: 'var(--color-gray-text-secondary)',
        font: 'var(--font-text-body-lg)',
        letterSpacing: 'var(--letter-spacing-body-lg, normal)',
        textAlign: 'center',
      },
    },
  };
};

const useGenStyle = genStyleHooks('WelcomeMessage', genStyle);

export function useStyle(prefixCls?: string) {
  const [, hashId] = useGenStyle(prefixCls ?? 'welcome');
  return { hashId };
}
