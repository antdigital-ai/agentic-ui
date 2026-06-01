import { genStyleHooks, type GenStyleFn } from '../../Hooks/useStyle';

const genStyle: GenStyleFn<'WorkspaceHtmlPreview'> = (token) => {
  return {
    [`${token.componentCls}`]: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',

      [`${token.componentCls}-actions`]: {
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '8px 0',
      },

      [`${token.componentCls}-content`]: {
        position: 'relative',
        width: '100%',
        height: '100%',
      },

      [`${token.componentCls}-iframe`]: {
        width: '100%',
        height: '100%',
        minHeight: '240px',
        border: 'none',
        background: token.colorBgContainer,
      },

      [`${token.componentCls}-overlay`]: {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,

        [`&--loading`]: {
          // 与 antd 遮罩一致，随亮/暗主题变化
          background: token.colorBgMask,
        },

        [`&--error`]: {
          background: token.colorErrorBg,
          color: token.colorError,
        },
      },

      [`${token.componentCls}-empty`]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: '240px',
        padding: '24px',
        textAlign: 'center',
      },
    },
  };
};

const useGenStyle = genStyleHooks('WorkspaceHtmlPreview', genStyle);

export function useHtmlPreviewStyle(prefixCls?: string) {
  const [, hashId] = useGenStyle(prefixCls ?? 'WorkspaceHtmlPreview');
  return { hashId };
}
