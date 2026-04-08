import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cnLabels, enLabels, I18nContext } from '../../src/I18n';
import { SchemaForm } from '../../src/Schema/SchemaForm/index';

describe('SchemaForm i18n tests', () => {
  afterEach(() => {
    cleanup();
  });

  const mockSchema: any = {
    version: '1.0.0',
    name: 'test-form',
    description: 'Test form schema',
    author: 'test',
    type: 'object',
    component: {
      properties: {
        name: {
          type: 'string',
          title: 'Name',
        },
        age: {
          type: 'number',
          title: 'Age',
        },
      },
    },
    required: ['name', 'age'],
    uiSchema: {},
  };

  it('should render form labels in Chinese', () => {
    render(
      <I18nContext.Provider value={{ locale: cnLabels, language: 'zh-CN' }}>
        <SchemaForm schema={mockSchema} />
      </I18nContext.Provider>,
    );

    // Test form labels and buttons in Chinese
    expect(screen.getByPlaceholderText('请输入 Age')).toBeDefined();
  });

  it('should render form labels in English', () => {
    render(
      <I18nContext.Provider value={{ locale: enLabels, language: 'en-US' }}>
        <SchemaForm schema={mockSchema} />
      </I18nContext.Provider>,
    );

    // Test form labels and buttons in English
    expect(screen.getByPlaceholderText('Please input Age')).toBeDefined();
  });

  it('should render Input for property type that falls through to default', () => {
    const schemaWithOtherType = {
      ...mockSchema,
      component: {
        properties: {
          extra: {
            type: 'object' as const,
            title: 'Extra',
          },
        },
      },
      required: [] as string[],
    };

    render(
      <I18nContext.Provider value={{ locale: enLabels, language: 'en-US' }}>
        <SchemaForm schema={schemaWithOtherType} />
      </I18nContext.Provider>,
    );

    expect(screen.getByText('Extra')).toBeInTheDocument();
  });
});
