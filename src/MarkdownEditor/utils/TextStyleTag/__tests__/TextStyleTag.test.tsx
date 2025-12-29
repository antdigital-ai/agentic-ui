import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { TextStyleTag } from '@ant-design/agentic-ui/MarkdownEditor/editor/components/fntTag';

describe('TextStyleTag Component', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(<ConfigProvider>{component}</ConfigProvider>);
  };

  it('should render children content', () => {
    renderWithProvider(<TextStyleTag>Hello World</TextStyleTag>);

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should render with correct HTML structure', () => {
    const { container } = renderWithProvider(
      <TextStyleTag>Test Content</TextStyleTag>,
    );

    const span = container.querySelector('span');
    expect(span).toBeInTheDocument();
    expect(span).toHaveTextContent('Test Content');
  });

  it('should apply base CSS class', () => {
    const { container } = renderWithProvider(<TextStyleTag>Test</TextStyleTag>);

    const span = container.querySelector('span');
    expect(span).toHaveClass('ant-agentic-md-editor-text-style-tag');
  });

  it('should render with React elements as children', () => {
    renderWithProvider(
      <TextStyleTag>
        <strong>Bold Text</strong>
        <em>Italic Text</em>
      </TextStyleTag>,
    );

    expect(screen.getByText('Bold Text')).toBeInTheDocument();
    expect(screen.getByText('Italic Text')).toBeInTheDocument();
  });

  it('should render with nested components', () => {
    renderWithProvider(
      <TextStyleTag>
        <div>
          <span>Nested</span>
          <span>Content</span>
        </div>
      </TextStyleTag>,
    );

    expect(screen.getByText('Nested')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should handle empty children', () => {
    const { container } = renderWithProvider(<TextStyleTag> </TextStyleTag>);

    const span = container.querySelector('span');
    expect(span).toBeInTheDocument();
  });

  it('should handle null children', () => {
    const { container } = renderWithProvider(
      <TextStyleTag>{null}</TextStyleTag>,
    );

    const span = container.querySelector('span');
    expect(span).toBeInTheDocument();
  });

  it('should handle undefined children', () => {
    const { container } = renderWithProvider(
      <TextStyleTag>{undefined}</TextStyleTag>,
    );

    const span = container.querySelector('span');
    expect(span).toBeInTheDocument();
  });

  it('should handle boolean children', () => {
    const { container } = renderWithProvider(
      <TextStyleTag>{false}</TextStyleTag>,
    );

    const span = container.querySelector('span');
    expect(span).toBeInTheDocument();
  });

  it('should render numbers as children', () => {
    renderWithProvider(<TextStyleTag>{42}</TextStyleTag>);

    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should render array of elements as children', () => {
    const items = ['Item 1', 'Item 2', 'Item 3'];
    renderWithProvider(
      <TextStyleTag>
        {items.map((item, index) => (
          <span key={index}>{item}</span>
        ))}
      </TextStyleTag>,
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('should handle mixed content types', () => {
    renderWithProvider(
      <TextStyleTag>
        Text content
        <span>Element content</span>
        {123}
        {true && <em>Conditional content</em>}
      </TextStyleTag>,
    );

    expect(screen.getByText(/Text content/)).toBeInTheDocument();
    expect(screen.getByText('Element content')).toBeInTheDocument();
    // Check if the number 123 is present in the document
    expect(screen.getByText(/123/)).toBeInTheDocument();
    expect(screen.getByText('Conditional content')).toBeInTheDocument();
  });

  it('should maintain proper HTML semantics', () => {
    const { container } = renderWithProvider(
      <TextStyleTag>Semantic Content</TextStyleTag>,
    );

    const span = container.querySelector('span');
    expect(span?.tagName.toLowerCase()).toBe('span');
  });

  it('should preserve text formatting in children', () => {
    renderWithProvider(
      <TextStyleTag>
        <code>console.log(&quot;Hello&quot;)</code>
      </TextStyleTag>,
    );

    expect(screen.getByText('console.log("Hello")')).toBeInTheDocument();
  });

  it('should work with ConfigProvider theme', () => {
    const customTheme = {
      token: {
        colorPrimary: '#custom-color',
      },
    };

    render(
      <ConfigProvider theme={customTheme}>
        <TextStyleTag>Themed Content</TextStyleTag>
      </ConfigProvider>,
    );

    expect(screen.getByText('Themed Content')).toBeInTheDocument();
  });

  it('should handle special characters in content', () => {
    const specialChars = 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
    renderWithProvider(<TextStyleTag>{specialChars}</TextStyleTag>);

    expect(screen.getByText(specialChars)).toBeInTheDocument();
  });

  it('should handle unicode characters', () => {
    renderWithProvider(
      <TextStyleTag>Unicode: 你好 🌟 Café naïve résumé</TextStyleTag>,
    );

    expect(
      screen.getByText('Unicode: 你好 🌟 Café naïve résumé'),
    ).toBeInTheDocument();
  });

  it('should handle very long content', () => {
    const longContent = 'A'.repeat(1000);
    renderWithProvider(<TextStyleTag>{longContent}</TextStyleTag>);

    expect(screen.getByText(longContent)).toBeInTheDocument();
  });

  it('should handle whitespace and newlines', () => {
    renderWithProvider(
      <TextStyleTag>Content with newlines and spaces</TextStyleTag>,
    );

    expect(screen.getByText(/Content with/)).toBeInTheDocument();
  });

  it('should render consistently across multiple renders', () => {
    const { rerender } = renderWithProvider(
      <TextStyleTag>Initial Content</TextStyleTag>,
    );

    expect(screen.getByText('Initial Content')).toBeInTheDocument();

    rerender(
      <ConfigProvider>
        <TextStyleTag>Updated Content</TextStyleTag>
      </ConfigProvider>,
    );

    expect(screen.getByText('Updated Content')).toBeInTheDocument();
    expect(screen.queryByText('Initial Content')).not.toBeInTheDocument();
  });

  it('should maintain accessibility', () => {
    const { container } = renderWithProvider(
      <TextStyleTag>Accessible Content</TextStyleTag>,
    );

    const span = container.querySelector('span');
    // Span elements should be accessible to screen readers
    expect(span).toBeInTheDocument();
    expect(span).toHaveTextContent('Accessible Content');
  });
});
