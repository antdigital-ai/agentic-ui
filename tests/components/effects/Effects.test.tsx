import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { CreativeRecommendationEffect } from '../../../src/Components/effects/CreativeRecommendationEffect';
import { LoadingEffect } from '../../../src/Components/effects/LoadingEffect';

const effectComponents = [
  { name: 'LoadingEffect', Component: LoadingEffect },
  { name: 'CreativeRecommendationEffect', Component: CreativeRecommendationEffect },
];

describe.each(effectComponents)('$name', ({ Component }) => {
  it('should render without crashing', () => {
    const { container } = render(<Component />);
    expect(container.firstChild).toBeTruthy();
  });

  it('should apply custom size', () => {
    const { container } = render(<Component size={80} />);
    const div = container.querySelector('div') as HTMLElement;
    expect(div).toHaveStyle({ width: '80px', height: '80px' });
  });

  it('should apply custom className and style', () => {
    const { container } = render(
      <Component className="custom-effect" style={{ opacity: 0.8 }} />,
    );
    expect(container.querySelector('.custom-effect')).toBeTruthy();
    const div = container.querySelector('div') as HTMLElement;
    expect(div).toHaveStyle({ opacity: '0.8' });
  });

  it('should render with autoplay=false and loop=false', () => {
    const { container } = render(<Component autoplay={false} loop={false} />);
    expect(container.firstChild).toBeTruthy();
  });
});
