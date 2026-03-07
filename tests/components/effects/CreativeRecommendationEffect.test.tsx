import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CreativeRecommendationEffect } from '../../../src/Components/effects/CreativeRecommendationEffect';

describe('CreativeRecommendationEffect', () => {
  it('should render without crashing', () => {
    const { container } = render(<CreativeRecommendationEffect />);
    expect(container.firstChild).toBeTruthy();
  });

  it('should apply custom size', () => {
    const { container } = render(<CreativeRecommendationEffect size={80} />);
    const div = container.querySelector('div') as HTMLElement;
    expect(div).toHaveStyle({ width: '80px', height: '80px' });
  });

  it('should apply custom className', () => {
    const { container } = render(
      <CreativeRecommendationEffect className="creative" />,
    );
    const div = container.querySelector('.creative');
    expect(div).toBeTruthy();
  });

  it('should apply custom style', () => {
    const { container } = render(
      <CreativeRecommendationEffect style={{ opacity: 0.8 }} />,
    );
    const div = container.querySelector('div') as HTMLElement;
    expect(div).toHaveStyle({ opacity: '0.8' });
  });

  it('should render with autoplay and loop disabled', () => {
    const { container } = render(
      <CreativeRecommendationEffect autoplay={false} loop={false} />,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('should render with all props combined', () => {
    const { container } = render(
      <CreativeRecommendationEffect
        size={100}
        className="test"
        style={{ padding: '5px' }}
        autoplay={true}
        loop={true}
      />,
    );
    const div = container.querySelector('div') as HTMLElement;
    expect(div).toHaveStyle({ width: '100px', height: '100px' });
    expect(container.querySelector('.test')).toBeTruthy();
  });
});
