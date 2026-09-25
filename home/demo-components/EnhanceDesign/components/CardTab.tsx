import React from 'react';
import { useSiteI18n } from '../../../i18n';
import { CardContent } from '../style';
import FinancialProductsCompareCard from './FinancialProductsCompareCard';
import TabPreview from './TabPreview';

const CardTab: React.FC = () => {
  const { messages } = useSiteI18n();
  const cardDemo = messages.enhance.cardDemo;
  const codeExample = JSON.stringify(cardDemo.mockData, null, 2);

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
            data={cardDemo.mockData}
            btnText={cardDemo.btnText}
            modalTitle={cardDemo.modalTitle}
            modalHeading={cardDemo.modalHeading}
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
