import VectorIcon from '../../icons/vector.svg';
import React, { useEffect, useRef, useState } from 'react';
import { CanvasTab, CardTab, MarkdownTab, SchemaTab } from './components';
import {
  Container,
  CustomTab,
  HorizontalDivider,
  SectionHeader,
  SectionSubtitle,
  SectionTitle,
  SectionWrapper,
  TabDescription,
  TabTitle,
  TabsContainer,
} from './style';

const EnhanceDesign: React.FC = () => {
  const [activeTab, setActiveTab] = useState('schema');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // 初始化宽度
    const updateWidth = () => {
      const width = element.offsetWidth;
      // 设置 CSS 变量到最近的 SectionWithBorders 父元素
      const sectionWithBorders = element.closest('[data-section-with-borders]');
      if (sectionWithBorders) {
        (sectionWithBorders as HTMLElement).style.setProperty(
          '--scrollable-content-width',
          `${width + 32}px`,
        );
      }
    };

    updateWidth();

    // 使用 ResizeObserver 监听宽度变化
    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const tabs = [
    {
      key: 'markdown',
      label: 'Markdown 渲染规范',
      description: '支持标准 Markdown 和 GFM 全部语法，公式图脚注完美渲染',
    },
    {
      key: 'schema',
      label: 'SchemaJson 图表渲染',
      description: 'JSON 配置生成可视化图表',
    },
    {
      key: 'canvas',
      label: 'MultiCanvas 扩展画布',
      description: 'AI 生成内容的多模态协同与预览空间',
    },
    {
      key: 'card',
      label: 'Card 行业卡片',
      description: '行业标准卡片快速验证方案',
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'markdown':
        return <MarkdownTab />;
      case 'schema':
        return <SchemaTab />;
      case 'canvas':
        return <CanvasTab />;
      case 'card':
        return <CardTab />;
      default:
        return <SchemaTab />;
    }
  };

  return (
    <SectionWrapper>
      <Container ref={containerRef}>
        <SectionHeader>
          <img
            src={VectorIcon}
            alt="Vector"
            style={{ width: '25px', height: '25px' }}
          />
          <SectionTitle>
            <span style={{ backgroundColor: 'white' }}>提升你的设计</span>
          </SectionTitle>
          <SectionSubtitle>
            <span
              style={{
                fontSize: '48px',
                fontWeight: 600,
                color: '#000',
                backgroundColor: 'white',
              }}
            >
              多模态输出
            </span>
            <span
              style={{
                fontFamily: 'PingFang SC',
                fontSize: '48px',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: '67px',
                marginLeft: '12px',
                background:
                  'linear-gradient(94deg, #000 4%, #3066FD 66%, #5666EE 100%)',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              渲染方案
            </span>
          </SectionSubtitle>
        </SectionHeader>

        <TabsContainer>
          {tabs.map((tab) => (
            <CustomTab
              key={tab.key}
              $active={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
            >
              <TabTitle $active={activeTab === tab.key}>{tab.label}</TabTitle>
              <TabDescription $active={activeTab === tab.key}>
                {tab.description}
              </TabDescription>
            </CustomTab>
          ))}
        </TabsContainer>

        {renderTabContent()}
      </Container>
      <HorizontalDivider />
    </SectionWrapper>
  );
};

export default EnhanceDesign;
