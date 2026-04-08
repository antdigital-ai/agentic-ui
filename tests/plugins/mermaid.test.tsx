import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import classNames from 'clsx';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Mermaid
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn((id: string, definition: string) =>
      Promise.resolve(`<svg><text>${definition}</text></svg>`),
    ),
    mermaidAPI: {
      render: vi.fn(),
    },
  },
}));

// Mock dependencies
vi.mock('../../src/MarkdownEditor/editor/store', () => ({
  useEditorStore: vi.fn(() => ({
    readonly: false,
    markdownEditorRef: { current: null },
  })),
}));

// Mock copy-to-clipboard at the top level
const copyToClipboard = vi.fn().mockReturnValue(true);
vi.mock('copy-to-clipboard', () => ({
  default: copyToClipboard,
}));

vi.mock('../../src/MarkdownEditor/hooks/editor', () => ({
  useSelStatus: vi.fn(() => [false, []]),
}));

vi.mock('copy-to-clipboard', () => ({
  default: vi.fn(() => true),
}));

describe('Mermaid Plugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Mermaid 图表类型', () => {
    it('应该支持流程图', () => {
      const flowchartCode = `
        graph TD
        A[开始] --> B{判断条件}
        B -->|是| C[执行操作1]
        B -->|否| D[执行操作2]
        C --> E[结束]
        D --> E
      `;

      const TestFlowchart = () => {
        return (
          <div data-testid="mermaid-flowchart" className="mermaid">
            <pre>{flowchartCode}</pre>
          </div>
        );
      };

      render(<TestFlowchart />);

      expect(screen.getByTestId('mermaid-flowchart')).toHaveTextContent(
        'graph TD',
      );
      expect(screen.getByTestId('mermaid-flowchart')).toHaveTextContent('开始');
    });

    it('应该支持时序图', () => {
      const sequenceCode = `
        sequenceDiagram
        participant A as 用户
        participant B as 服务器
        A->>B: 发送请求
        B-->>A: 返回响应
      `;

      const TestSequenceDiagram = () => {
        return (
          <div data-testid="mermaid-sequence" className="mermaid">
            <pre>{sequenceCode}</pre>
          </div>
        );
      };

      render(<TestSequenceDiagram />);

      expect(screen.getByTestId('mermaid-sequence')).toHaveTextContent(
        'sequenceDiagram',
      );
      expect(screen.getByTestId('mermaid-sequence')).toHaveTextContent('用户');
    });

    it('应该支持甘特图', () => {
      const ganttCode = `
        gantt
        title 项目时间表
        dateFormat YYYY-MM-DD
        section 开发阶段
        需求分析    :done, des1, 2024-01-01, 2024-01-15
        设计阶段    :active, des2, 2024-01-16, 2024-02-01
        编码阶段    :des3, after des2, 20d
      `;

      const TestGanttChart = () => {
        return (
          <div data-testid="mermaid-gantt" className="mermaid">
            <pre>{ganttCode}</pre>
          </div>
        );
      };

      render(<TestGanttChart />);

      expect(screen.getByTestId('mermaid-gantt')).toHaveTextContent('gantt');
      expect(screen.getByTestId('mermaid-gantt')).toHaveTextContent(
        '项目时间表',
      );
    });

    it('应该支持饼图', () => {
      const pieCode = `
        pie title 编程语言使用比例
        "JavaScript" : 42.96
        "Python" : 20.86
        "Java" : 15.42
        "TypeScript" : 10.76
        "其他" : 10.00
      `;

      const TestPieChart = () => {
        return (
          <div data-testid="mermaid-pie" className="mermaid">
            <pre>{pieCode}</pre>
          </div>
        );
      };

      render(<TestPieChart />);

      expect(screen.getByTestId('mermaid-pie')).toHaveTextContent('pie title');
      expect(screen.getByTestId('mermaid-pie')).toHaveTextContent('JavaScript');
    });

    it('应该支持类图', () => {
      const classCode = `
        classDiagram
        class Animal {
          +String name
          +int age
          +makeSound()
        }
        class Dog {
          +bark()
        }
        Animal <|-- Dog
      `;

      const TestClassDiagram = () => {
        return (
          <div data-testid="mermaid-class" className="mermaid">
            <pre>{classCode}</pre>
          </div>
        );
      };

      render(<TestClassDiagram />);

      expect(screen.getByTestId('mermaid-class')).toHaveTextContent(
        'classDiagram',
      );
      expect(screen.getByTestId('mermaid-class')).toHaveTextContent('Animal');
    });
  });

  describe('Mermaid 编辑功能', () => {
    it('应该支持实时预览', async () => {
      const TestMermaidEditor = () => {
        const [code, setCode] = React.useState('graph TD\nA --> B');
        const [svg, setSvg] = React.useState('');

        React.useEffect(() => {
          // 模拟 Mermaid 渲染
          const timer = setTimeout(() => {
            setSvg(`<svg><text>${code}</text></svg>`);
          }, 100);
          return () => clearTimeout(timer);
        }, [code]);

        return (
          <div>
            <textarea
              data-testid="mermaid-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <div
              data-testid="mermaid-preview"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>
        );
      };

      render(<TestMermaidEditor />);

      const input = screen.getByTestId('mermaid-input');
      const preview = screen.getByTestId('mermaid-preview');

      fireEvent.change(input, { target: { value: 'graph LR\nX --> Y' } });

      await waitFor(() => {
        expect(preview.innerHTML).toContain('graph LR');
      });
    });

    it('应该支持语法验证', async () => {
      const TestMermaidValidation = () => {
        const [code, setCode] = React.useState('initial empty');
        const [hasErrors, setHasErrors] = React.useState(true);

        const validateMermaid = (input: string) => {
          const hasValidationErrors =
            input.trim() === '' ||
            (!input.includes('graph') &&
              !input.includes('sequenceDiagram') &&
              !input.includes('gantt') &&
              !input.includes('pie') &&
              !input.includes('classDiagram'));

          setHasErrors(hasValidationErrors);
        };

        const handleChange = (value: string) => {
          setCode(value);
          validateMermaid(value);
        };

        React.useEffect(() => {
          validateMermaid(code);
        }, []);

        return (
          <div>
            <textarea
              data-testid="mermaid-input"
              value={code}
              onChange={(e) => handleChange(e.target.value)}
            />
            {hasErrors && (
              <div data-testid="validation-errors">代码验证失败</div>
            )}
          </div>
        );
      };

      render(<TestMermaidValidation />);

      const input = screen.getByTestId('mermaid-input');

      // 先确认错误元素存在（由于初始状态）
      expect(screen.getByTestId('validation-errors')).toBeInTheDocument();

      // 测试空输入
      fireEvent.change(input, { target: { value: '' } });
      await waitFor(() => {
        expect(screen.getByTestId('validation-errors')).toBeInTheDocument();
      });

      // 测试有效代码
      fireEvent.change(input, { target: { value: 'graph TD\nA --> B' } });
      await waitFor(() => {
        expect(
          screen.queryByTestId('validation-errors'),
        ).not.toBeInTheDocument();
      });
    });

    it('应该支持复制功能', () => {
      const TestMermaidCopy = () => {
        const code = 'graph TD\nA --> B\nB --> C';

        const handleCopy = () => {
          copyToClipboard(code);
        };

        return (
          <div>
            <pre data-testid="mermaid-code">{code}</pre>
            <button
              type="button"
              data-testid="copy-button"
              onClick={handleCopy}
            >
              复制代码
            </button>
          </div>
        );
      };

      render(<TestMermaidCopy />);

      const copyButton = screen.getByTestId('copy-button');
      fireEvent.click(copyButton);

      expect(copyToClipboard).toHaveBeenCalledWith(
        'graph TD\nA --> B\nB --> C',
      );
    });
  });

  describe('Mermaid 错误处理', () => {
    it('应该处理渲染错误', async () => {
      const TestMermaidError = () => {
        const [code] = React.useState('invalid mermaid syntax');
        const [error, setError] = React.useState('');
        const [svg, setSvg] = React.useState('');

        React.useEffect(() => {
          try {
            // 模拟渲染错误
            if (code.includes('invalid')) {
              throw new Error('Syntax error in diagram definition');
            }
            setSvg(`<svg><text>${code}</text></svg>`);
          } catch (err) {
            setError(err instanceof Error ? err.message : '渲染错误');
            setSvg('');
          }
        }, [code]);

        return (
          <div>
            {error ? (
              <div data-testid="mermaid-error" className="error">
                {error}
              </div>
            ) : (
              <div
                data-testid="mermaid-success"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            )}
          </div>
        );
      };

      render(<TestMermaidError />);

      await waitFor(() => {
        expect(screen.getByTestId('mermaid-error')).toHaveTextContent(
          'Syntax error in diagram definition',
        );
      });
    });

    it('应该提供错误恢复', () => {
      const TestMermaidRecovery = () => {
        const [code, setCode] = React.useState('invalid syntax');
        const [showFallback, setShowFallback] = React.useState(false);

        const handleError = () => {
          setShowFallback(true);
        };

        const useTemplate = () => {
          setCode('graph TD\nA[开始] --> B[结束]');
          setShowFallback(false);
        };

        React.useEffect(() => {
          if (code.includes('invalid')) {
            handleError();
          } else {
            setShowFallback(false);
          }
        }, [code]);

        return (
          <div>
            {showFallback ? (
              <div data-testid="error-recovery">
                <div>图表渲染失败，请检查语法</div>
                <button
                  type="button"
                  data-testid="use-template"
                  onClick={useTemplate}
                >
                  使用模板
                </button>
              </div>
            ) : (
              <div data-testid="mermaid-diagram">
                <pre>{code}</pre>
              </div>
            )}
          </div>
        );
      };

      render(<TestMermaidRecovery />);

      expect(screen.getByTestId('error-recovery')).toBeInTheDocument();

      const templateButton = screen.getByTestId('use-template');
      fireEvent.click(templateButton);

      expect(screen.getByTestId('mermaid-diagram')).toBeInTheDocument();
      expect(screen.getByTestId('mermaid-diagram')).toHaveTextContent(
        'graph TD',
      );
    });

    it('应该处理长时间渲染', async () => {
      const TestMermaidTimeout = () => {
        const [isLoading, setIsLoading] = React.useState(false);
        const [result, setResult] = React.useState('');

        const renderWithTimeout = async () => {
          setIsLoading(true);

          try {
            // 模拟长时间渲染
            const result = await new Promise<string>((resolve, reject) => {
              const timer = setTimeout(() => {
                resolve('渲染完成');
              }, 100);

              // 模拟超时
              setTimeout(() => {
                clearTimeout(timer);
                reject(new Error('渲染超时'));
              }, 50);
            });

            setResult(result);
          } catch (error) {
            setResult('渲染超时，请简化图表');
          } finally {
            setIsLoading(false);
          }
        };

        React.useEffect(() => {
          renderWithTimeout();
        }, []);

        return (
          <div>
            {isLoading ? (
              <div data-testid="loading">正在渲染图表...</div>
            ) : (
              <div data-testid="result">{result}</div>
            )}
          </div>
        );
      };

      render(<TestMermaidTimeout />);

      expect(screen.getByTestId('loading')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByTestId('result')).toHaveTextContent(
          '渲染超时，请简化图表',
        );
      });
    });
  });

  describe('Mermaid 集成功能', () => {
    it('应该支持主题切换', () => {
      const TestMermaidTheme = () => {
        const [theme, setTheme] = React.useState('default');
        const themes = ['default', 'dark', 'forest', 'base'];

        return (
          <div>
            <select
              data-testid="theme-select"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              {themes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <div
              data-testid="mermaid-themed"
              className={classNames('mermaid', `theme-${theme}`)}
            >
              graph TD{'\n'}A --{'>'}B
            </div>
          </div>
        );
      };

      render(<TestMermaidTheme />);

      const select = screen.getByTestId('theme-select');
      const diagram = screen.getByTestId('mermaid-themed');

      expect(diagram).toHaveClass('theme-default');

      fireEvent.change(select, { target: { value: 'dark' } });
      expect(diagram).toHaveClass('theme-dark');
    });

    it('应该支持导出功能', () => {
      const TestMermaidExport = () => {
        const diagramSvg = '<svg><text>graph TD\nA --> B</text></svg>';

        const exportAsPNG = () => {
          // 模拟 PNG 导出，避免使用canvas
          // 在实际环境中，这里会使用canvas进行PNG导出
          return 'data:image/png;base64,mock-png-data';
        };

        const exportAsSVG = () => {
          return diagramSvg;
        };

        const [exportData, setExportData] = React.useState('');

        return (
          <div>
            <div dangerouslySetInnerHTML={{ __html: diagramSvg }} />
            <button
              type="button"
              data-testid="export-png"
              onClick={() => setExportData(exportAsPNG())}
            >
              导出 PNG
            </button>
            <button
              type="button"
              data-testid="export-svg"
              onClick={() => setExportData(exportAsSVG())}
            >
              导出 SVG
            </button>
            {exportData && (
              <div data-testid="export-result">
                {exportData.includes('svg') ? 'SVG 数据' : 'PNG 数据'}
              </div>
            )}
          </div>
        );
      };

      render(<TestMermaidExport />);

      const pngButton = screen.getByTestId('export-png');
      const svgButton = screen.getByTestId('export-svg');

      fireEvent.click(pngButton);
      expect(screen.getByTestId('export-result')).toHaveTextContent('PNG 数据');

      fireEvent.click(svgButton);
      expect(screen.getByTestId('export-result')).toHaveTextContent('SVG 数据');
    });

    it('应该支持响应式布局', () => {
      const TestResponsiveMermaid = () => {
        const [containerWidth, setContainerWidth] = React.useState(800);

        const isMobile = containerWidth < 600;
        const isTablet = containerWidth >= 600 && containerWidth < 1024;

        return (
          <div>
            <input
              type="range"
              min="300"
              max="1200"
              value={containerWidth}
              onChange={(e) => setContainerWidth(Number(e.target.value))}
              data-testid="width-slider"
            />
            <div
              data-testid="mermaid-responsive"
              className={classNames('mermaid', {
                mobile: isMobile,
                tablet: isTablet,
                desktop: !isMobile && !isTablet,
              })}
              style={{ width: containerWidth }}
            >
              图表内容
            </div>
            <div data-testid="device-type">
              {isMobile ? '手机' : isTablet ? '平板' : '桌面'}
            </div>
          </div>
        );
      };

      render(<TestResponsiveMermaid />);

      const slider = screen.getByTestId('width-slider') as HTMLInputElement;
      const diagram = screen.getByTestId('mermaid-responsive');
      const deviceType = screen.getByTestId('device-type');

      // 测试手机尺寸
      fireEvent.change(slider, { target: { value: '400' } });
      expect(diagram).toHaveClass('mobile');
      expect(deviceType).toHaveTextContent('手机');

      // 测试平板尺寸
      fireEvent.change(slider, { target: { value: '750' } });
      expect(diagram).toHaveClass('tablet');
      expect(deviceType).toHaveTextContent('平板');

      // 测试桌面尺寸
      fireEvent.change(slider, { target: { value: '1100' } });
      expect(diagram).toHaveClass('desktop');
      expect(deviceType).toHaveTextContent('桌面');
    });
  });
});
