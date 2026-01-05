import React from 'react';
import { BacksideCard } from '../../BacksideCard';
import { FeatureItem } from '../types';
import { CardBack } from './style';

interface DefaultBacksideCardProps {
  feature: FeatureItem;
  themeColor: string;
}

export const DefaultBacksideCard: React.FC<DefaultBacksideCardProps> = ({
  feature,
  themeColor,
}) => {
  return (
    <CardBack $borderColor={themeColor}>
      <BacksideCard feature={feature} color={themeColor} />
    </CardBack>
  );
};
