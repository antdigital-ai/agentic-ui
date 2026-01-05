import React, { ReactNode } from 'react';
import {
  ContentCard,
  ContentCardInner,
  ContentWrapper,
  HeaderText,
  PreviewContainer,
  PreviewHeader,
  TrafficLight,
  TrafficLights,
} from '../style';

interface TabPreviewProps {
  codeExample: string;
  contentExample: ReactNode;
}

const TabPreview: React.FC<TabPreviewProps> = ({
  codeExample,
  contentExample,
}) => {
  return (
    <PreviewContainer>
      <PreviewHeader>
        <TrafficLights>
          <TrafficLight $color="#F96256" />
          <TrafficLight $color="#FBDC3D" />
          <TrafficLight $color="#5CB740" />
        </TrafficLights>
        <HeaderText>agentic.antdigital.ai</HeaderText>
      </PreviewHeader>
      <ContentWrapper>
        <div
          style={{
            height: '100%',
            overflow: 'auto',
            backgroundColor: '#1e1e1e',
            padding: '16px',
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
            fontSize: '12px',
            lineHeight: '1.5',
          }}
        >
          <pre
            style={{
              margin: 0,
              color: '#d4d4d4',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
            }}
          >
            <code>{codeExample}</code>
          </pre>
        </div>
        <ContentCard>
          <ContentCardInner>{contentExample}</ContentCardInner>
        </ContentCard>
      </ContentWrapper>
    </PreviewContainer>
  );
};

export default TabPreview;
