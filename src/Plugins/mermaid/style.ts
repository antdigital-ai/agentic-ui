import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      // 主容器样式
      marginBottom: '0.75em',
      cursor: 'default',
      userSelect: 'none',
      padding: '0.75rem 0',
      borderRadius: '1em',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      // 增加隔离：防止内容溢出影响其他元素
      position: 'relative',
      isolation: 'isolate', // CSS isolation 属性，创建新的堆叠上下文
      contain: 'layout style paint', // CSS containment，限制布局和样式的影响范围
      overflow: 'hidden', // 防止内容溢出

      // 渲染容器样式
      '& [data-mermaid-container="true"]': {
        width: '100%',
        maxWidth: '100%',
        minHeight: '200px', // 保持最小高度，避免尺寸抖动
        display: 'flex',
        justifyContent: 'center',
        // 增加隔离样式
        position: 'relative',
        isolation: 'isolate',
        contain: 'layout style paint',
        overflow: 'hidden',
        // 防止 SVG 样式影响外部
      },

      // SVG 包装器样式（用于动态创建的 wrapper）
      '& [data-mermaid-wrapper]': {
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        isolation: 'isolate',
        contain: 'layout style paint',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px', // 保持最小高度，避免尺寸抖动
      },

      // SVG 元素样式
      '& [data-mermaid-svg="true"]': {
        maxWidth: '100%',
        height: 'auto',
        overflow: 'hidden',
      },

      // SVG 内部元素样式
      '& [data-mermaid-internal="true"]': {
        // 确保内部元素不会影响外部
      },

      // 加载状态样式
      '&-loading': {
        textAlign: 'center',
        color: '#6B7280',
        padding: '0.5rem',
        position: 'relative',
        zIndex: 1,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',

        // Skeleton 样式优化
        '& .ant-skeleton': {
          width: '100%',
          maxWidth: '800px',
        },

        '& .ant-skeleton-image': {
          width: '100%',
          minHeight: '200px',
          borderRadius: '12px',
        },
      },

      // 错误状态样式
      '&-error': {
        textAlign: 'center',
        color: 'rgba(239, 68, 68, 0.8)',
        padding: '0.5rem',
        flex: 1,
        // 错误信息也增加隔离
        position: 'relative',
        zIndex: 1,
        wordBreak: 'break-word',
        maxWidth: '100%',
        height: '100%',
        width: '100%',
      },

      // 空状态样式
      '&-empty': {
        textAlign: 'center',
        color: '#6B7280',
        backgroundColor: '#fff',
        borderRadius: '12px',
        border: '1px solid #e1e5e9',
        padding: '0.5rem',
        position: 'relative',
        zIndex: 1,
        flex: 1,
        height: '100%',
        width: '100%',
      },

      // Fallback 组件样式
      '&-fallback': {
        marginBottom: '0.75em',
        padding: '0.75rem 0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#6B7280',
        width: '100%',
        minHeight: '200px',

        // Skeleton 样式优化
        '& .ant-skeleton': {
          width: '100%',
          maxWidth: '800px',
        },

        '& .ant-skeleton-image': {
          width: '100%',
          minHeight: '200px',
          borderRadius: '12px',
        },
      },

      // SVG 渲染优化样式
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
    },
  };
};

/**
 * Mermaid 插件样式 Hook
 * @param prefixCls - 样式类名前缀
 * @returns 样式相关的 wrapSSR 和 hashId
 */
export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('agentic-plugin-mermaid', (token) => {
    const editorToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genStyle(editorToken)];
  });
}
