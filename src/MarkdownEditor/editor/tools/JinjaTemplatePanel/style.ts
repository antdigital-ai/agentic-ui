import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../../../../Hooks/useStyle';

export const JINJA_PANEL_PREFIX_CLS = 'agentic-md-editor-jinja-panel';

const genJinjaPanelStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      width: 360,
      height: 200,
      maxHeight: 320,
      minWidth: 240,
      overflow: 'hidden',
      borderRadius: 'var(--radius-control-sm, var(--ant-border-radius-sm))',
      backgroundColor:
        'var(--color-gray-bg-page-light, var(--ant-color-bg-container))',
      boxShadow: 'var(--shadow-control-lg, var(--ant-box-shadow))',
      '&-content': {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'hidden',
        padding: 4,
      },
      '&-header': {
        padding: '6px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      },
      '&-header-actions': {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      },
      '&-close': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
        margin: -4,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        color: 'var(--color-gray-text-light, var(--ant-color-text-secondary))',
        borderRadius: token.borderRadiusSM,
        '&:hover': {
          color: 'var(--color-gray-text-default, var(--ant-color-text))',
          backgroundColor: token.colorFillTertiary,
        },
      },
      '&-title': {
        font: 'var(--font-text-body-emphasized-sm)',
        letterSpacing: 'var(--letter-spacing-body-emphasized-sm, normal)',
        color: 'var(--color-gray-text-light, var(--ant-color-text-secondary))',
      },
      '&-doc-link': {
        display: 'flex',
        cursor: 'pointer',
        alignItems: 'center',
        gap: 4,
        font: 'var(--font-text-body-emphasized-sm)',
        letterSpacing: 'var(--letter-spacing-body-emphasized-sm, normal)',
        color: 'var(--color-primary-text-default, var(--ant-color-link))',
      },
      '&-list-box': {
        flex: 1,
        overflowY: 'auto',
        padding: '4px 0',
      },
      '&-item': {
        display: 'flex',
        borderRadius: token.borderRadiusSM,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: token.colorFillTertiary,
        },
      },
      '&-item-active': {
        backgroundColor: token.controlItemBgHover,
      },
      '&-item-title': {
        flexShrink: 0,
        font: 'var(--font-text-body-base)',
        letterSpacing: 'var(--letter-spacing-body-base, normal)',
        color: 'var(--color-gray-text-default, var(--ant-color-text))',
      },
      '&-item-desc': {
        flex: 1,
        minWidth: 0,
        font: 'var(--font-text-body-sm)',
        letterSpacing: 'var(--letter-spacing-body-sm, normal)',
        color: 'var(--color-gray-text-light, var(--ant-color-text-secondary))',
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
