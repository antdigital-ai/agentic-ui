import { Button } from 'antd';
import React from 'react';
import designStrategyIcon from '../../../../../assets/design-strategy-icon.png';
import { COMPONENT_LIBRARY_URL } from '../../../../../constants/links';
import { useSiteI18n } from '../../../../../i18n';
import { getGradientSvg } from '../../BacksideCard';
import { Rotate3DIcon } from '../../Rotate3DIcon';
import { FeatureItem } from '../types';
import { CardBack } from './style';

interface IntroBacksideCardProps {
  feature: FeatureItem;
  themeColor: string;
}

export const IntroBacksideCard: React.FC<IntroBacksideCardProps> = ({
  feature,
  themeColor,
}) => {
  const bgImage = getGradientSvg(themeColor);
  const { messages } = useSiteI18n();

  return (
    <CardBack $borderColor={themeColor}>
      {/* Background gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url("${bgImage}")`,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          padding: '32px',
        }}
      >
        {/* Top Section */}
        <div>
          {/* Label */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '24px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  backgroundRepeat: 'repeat',
                  backgroundSize: '38px 11px',
                  backgroundPosition: 'top left',
                  height: '12px',
                  opacity: 0.5,
                  flexShrink: 0,
                  width: '14px',
                  backgroundImage: `url('${designStrategyIcon}')`,
                }}
              />
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 400,
                  letterSpacing: '0.025em',
                  color: 'rgba(84, 93, 109, 0.65)',
                }}
              >
                {messages.common.designPrinciples}
              </span>
            </div>
            <Rotate3DIcon size={24} color="#343A45" />
          </div>

          {/* Title - Single line */}
          <div
            style={{
              color: 'var(---, #343A45)',
              fontFamily: 'PingFang SC',
              fontSize: '20px',
              fontStyle: 'normal',
              fontWeight: '600',
              lineHeight: 'normal',
            }}
          >
            {Array.isArray(feature.title) ? (
              feature.title.map((line, index) => <div key={index}>{line}</div>)
            ) : (
              <div>{feature.title}</div>
            )}
          </div>

          <p
            style={{
              color: '#343A45',
              fontFamily: 'PingFang SC',
              fontSize: '32px',
              fontStyle: 'normal',
              fontWeight: 500,
              lineHeight: 'normal',
              marginTop: '32px',
            }}
          >
            <span style={{ color: '#343A45' }}>
              {messages.common.introDescription}
            </span>
          </p>
        </div>

        {/* Bottom Buttons */}
        <div
          style={{
            display: 'flex',
            padding: '32px 0',
            width: '100%',
            marginTop: 'auto',
          }}
        >
          <Button
            block
            onClick={() => {
              // Handle learn more action
              window.open(COMPONENT_LIBRARY_URL);
            }}
            style={{
              backgroundColor: 'white',
              color: '#14161C',
              fontSize: '15px',
              fontWeight: 500,
              height: '48px',
              width: '132px',
              padding: '12px 8px',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '200px',
              background: '#FFF',
              boxShadow: '0 0 1px 0 rgba(80, 92, 113, 0.36) inset',
              border: 'none',
            }}
          >
            {messages.common.learnMore}
          </Button>
        </div>
      </div>
    </CardBack>
  );
};
