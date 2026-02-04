import React, { useRef } from 'react';
import { Workspace } from '@ant-design/agentic-ui';
import { CardContent } from '../../style';
import TabPreview from '../TabPreview';

// 直接使用底层的 Mermaid 组件，避免 Slate 属性要求
const MermaidRenderer: React.FC<{ code: string }> = ({ code }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');

  React.useEffect(() => {
    const renderMermaid = async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        const id = 'mermaid-' + Date.now();
        const result = await mermaid.render(id, code);
        setSvgContent(result.svg);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : '渲染失败');
        setSvgContent('');
      }
    };

    if (code) {
      renderMermaid();
    }
  }, [code]);

  return (
    <div
      style={{
        marginBottom: '0.75em',
        cursor: 'default',
        userSelect: 'none',
        padding: '0.75rem 0',
        backgroundColor: 'rgba(15, 17, 20, 0.05)',
        borderRadius: '0.25em',
        display: 'flex',
        justifyContent: 'center',
      }}
      contentEditable={false}
    >
      <div
        ref={containerRef}
        contentEditable={false}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          visibility: svgContent && !error ? 'visible' : 'hidden',
        }}
        dangerouslySetInnerHTML={
          svgContent ? { __html: svgContent } : undefined
        }
      />
      {error && (
        <div style={{ textAlign: 'center', color: 'rgba(239, 68, 68, 0.8)' }}>
          {error}
        </div>
      )}
      {!code && !error && (
        <div style={{ textAlign: 'center', color: '#6B7280' }}>Empty</div>
      )}
    </div>
  );
};

const CanvasTab: React.FC = () => {
  // Mermaid 流程图代码
  const mermaidCode = `graph TD
    A[开始] --> B[知识查询]
    B -->|有结果| C[回答]
    B -->|无结果| D[回答]
    C --> E[结束]
    D --> E`;

  const contentExample = (
    <CardContent>
      <div style={{ width: '100%', height: '500px' }}>
        <Workspace
          title="流程画布"
          onTabChange={(key: string) => console.log('切换到标签页:', key)}
          onClose={() => console.log('关闭工作空间')}
          pure
        >
          <Workspace.Custom tab={{ key: 'flow', title: '流程图' }}>
            <div style={{ padding: '20px', height: '100%', overflow: 'auto' }}>
              <MermaidRenderer code={mermaidCode} />
            </div>
          </Workspace.Custom>
        </Workspace>
      </div>
    </CardContent>
  );

  return (
    <TabPreview codeExample={mermaidCode} contentExample={contentExample} />
  );
};

export default CanvasTab;
