import { Workspace } from '@ant-design/agentic-ui';
import React, { useRef } from 'react';
import { useSiteI18n } from '../../../../i18n';
import { CardContent } from '../../style';
import TabPreview from '../TabPreview';

// 直接使用底层的 Mermaid 组件，避免 Slate 属性要求
const MermaidRenderer: React.FC<{ code: string; renderError: string }> = ({
  code,
  renderError,
}) => {
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
        setError(err instanceof Error ? err.message : renderError);
        setSvgContent('');
      }
    };

    if (code) {
      renderMermaid();
    }
  }, [code, renderError]);

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
  const { messages } = useSiteI18n();
  const canvasMessages = messages.enhance.tabs.canvas;
  // Mermaid 流程图代码
  const mermaidCode = canvasMessages.mermaidContent;

  const contentExample = (
    <CardContent>
      <div style={{ width: '100%', height: '500px' }}>
        <Workspace
          title={canvasMessages.workspaceTitle}
          onTabChange={(key: string) => console.log('Tab changed:', key)}
          onClose={() => console.log('Workspace closed')}
          pure
        >
          <Workspace.Custom
            tab={{ key: 'flow', title: canvasMessages.flowTab }}
          >
            <div style={{ padding: '20px', height: '100%', overflow: 'auto' }}>
              <MermaidRenderer
                code={mermaidCode}
                renderError={canvasMessages.renderError}
              />
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
