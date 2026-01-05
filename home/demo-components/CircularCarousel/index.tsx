import React, { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue } from 'framer-motion';
import { CarouselCard } from './components/CarouselCard';
import { CarouselWheel } from './components/CarouselWheel';
import { FEATURES } from './data';
import {
  ActiveIndicatorWrapper,
  BackgroundGradient,
  CarouselContainer,
  CarouselWheelContainer,
  NavButton,
  NavigationMenu,
  StickyContainer,
} from './style';

// Helper to get color for the active state
const getFeatureColor = (id: string) => {
  switch (id) {
    case 'intro':
      return '40, 118, 255'; // 偏蓝色
    case '01':
      return '91, 59, 159';
    case '02':
      return '0, 130, 133';
    case '03':
      return '0, 179, 0';
    case '04':
      return '0, 92, 157';
    case '05':
      return '204, 153, 0';
    default:
      return '255, 255, 255';
  }
};

const CircularCarousel: React.FC<{
  onTabChange?: (id: string) => void;
}> = ({ onTabChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Motion value for the current index - used for smooth transitions
  const smoothIndex = useMotionValue(0);

  // Animate the smoothIndex whenever activeIndex changes
  useEffect(() => {
    const controls = animate(smoothIndex, activeIndex, {
      type: 'spring',
      stiffness: 200,
      damping: 30,
    });
    return controls.stop;
  }, [activeIndex, smoothIndex]);

  const handleMenuClick = (index: number) => {
    setActiveIndex(index);
    if (onTabChange) {
      onTabChange(FEATURES[index].id);
    }
  };

  return (
    <CarouselContainer ref={containerRef}>
      <StickyContainer>
        {/* Navigation Menu */}
        <NavigationMenu>
          {FEATURES.map((feature, idx) => {
            const isActive = idx === activeIndex;
            return (
              <NavButton
                key={feature.id}
                onClick={() => handleMenuClick(idx)}
                $isActive={isActive}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-cursor"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      margin: '-4px',
                      borderRadius: '8px',
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 30,
                    }}
                  >
                    <ActiveIndicatorWrapper>
                      {/* Top Left */}
                      <svg
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '8px',
                          height: '8px',
                          color: '#14161C',
                        }}
                        viewBox="0 0 10 10"
                        fill="none"
                      >
                        <path
                          d="M1 9V1H9"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="square"
                        />
                      </svg>
                      {/* Top Right */}
                      <svg
                        style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: '8px',
                          height: '8px',
                          color: '#14161C',
                        }}
                        viewBox="0 0 10 10"
                        fill="none"
                      >
                        <path
                          d="M9 9V1H1"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="square"
                        />
                      </svg>
                      {/* Bottom Left */}
                      <svg
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          width: '8px',
                          height: '8px',
                          color: '#14161C',
                        }}
                        viewBox="0 0 10 10"
                        fill="none"
                      >
                        <path
                          d="M1 1V9H9"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="square"
                        />
                      </svg>
                      {/* Bottom Right */}
                      <svg
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: '8px',
                          height: '8px',
                          color: '#14161C',
                        }}
                        viewBox="0 0 10 10"
                        fill="none"
                      >
                        <path
                          d="M9 1V9H1"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="square"
                        />
                      </svg>
                    </ActiveIndicatorWrapper>
                  </motion.div>
                )}
                <span style={{ position: 'relative', zIndex: 10 }}>
                  {feature.label}
                </span>
              </NavButton>
            );
          })}
        </NavigationMenu>

        {/* Carousel Wheel */}
        <CarouselWheelContainer>
          <CarouselWheel smoothIndex={smoothIndex} />
          {FEATURES.map((feature, index) => (
            <CarouselCard
              key={feature.id}
              feature={feature}
              index={index}
              smoothIndex={smoothIndex}
              isActive={index === activeIndex}
              onCardClick={handleMenuClick}
              themeColor={getFeatureColor(feature.id)}
            />
          ))}
        </CarouselWheelContainer>

        {/* Background Radial Gradient */}
        <BackgroundGradient />
      </StickyContainer>
    </CarouselContainer>
  );
};

export default CircularCarousel;
