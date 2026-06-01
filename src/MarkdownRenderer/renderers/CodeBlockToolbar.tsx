import { ChevronsUpDown, Copy } from '@sofa-design/icons';
import React, { useContext } from 'react';
import { ActionIconBox } from '../../Components/ActionIconBox';
import { I18nContext } from '../../I18n';
import { LoadImage } from '../../Plugins/code/components/LoadImage';
import { langIconMap } from '../../Plugins/code/langIconMap';

/**
 * 代码块顶部工具栏（语言标识 + 复制 + 折叠）。
 *
 * 从 CodeRenderer.tsx 中抽出，原本作为大段内联 JSX 嵌在 render 内，
 * 抽离后好处：
 * 1. 所有 inline style 在模块加载期一次构造，而非每次 render 重新分配
 * 2. 便于独立测试折叠交互、复制按钮等
 * 3. CodeRenderer 主体保持精简
 */
export interface CodeBlockToolbarProps {
  /** 代码语言（如 `typescript`、`json`） */
  language?: string;
  /** 是否处于展开状态（控制 toolbar 底部是否显示分隔线） */
  expanded: boolean;
  /** 主题（影响 ActionIconBox 配色） */
  theme: 'dark' | 'light';
  /** 点击复制按钮 */
  onCopy: () => void;
  /** 点击折叠 / 展开按钮 */
  onToggleExpanded: () => void;
}

const TOOLBAR_BASE_STYLE: React.CSSProperties = {
  borderTopLeftRadius: 'inherit',
  borderTopRightRadius: 'inherit',
  backgroundColor: 'transparent',
  paddingLeft: '0.25em',
  paddingRight: '0.25em',
  width: '100%',
  position: 'sticky',
  left: 0,
  top: 0,
  fontSize: '1em',
  font: 'var(--font-text-h6-base)',
  color: 'inherit',
  justifyContent: 'space-between',
  zIndex: 50,
  height: '38px',
  display: 'flex',
  alignItems: 'center',
  padding: '9px 12px',
  gap: '16px',
  alignSelf: 'stretch',
  boxSizing: 'border-box',
  userSelect: 'none',
};

const TOOLBAR_LEFT_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

const LANG_LABEL_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  gap: 4,
  font: 'inherit',
  color: 'inherit',
  userSelect: 'none',
};

const LANG_ICON_WRAPPER_STYLE: React.CSSProperties = {
  height: '1em',
  width: '1em',
  fontSize: '16px',
  display: 'flex',
};

const LANG_ICON_INNER_STYLE: React.CSSProperties = {
  height: '1em',
  width: '1em',
};

const TOOLBAR_RIGHT_STYLE: React.CSSProperties = {
  display: 'flex',
  gap: 5,
  alignItems: 'center',
};

const COPY_BUTTON_STYLE: React.CSSProperties = {
  fontSize: '1em',
  lineHeight: '1.75em',
  marginLeft: '0.125em',
};

const TOOLBAR_BORDER = '1px solid var(--color-gray-border-light)';

/**
 * 计算 toolbar 容器最终样式：仅在展开态附加底部分隔线。
 * 提取为函数避免 inline 表达式让 React diff 失稳。
 */
const buildToolbarStyle = (expanded: boolean): React.CSSProperties => ({
  ...TOOLBAR_BASE_STYLE,
  borderBottom: expanded ? TOOLBAR_BORDER : 'none',
});

const CodeBlockToolbarComponent: React.FC<CodeBlockToolbarProps> = ({
  language,
  expanded,
  theme,
  onCopy,
  onToggleExpanded,
}) => {
  const i18n = useContext(I18nContext);
  const langIcon = langIconMap.get(language?.toLowerCase() || '');
  const actionTheme = theme === 'dark' ? 'dark' : 'light';

  return (
    <div
      data-testid="code-toolbar"
      contentEditable={false}
      style={buildToolbarStyle(expanded)}
    >
      <div style={TOOLBAR_LEFT_STYLE}>
        <div style={LANG_LABEL_STYLE}>
          {langIcon && (
            <div style={LANG_ICON_WRAPPER_STYLE}>
              <LoadImage style={LANG_ICON_INNER_STYLE} src={langIcon} />
            </div>
          )}
          <span>{language || 'plain text'}</span>
        </div>
      </div>
      <div style={TOOLBAR_RIGHT_STYLE}>
        <ActionIconBox
          theme={actionTheme}
          title={i18n?.locale?.copy || '复制'}
          style={COPY_BUTTON_STYLE}
          onClick={onCopy}
        >
          <Copy />
        </ActionIconBox>
        <ActionIconBox
          title={i18n?.locale?.expandCollapse || '展开/收起'}
          theme={actionTheme}
          onClick={onToggleExpanded}
        >
          <ChevronsUpDown />
        </ActionIconBox>
      </div>
    </div>
  );
};

CodeBlockToolbarComponent.displayName = 'CodeBlockToolbar';

export const CodeBlockToolbar = React.memo(CodeBlockToolbarComponent);
