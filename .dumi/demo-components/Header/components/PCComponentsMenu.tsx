import componentsBg from '../../../assets/components-bg.png';
import visualAssetsBg from '../../../assets/visual-assets-bg.png';
import {
  PC_COMPONENT_DESIGN_RESOURCE_URL,
  PC_COMPONENT_URL,
} from '../../../constants/links';
import React from 'react';
import { motion } from 'framer-motion';
import {
  DesignResourceCard,
  DesignResourceCardContent,
  DesignResourceCardDescription,
  DesignResourceCardImage,
  DesignResourceCardTitle,
  DesignResourcesContainer,
  DesignResourcesGrid,
  DesignResourcesTitle,
  MenuContainer,
  MenuContent,
  MenuContentWrapper,
  NavItem,
  NavItemDescription,
  NavItemTitle,
  NavSection,
  NavSectionTitleIcon,
  ScrollableInner,
  ScrollableWrapper,
  VerticalDivider,
} from '../style';

// 动画 variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
};

// SVG Paths - 语义化命名
const svgPaths = {
  laptopIcon:
    'M14.6667 12.6667C15.0349 12.6667 15.3333 12.9651 15.3333 13.3333C15.3333 13.7015 15.0349 14 14.6667 14H1.33333C0.965144 14 0.666667 13.7015 0.666667 13.3333C0.666667 12.9651 0.965144 12.6667 1.33333 12.6667H14.6667ZM13.3333 4C13.3333 3.63181 13.0349 3.33333 12.6667 3.33333H3.33333C2.96514 3.33333 2.66667 3.63181 2.66667 4V9.33333C2.66667 9.70152 2.96514 10 3.33333 10H12.6667C13.0349 10 13.3333 9.70152 13.3333 9.33333V4ZM14.6667 9.33333C14.6667 10.4379 13.7712 11.3333 12.6667 11.3333H3.33333C2.22876 11.3333 1.33333 10.4379 1.33333 9.33333V4C1.33333 2.89543 2.22876 2 3.33333 2H12.6667C13.7712 2 14.6667 2.89543 14.6667 4V9.33333Z',
  swatchBookIcon:
    'M13.3333 10C13.3333 9.82319 13.263 9.65367 13.138 9.52865C13.013 9.40362 12.8435 9.33333 12.6667 9.33333H11.3896L7.40788 13.3333H12.6667C12.8435 13.3333 13.013 13.263 13.138 13.138C13.263 13.013 13.3333 12.8435 13.3333 12.6667V10ZM4.67318 10.6667C5.04137 10.6667 5.33984 10.9651 5.33984 11.3333C5.33984 11.7015 5.04137 12 4.67318 12H4.66667C4.29848 12 4 11.7015 4 11.3333C4 10.9651 4.29848 10.6667 4.66667 10.6667H4.67318ZM10.001 3.99609C9.87801 3.99597 9.75617 4.01997 9.64258 4.06706C9.52894 4.11416 9.4257 4.18338 9.33887 4.27051L9.33822 4.27148L8 5.60937V10.8486L11.945 6.88574L11.9479 6.88249C12.0363 6.79489 12.1062 6.69054 12.1536 6.57552C12.2011 6.46054 12.2252 6.33726 12.2243 6.21289C12.2233 6.08847 12.1973 5.96522 12.1481 5.85091C12.099 5.73667 12.0275 5.63342 11.9378 5.5472L10.6628 4.27214C10.5761 4.18479 10.4729 4.11541 10.3594 4.06803C10.2459 4.02067 10.124 3.99624 10.001 3.99609ZM6.66667 3.33333C6.66667 3.15652 6.59638 2.987 6.47135 2.86198C6.36193 2.75255 6.21842 2.68505 6.06575 2.66992L6 2.66667H3.33333C3.15652 2.66667 2.987 2.73695 2.86198 2.86198C2.73695 2.987 2.66667 3.15652 2.66667 3.33333V11.3333C2.66667 11.8638 2.87753 12.3723 3.2526 12.7474C3.62768 13.1225 4.13623 13.3333 4.66667 13.3333C5.1971 13.3333 5.70566 13.1225 6.08073 12.7474C6.4558 12.3723 6.66667 11.8638 6.66667 11.3333V3.33333ZM8 3.72363L8.39518 3.32845C8.60586 3.11726 8.85628 2.94987 9.13184 2.83561C9.40781 2.72121 9.70385 2.66242 10.0026 2.66276C10.3014 2.66311 10.5973 2.7225 10.873 2.83757C11.1479 2.95229 11.3974 3.12015 11.6074 3.33138L12.8623 4.58626L12.9417 4.66667C13.1225 4.85883 13.2686 5.08132 13.373 5.32422C13.4924 5.60176 13.555 5.90036 13.5573 6.20247C13.5596 6.50461 13.5015 6.80432 13.3864 7.08366C13.2718 7.36161 13.1027 7.61375 12.8896 7.82585L12.89 7.82617L12.7155 8.00098C13.2282 8.01349 13.7172 8.22239 14.0807 8.58594C14.4558 8.96101 14.6667 9.46957 14.6667 10V12.6667C14.6667 13.1971 14.4558 13.7057 14.0807 14.0807C13.7057 14.4558 13.1971 14.6667 12.6667 14.6667H4.66667C3.78261 14.6667 2.93469 14.3155 2.30957 13.6904C1.68445 13.0653 1.33333 12.2174 1.33333 11.3333V3.33333C1.33333 2.8029 1.5442 2.29434 1.91927 1.91927C2.29434 1.5442 2.8029 1.33333 3.33333 1.33333H6C6.53043 1.33333 7.03899 1.5442 7.41406 1.91927C7.78913 2.29434 8 2.8029 8 3.33333V3.72363Z',
  decorativePatternTopLeft: 'M12 10H18V12H12V18H10V12H4V10H10V4H12V10Z',
  decorativePatternTopRight:
    'M347 10H353V12H347V18H345V12H339V10H345V4H347V10Z',
  decorativePatternBottomLeft:
    'M12 199H18V201H12V207H10V201H4V199H10V193H12V199Z',
  decorativePatternBottomRight:
    'M347 199H353V201H347V207H345V201H339V199H345V193H347V199Z',
};

