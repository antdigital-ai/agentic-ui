import React from 'react';
import { motion } from 'framer-motion';
import { getGradientSvg } from '../../BacksideCard';
import { CheckCircleIcon } from '../../CheckCircleIcon';
import { FolderStackIcon } from '../../FolderStackIcon';
import { Rotate3DIcon } from '../../Rotate3DIcon';
import { FeatureItem } from '../types';
import * as CardStyles from './defaultInactiveCardStyle';
import diamondsIcon from './icons/diamonds.svg';
import folderClosureIcon from './icons/folderClosure.svg';
import oralsIcon from './icons/orals.svg';
import shapeComineIcon from './icons/shapeComine.svg';
import { CardFront } from './style';

interface DefaultInactiveCardProps {
  feature: FeatureItem;
  themeColor: string;
}

// Icon mapping based on feature.id
const getIconForFeature = (featureId: string) => {
  switch (featureId) {
    case '01':
      return <FolderStackIcon />;
    case '02':
      return (
        <img
          src={shapeComineIcon}
          alt="shapeCombine"
          style={{ width: '121px', height: '78px' }}
        />
      );
    case '03':
      return (
        <img
          src={folderClosureIcon}
          alt="folderClosure"
          style={{ width: '82px', height: '77px' }}
        />
      );
    case '04':
      return (
        <img
          src={diamondsIcon}
          alt="diamonds"
          style={{ width: '80px', height: '87px' }}
        />
      );
    case '05':
      return (
        <img
          src={oralsIcon}
          alt="orals"
          style={{ width: '117px', height: '82px' }}
        />
      );
    default:
      return <FolderStackIcon />;
  }
};

export const DefaultInactiveCard: React.FC<DefaultInactiveCardProps> = ({
  feature,
  themeColor,
}) => {
  const bgImage = getGradientSvg(themeColor);

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

      {/* Middle/Spacer Section - Icon centered in remaining space */}
      <div style={CardStyles.middleSection}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          style={{ opacity: 0.8 }}
        >
          {getIconForFeature(feature.id)}
        </motion.div>
      </div>

      {/* Bottom Section (Metrics) */}
      <div style={CardStyles.bottomSection}>
        <div style={CardStyles.bottomSectionHeader}>
          <div style={CardStyles.dashedIcon} />
          <span style={CardStyles.bottomSectionLabel(false)}>评估指标</span>
        </div>

        <div style={CardStyles.metricsList}>
          {feature.subFeatures.map((sub, i) => (
            <div key={i} style={CardStyles.metricItem}>
              <CheckCircleIcon size={22} color="#343A45" strokeColor="white" />
              <span style={CardStyles.metricText(false)}>{sub}</span>
            </div>
          ))}
        </div>
      </div>
    </CardFront>
  );
};
