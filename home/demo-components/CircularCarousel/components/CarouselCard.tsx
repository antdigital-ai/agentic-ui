import React from 'react';
import { motion, useTransform } from 'framer-motion';
import { CardFlipContainer, CardMotionContainer, CardWrapper } from '../style';
import { ActiveCard, BacksideCardState, InactiveCard } from './cardStates';
import { CornerMarks } from './cardStates/CornerMarks';
import { FeatureItem } from './cardStates/types';

const ANGLE_STEP = 15;

interface CarouselCardProps {
  feature: FeatureItem;
  index: number;
  smoothIndex: any;
  isActive: boolean;
  onCardClick: (index: number) => void;
  themeColor: string;
}

export const CarouselCard: React.FC<CarouselCardProps> = ({
  feature,
  index,
  smoothIndex,
  isActive,
  onCardClick,
  themeColor,
}) => {
  // Calculate relative position based on the smooth index
  const relativeIndex = useTransform(smoothIndex, (v: number) => index - v);

  // Calculate rotation: index * step
  const rotate = useTransform(relativeIndex, (v) => v * ANGLE_STEP);

  // Calculate X offset: move cards apart horizontally
  const x = useTransform(relativeIndex, (v) => v * 350);

  // Calculate Y offset: drop down as they move away from center
  const y = useTransform(relativeIndex, (v) => Math.abs(v) * 60 + 56);

  const scale = useTransform(relativeIndex, (v) => {
    const dist = Math.abs(v);
    return Math.max(0.8, 1 - dist * 0.1);
  });

  const zIndex = useTransform(relativeIndex, (v) => {
    return 100 - Math.round(Math.abs(v) * 10);
  });

  return (
    <CardMotionContainer
      as={motion.div}
      style={{
        rotate,
        x,
        y,
        opacity: 1,
        scale,
        zIndex,
        transformOrigin: '50% 1500px',
      }}
      onClick={(e) => {
        // 如果点击的是按钮或其他交互元素，不阻止事件
        const target = e.target as HTMLElement;
        if (
          target.closest('button') ||
          target.closest('a') ||
          target.closest('[role="button"]')
        ) {
          return;
        }
        if (!isActive) {
          e.stopPropagation();
          onCardClick(index);
        }
      }}
    >
      {/* 3D Perspective Container */}
      <CardWrapper $isActive={isActive}>
        {/* Flipping Container */}
        <CardFlipContainer
          $isActive={isActive}
          style={{}}
        >
          {/* Corner Plus Marks - Now inside flip container to flip with card */}
          <CornerMarks />

          {/* Front Face - Render different state based on isActive */}
          {isActive ? (
            <ActiveCard
              feature={feature}
              index={index}
              smoothIndex={smoothIndex}
              themeColor={themeColor}
            />
          ) : (
            <InactiveCard feature={feature} themeColor={themeColor} />
          )}

          {/* Back Face */}
          <BacksideCardState feature={feature} themeColor={themeColor} />
        </CardFlipContainer>
      </CardWrapper>
    </CardMotionContainer>
  );
};
