import { motion } from 'framer-motion';
import React from 'react';
import componentsBg from '../../../assets/component-mobile-bg.png';
import {
  DESIGN_RESOURCE_MOBILE_URL,
  MOBILE_COMPONENT_LIBRARY_URL,
} from '../../../constants/links';
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
    'M7.99967 6.66675C7.99967 6.29856 7.7012 6.00008 7.33301 6.00008H3.33301C2.96482 6.00008 2.66634 6.29856 2.66634 6.66675V13.3334C2.66634 13.7016 2.96482 14.0001 3.33301 14.0001H7.33301C7.7012 14.0001 7.99967 13.7016 7.99967 13.3334V6.66675ZM13.333 13.3334V2.66675C13.333 2.48994 13.2627 2.32042 13.1377 2.19539C13.0127 2.07037 12.8432 2.00008 12.6663 2.00008H4.66634C4.48953 2.00008 4.32001 2.07037 4.19499 2.19539C4.06996 2.32042 3.99967 2.48994 3.99967 2.66675C3.99967 3.03494 3.7012 3.33341 3.33301 3.33341C2.96482 3.33341 2.66634 3.03494 2.66634 2.66675C2.66634 2.13632 2.87721 1.62776 3.25228 1.25269C3.62735 0.877613 4.13591 0.666748 4.66634 0.666748H12.6663C13.1968 0.666748 13.7053 0.877613 14.0804 1.25269C14.4555 1.62776 14.6663 2.13631 14.6663 2.66675V13.3334C14.6663 13.8638 14.4555 14.3724 14.0804 14.7475C13.7053 15.1226 13.1968 15.3334 12.6663 15.3334H11.0664C10.6982 15.3334 10.3997 15.0349 10.3997 14.6667C10.3997 14.2986 10.6982 14.0001 11.0664 14.0001H12.6663C12.8432 14.0001 13.0127 13.9298 13.1377 13.8048C13.2627 13.6797 13.333 13.5102 13.333 13.3334ZM5.33952 11.3334C5.70771 11.3334 6.00618 11.6319 6.00618 12.0001C6.00618 12.3683 5.70771 12.6667 5.33952 12.6667H5.33301C4.96482 12.6667 4.66634 12.3683 4.66634 12.0001C4.66634 11.6319 4.96482 11.3334 5.33301 11.3334H5.33952ZM9.33301 13.3334C9.33301 14.438 8.43758 15.3334 7.33301 15.3334H3.33301C2.22844 15.3334 1.33301 14.438 1.33301 13.3334V6.66675C1.33301 5.56218 2.22844 4.66675 3.33301 4.66675H7.33301C8.43758 4.66675 9.33301 5.56218 9.33301 6.66675V13.3334Z',
  swatchBookIcon:
    'M13.333 9.99992C13.333 9.82311 13.2627 9.65359 13.1377 9.52856C13.0127 9.40354 12.8432 9.33325 12.6663 9.33325H11.3893L7.40755 13.3333H12.6663C12.8432 13.3333 13.0127 13.263 13.1377 13.1379C13.2627 13.0129 13.333 12.8434 13.333 12.6666V9.99992ZM4.67285 10.6666C5.04104 10.6666 5.33952 10.9651 5.33952 11.3333C5.33952 11.7014 5.04104 11.9999 4.67285 11.9999H4.66634C4.29815 11.9999 3.99967 11.7014 3.99967 11.3333C3.99967 10.9651 4.29815 10.6666 4.66634 10.6666H4.67285ZM10.0007 3.99601C9.87768 3.99588 9.75585 4.01989 9.64225 4.06698C9.52861 4.11408 9.42538 4.18329 9.33854 4.27043L9.33789 4.2714L7.99967 5.60929V10.8486L11.9447 6.88566L11.9476 6.88241C12.0359 6.7948 12.1059 6.69046 12.1533 6.57544C12.2007 6.46046 12.2249 6.33718 12.224 6.21281C12.223 6.08839 12.1969 5.96514 12.1478 5.85083C12.0986 5.73659 12.0271 5.63334 11.9375 5.54712L10.6624 4.27205C10.5758 4.18471 10.4726 4.11533 10.359 4.06795C10.2455 4.02059 10.1237 3.99616 10.0007 3.99601ZM6.66634 3.33325C6.66634 3.15644 6.59605 2.98692 6.47103 2.8619C6.3616 2.75247 6.2181 2.68497 6.06543 2.66984L5.99967 2.66659H3.33301C3.1562 2.66659 2.98668 2.73687 2.86165 2.8619C2.73663 2.98692 2.66634 3.15644 2.66634 3.33325V11.3333C2.66634 11.8637 2.87721 12.3722 3.25228 12.7473C3.62735 13.1224 4.13591 13.3333 4.66634 13.3333C5.19677 13.3333 5.70533 13.1224 6.0804 12.7473C6.45548 12.3722 6.66634 11.8637 6.66634 11.3333V3.33325ZM7.99967 3.72355L8.39486 3.32837C8.60553 3.11718 8.85595 2.94979 9.13151 2.83553C9.40749 2.72112 9.70352 2.66234 10.0023 2.66268C10.3011 2.66303 10.597 2.72242 10.8727 2.83748C11.1476 2.95221 11.3971 3.12007 11.6071 3.3313L12.862 4.58618L12.9414 4.66658C13.1222 4.85875 13.2682 5.08124 13.3727 5.32414C13.4921 5.60168 13.5547 5.90028 13.557 6.20239C13.5593 6.50453 13.5012 6.80423 13.3861 7.08358C13.2715 7.36153 13.1024 7.61367 12.8893 7.82576L12.8896 7.82609L12.7152 8.00089C13.2279 8.01341 13.7169 8.22231 14.0804 8.58586C14.4555 8.96093 14.6663 9.46948 14.6663 9.99992V12.6666C14.6663 13.197 14.4555 13.7056 14.0804 14.0806C13.7053 14.4557 13.1968 14.6666 12.6663 14.6666H4.66634C3.78229 14.6666 2.93437 14.3155 2.30924 13.6903C1.68412 13.0652 1.33301 12.2173 1.33301 11.3333V3.33325C1.33301 2.80282 1.54387 2.29426 1.91895 1.91919C2.29402 1.54412 2.80257 1.33325 3.33301 1.33325H5.99967C6.53011 1.33325 7.03866 1.54412 7.41374 1.91919C7.78881 2.29426 7.99967 2.80282 7.99967 3.33325V3.72355Z',
  decorativePatternTopLeft: 'M12 10H18V12H12V18H10V12H4V10H10V4H12V10Z',
  decorativePatternTopRight:
    'M347 10H353V12H347V18H345V12H339V10H345V4H347V10Z',
  decorativePatternBottomLeft:
    'M12 199H18V201H12V207H10V201H4V199H10V193H12V199Z',
  decorativePatternBottomRight:
    'M347 199H353V201H347V207H345V201H339V199H345V193H347V199Z',
};

