import { genStyleHooks, type GenStyleFn } from '../../../../Hooks/useStyle';

const genStyle: GenStyleFn<'ContributorAvatar'> = (token) => {
  return {
    [token.componentCls]: {
      display: 'flex',
      alignItems: 'center',
      boxSizing: 'border-box',
      listStyle: 'none',
      margin: 0,
      padding: 0,
      flexFlow: 'wrap',
      '&-item': {
        display: 'inline-block',
        marginRight: '-8px',
        transition: 'all 0.3s',
      },
      '&:hover &-item': {
        display: 'inline-block',
        marginRight: '0px',
      },
    },
  };
};

/**
 * BubbleChat
 * @param prefixCls
 * @returns
 */
const useGenStyle = genStyleHooks('ContributorAvatar', genStyle);

export function useStyle(prefixCls?: string) {
  const [, hashId] = useGenStyle(prefixCls ?? 'editor-content-contributorAvatar');
  return { hashId };
}
