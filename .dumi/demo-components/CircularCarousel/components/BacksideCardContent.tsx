import React from 'react';
import { CardCarousel } from './CardCarousel';
import { DesignStrategyIcon } from './DecorativeIcon';
import { Rotate3DIcon } from './Rotate3DIcon';

// Top Section with Design Strategy Label
function TopSection() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <DesignStrategyIcon />
        <span
          style={{
            fontSize: '13px',
            fontFamily: 'PingFang SC',
            fontWeight: 400,
            color: 'rgba(84, 93, 109, 0.65)',
          }}
        >
          设计策略
        </span>
      </div>
      {/* Rotate Icon */}
      <Rotate3DIcon size={24} color="rgba(80, 92, 113, 0.35)" />
    </div>
  );
}

// Title Section
function TitleSection({ feature }: { feature?: any }) {
  // 处理 title 为数组或字符串的情况
  const titleStr = Array.isArray(feature?.title)
    ? feature.title.join(' ')
    : feature?.title || 'O1. 精准预期';
  const parts = titleStr.split('.');
  const num = parts[0] ? parts[0] + '.' : 'O1.';
  const text = parts[1] ? parts[1].trim() : '精准预期';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        marginBottom: '32px',
        marginTop: '8px',
      }}
    >
      <div
        style={{
          color: '#343A45',
          fontFamily: 'PingFang SC',
          fontSize: '20px',
          fontStyle: 'normal',
          fontWeight: '600',
          lineHeight: 'normal',
        }}
      >
        <div>
          {num}
          {text}
        </div>
      </div>
      <div
        style={{
          color: 'rgba(84, 93, 109, 0.65)',
          fontFamily: 'PingFang SC',
          fontSize: '13px',
          fontStyle: 'normal',
          fontWeight: 400,
          lineHeight: '22px',
        }}
      >
        {feature?.description ||
          '对话启动与意图确立阶段，边界的精准是信任的基石'}
      </div>
    </div>
  );
}

// Design Pattern Label
function DesignPatternLabel() {
  return (
    <div
      style={{
        position: 'absolute',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        left: '32px',
        top: 0,
        width: '416px',
        zIndex: 10,
      }}
    >
      <DesignStrategyIcon />
      <div
        style={{
          fontSize: '13px',
          fontFamily: 'PingFang SC',
          fontWeight: 400,
          color: 'rgba(84, 93, 109, 0.65)',
          whiteSpace: 'pre',
          lineHeight: '22px',
        }}
      >
        设计模式
      </div>
    </div>
  );
}

// Content Light Component
export function ContentLight({ feature }: { feature?: any }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        position: 'relative',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ padding: '32px' }}>
        <TopSection />
        <TitleSection feature={feature} />
      </div>
      <div
        style={{
          // flex: 1,
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        <DesignPatternLabel />
        <div
          style={{
            // position: 'absolute',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <CardCarousel feature={feature} />
        </div>
      </div>
    </div>
  );
}
