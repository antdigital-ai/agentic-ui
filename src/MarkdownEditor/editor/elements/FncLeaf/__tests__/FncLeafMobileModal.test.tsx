import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { FootnoteDefinitionNode } from '../../../el';
import { FncLeafMobileModal } from '../FncLeafMobileModal';

describe('FncLeafMobileModal', () => {
  const definition: FootnoteDefinitionNode = {
    type: 'footnoteDefinition',
    identifier: '1',
    value: 'Footnote body',
    url: 'https://example.com',
    children: [{ text: 'Footnote body' }],
  };

  it('shows definition text and source link', () => {
    render(
      <ConfigProvider>
        <FncLeafMobileModal
          open
          onClose={() => {}}
          displayLabel="1"
          identifier="1"
          definition={definition}
        />
      </ConfigProvider>,
    );
    expect(screen.getByText('Footnote body')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '查看来源' })).toHaveAttribute(
      'href',
      'https://example.com',
    );
  });

  it('calls onClose when cancel clicked', () => {
    const onClose = vi.fn();
    render(
      <ConfigProvider>
        <FncLeafMobileModal
          open
          onClose={onClose}
          displayLabel="1"
          identifier="1"
        />
      </ConfigProvider>,
    );
    fireEvent.click(document.querySelector('.ant-modal-close')!);
    expect(onClose).toHaveBeenCalled();
  });
});
