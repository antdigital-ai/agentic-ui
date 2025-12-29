import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

// Import popular language icons
import * as Icons from '../index';
import {
  CssIcon,
  GoIcon,
  GraphqlIcon,
  HtmlIcon,
  JavaIcon,
  JavascriptIcon,
  JsonIcon,
  LessIcon,
  MarkdownIcon,
  PythonIcon,
  ReactIcon,
  RustIcon,
  SassIcon,
  TypescriptIcon,
  VueIcon,
  XmlIcon,
  YamlIcon,
} from '../index';

describe('Language Icons', () => {
  const iconNames = Object.keys(Icons).filter(
    (name) => name.endsWith('Icon') && name !== 'LanguageIcons',
  );
  iconNames.forEach((name) => {
    it(`应该渲染 ${name} 图标`, () => {
      const IconComponent = Icons[name as 'AplIcon'] as unknown as any;
      const { container } = render(
        <IconComponent data-testid={`${name.toLowerCase()}-icon`} />,
      );
      expect(container).toMatchSnapshot();
    });
  });

  iconNames.forEach((name) => {
    it(`应该渲染 ${name} 48 size 图标`, () => {
      const IconComponent = Icons[name as 'AplIcon'] as unknown as any;
      const { container } = render(
        <IconComponent size={48} data-testid={`${name.toLowerCase()}-icon`} />,
      );
      expect(container).toMatchSnapshot();
    });
  });
  describe('Popular Programming Languages', () => {
    const popularLanguages = [
      {
        name: 'JavaScript',
        component: JavascriptIcon,
        expectedColor: '#ffca28',
      },
      {
        name: 'TypeScript',
        component: TypescriptIcon,
        expectedColor: '#0288d1',
      },
      { name: 'Python', component: PythonIcon, expectedFill: true },
      { name: 'Java', component: JavaIcon, expectedFill: true },
      { name: 'Go', component: GoIcon, expectedFill: true },
      { name: 'Rust', component: RustIcon, expectedFill: true },
    ];

    popularLanguages.forEach(
      ({ name, component: IconComponent, expectedColor }) => {
        it(`应该渲染 ${name} 图标`, () => {
          const { container } = render(
            <IconComponent data-testid={`${name.toLowerCase()}-icon`} />,
          );
          const icon = screen.getByTestId(`${name.toLowerCase()}-icon`);

          expect(icon).toBeInTheDocument();
          expect(icon.tagName).toBe('svg');
          expect(icon).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');

          if (expectedColor) {
            const pathElement = container.querySelector('path[fill]');
            expect(pathElement).toHaveAttribute('fill', expectedColor);
          }
        });
      },
    );
  });

  describe('Web Development Languages', () => {
    const webLanguages = [
      { name: 'HTML', component: HtmlIcon },
      { name: 'CSS', component: CssIcon },
      { name: 'LESS', component: LessIcon },
      { name: 'SASS', component: SassIcon },
    ];

    webLanguages.forEach(({ name, component: IconComponent }) => {
      it(`应该渲染 ${name} 图标`, () => {
        render(<IconComponent data-testid={`${name.toLowerCase()}-icon`} />);
        const icon = screen.getByTestId(`${name.toLowerCase()}-icon`);

        expect(icon).toBeInTheDocument();
        expect(icon.tagName).toBe('svg');
        expect(icon).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
      });
    });
  });

  describe('Framework and Data Format Icons', () => {
    const frameworksAndFormats = [
      { name: 'React', component: ReactIcon },
      { name: 'Vue', component: VueIcon },
      { name: 'JSON', component: JsonIcon },
      { name: 'XML', component: XmlIcon },
      { name: 'YAML', component: YamlIcon },
      { name: 'Markdown', component: MarkdownIcon },
      { name: 'GraphQL', component: GraphqlIcon },
    ];

    frameworksAndFormats.forEach(({ name, component: IconComponent }) => {
      it(`应该渲染 ${name} 图标`, () => {
        render(<IconComponent data-testid={`${name.toLowerCase()}-icon`} />);
        const icon = screen.getByTestId(`${name.toLowerCase()}-icon`);

        expect(icon).toBeInTheDocument();
        expect(icon.tagName).toBe('svg');
      });
    });
  });

  describe('Icon Props and Customization', () => {
    it('图标应该支持自定义 size 属性', () => {
      const testSize = 48;
      render(<JavascriptIcon size={testSize} data-testid="size-test" />);
      const icon = screen.getByTestId('size-test');

      expect(icon).toHaveAttribute('width', testSize.toString());
      expect(icon).toHaveAttribute('height', testSize.toString());
    });

    it('图标应该支持字符串类型的 size', () => {
      render(<PythonIcon size="2rem" data-testid="string-size" />);
      const icon = screen.getByTestId('string-size');

      expect(icon).toHaveAttribute('width', '2rem');
      expect(icon).toHaveAttribute('height', '2rem');
    });

    it('图标应该支持传递额外的 SVG 属性', () => {
      render(
        <TypescriptIcon
          data-testid="custom-props"
          className="custom-class"
          style={{ opacity: 0.8 }}
        />,
      );
      const icon = screen.getByTestId('custom-props');

      expect(icon).toHaveClass('custom-class');
      expect(icon).toHaveStyle({ opacity: '0.8' });
    });

    it('图标应该支持 aria-label 以提高可访问性', () => {
      render(
        <JavaIcon
          data-testid="accessible-icon"
          aria-label="Java programming language"
        />,
      );
      const icon = screen.getByTestId('accessible-icon');

      expect(icon).toHaveAttribute('aria-label', 'Java programming language');
    });
  });

  describe('Icon Rendering Quality', () => {
    it('所有图标都应该有正确的 SVG 结构', () => {
      const testIcons = [
        <JavascriptIcon key="js" />,
        <TypescriptIcon key="ts" />,
        <PythonIcon key="py" />,
        <ReactIcon key="react" />,
      ];

      testIcons.forEach((iconElement) => {
        const { container } = render(iconElement);
        const svg = container.querySelector('svg');

        expect(svg).toBeInTheDocument();
        expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
        expect(svg).toHaveAttribute('viewBox');

        // 检查是否包含图形内容
        const hasContent = svg?.querySelector(
          'path, g, circle, rect, polygon, defs',
        );
        expect(hasContent).toBeTruthy();
      });
    });

    it('JavaScript 图标应该包含特定颜色', () => {
      const { container } = render(<JavascriptIcon />);
      const coloredPath = container.querySelector('path[fill="#ffca28"]');

      expect(coloredPath).toBeTruthy();
    });

    it('TypeScript 图标应该有正确的视图框', () => {
      render(<TypescriptIcon data-testid="ts-viewbox" />);
      const icon = screen.getByTestId('ts-viewbox');

      expect(icon).toHaveAttribute('viewBox', '0 0 500 500');
    });

    it('所有图标都应该有默认的 24px 尺寸', () => {
      const icons = [JavascriptIcon, PythonIcon, ReactIcon];

      icons.forEach((IconComponent) => {
        const { container } = render(<IconComponent />);
        const svg = container.querySelector('svg');

        expect(svg).toHaveAttribute('width', '24');
        expect(svg).toHaveAttribute('height', '24');
      });
    });
  });

  describe('边缘情况处理', () => {
    it('图标应该优雅地处理 size 为 0', () => {
      render(<JavascriptIcon size={0} data-testid="zero-size" />);
      const icon = screen.getByTestId('zero-size');

      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('width', '0');
      expect(icon).toHaveAttribute('height', '0');
    });

    it('图标应该在没有 props 的情况下正常渲染', () => {
      const { container } = render(<PythonIcon />);
      const svg = container.querySelector('svg');

      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
    });

    it('图标应该支持大尺寸', () => {
      render(<GoIcon size={128} data-testid="large-size" />);
      const icon = screen.getByTestId('large-size');

      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('width', '128');
      expect(icon).toHaveAttribute('height', '128');
    });
  });
});
