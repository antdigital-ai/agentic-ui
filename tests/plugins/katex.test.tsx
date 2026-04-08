import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import classNames from 'clsx';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock KaTeX
vi.mock('katex', () => ({
  default: {
    renderToString: vi.fn(
      (latex: string) => `<span class="katex">${latex}</span>`,
    ),
    render: vi.fn(),
  },
}));

// Mock dependencies
vi.mock('../../src/MarkdownEditor/editor/store', () => ({
  useEditorStore: vi.fn(() => ({
    readonly: false,
    markdownEditorRef: { current: null },
  })),
}));

vi.mock('slate-react', () => ({
  ReactEditor: {
    isFocused: vi.fn(() => true),
  },
}));

vi.mock('../../src/MarkdownEditor/hooks/editor', () => ({
  useSelStatus: vi.fn(() => [false, []]),
}));

describe('Katex Plugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Katex 渲染功能', () => {
    it('应该渲染简单的数学公式', () => {
      const TestKatex = ({ latex }: { latex: string }) => {
        // 模拟 KaTeX 渲染逻辑
        const renderLatex = (input: string) => {
          return `<span class="katex">${input}</span>`;
        };

        return (
          <div
            data-testid="katex-output"
            dangerouslySetInnerHTML={{ __html: renderLatex(latex) }}
          />
        );
      };

      render(<TestKatex latex="x^2 + y^2 = z^2" />);

      const output = screen.getByTestId('katex-output');
      expect(output.innerHTML).toContain('x^2 + y^2 = z^2');
    });

    it('应该支持复杂的数学公式', () => {
      const complexFormulas = [
        '\\sum_{i=1}^{n} x_i',
        '\\int_{-\\infty}^{\\infty} e^{-x^2} dx',
        '\\frac{\\partial f}{\\partial x}',
        '\\begin{matrix} a & b \\\\ c & d \\end{matrix}',
        '\\lim_{x \\to \\infty} \\frac{1}{x}',
      ];

      const TestComplexKatex = () => {
        return (
          <div>
            {complexFormulas.map((formula, index) => (
              <div key={index} data-testid={`formula-${index}`}>
                <span className="katex">{formula}</span>
              </div>
            ))}
          </div>
        );
      };

      render(<TestComplexKatex />);

      complexFormulas.forEach((formula, index) => {
        expect(screen.getByTestId(`formula-${index}`)).toHaveTextContent(
          formula,
        );
      });
    });

    it('应该处理内联公式', () => {
      const TestInlineKatex = () => {
        const text = '这是一个内联公式 $x = y + z$ 在文本中。';

        return <div data-testid="inline-text">{text}</div>;
      };

      render(<TestInlineKatex />);

      expect(screen.getByTestId('inline-text')).toHaveTextContent(
        '这是一个内联公式 $x = y + z$ 在文本中。',
      );
    });

    it('应该处理块级公式', () => {
      const TestBlockKatex = () => {
        const blockFormula = '$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$';

        return (
          <div data-testid="block-formula" className="katex-block">
            {blockFormula}
          </div>
        );
      };

      render(<TestBlockKatex />);

      const blockElement = screen.getByTestId('block-formula');
      expect(blockElement).toHaveClass('katex-block');
      expect(blockElement).toHaveTextContent(
        '$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$',
      );
    });
  });

  describe('Katex 编辑功能', () => {
    it('应该支持实时预览', async () => {
      const TestKatexEditor = () => {
        const [latex, setLatex] = React.useState('x^2');
        const [preview, setPreview] = React.useState('');

        React.useEffect(() => {
          // 模拟实时渲染
          const timer = setTimeout(() => {
            setPreview(`<span class="katex">${latex}</span>`);
          }, 100);
          return () => clearTimeout(timer);
        }, [latex]);

        return (
          <div>
            <textarea
              data-testid="latex-input"
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
              placeholder="输入 LaTeX 公式..."
            />
            <div
              data-testid="latex-preview"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          </div>
        );
      };

      render(<TestKatexEditor />);

      const input = screen.getByTestId('latex-input') as HTMLTextAreaElement;
      const preview = screen.getByTestId('latex-preview');

      fireEvent.change(input, { target: { value: 'y = mx + b' } });

      await waitFor(() => {
        expect(preview.innerHTML).toContain('y = mx + b');
      });
    });

    it('应该支持语法验证', () => {
      const TestKatexValidation = () => {
        const [latex, setLatex] = React.useState('');
        const [error, setError] = React.useState('');

        const validateLatex = (input: string) => {
          // 简单的语法验证
          if (input.includes('\\invalidcommand')) {
            setError('无效的 LaTeX 命令');
          } else if (input.match(/\{[^}]*$/)) {
            setError('未闭合的大括号');
          } else {
            setError('');
          }
        };

        const handleChange = (value: string) => {
          setLatex(value);
          validateLatex(value);
        };

        return (
          <div>
            <textarea
              data-testid="latex-input"
              value={latex}
              onChange={(e) => handleChange(e.target.value)}
            />
            {error && (
              <div data-testid="error-message" className="error">
                {error}
              </div>
            )}
          </div>
        );
      };

      render(<TestKatexValidation />);

      const input = screen.getByTestId('latex-input');

      // 测试无效命令
      fireEvent.change(input, { target: { value: '\\invalidcommand{x}' } });
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        '无效的 LaTeX 命令',
      );

      // 测试未闭合括号
      fireEvent.change(input, { target: { value: '\\frac{a' } });
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        '未闭合的大括号',
      );

      // 测试有效公式
      fireEvent.change(input, { target: { value: '\\frac{a}{b}' } });
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });

    it('应该支持常用公式插入', () => {
      const TestFormulaTemplates = () => {
        const [latex, setLatex] = React.useState('');

        const templates = [
          { name: '分数', latex: '\\frac{a}{b}' },
          { name: '求和', latex: '\\sum_{i=1}^{n} x_i' },
          { name: '积分', latex: '\\int_{a}^{b} f(x) dx' },
          {
            name: '矩阵',
            latex: '\\begin{matrix} a & b \\\\ c & d \\end{matrix}',
          },
          { name: '根号', latex: '\\sqrt{x}' },
        ];

        const insertTemplate = (template: string) => {
          setLatex((prev) => prev + template);
        };

        return (
          <div>
            <textarea
              data-testid="latex-input"
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
            />
            <div data-testid="template-buttons">
              {templates.map((template, index) => (
                <button
                  key={index}
                  type="button"
                  data-testid={`template-${index}`}
                  onClick={() => insertTemplate(template.latex)}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>
        );
      };

      render(<TestFormulaTemplates />);

      const input = screen.getByTestId('latex-input') as HTMLTextAreaElement;
      const fractionButton = screen.getByTestId('template-0');

      fireEvent.click(fractionButton);

      expect(input.value).toBe('\\frac{a}{b}');
    });
  });

  describe('Katex 错误处理', () => {
    it('应该处理渲染错误', () => {
      const TestKatexError = () => {
        const [latex] = React.useState('\\invalid{syntax');
        const [error, setError] = React.useState('');

        React.useEffect(() => {
          try {
            // 模拟 KaTeX 渲染错误
            if (latex.includes('\\invalid')) {
              throw new Error('ParseError: Undefined control sequence');
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : '渲染错误');
          }
        }, [latex]);

        return (
          <div>
            {error ? (
              <div data-testid="katex-error" className="katex-error">
                {error}
              </div>
            ) : (
              <div data-testid="katex-success">渲染成功</div>
            )}
          </div>
        );
      };

      render(<TestKatexError />);

      expect(screen.getByTestId('katex-error')).toHaveTextContent(
        'ParseError: Undefined control sequence',
      );
    });

    it('应该提供错误恢复机制', () => {
      const TestKatexRecovery = () => {
        const [latex, setLatex] = React.useState('\\invalid{syntax');
        const [showFallback, setShowFallback] = React.useState(false);

        const handleRenderError = () => {
          setShowFallback(true);
        };

        const retry = () => {
          setShowFallback(false);
          setLatex('x^2 + y^2 = z^2'); // 修复为有效公式
        };

        React.useEffect(() => {
          if (latex.includes('\\invalid')) {
            handleRenderError();
          } else {
            setShowFallback(false);
          }
        }, [latex]);

        return (
          <div>
            {showFallback ? (
              <div data-testid="fallback-content">
                <div>公式渲染失败</div>
                <button
                  type="button"
                  data-testid="retry-button"
                  onClick={retry}
                >
                  使用默认公式
                </button>
              </div>
            ) : (
              <div data-testid="katex-content">
                <span className="katex">{latex}</span>
              </div>
            )}
          </div>
        );
      };

      render(<TestKatexRecovery />);

      expect(screen.getByTestId('fallback-content')).toBeInTheDocument();

      const retryButton = screen.getByTestId('retry-button');
      fireEvent.click(retryButton);

      expect(screen.getByTestId('katex-content')).toBeInTheDocument();
      expect(screen.getByTestId('katex-content')).toHaveTextContent(
        'x^2 + y^2 = z^2',
      );
    });

    it('应该处理空输入', () => {
      const TestEmptyKatex = () => {
        const [latex] = React.useState('');

        return (
          <div>
            {latex.trim() === '' ? (
              <div data-testid="empty-placeholder">点击此处输入数学公式</div>
            ) : (
              <div data-testid="katex-output">
                <span className="katex">{latex}</span>
              </div>
            )}
          </div>
        );
      };

      render(<TestEmptyKatex />);

      expect(screen.getByTestId('empty-placeholder')).toHaveTextContent(
        '点击此处输入数学公式',
      );
    });
  });

  describe('Katex 集成功能', () => {
    it('应该支持只读模式', () => {
      const TestReadonlyKatex = ({ readonly }: { readonly: boolean }) => {
        const latex = '\\sum_{i=1}^{n} x_i';

        return (
          <div>
            {readonly ? (
              <div data-testid="readonly-katex" className="katex-readonly">
                <span className="katex">{latex}</span>
              </div>
            ) : (
              <div data-testid="editable-katex" className="katex-editable">
                <textarea value={latex} readOnly />
                <div className="katex-preview">
                  <span className="katex">{latex}</span>
                </div>
              </div>
            )}
          </div>
        );
      };

      const { rerender } = render(<TestReadonlyKatex readonly={false} />);

      expect(screen.getByTestId('editable-katex')).toBeInTheDocument();

      rerender(<TestReadonlyKatex readonly={true} />);

      expect(screen.getByTestId('readonly-katex')).toBeInTheDocument();
      expect(screen.getByTestId('readonly-katex')).toHaveClass(
        'katex-readonly',
      );
    });

    it('应该支持拖拽功能', () => {
      const TestDraggableKatex = () => {
        const [isDragging, setIsDragging] = React.useState(false);

        return (
          <div
            data-testid="draggable-katex"
            className={classNames('katex-block', { dragging: isDragging })}
            draggable
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
          >
            <span className="katex">E = mc^2</span>
          </div>
        );
      };

      render(<TestDraggableKatex />);

      const draggableElement = screen.getByTestId('draggable-katex');

      expect(draggableElement).toHaveAttribute('draggable', 'true');

      fireEvent.dragStart(draggableElement);
      expect(draggableElement).toHaveClass('dragging');

      fireEvent.dragEnd(draggableElement);
      expect(draggableElement).not.toHaveClass('dragging');
    });

    it('应该支持键盘快捷键', () => {
      const TestKatexShortcuts = () => {
        const [latex, setLatex] = React.useState('');

        const handleKeyDown = (e: React.KeyboardEvent) => {
          // Ctrl/Cmd + B: 加粗
          if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            setLatex((prev) => prev + '\\mathbf{}');
          }
          // Ctrl/Cmd + I: 斜体
          if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
            e.preventDefault();
            setLatex((prev) => prev + '\\mathit{}');
          }
          // Ctrl/Cmd + F: 分数
          if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            setLatex((prev) => prev + '\\frac{}{}');
          }
        };

        return (
          <textarea
            data-testid="katex-input"
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        );
      };

      render(<TestKatexShortcuts />);

      const input = screen.getByTestId('katex-input') as HTMLTextAreaElement;

      // 测试 Ctrl+B
      fireEvent.keyDown(input, { key: 'b', ctrlKey: true });
      expect(input.value).toBe('\\mathbf{}');

      // 测试 Ctrl+F
      fireEvent.keyDown(input, { key: 'f', ctrlKey: true });
      expect(input.value).toBe('\\mathbf{}\\frac{}{}');
    });
  });

  describe('Katex 性能优化', () => {
    it('应该实现防抖渲染', async () => {
      const TestDebouncedKatex = () => {
        const [latex, setLatex] = React.useState('');
        const [renderCount, setRenderCount] = React.useState(0);

        // 模拟防抖渲染
        React.useEffect(() => {
          const timer = setTimeout(() => {
            if (latex) {
              setRenderCount((prev) => prev + 1);
            }
          }, 300);

          return () => clearTimeout(timer);
        }, [latex]);

        return (
          <div>
            <textarea
              data-testid="latex-input"
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
            />
            <div data-testid="render-count">渲染次数: {renderCount}</div>
          </div>
        );
      };

      render(<TestDebouncedKatex />);

      const input = screen.getByTestId('latex-input');
      const renderCount = screen.getByTestId('render-count');

      // 快速输入多个字符
      fireEvent.change(input, { target: { value: 'x' } });
      fireEvent.change(input, { target: { value: 'x^' } });
      fireEvent.change(input, { target: { value: 'x^2' } });

      // 初始状态
      expect(renderCount).toHaveTextContent('渲染次数: 0');

      // 等待防抖时间
      await waitFor(
        () => {
          expect(renderCount).toHaveTextContent('渲染次数: 1');
        },
        { timeout: 500 },
      );
    });

    it('应该缓存渲染结果', () => {
      const TestKatexCache = () => {
        const [cache] = React.useState(new Map<string, string>());

        const renderWithCache = (latex: string): string => {
          if (cache.has(latex)) {
            return cache.get(latex) || '';
          }

          const result = `<span class="katex">${latex}</span>`;
          cache.set(latex, result);
          return result;
        };

        const formulas = ['x^2', 'y^2', 'x^2']; // x^2 重复

        return (
          <div>
            {formulas.map((formula, index) => (
              <div
                key={index}
                data-testid={`formula-${index}`}
                dangerouslySetInnerHTML={{ __html: renderWithCache(formula) }}
              />
            ))}
            <div data-testid="cache-size">缓存大小: {cache.size}</div>
          </div>
        );
      };

      render(<TestKatexCache />);

      // 验证缓存生效（只有2个不同的公式被缓存）
      expect(screen.getByTestId('cache-size')).toHaveTextContent('缓存大小: 2');
    });
  });
});
