import designStrategyIcon from '../../../../../assets/design-strategy-icon.png';
import { AGENT_EVALUATION_URL, COMPONENT_LIBRARY_URL } from '../../../../../constants/links';
import { Button } from 'antd';
import React from 'react';
import { ArrowRightOutlined } from '@ant-design/icons';
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
                设计原则
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

          {/* Description Text */}
          {/* <p
            style={{
              fontFamily: 'PingFang SC',
              fontSize: '24px',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: 'normal',
              alignSelf: 'stretch',
            }}
          >
            <span style={{ color: 'var(---, rgba(80, 92, 113, 0.36))' }}>
              精准不只是结果准确,也是将用户
            </span>
            <span style={{ color: '#343A45' }}>意图转化为结果</span>
            <span style={{ color: 'var(---, rgba(80, 92, 113, 0.36))' }}>
              过程中,对用户
            </span>
            <span style={{ color: '#343A45' }}>
              目标不多不少、恰到好处的把握。
            </span>
          </p> */}
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
              用 AI 智能加速工作流程，同时保障过程准确、透明、可干预。
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
          {/* 立即评估 Button */}
          <Button
            type="primary"
            block
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Handle evaluate action
              window.open(
                AGENT_EVALUATION_URL,
                '_blank',
                'noopener,noreferrer',
              );
            }}
            style={{
              backgroundColor: '#14161C',
              borderColor: '#14161C',
              borderRadius: '200px',
              fontSize: '15px',
              fontWeight: 500,
              transition: 'all 0.2s ease',
              display: 'flex',
              height: '48px',
              width: '132px',
              padding: '12px 8px',
              alignItems: 'center',
              gap: '8px',
              marginRight: '12px',
              position: 'relative',
              zIndex: 11,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            立即评估
            <span
              style={{
                borderRadius: '200px',
                background: '#FFF',
                padding: '4px',
                display: 'flex',
                marginLeft: '4px',
              }}
            >
              <ArrowRightOutlined style={{ color: '#14161C' }} size={32} />
            </span>
          </Button>

          {/* 了解更多 Button */}
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
            了解更多
          </Button>
        </div>
      </div>
    </CardBack>
  );
};
