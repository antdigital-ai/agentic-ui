/**
 * VoiceInputButton：title truthy 时渲染文本布局。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TestWrapper } from '../../../../_test_helpers/testUtils';
import { VoiceInputButton } from '../index';

describe('VoiceInput branches', () => {
  it('title 有值时渲染标题文本', () => {
    render(
      <TestWrapper>
        <VoiceInputButton
          title="Speak"
          recording={false}
          onStart={vi.fn()}
          onStop={vi.fn()}
        />
      </TestWrapper>,
    );
    expect(screen.getByText('Speak')).toBeInTheDocument();
  });
});
