import { motion } from 'framer-motion';
import React from 'react';
import designStrategyIcon from '../../../../../assets/design-strategy-icon-white.png';
import { Rotate3DIcon } from '../../Rotate3DIcon';
import { FeatureItem, FEATURES } from '../types';
import * as CardStyles from './introActiveCardStyle';
import { MakeCanvasRevealEffect } from './make-canvas-reveal-effect';
import { CardFront } from './style';

interface IntroActiveCardProps {
  feature: FeatureItem;
  index: number;
  smoothIndex: any;
  themeColor: string;
}

export const IntroActiveCard: React.FC<IntroActiveCardProps> = ({
  feature,
  themeColor,
  index: _index, // eslint-disable-line @typescript-eslint/no-unused-vars
  smoothIndex: _smoothIndex, // eslint-disable-line @typescript-eslint/no-unused-vars
}) => {
  // Get other features (excluding intro)
  const otherFeatures = FEATURES.filter((f) => f.id !== 'intro');

  // 将 themeColor 从 "r, g, b" 格式转换为 [[r, g, b]] 数组格式
  const colors = React.useMemo(() => {
    const rgb = themeColor.split(',').map((c) => parseInt(c.trim()));
    return [rgb];
  }, [themeColor]);

  return (
    <CardFront
      $isActive={true}
      $bgImage={undefined}
      style={{
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        width: '100%',
      }}
    >
      {/* Background Animation - 最底层，覆盖整个卡片 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <MakeCanvasRevealEffect
          animationSpeed={1}
          colors={colors}
          dotSize={1}
          containerClassName="h-full w-full bg-transparent"
        />
      </div>

      {/* Content Layer - 在上方 */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top Section */}
        <motion.div
          key="top-active"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.2 }}
          style={CardStyles.topSection}
        >
          <div style={CardStyles.topSectionLeft}>
            <img
              src={designStrategyIcon}
              alt="design-strategy"
              style={CardStyles.dashedIcon}
            />
            <span style={CardStyles.topSectionLabel(true)}>设计原则</span>
          </div>
          <Rotate3DIcon size={24} color="white" />
        </motion.div>

        {/* Title Section */}
        <motion.div
          key="title-active"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={CardStyles.titleSection}
        >
          <div style={CardStyles.titleContainer()}>
            {Array.isArray(feature.title) ? (
              feature.title.map((line, index) => (
                <div key={index} style={CardStyles.titleText(true)}>
                  {line}
                </div>
              ))
            ) : (
              <div style={CardStyles.titleText(true)}>{feature.title}</div>
            )}
          </div>
          <p style={CardStyles.descriptionText(true)}>{feature.description}</p>
        </motion.div>

        {/* Bottom Section - Vertically Centered */}
        <motion.div
          key="bottom-active"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
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
            <img
              src={designStrategyIcon}
              alt="design-strategy"
              style={CardStyles.dashedIcon}
            />
            <span style={CardStyles.bottomSectionLabel(true)}>设计策略</span>
          </div>

          <div
            style={{
              ...CardStyles.metricsList,
              justifyContent: 'center',
            }}
          >
            {otherFeatures.map((f) => (
              <div key={f.id} style={CardStyles.metricItem}>
                <span style={CardStyles.metricText(true)}>
                  {Array.isArray(f.title) ? f.title.join(' ') : f.title}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </CardFront>
  );
};
