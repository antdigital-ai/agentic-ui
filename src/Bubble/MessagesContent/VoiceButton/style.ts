import { genStyleHooks, resetComponent, type GenStyleFn } from '../../../Hooks/useStyle';

const genStyle: GenStyleFn<'BubbleVoiceButton'> = (token) => {
  const playBoxSize = 28;
  const innerBoxSize = 24;
  return {
    [token.componentCls]: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,

      '&-playBox': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: playBoxSize, // 28
        height: playBoxSize,
        cursor: 'pointer',
        borderRadius: 6,
        boxSizing: 'border-box',
      },

      '&-playBox:hover': {
        background: 'var(--color-gray-control-fill-hover)',
        borderRadius: 'var(--radius-control-base)',
        backdropFilter: 'blur(20px)',
        boxSizing: 'border-box',
      },

      '&-playingWrap': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 6,
        background: 'var(--color-gray-bg-card-white)',
        boxShadow: 'var(--shadow-control-base)',
        width: 86,
        height: 28,
        padding: '2px',
      },

      '&-playingBox': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: innerBoxSize, // 24
        height: innerBoxSize, // 24
        borderRadius: 6,
        cursor: 'pointer',
      },
      '&-playingBox:hover': {
        background: 'var(--color-gray-control-fill-hover)',
      },

      '&-rateBox': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 8px',
        width: 56,
        height: innerBoxSize, // 24
        gap: 2,
        cursor: 'pointer',
        borderRadius: 6,
      },
      '&-rateBox:hover': {
        background: 'var(--color-gray-control-fill-hover)',
      },

      '&-rateItem': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: 90,
      },
    },
  };
};

const useGenStyle = genStyleHooks('BubbleVoiceButton', (token, info) => [
  resetComponent(token),
  genStyle(token, info),
]);

export function useStyle(prefixCls?: string) {
  const [wrapSSR, hashId] = useGenStyle(prefixCls ?? 'VoiceButton');
  return { wrapSSR, hashId };
}
