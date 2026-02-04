import componentsBg from '../../../assets/component-icon.png';
import { DESIGN_RESOURCE_PC_URL, ICON_LIBRARY_URL } from '../../../constants/links';
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
    'M13.3333 4.33341C13.3333 4.29717 13.3189 4.26236 13.2933 4.23673L11.7627 2.70613C11.7371 2.6806 11.7025 2.66613 11.6663 2.66609H11.666C11.6299 2.66613 11.5952 2.6806 11.5697 2.70613L8.03906 6.23673C8.01344 6.26236 7.99903 6.29717 7.99902 6.33341C7.99902 6.36965 8.01344 6.40446 8.03906 6.43009L9.56966 7.96069C9.59528 7.98626 9.63013 8.00073 9.66634 8.00073C9.70249 8.00068 9.73711 7.98623 9.76269 7.96069L13.2933 4.43009C13.3189 4.40446 13.3333 4.36965 13.3333 4.33341ZM11.5387 8.07006C12.3022 9.17908 12.9015 10.3937 13.3171 11.6765L13.3311 11.7152C13.4071 11.9035 13.5599 11.9919 13.6634 12.0056C13.6883 12.0089 13.7057 12.0073 13.7158 12.0053C13.7254 12.0034 13.7289 12.0012 13.7292 12.0011C13.7295 12.0008 13.7303 12.0003 13.7314 11.9991C13.7326 11.9979 13.7351 11.9951 13.7386 11.99C13.7453 11.9801 13.7592 11.9558 13.7708 11.9086C14.027 10.8651 14.0702 9.78046 13.8981 8.7198C13.7694 7.92687 13.522 7.1595 13.166 6.44278L11.5387 8.07006ZM7.2959 2.10489C6.23083 1.92997 5.14135 1.97238 4.0931 2.22957H4.09245C4.04534 2.2411 4.02127 2.2551 4.01139 2.26179C4.00623 2.2653 4.00345 2.26776 4.00228 2.26895C4.00111 2.27014 4.00055 2.27089 4.00033 2.27123C3.99998 2.27176 3.9979 2.27526 3.99609 2.28425C3.99407 2.29432 3.99249 2.31181 3.99577 2.33666C4.00941 2.43979 4.09743 2.5919 4.28516 2.66772L4.32422 2.68172L4.32454 2.68204C5.60683 3.09771 6.82111 3.69676 7.92969 4.46004L9.55599 2.83373C8.84439 2.48052 8.08292 2.23415 7.2959 2.10489ZM1.9974 13.2537C1.99746 13.4519 2.07624 13.6421 2.21647 13.7823C2.35673 13.9225 2.54712 14.0011 2.74544 14.0011C2.8436 14.001 2.9409 13.9817 3.03158 13.9441C3.12223 13.9065 3.2047 13.8514 3.27409 13.782L8.38965 8.66642L7.33236 7.60912L2.21615 12.725C2.07607 12.8652 1.99736 13.0554 1.9974 13.2537ZM14.6667 4.33341C14.6667 4.69892 14.5306 5.0504 14.2865 5.32006L14.2363 5.3728L14.1527 5.45613C14.6803 6.40239 15.0402 7.4343 15.2142 8.50626C15.4024 9.66632 15.3699 10.8508 15.1188 11.9975L15.0658 12.2263C14.9731 12.6039 14.7644 12.9185 14.4554 13.1192C14.1529 13.3157 13.806 13.3696 13.4883 13.3275C12.8622 13.2447 12.2751 12.7854 12.0488 12.0876H12.0485C11.6969 11.0022 11.1999 9.97066 10.5719 9.02091C10.3147 9.22233 9.99645 9.33402 9.66634 9.33406C9.64747 9.33406 9.62849 9.33315 9.6097 9.33243L4.2168 14.725C4.02366 14.9182 3.79432 15.0713 3.54199 15.1759C3.28952 15.2805 3.01874 15.3343 2.74544 15.3344C2.19353 15.3345 1.66409 15.1155 1.27376 14.7253C0.883413 14.3351 0.664154 13.8056 0.664063 13.2537C0.664 12.7017 0.883243 12.1723 1.27344 11.782L6.66667 6.38907C6.66597 6.37056 6.66569 6.352 6.66569 6.33341C6.66569 6.00315 6.77695 5.6845 6.97852 5.42716C6.02918 4.79929 4.99835 4.30196 3.91341 3.95027V3.94994C3.21554 3.724 2.75649 3.13718 2.67383 2.51114C2.6319 2.1935 2.68591 1.84668 2.88249 1.54435C3.08326 1.23567 3.39792 1.02742 3.77539 0.93497V0.934645C4.99835 0.63459 6.26946 0.585063 7.51204 0.789137C8.57722 0.964085 9.60244 1.32256 10.543 1.84675L10.6266 1.76342H10.627C10.9026 1.4878 11.2765 1.33276 11.6663 1.33276C12.0561 1.3328 12.4298 1.48784 12.7054 1.76342H12.7057L14.2363 3.29402L14.2865 3.34675C14.5306 3.61641 14.6667 3.9679 14.6667 4.33341Z',
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

const IconDropMenu: React.FC = () => {
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
                        icon
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
                            window.open(ICON_LIBRARY_URL, '_blank');
                          }}
                        >
                          <NavItemTitle>图标库 Icon library</NavItemTitle>
                          <NavItemDescription>图标库引用</NavItemDescription>
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
                            window.open(DESIGN_RESOURCE_PC_URL, '_blank');
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
                                图标设计资源
                              </DesignResourceCardTitle>
                              <DesignResourceCardDescription>
                                图标设计规范和资源
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

export default IconDropMenu;