const MobileComponentsMenu: React.FC = () => {
  return (
    <MenuContainer>
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
                  alignItems: 'flex-start',
                  width: '100%',
                  position: 'relative',
                }}
              >
                {/* 左侧导航区域 */}
                <motion.div variants={itemVariants}>
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
                        Mobile
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
                          onClick={(e) => {
                            e.preventDefault();
                            window.open(MOBILE_COMPONENT_LIBRARY_URL, '_blank');
                          }}
                        >
                          <NavItemTitle>组件 Components</NavItemTitle>
                          <NavItemDescription>
                            提供组件和开发接入指南
                          </NavItemDescription>
                        </NavItem>
                      </motion.div>
                    </div>
                  </NavSection>
                </motion.div>
                <VerticalDivider />

                {/* 右侧设计资源区域 */}
                <motion.div variants={itemVariants}>
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
                      {/* 组件库设计资源卡片 */}
                      <motion.div
                        variants={itemVariants}
                        style={{ width: '336px' }}
                      >
                        <DesignResourceCard
                          onClick={(e) => {
                            e.preventDefault();
                            window.open(DESIGN_RESOURCE_MOBILE_URL, '_blank');
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
                                Mobile 组件库设计资源
                              </DesignResourceCardTitle>
                              <DesignResourceCardDescription>
                                提供设计组件库和设计指南
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

export default MobileComponentsMenu;
