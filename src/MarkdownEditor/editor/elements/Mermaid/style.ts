import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../../../../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      // 基础容器样式
      height: '240px',
      minWidth: '300px',
      maxWidth: '800px',
      minHeight: '240px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      alignSelf: 'stretch',
      zIndex: 5,
      color: 'rgb(27, 27, 27)',
      padding: '1em',
      margin: '1em 0',
      fontSize: '0.8em',
      lineHeight: '1.5',
      overflowX: 'auto',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
      fontFamily: `'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace`,
      wordWrap: 'break-word',
      borderRadius: '12px',
      background: '#FFFFFF',
      boxShadow: 'var(--shadow-control-base)',

      // SVG 渲染优化
      '& svg': {
        // 节点样式
        '& .node': {
          '& rect, & circle, & ellipse, & polygon': {
            stroke: '#333',
            strokeWidth: '1px',
            fill: '#fff',
          },
        },

        // 强制设置所有文字样式
        '& text': {
          // 确保文字不会被裁剪
          dominantBaseline: 'middle',
          textAnchor: 'middle',
        },

        // 节点标签 - 更大的字体
        '& .nodeLabel': {
          fontWeight: 500,
          fill: '#333 !important',
        },

        // 边标签 - 稍小一些但仍然清晰
        '& .edgeLabel': {
          fill: '#666 !important',
        },

        // 专门针对流程图的文字
        '& .flowchart-label': {
          fill: '#333 !important',
        },

        // 针对不同类型的标签
        '& .label': {
          fill: '#333 !important',
        },
      },

      // 错误状态样式
      '&-error': {
        color: '#d73a49',
        background: '#ffeaea',
        border: '1px solid #f97583',
        padding: '12px',
        borderRadius: '4px',
        textAlign: 'left',

        '& pre': {
          margin: '8px 0 0',
          background: '#f6f8fa',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
        },
      },
    },
  };
};

/**
 * Mermaid 组件样式 Hook
 * @param prefixCls - 样式类名前缀
 * @returns 样式相关的 className 和 hashId
 */
export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('editor-content-mermaid', (token) => {
    const editorToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genStyle(editorToken)];
  });
}
