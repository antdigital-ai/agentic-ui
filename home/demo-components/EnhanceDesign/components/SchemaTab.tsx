import { BarChart } from '@ant-design/agentic-ui';
import React from 'react';
import { useSiteI18n } from '../../../i18n';
import { CardContent } from '../style';
import TabPreview from './TabPreview';

const SchemaTab: React.FC = () => {
  const { messages } = useSiteI18n();

  // 从 codeExample 解析数据，移除注释后解析
  const codeExample = messages.enhance.schemaData;

  const data = JSON.parse(codeExample);

  const contentExample = (
    <div>
      <CardContent>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: '14px', color: '#666' }}>
            <BarChart
              title={messages.enhance.schemaExampleTitle}
              data={data}
              width={'100%'}
              height={500}
            />
          </div>
        </div>
      </CardContent>
    </div>
  );

  return (
    <TabPreview codeExample={codeExample} contentExample={contentExample} />
  );
};

export default SchemaTab;
