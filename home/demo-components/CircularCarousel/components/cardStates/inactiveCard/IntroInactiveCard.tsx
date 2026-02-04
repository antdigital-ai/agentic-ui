import React from 'react';
import { getGradientSvg } from '../../BacksideCard';
import { Rotate3DIcon } from '../../Rotate3DIcon';
import { FeatureItem, FEATURES } from '../types';
import * as CardStyles from './introInactiveCardStyle';
import { CardFront } from './style';

interface IntroInactiveCardProps {
  feature: FeatureItem;
  themeColor: string;
}

export const IntroInactiveCard: React.FC<IntroInactiveCardProps> = ({
  feature,
  themeColor,
}) => {
  const bgImage = getGradientSvg(themeColor);
  // Get other features (excluding intro)
  const otherFeatures = FEATURES.filter((f) => f.id !== 'intro');

  return (
    <CardFront $isActive={false} $bgImage={bgImage} $themeColor={themeColor}>
      {/* Top Section */}
      <div style={CardStyles.topSection}>
        <div style={CardStyles.topSectionLeft}>
          <div style={CardStyles.dashedIcon} />
          <span style={CardStyles.topSectionLabel(false)}>设计策略</span>
        </div>
        <Rotate3DIcon size={24} color="rgba(80, 92, 113, 0.35)" />
      </div>

      {/* Title Section */}
      <div style={CardStyles.titleSection}>
        <div style={CardStyles.titleContainer()}>
          {Array.isArray(feature.title) ? (
            feature.title.map((line, index) => (
              <div key={index} style={CardStyles.titleText(false)}>
                {line}
              </div>
            ))
          ) : (
            <div style={CardStyles.titleText(false)}>{feature.title}</div>
          )}
        </div>
        <p style={CardStyles.descriptionText(false)}>{feature.description}</p>
      </div>

      {/* Bottom Section - Vertically Centered */}
      <div
        style={{
          ...CardStyles.bottomSection,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flex: 1,
          marginTop: 0,
        }}
      >
        <div style={CardStyles.bottomSectionHeader}>
          <div style={CardStyles.dashedIcon} />
          <span style={CardStyles.bottomSectionLabel(false)}>设计策略</span>
        </div>

        <div
          style={{
            ...CardStyles.metricsList,
            justifyContent: 'center',
          }}
        >
          {otherFeatures.map((f) => (
            <div key={f.id} style={CardStyles.metricItem}>
              <span style={CardStyles.metricText(false)}>
                {Array.isArray(f.title) ? f.title.join(' ') : f.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </CardFront>
  );
};
