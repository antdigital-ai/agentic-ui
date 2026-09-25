import { I18nProvide } from '@ant-design/agentic-ui';
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import React from 'react';
import { SiteLanguageProvider, useSiteI18n } from '../../i18n';
import CircularCarousel from '../CircularCarousel';
import EnhanceDesign from '../EnhanceDesign';
import Hero from '../Hero';
import Showroom from '../Showroom';
import SupportDesign from '../SupportDesign';
import { PageWrapper, SectionWithBorders, SectionWithDividers } from './style';

// 注意：Header 已通过路由 wrappers 统一管理，不需要在页面中引入

// 将站点语言同步到 antd / agentic-ui 组件内置文案
const LocaleBridge: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { locale } = useSiteI18n();
  return (
    <ConfigProvider prefixCls="ant" locale={locale === 'zh-CN' ? zhCN : enUS}>
      {/* key 保证语言切换时组件内置文案立即切换 */}
      <I18nProvide key={locale} defaultLanguage={locale} autoDetect={false}>
        {children}
      </I18nProvide>
    </ConfigProvider>
  );
};

const HomePage: React.FC = () => {
  return (
    <SiteLanguageProvider>
      <LocaleBridge>
        <PageWrapper>
          <SectionWithDividers>
            <Hero />
          </SectionWithDividers>
          <SectionWithDividers>
            <CircularCarousel />
          </SectionWithDividers>
          <SectionWithBorders
            backgroundColor="#f7f8f9"
            data-section-with-borders
          >
            <SupportDesign />
          </SectionWithBorders>
          <SectionWithBorders data-section-with-borders>
            <EnhanceDesign />
          </SectionWithBorders>
          <SectionWithDividers>
            <Showroom />
          </SectionWithDividers>
        </PageWrapper>
      </LocaleBridge>
    </SiteLanguageProvider>
  );
};

export default HomePage;
