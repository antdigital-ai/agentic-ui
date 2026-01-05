import React, { useEffect, useRef } from 'react';
import VectorIcon from '../../icons/vector.svg';
import AIChatbot from '../AIChatbot';
import {
  DialogFlowCard,
  SuggestionCard,
  SuperInputCard,
  WelcomeCard,
  WorkspaceCard,
} from './components';
import {
  Container,
  DesignGrid,
  HorizontalDivider,
  ScrollableContent,
  ScrollableInner,
  ScrollableWrapper,
  SectionHeader,
  SectionSubtitle,
  SectionTitle,
  SectionWrapper,
  TopLeftContainer,
  TopVectorIcon,
  VerticalDivider,
} from './style';

const SupportDesign: React.FC = () => {
  const scrollableContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scrollableContentRef.current;
    if (!element) return;

    // 初始化宽度
    const updateWidth = () => {
      const width = element.offsetWidth;
      // 设置 CSS 变量到最近的 SectionWithBorders 父元素
      const sectionWithBorders = element.closest('[data-section-with-borders]');
      if (sectionWithBorders) {
        (sectionWithBorders as HTMLElement).style.setProperty(
          '--scrollable-content-width',
          `${width}px`,
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

  return (
    <SectionWrapper>
      <TopVectorIcon>
        <img
          src={VectorIcon}
          alt="Vector"
          style={{ width: '25px', height: '25px' }}
        />
        <VerticalDivider />
      </TopVectorIcon>
      <Container>
        <SectionHeader>
          <SectionTitle>支持你的设计</SectionTitle>
          <SectionSubtitle>
            <span style={{ fontSize: '48px', fontWeight: 600, color: '#000' }}>
              75个基础
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
              设计范式
            </span>
          </SectionSubtitle>
        </SectionHeader>
        <HorizontalDivider />
        <ScrollableWrapper>
          <ScrollableInner>
            <ScrollableContent ref={scrollableContentRef}>
              <DesignGrid>
                {/* 左上角：拆分成两个小格子 */}
                <TopLeftContainer>
                  <WelcomeCard />
                  <SuggestionCard />
                </TopLeftContainer>

                {/* 右上角 */}
                <SuperInputCard />

                {/* 左下角 */}
                <DialogFlowCard />

                {/* 右下角 */}
                <WorkspaceCard />
              </DesignGrid>
            </ScrollableContent>
          </ScrollableInner>
        </ScrollableWrapper>
        <HorizontalDivider />
        <div style={{ height: '32px' }}></div>
        <HorizontalDivider />
        <AIChatbot />
      </Container>
    </SectionWrapper>
  );
};

export default SupportDesign;
