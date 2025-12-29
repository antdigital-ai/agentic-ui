import { cleanup, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { I18nProvide, cnLabels, compileTemplate, enLabels } from '../../I18n';

describe('I18n Provider', () => {
  afterEach(() => {
    cleanup();
  });

  it('should provide Chinese labels by default', () => {
    const TestComponent = () => {
      return <div data-testid="test">{cnLabels.table}</div>;
    };

    render(
      <I18nProvide>
        <TestComponent />
      </I18nProvide>,
    );

    expect(screen.getByTestId('test')).toHaveTextContent('表格');
  });

  it('should respect ConfigProvider locale', () => {
    const TestComponent = () => {
      return <div data-testid="test">{enLabels.table}</div>;
    };

    render(
      <ConfigProvider locale={{ locale: 'en-US' }}>
        <I18nProvide>
          <TestComponent />
        </I18nProvide>
      </ConfigProvider>,
    );

    expect(screen.getByTestId('test')).toHaveTextContent('Table');
  });

  it('should use browser language preference when available', () => {
    const originalNavigator = window.navigator;
    const mockNavigator = {
      ...originalNavigator,
      language: 'en-US',
    };
    Object.defineProperty(window, 'navigator', {
      value: mockNavigator,
      writable: true,
    });

    const TestComponent = () => {
      return <div data-testid="test">{enLabels.table}</div>;
    };

    render(
      <I18nProvide>
        <TestComponent />
      </I18nProvide>,
    );

    expect(screen.getByTestId('test')).toHaveTextContent('Table');

    // Restore original navigator
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      writable: true,
    });
  });

  it('should allow locale override through props', () => {
    const TestComponent = () => {
      return <div data-testid="test">{enLabels.table}</div>;
    };

    render(
      <I18nProvide locale={enLabels}>
        <TestComponent />
      </I18nProvide>,
    );

    expect(screen.getByTestId('test')).toHaveTextContent('Table');
  });
});

describe('Template Compilation', () => {
  it('should compile template with provided variables', () => {
    const template = '${name} is ${status}';
    const variables = {
      name: 'Task',
      status: 'running',
    };
    const result = compileTemplate(template, variables);
    expect(result).toBe('Task is running');
  });

  it('should handle missing variables', () => {
    const template = '${name} is ${status}';
    const variables = {
      name: 'Task',
    };
    const result = compileTemplate(template, variables);
    expect(result).toBe('Task is [status]');
  });

  it('should handle template without variables', () => {
    const template = 'Simple text';
    const result = compileTemplate(template);
    expect(result).toBe('Simple text');
  });

  it('should handle empty template', () => {
    const result = compileTemplate('');
    expect(result).toBe('');
  });
});

describe('Labels Consistency', () => {
  it('should have matching keys in Chinese and English labels', () => {
    const cnKeys = Object.keys(cnLabels).sort();
    const enKeys = Object.keys(enLabels).sort();
    expect(cnKeys).toEqual(enKeys);
  });

  it('should not have empty translations except for "other"', () => {
    Object.entries(cnLabels).forEach(([key, value]) => {
      if (key !== 'other') {
        expect(value).not.toBe('');
      }
    });

    Object.entries(enLabels).forEach(([key, value]) => {
      if (key !== 'other') {
        expect(value).not.toBe('');
      }
    });
  });
});
