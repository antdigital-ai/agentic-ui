import { ConfigProvider } from 'antd';
import React from 'react';
import CircularCarousel from '../CircularCarousel';
import EnhanceDesign from '../EnhanceDesign';
import Hero from '../Hero';
import Showroom from '../Showroom';
import SupportDesign from '../SupportDesign';
import { PageWrapper, SectionWithBorders, SectionWithDividers } from './style';

// 注意：Header 已通过路由 wrappers 统一管理，不需要在页面中引入

const HomePage: React.FC = () => {
  return (
    <ConfigProvider prefixCls="ant">
      <PageWrapper>
        <SectionWithDividers>
          <Hero />
        </SectionWithDividers>
        <SectionWithDividers>
          <CircularCarousel />
        </SectionWithDividers>
        <SectionWithBorders backgroundColor="#f7f8f9" data-section-with-borders>
          <SupportDesign />
        </SectionWithBorders>
        <SectionWithBorders data-section-with-borders>
          <EnhanceDesign />
        </SectionWithBorders>
        <SectionWithDividers>
          <Showroom />
        </SectionWithDividers>
      </PageWrapper>
    </ConfigProvider>
  );
};

export default HomePage;
