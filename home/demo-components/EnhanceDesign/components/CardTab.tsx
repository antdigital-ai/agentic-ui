import React from 'react';
import { CardContent } from '../style';
import FinancialProductsCompareCard from './FinancialProductsCompareCard';
import { mockCompareData } from './FinancialProductsCompareCard/mockData';
import TabPreview from './TabPreview';

const CardTab: React.FC = () => {
  const codeExample = JSON.stringify(mockCompareData, null, 2);

  const contentExample = (
    <CardContent>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          width: '100%',
          padding: '24px',
        }}
      >
        <div style={{ maxWidth: '335px', width: '100%' }}>
          <FinancialProductsCompareCard
            data={mockCompareData}
            btnText="查看详细对比"
          />
        </div>
      </div>
    </CardContent>
  );

  return (
    <TabPreview codeExample={codeExample} contentExample={contentExample} />
  );
};

export default CardTab;
