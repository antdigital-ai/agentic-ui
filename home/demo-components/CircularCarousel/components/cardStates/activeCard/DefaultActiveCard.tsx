import designStrategyIcon from '../../../../../assets/design-strategy-icon-white.png';
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon } from '../../CheckCircleIcon';
import { Rotate3DIcon } from '../../Rotate3DIcon';
import { FeatureItem } from '../types';
import * as CardStyles from './defaultActiveCardStyle';
import { MakeCanvasRevealEffect } from './make-canvas-reveal-effect';
import { CardFront } from './style';

interface DefaultActiveCardProps {
  feature: FeatureItem;
  index: number;
  smoothIndex: any;
  themeColor: string;
}

export const DefaultActiveCard: React.FC<DefaultActiveCardProps> = ({
  feature,
  themeColor,
  index: _index, // eslint-disable-line @typescript-eslint/no-unused-vars
  smoothIndex: _smoothIndex, // eslint-disable-line @typescript-eslint/no-unused-vars
}) => {
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
            <span style={CardStyles.topSectionLabel(true)}>设计策略</span>
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

        {/* Middle/Spacer Section */}
        <div style={CardStyles.middleSection} />

        {/* Bottom Section (Metrics) */}
        <motion.div
          key="bottom-active"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={CardStyles.bottomSection}
        >
          <div style={CardStyles.bottomSectionHeader}>
            <img
              src={designStrategyIcon}
              alt="design-strategy"
              style={CardStyles.dashedIcon}
            />
            <span style={CardStyles.bottomSectionLabel(true)}>评估指标</span>
          </div>

          <div style={CardStyles.metricsList}>
            {feature.subFeatures.map((sub, i) => (
              <div key={i} style={CardStyles.metricItem}>
                <CheckCircleIcon size={22} color="white" strokeColor="black" />
                <span style={CardStyles.metricText(true)}>{sub}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </CardFront>
  );
};
