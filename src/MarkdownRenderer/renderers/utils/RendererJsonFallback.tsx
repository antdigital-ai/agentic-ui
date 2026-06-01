import React from 'react';

export interface RendererJsonFallbackProps {
  /** 用于 data-testid，便于测试与 DOM 调试 */
  testId: string;
  /** 待展示的原始 JSON 字符串 */
  code: string;
  /** 自定义额外样式（覆盖默认） */
  style?: React.CSSProperties;
}

const DEFAULT_STYLE: React.CSSProperties = {
  background: 'rgb(242, 241, 241)',
  padding: '1em',
  borderRadius: '0.5em',
  margin: '0.75em 0',
  fontSize: '0.8em',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
};

/**
 * Agentic UI 内嵌 JSON 代码块解析失败时的统一兜底展示。
 * 替代 task / toolusebar / filemap 三处重复 <pre> 实现。
 */
const RendererJsonFallbackComponent: React.FC<RendererJsonFallbackProps> = ({
  testId,
  code,
  style,
}) => {
  return (
    <pre data-testid={testId} style={{ ...DEFAULT_STYLE, ...style }}>
      <code>{code}</code>
    </pre>
  );
};

RendererJsonFallbackComponent.displayName = 'RendererJsonFallback';

export const RendererJsonFallback = React.memo(RendererJsonFallbackComponent);
