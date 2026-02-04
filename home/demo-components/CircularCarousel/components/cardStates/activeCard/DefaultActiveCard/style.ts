import { CSSProperties } from 'react';

export const topSection: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'relative',
  zIndex: 10,
};

export const topSectionLeft: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

export const dashedIcon: CSSProperties = {
  width: '16px',
  height: '12px',
  opacity: 0.5,
  background: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
  backgroundSize: '4px 4px',
};

export const topSectionLabel = (isActive: boolean): CSSProperties => ({
  fontSize: '13px',
  fontWeight: 400,
  letterSpacing: '0.025em',
  color: isActive ? 'white' : 'rgba(84, 93, 109, 0.65)',
});

export const titleSection: CSSProperties = {
  marginBottom: '32px',
  position: 'relative',
  zIndex: 10,
};

export const titleText = (isActive: boolean): CSSProperties => ({
  fontSize: '36px',
  fontWeight: 600,
  lineHeight: '1.2',
  color: isActive ? 'white' : '#343A45',
  height: '67px',
  display: 'flex',
  alignItems: 'center',
});

export const descriptionText = (isActive: boolean): CSSProperties => ({
  fontSize: '24px',
  fontWeight: 500,
  lineHeight: 'normal',
  color: isActive ? 'white' : '#343A45',
});

export const middleSection: CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  zIndex: 10,
};

export const bottomSection: CSSProperties = {
  marginTop: 'auto',
  position: 'relative',
  zIndex: 10,
};

export const bottomSectionHeader: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '24px',
};

export const bottomSectionLabel = (isActive: boolean): CSSProperties => ({
  fontSize: '13px',
  fontWeight: 400,
  color: isActive ? 'white' : 'rgba(84, 93, 109, 0.65)',
});

export const metricsList: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

export const metricItem: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

export const metricText = (isActive: boolean): CSSProperties => ({
  fontSize: '17px',
  fontWeight: 500,
  color: isActive ? 'white' : '#343A45',
});
