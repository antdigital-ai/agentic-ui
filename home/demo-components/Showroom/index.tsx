import React, { useState } from 'react';
import showroomImage1 from './assets/showroom-1.png';
import showroomImage2 from './assets/showroom-2.png';
import showroomImage3 from './assets/showroom-3.png';
import showroomImage4 from './assets/showroom-4.png';
import showroomImage5 from './assets/showroom-5.png';
import {
  CarouselCard,
  CarouselContainer,
  ComingSoonText,
  ComingSoonTitle,
  Container,
  CornerBracket,
  DiamondIcon,
  SectionWrapper,
  ShowroomCard,
  ShowroomCardImage,
  ShowroomSubtitle,
  ShowroomTitle,
  ShowroomTitleHighlight,
} from './style';

const showroomImages = [
  showroomImage1,
  showroomImage2,
  showroomImage3,
  showroomImage4,
  showroomImage5,
];

// 根据设计稿的精确尺寸
const CARD_WIDTH = 506; // 激活卡片宽度
const CARD_GAP = 80; // 卡片之间的间距
const ACTIVE_SCALE = 1; // 激活卡片缩放
const INACTIVE_SCALE = 0.75; // 非激活卡片缩放
const ANIMATION_DURATION = 600; // 动画持续时间（毫秒）

const Showroom: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(2); // 默认中间卡片激活
  const [isAnimating, setIsAnimating] = useState(false);

  const handleCardClick = (index: number) => {
    if (index === activeIndex || isAnimating) {
      return;
    }

    setIsAnimating(true);
    setActiveIndex(index);

    // 动画结束后重置状态
    setTimeout(() => {
      setIsAnimating(false);
    }, ANIMATION_DURATION);
  };

  return (
    <SectionWrapper>
      <Container>
        {/* Diamond Icon */}
        <DiamondIcon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="25"
            viewBox="0 0 25 25"
            fill="none"
          >
            <path
              d="M0.00195312 12.1406C2.46307 13.7967 4.7351 15.6364 6.81804 17.6599C8.90099 19.6833 10.7949 21.8904 12.4996 24.2812C14.2044 21.8904 16.0983 19.6833 18.1812 17.6599C20.2642 15.6364 22.5362 13.7967 24.9973 12.1406C22.5362 10.4845 20.2642 8.64478 18.1812 6.62134C16.0983 4.59791 14.2044 2.3908 12.4996 0C10.7949 2.3908 8.90099 4.59791 6.81804 6.62134C4.7351 8.64478 2.46307 10.4845 0.00195312 12.1406Z"
              fill="#3066FD"
            />
          </svg>
        </DiamondIcon>

        {/* Subtitle */}
        <ShowroomSubtitle>快速开始你的设计</ShowroomSubtitle>

        {/* Title */}
        <ShowroomTitle>
          行业设计<ShowroomTitleHighlight>样板间</ShowroomTitleHighlight>
        </ShowroomTitle>

        {/* Carousel */}
        <CarouselContainer>
          {/* 固定的四个角标 - 始终显示在中心位置 */}
          <CornerBracket $position="top-left">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="26"
              viewBox="0 0 25 26"
              fill="none"
            >
              <path
                d="M1 1V0H0V1H1ZM0 25V26H2V25H1H0ZM1 1V2H25V1V0H1V1ZM1 25H2V1H1H0V25H1Z"
                fill="white"
              />
            </svg>
          </CornerBracket>
          <CornerBracket $position="top-right">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="25"
              viewBox="0 0 26 25"
              fill="none"
            >
              <path
                d="M25 1L26 1L26 4.37114e-08L25 0L25 1ZM1 -1.04907e-06L4.37114e-08 -1.09278e-06L-4.37114e-08 2L1 2L1 0.999999L1 -1.04907e-06ZM25 1L24 1L24 25L25 25L26 25L26 1L25 1ZM1 0.999999L1 2L25 2L25 1L25 0L1 -1.04907e-06L1 0.999999Z"
                fill="white"
              />
            </svg>
          </CornerBracket>
          <CornerBracket $position="bottom-left">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="26"
              viewBox="0 0 25 26"
              fill="none"
            >
              <path
                d="M1 25V26H0V25H1ZM0 1V0H2V1H1H0ZM1 25V24H25V25V26H1V25ZM1 1H2V25H1H0V1H1Z"
                fill="white"
              />
            </svg>
          </CornerBracket>
          <CornerBracket $position="bottom-right">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 26 26"
              fill="none"
            >
              <path
                d="M25 1L25 25L1 25"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="square"
              />
            </svg>
          </CornerBracket>

          {/* 卡片列表 */}
          {showroomImages.map((image, index) => {
            const isActive = index === activeIndex;
            const relativeIndex = index - activeIndex;

            // 计算 X 偏移：居中显示，其他卡片水平排列
            // 考虑激活卡片和非激活卡片的宽度差异
            // 激活卡片宽度：506px，非激活卡片宽度：506px * 0.75 = 379.5px
            // 相邻卡片中心间距 = 前一个卡片宽度/2 + CARD_GAP + 后一个卡片宽度/2
            const getSpacing = (fromIndex: number, toIndex: number) => {
              const fromScale =
                fromIndex === activeIndex ? ACTIVE_SCALE : INACTIVE_SCALE;
              const toScale =
                toIndex === activeIndex ? ACTIVE_SCALE : INACTIVE_SCALE;
              const fromWidth = CARD_WIDTH * fromScale;
              const toWidth = CARD_WIDTH * toScale;
              return fromWidth / 2 + CARD_GAP + toWidth / 2;
            };

            // 计算到中心位置的总距离
            let totalSpacing = 0;
            if (relativeIndex > 0) {
              // 向右计算
              for (let i = 0; i < relativeIndex; i++) {
                totalSpacing += getSpacing(
                  activeIndex + i,
                  activeIndex + i + 1,
                );
              }
            } else if (relativeIndex < 0) {
              // 向左计算
              for (let i = 0; i > relativeIndex; i--) {
                totalSpacing -= getSpacing(
                  activeIndex + i - 1,
                  activeIndex + i,
                );
              }
            }

            const left = `calc(50% + ${totalSpacing}px)`;
            const translateX = '-50%'; // 居中定位

            // 根据设计稿调整缩放和透明度
            const distance = Math.abs(relativeIndex);
            const scale = isActive ? ACTIVE_SCALE : INACTIVE_SCALE;
            const opacity = isActive
              ? 1
              : Math.max(0.5, 0.65 - distance * 0.08);

            return (
              <CarouselCard
                key={index}
                $isActive={isActive}
                $isAnimating={isAnimating}
                onClick={() => handleCardClick(index)}
                style={{
                  left,
                  transform: `translateX(${translateX}) scale(${scale})`,
                  zIndex: isActive ? 10 : 5 - distance,
                  opacity,
                  transition: isAnimating
                    ? `all ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`
                    : 'none',
                }}
              >
                <ShowroomCard $isActive={isActive}>
                  <ShowroomCardImage
                    src={image}
                    alt={`Showroom ${index + 1}`}
                  />
                </ShowroomCard>
              </CarouselCard>
            );
          })}
        </CarouselContainer>

        {/* Coming Soon */}
        <ComingSoonTitle>敬请期待</ComingSoonTitle>
        <ComingSoonText>即将到来</ComingSoonText>
      </Container>
    </SectionWrapper>
  );
};

export default Showroom;
