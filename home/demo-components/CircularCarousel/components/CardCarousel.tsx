import React, { useEffect, useState } from 'react';
import { motion, TargetAndTransition } from 'framer-motion';
import { getCardsByFeatureId } from './cardData';

// Animated Card Container
interface AnimatedCardProps {
  children: React.ReactNode;
  step: number;
  initialIndex: number;
  totalCards: number;
}

// Define available animation states (positions)
// These states represent different positions in the carousel
const STATES = [
  // 0: Enter (Waiting at bottom right)
  {
    x: 300,
    y: 335,
    scale: 0.9,
    opacity: 1,
    zIndex: 0,
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
  // 1: Bottom
  {
    x: 173,
    y: 242,
    scale: 0.9,
    opacity: 1,
    zIndex: 2,
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
  // 2: Center (Highlight)
  {
    x: 46,
    y: 149,
    scale: 1.0,
    opacity: 1,
    zIndex: 10,
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
  // 3: Top
  {
    x: -81,
    y: 56,
    scale: 0.9,
    opacity: 1,
    zIndex: 1,
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
  // 4: Exit (Fade out to top left)
  {
    x: -208,
    y: -37,
    scale: 0.8,
    opacity: 0,
    zIndex: 0,
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
  // 5: Hidden (Flyback to start position invisibly)
  {
    x: 300,
    y: 335,
    scale: 0.8,
    opacity: 0,
    zIndex: 0,
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
];

// Maximum number of visible states
const MAX_VISIBLE_STATES = STATES.length;

function AnimatedCard({
  children,
  step,
  initialIndex,
  totalCards,
}: AnimatedCardProps) {
  // Calculate the current position in the carousel queue
  // This ensures cards cycle through all positions regardless of total count
  const queuePosition = (initialIndex + step) % totalCards;

  // Map queue position to a visible state
  // For cards beyond visible range, use the last state (hidden)
  const stateIndex = Math.min(queuePosition, MAX_VISIBLE_STATES - 1);
  const currentState = STATES[stateIndex];

  return (
    <motion.div
      initial={false}
      animate={currentState as TargetAndTransition}
      style={{
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '375px',
        height: '240px',
      }}
    >
      <div
        style={{
          transform: 'rotate(355deg) skewX(9.851deg)',
          flexShrink: 0,
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}

// Card Carousel Component
interface CardCarouselProps {
  feature?: { id: string };
}

export function CardCarousel({ feature }: CardCarouselProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => prev + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Get cards based on feature.id
  const selectedCards = getCardsByFeatureId(feature?.id);
  const totalCards = selectedCards.length;
  const cards = [...selectedCards].map((card, i) => ({
    ...card,
    uniqueId: `${card.id}-${i}`,
  }));

  return (
    <div
      style={{
        overflow: 'hidden',
        position: 'relative',
        width: '480px',
        height: '480px',
        flexShrink: 0,
      }}
    >
      {cards.map((card, index) => (
        <AnimatedCard
          key={card.uniqueId}
          step={step}
          initialIndex={index}
          totalCards={totalCards}
        >
          {card.component}
        </AnimatedCard>
      ))}
    </div>
  );
}