const PCComponentsMenu: React.FC = () => {
  return (
    <MenuContainer>
      {/* <RightEdgeDivider />
      <LeftEdgeDivider /> */}

      <ScrollableWrapper>
        <MenuContentWrapper>
          <ScrollableInner>
            <MenuContent>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{
                  display: 'flex',
                  alignItems: 'stretch',
                  width: '100%',
                  position: 'relative',
                }}
              >
                {/* 左侧导航区域 */}
                <motion.div
                  variants={itemVariants}
                  style={{ alignSelf: 'flex-start' }}
                >
                  <NavSection>
                    {/* PC 组件标题 */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                      }}
                    >
                      <NavSectionTitleIcon>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d={svgPaths.laptopIcon}
                            fill="#343A45"
                            id="Vector (Stroke)"
                          />
                        </svg>
                      </NavSectionTitleIcon>
                      <span
                        style={{
                          fontFamily: 'PingFang SC',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#343a45',
                        }}
                      >
                        PC 组件
                      </span>
                    </div>

                    {/* 导航项列表 */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        width: '100%',
                      }}
                    >
                      {/* 组件 Components */}
                      <motion.div variants={itemVariants}>
                        <NavItem
                          href={PC_COMPONENT_URL.COMPONENTS}
                          onClick={(e) => {
                            e.preventDefault();
                            window.open(
                              PC_COMPONENT_URL.COMPONENTS,
                              '_blank',
                              'noopener,noreferrer',
                            );
                          }}
                        >
                          <NavItemTitle>组件 Components</NavItemTitle>
                          <NavItemDescription>
                            提供组件和开发接入指南
                          </NavItemDescription>
                        </NavItem>
                      </motion.div>

                      {/* 演示 Demo */}
                      <motion.div variants={itemVariants}>
                        <NavItem
                          href={PC_COMPONENT_URL.DEMO}
                          onClick={(e) => {
                            e.preventDefault();
                            window.open(
                              PC_COMPONENT_URL.DEMO,
                              '_blank',
                              'noopener,noreferrer',
                            );
                          }}
                        >
                          <NavItemTitle>演示 Demo</NavItemTitle>
                          <NavItemDescription>
                            通过演示demo更快构建智能体产品
                          </NavItemDescription>
                        </NavItem>
                      </motion.div>

                      {/* 更新日志 Changelog */}
                      <motion.div variants={itemVariants}>
                        <NavItem
                          href={PC_COMPONENT_URL.CHANGELOG}
                          onClick={(e) => {
                            e.preventDefault();
                            window.open(
                              PC_COMPONENT_URL.CHANGELOG,
                              '_blank',
                              'noopener,noreferrer',
                            );
                          }}
                        >
                          <NavItemTitle>更新日志 Changelog</NavItemTitle>
                        </NavItem>
                      </motion.div>
                    </div>
                  </NavSection>
                </motion.div>
                <VerticalDivider />

                {/* 右侧设计资源区域 */}
                <motion.div
                  variants={itemVariants}
                  style={{ alignSelf: 'flex-start' }}
                >
                  <DesignResourcesContainer>
                    {/* 设计资源标题 */}
                    <DesignResourcesTitle>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d={svgPaths.swatchBookIcon}
                          fill="#343A45"
                          id="Vector (Stroke)"
                        />
                      </svg>
                      设计资源
                    </DesignResourcesTitle>

                    {/* 设计资源卡片网格 */}
                    <DesignResourcesGrid>
                      {/* 视觉风格手册卡片 */}
                      <motion.div
                        variants={itemVariants}
                        style={{ width: '335px' }}
                      >
                        <DesignResourceCard
                          href={
                            PC_COMPONENT_DESIGN_RESOURCE_URL.DESIGN_VISUAL_ASSETS
                          }
                          onClick={(e) => {
                            e.preventDefault();
                            window.open(
                              PC_COMPONENT_DESIGN_RESOURCE_URL.DESIGN_VISUAL_ASSETS,
                              '_blank',
                              'noopener,noreferrer',
                            );
                          }}
                          style={{ width: '100%' }}
                        >
                          <DesignResourceCardImage
                            style={{
                              height: '188px',
                              background: 'rgba(239, 246, 255, 1)',
                              position: 'relative',
                              overflow: 'visible',
                              borderRadius: '8px',
                            }}
                          >
                            <img
                              alt=""
                              src={visualAssetsBg}
                              loading="eager"
                              decoding="async"
                              style={{
                                position: 'absolute',
                                inset: 0,
                                maxWidth: 'none',
                                objectFit: 'cover',
                                pointerEvents: 'none',
                                width: '100%',
                                height: '100%',
                                mixBlendMode: 'multiply',
                              }}
                            />
                            {/* Corner Plus Icons */}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 14 14"
                              fill="none"
                              style={{
                                position: 'absolute',
                                top: '-7px',
                                left: '-7px',
                                zIndex: 2,
                              }}
                            >
                              <path
                                d="M8 6H14V8H8V14H6V8H0V6H6V0H8V6Z"
                                fill="#343A45"
                              />
                            </svg>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 14 14"
                              fill="none"
                              style={{
                                position: 'absolute',
                                top: '-7px',
                                right: '-7px',
                                zIndex: 2,
                              }}
                            >
                              <path
                                d="M8 6H14V8H8V14H6V8H0V6H6V0H8V6Z"
                                fill="#343A45"
                              />
                            </svg>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 14 14"
                              fill="none"
                              style={{
                                position: 'absolute',
                                bottom: '-7px',
                                left: '-7px',
                                zIndex: 2,
                              }}
                            >
                              <path
                                d="M8 6H14V8H8V14H6V8H0V6H6V0H8V6Z"
                                fill="#343A45"
                              />
                            </svg>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 14 14"
                              fill="none"
                              style={{
                                position: 'absolute',
                                bottom: '-7px',
                                right: '-7px',
                                zIndex: 2,
                              }}
                            >
                              <path
                                d="M8 6H14V8H8V14H6V8H0V6H6V0H8V6Z"
                                fill="#343A45"
                              />
                            </svg>
                          </DesignResourceCardImage>
                          <DesignResourceCardContent
                            style={{ padding: '0 0 16px 0', gap: '4px' }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                                flex: 1,
                              }}
                            >
                              <DesignResourceCardTitle>
                                视觉风格手册
                              </DesignResourceCardTitle>
                              <DesignResourceCardDescription>
                                提供 chatbot 、插图等视觉资源
                              </DesignResourceCardDescription>
                            </div>
                          </DesignResourceCardContent>
                        </DesignResourceCard>
                      </motion.div>

                      {/* 组件库设计资源卡片 */}
                      <motion.div
                        variants={itemVariants}
                        style={{ width: '336px' }}
                      >
                        <DesignResourceCard
                          href={
                            PC_COMPONENT_DESIGN_RESOURCE_URL.DESIGN_RESOURCE
                          }
                          onClick={(e) => {
                            e.preventDefault();
                            window.open(
                              PC_COMPONENT_DESIGN_RESOURCE_URL.DESIGN_RESOURCE,
                              '_blank',
                              'noopener,noreferrer',
                            );
                          }}
                          style={{ width: '100%' }}
                        >
                          <DesignResourceCardImage
                            style={{
                              height: '188px',
                              background: 'rgba(239, 246, 255, 1)',
                              position: 'relative',
                              overflow: 'visible',
                              borderRadius: '8px',
                            }}
                          >
                            <img
                              alt=""
                              src={componentsBg}
                              loading="eager"
                              decoding="async"
                              style={{
                                position: 'absolute',
                                inset: 0,
                                maxWidth: 'none',
                                objectFit: 'cover',
                                pointerEvents: 'none',
                                width: '100%',
                                height: '100%',
                                mixBlendMode: 'multiply',
                              }}
                            />
                            {/* Corner Plus Icons */}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 14 14"
                              fill="none"
                              style={{
                                position: 'absolute',
                                top: '-7px',
                                left: '-7px',
                                zIndex: 2,
                              }}
                            >
                              <path
                                d="M8 6H14V8H8V14H6V8H0V6H6V0H8V6Z"
                                fill="#343A45"
                              />
                            </svg>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 14 14"
                              fill="none"
                              style={{
                                position: 'absolute',
                                top: '-7px',
                                right: '-7px',
                                zIndex: 2,
                              }}
                            >
                              <path
                                d="M8 6H14V8H8V14H6V8H0V6H6V0H8V6Z"
                                fill="#343A45"
                              />
                            </svg>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 14 14"
                              fill="none"
                              style={{
                                position: 'absolute',
                                bottom: '-7px',
                                left: '-7px',
                                zIndex: 2,
                              }}
                            >
                              <path
                                d="M8 6H14V8H8V14H6V8H0V6H6V0H8V6Z"
                                fill="#343A45"
                              />
                            </svg>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 14 14"
                              fill="none"
                              style={{
                                position: 'absolute',
                                bottom: '-7px',
                                right: '-7px',
                                zIndex: 2,
                              }}
                            >
                              <path
                                d="M8 6H14V8H8V14H6V8H0V6H6V0H8V6Z"
                                fill="#343A45"
                              />
                            </svg>
                          </DesignResourceCardImage>
                          <DesignResourceCardContent
                            style={{ padding: '0 0 16px 0', gap: '4px' }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                                flex: 1,
                              }}
                            >
                              <DesignResourceCardTitle>
                                组件库设计资源
                              </DesignResourceCardTitle>
                              <DesignResourceCardDescription>
                                提供设计组件库和 Agent 设计指南
                              </DesignResourceCardDescription>
                            </div>
                          </DesignResourceCardContent>
                        </DesignResourceCard>
                      </motion.div>
                    </DesignResourcesGrid>
                  </DesignResourcesContainer>
                </motion.div>
              </motion.div>
            </MenuContent>
          </ScrollableInner>
        </MenuContentWrapper>
      </ScrollableWrapper>
    </MenuContainer>
  );
};

export default PCComponentsMenu;
