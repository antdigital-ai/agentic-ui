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
      maxWidth: '800px',
      border: '1px solid #e8e8e8',
      backgroundColor: '#fff',
      minWidth: '240px',
      minHeight: '200px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      // 增加隔离：防止内容溢出影响其他元素
      position: 'relative',
      isolation: 'isolate',
      contain: 'layout style paint',
      overflow: 'hidden',
      transition: 'height 0.3s ease, min-height 0.3s ease',

      // 渲染容器样式
      '& [data-mermaid-container="true"]': {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        position: 'relative',
        isolation: 'isolate',
        contain: 'layout style paint',
        overflow: 'hidden',
        transition:
          'opacity 0.3s ease, height 0.3s ease, min-height 0.3s ease, max-height 0.3s ease',
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
        animation: 'agenticMermaidFadeIn 0.3s ease',

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
        position: 'relative',
        zIndex: 1,
        wordBreak: 'break-word',
        maxWidth: '100%',
        height: '100%',
        width: '100%',
        animation: 'agenticMermaidFadeIn 0.3s ease',
      },

      // 源码预览样式（加载中 / 流式输入中）
      '&-empty': {
        textAlign: 'left',
        color: '#6B7280',
        padding: '0.75rem 1.5rem',
        position: 'relative',
        zIndex: 1,
        flex: 1,
        height: '100%',
        width: '100%',
        fontFamily:
          "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
        fontSize: '0.875em',
        lineHeight: 1.7,
        animation: 'agenticMermaidFadeIn 0.3s ease',
      },

      // Fallback 组件样式（Suspense 加载中）
      '&-fallback': {
        padding: '0.75rem 0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#6B7280',
        width: '100%',
        minHeight: '200px',
        animation: 'agenticMermaidFadeIn 0.3s ease',

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

      '@keyframes agenticMermaidFadeIn': {
        from: { opacity: 0 },
        to: { opacity: 1 },
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
