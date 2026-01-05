import React from 'react';
import { DefaultActiveCard } from './activeCard/DefaultActiveCard';
import { IntroActiveCard } from './activeCard/IntroActiveCard';
import { FeatureItem } from './types';

interface ActiveCardProps {
  feature: FeatureItem;
  index: number;
  smoothIndex: any;
  themeColor: string;
}

export const ActiveCard: React.FC<ActiveCardProps> = ({
  feature,
  index,
  smoothIndex,
  themeColor,
}) => {
  // Special handling for intro card
  if (feature.id === 'intro') {
    return (
      <IntroActiveCard
        feature={feature}
        index={index}
        smoothIndex={smoothIndex}
        themeColor={themeColor}
      />
    );
  }

  // Default content component
  return (
    <DefaultActiveCard
      feature={feature}
      index={index}
      smoothIndex={smoothIndex}
      themeColor={themeColor}
    />
  );
};
