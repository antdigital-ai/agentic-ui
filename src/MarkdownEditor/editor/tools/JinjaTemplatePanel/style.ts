import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../../../../Hooks/useStyle';

export const JINJA_PANEL_PREFIX_CLS = 'md-editor-jinja-panel';

const genJinjaPanelStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: 320,
      minWidth: 240,
      overflow: 'hidden',
      borderRadius: token.borderRadius,
      backgroundColor: token.colorBgContainer,
      boxShadow: token.boxShadowSecondary,
      border: `1px solid ${token.colorBorder}`,
      '&__content': {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'hidden',
      },
      '&__doc-link': {
        padding: '8px 12px',
        fontSize: token.fontSizeSM,
        color: token.colorLink,
        borderBottom: `1px solid ${token.colorBorder}`,
        a: {
          color: 'inherit',
          textDecoration: 'none',
          '&:hover': { textDecoration: 'underline' },
          '&:focus-visible': {
            outline: `2px solid ${token.colorPrimary}`,
            outlineOffset: 2,
            borderRadius: token.borderRadiusSM,
          },
        },
      },
      '&__list-box': {
        flex: 1,
        overflowY: 'auto',
        padding: '4px 0',
      },
      '&__item': {
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: '8px 12px',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: token.colorFillTertiary,
        },
        '&--active': {
          backgroundColor: token.controlItemBgHover,
        },
      },
      '&__item-title': {
        fontSize: token.fontSize,
        fontWeight: token.fontWeightStrong,
        color: token.colorText,
      },
      '&__item-desc': {
        fontSize: token.fontSizeSM,
        color: token.colorTextSecondary,
      },
    },
  };
};

export function useJinjaTemplatePanelStyle(prefixCls?: string) {
  const componentCls = '.' + (prefixCls || JINJA_PANEL_PREFIX_CLS);
  return useEditorStyleRegister(
    'JinjaTemplatePanel-' + (prefixCls || JINJA_PANEL_PREFIX_CLS),
    (token) => {
      const editorToken: ChatTokenType = {
        ...token,
        componentCls,
      };
      return [resetComponent(editorToken), genJinjaPanelStyle(editorToken)];
    },
  );
}
