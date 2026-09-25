import { MarkdownEditor } from '@ant-design/agentic-ui';
import React from 'react';
import { useSiteI18n } from '../../../i18n';
import { CardContent } from '../style';
import TabPreview from './TabPreview';

const MarkdownTab: React.FC = () => {
  const { messages } = useSiteI18n();
  const codeExample = messages.enhance.markdownExample;

  const contentExample = (
    <div>
      <CardContent>
        <div style={{ height: '500px', overflow: 'auto' }}>
          <MarkdownEditor
            initValue={codeExample}
            readonly={true}
            toolBar={{ enable: false }}
            toc={false}
            style={{ height: '100%' }}
            contentStyle={{ height: '100%', padding: '0' }}
          />
        </div>
      </CardContent>
    </div>
  );

  return (
    <TabPreview codeExample={codeExample} contentExample={contentExample} />
  );
};

export default MarkdownTab;
