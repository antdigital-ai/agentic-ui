import { genStyleHooks, type GenStyleFn } from '../../../../Hooks/useStyle';
import { FNC_TAG_STYLES } from '../../tagStyles';

const genStyle: GenStyleFn<'FntTag'> = (token) => {
  return {
    [token.componentCls]: {
      ...FNC_TAG_STYLES,
    },
  };
};

/**
 * BubbleChat
 * @param prefixCls
 * @returns
 */
const useGenStyle = genStyleHooks('FntTag', genStyle);

export function useStyle(prefixCls?: string) {
  const [, hashId] = useGenStyle(prefixCls ?? 'editor-content-TextStyleTag');
  return { hashId };
}
