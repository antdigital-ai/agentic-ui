import React from 'react';
import { DefaultInactiveCard } from './inactiveCard/DefaultInactiveCard';
import { IntroInactiveCard } from './inactiveCard/IntroInactiveCard';
import { FeatureItem } from './types';

interface InactiveCardProps {
  feature: FeatureItem;
  themeColor: string;
}

export const InactiveCard: React.FC<InactiveCardProps> = ({
  feature,
  themeColor,
}) => {
  // Special handling for intro card
  if (feature.id === 'intro') {
    return <IntroInactiveCard feature={feature} themeColor={themeColor} />;
  }

  // Default content component
  return <DefaultInactiveCard feature={feature} themeColor={themeColor} />;
};
