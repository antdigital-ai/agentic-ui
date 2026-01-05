import React from 'react';
import { DefaultBacksideCard } from './backsideCard/DefaultBacksideCard';
import { IntroBacksideCard } from './backsideCard/IntroBacksideCard';
import { FeatureItem } from './types';

interface BacksideCardStateProps {
  feature: FeatureItem;
  themeColor: string;
}

export const BacksideCardState: React.FC<BacksideCardStateProps> = ({
  feature,
  themeColor,
}) => {
  // Special handling for intro card
  if (feature.id === 'intro') {
    return <IntroBacksideCard feature={feature} themeColor={themeColor} />;
  }

  // Default content component
  return <DefaultBacksideCard feature={feature} themeColor={themeColor} />;
};
