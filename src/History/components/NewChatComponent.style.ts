import { genStyleHooks, type GenStyleFn } from '../../Hooks/useStyle';

const genNewChatStyle: GenStyleFn<'NewChatComponent'> = (token) => {
  return {
    [`${token.componentCls}-new-chat`]: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      padding: '5px 12px',
      borderRadius: 'var(--radius-control-base)',
      background: 'var(--color-primary-control-fill-secondary)',
      fontSize: '14px',
      fontWeight: 600,
      lineHeight: '22px',
      letterSpacing: 'normal',
      color: 'var(--color-primary-text-secondary)',
      boxShadow: 'var(--shadow-border-base)',

      '&:hover': {
        background: 'var(--color-primary-control-fill-secondary-hover)',
      },
    },
  };
};

const useGenStyle = genStyleHooks('NewChatComponent', genNewChatStyle);

export const useNewChatStyle = (prefixCls: string) => {
  const [wrapSSR, hashId] = useGenStyle(prefixCls);
  return { wrapSSR, hashId };
};

