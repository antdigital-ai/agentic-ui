/**
 * AgenticLayout residual：仅 center、左右栏、header、自定义宽度。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { AGENTIC_LAYOUT_TEST_ID, AgenticLayout } from '../index';

describe('AgenticLayout residual branches', () => {
  it('仅 center 渲染', () => {
    render(
      <ConfigProvider>
        <AgenticLayout center={<div>Main</div>} />
      </ConfigProvider>,
    );
    expect(screen.getByTestId(AGENTIC_LAYOUT_TEST_ID)).toBeInTheDocument();
    expect(screen.getByText('Main')).toBeInTheDocument();
  });

  it('left/right/header/className/style/宽度', () => {
    render(
      <ConfigProvider>
        <AgenticLayout
          className="custom"
          style={{ minHeight: 100 }}
          leftWidth={120}
          rightWidth={200}
          left={<div>L</div>}
          center={<div>C</div>}
          right={<div>R</div>}
          header={{ title: 'Hdr', leftCollapsible: true, rightCollapsible: true }}
        />
      </ConfigProvider>,
    );
    expect(screen.getByText('L')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('R')).toBeInTheDocument();
    expect(screen.getByText('Hdr')).toBeInTheDocument();
  });

  it('无 header 时仍渲染三栏', () => {
    render(
      <ConfigProvider>
        <AgenticLayout left={<span>A</span>} center={<span>B</span>} right={<span>C</span>} />
      </ConfigProvider>,
    );
    expect(screen.getByText('A')).toBeInTheDocument();
  });
});
