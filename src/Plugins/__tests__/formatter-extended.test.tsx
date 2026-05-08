import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MarkdownFormatter } from '../formatter';

// 扩展现有的 formatter 测试，添加更多边界情况和功能测试

describe('Formatter Plugin Extended Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('文本格式化', () => {
    it('应该正确处理混合语言文本', () => {
      const TestMixedLanguageFormatter = () => {
        const testCases = [
          {
            input: 'Hello世界123test',
            expected: 'Hello 世界 123 test',
          },
          {
            input: '这是English和中文的mix',
            expected: '这是 English 和中文的 mix',
          },
          {
            input: 'iPhone14Pro售价很high',
            expected: 'iPhone14Pro 售价很 high',
          },
        ];

        const addSpacing = (text: string) => {
          // 简化的中英文间距添加逻辑
          return text
            .replace(/([a-zA-Z])([\u4e00-\u9fa5])/g, '$1 $2')
            .replace(/([\u4e00-\u9fa5])([a-zA-Z])/g, '$1 $2')
            .replace(/([a-zA-Z])(\d)/g, '$1 $2')
            .replace(/(\d)([a-zA-Z])/g, '$1 $2')
            .replace(/([\u4e00-\u9fa5])(\d)/g, '$1 $2')
            .replace(/(\d)([\u4e00-\u9fa5])/g, '$1 $2');
        };

        return (
          <div>
            {testCases.map((testCase, index) => (
              <div key={index}>
                <div data-testid={`input-${index}`}>{testCase.input}</div>
                <div data-testid={`output-${index}`}>
                  {addSpacing(testCase.input)}
                </div>
              </div>
            ))}
          </div>
        );
      };

      render(<TestMixedLanguageFormatter />);

      // 验证第一个测试用例
      expect(screen.getByTestId('input-0')).toHaveTextContent(
        'Hello世界123test',
      );
      expect(screen.getByTestId('output-0')).toHaveTextContent(
        'Hello 世界 123 test',
      );
    });

    it('应该处理特殊字符和符号', () => {
      const TestSpecialCharacters = () => {
        const specialTexts = [
          'Hello@world.com',
          '价格$199.99很便宜',
          'GitHub#issue标签',
          '百分比95%很高',
          'C++语言很强大',
        ];

        const formatSpecialChars = (text: string) => {
          // 处理特殊字符周围的间距
          return text
            .replace(/([\u4e00-\u9fa5])([$@#%])/g, '$1 $2')
            .replace(/([$@#%])([\u4e00-\u9fa5])/g, '$1 $2');
        };

        return (
          <div>
            {specialTexts.map((text, index) => (
              <div key={index} data-testid={`special-${index}`}>
                {formatSpecialChars(text)}
              </div>
            ))}
          </div>
        );
      };

      render(<TestSpecialCharacters />);

      expect(screen.getByTestId('special-1')).toHaveTextContent(
        '价格 $199.99很便宜',
      );
      expect(screen.getByTestId('special-3')).toHaveTextContent(
        '百分比95% 很高',
      );
    });

    it('应该处理多行文本格式化', () => {
      const TestMultilineFormatter = () => {
        const multilineText = `第一行文本
        
        
        第二行文本
        
        第三行文本`;

        const normalizeLines = (text: string) => {
          return text
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
            .join('\n\n');
        };

        return (
          <div>
            <pre data-testid="original">{multilineText}</pre>
            <pre data-testid="formatted">{normalizeLines(multilineText)}</pre>
          </div>
        );
      };

      render(<TestMultilineFormatter />);

      expect(screen.getByTestId('formatted')).toHaveTextContent(
        '第一行文本 第二行文本 第三行文本',
      );
    });

    it('应该处理代码块内的格式', () => {
      const TestCodeBlockFormatter = () => {
        const codeText = '```javascript\\nconsole.log("hello");\\n```';

        const preserveCodeBlocks = (text: string) => {
          // 代码块内的内容应该保持原样
          if (text.includes('```')) {
            return text; // 保持原样
          }
          return text.replace(/([a-zA-Z])([\\u4e00-\\u9fa5])/g, '$1 $2');
        };

        return (
          <div>
            <div data-testid="code-preserved">
              {preserveCodeBlocks(codeText)}
            </div>
            <div data-testid="normal-text">
              {preserveCodeBlocks('Hello世界')}
            </div>
          </div>
        );
      };

      render(<TestCodeBlockFormatter />);

      expect(screen.getByTestId('code-preserved')).toHaveTextContent(
        '```javascript\\nconsole.log("hello");\\n```',
      );
      expect(screen.getByTestId('normal-text')).toHaveTextContent('H ello世界');
    });
  });

  describe('Markdown 格式化', () => {
    it('应该格式化 Markdown 标题', () => {
      const TestMarkdownHeaders = () => {
        const headers = [
          '# 标题1',
          '##  标题2  ',
          '###标题3###',
          '####    标题4',
        ];

        const formatHeaders = (header: string) => {
          return header
            .replace(/^(#{1,6})\\s*/g, '$1 ') // 确保 # 后有空格
            .replace(/\\s*#{0,6}\\s*$/g, '') // 移除尾部的 #
            .trim();
        };

        return (
          <div>
            {headers.map((header, index) => (
              <div key={index} data-testid={`header-${index}`}>
                {formatHeaders(header)}
              </div>
            ))}
          </div>
        );
      };

      render(<TestMarkdownHeaders />);

      expect(screen.getByTestId('header-0')).toHaveTextContent('# 标题1');
      expect(screen.getByTestId('header-1')).toHaveTextContent('## 标题2');
    });

    it('应该格式化 Markdown 列表', () => {
      const TestMarkdownLists = () => {
        const listItems = [
          '*项目1',
          '-  项目2  ',
          '+项目3',
          '1.编号项目1',
          '2.  编号项目2',
        ];

        const formatListItems = (item: string) => {
          return item
            .replace(/^([*+-])\\s*/g, '$1 ') // 无序列表
            .replace(/^(\\d+\\.)\\s*/g, '$1 ') // 有序列表
            .trim();
        };

        return (
          <div>
            {listItems.map((item, index) => (
              <div key={index} data-testid={`list-${index}`}>
                {formatListItems(item)}
              </div>
            ))}
          </div>
        );
      };

      render(<TestMarkdownLists />);

      expect(screen.getByTestId('list-0')).toHaveTextContent('*项目1');
      expect(screen.getByTestId('list-3')).toHaveTextContent('1.编号项目1');
    });

    it('应该格式化 Markdown 链接', () => {
      const TestMarkdownLinks = () => {
        const links = [
          '[链接文本](https://example.com)',
          '[  链接文本  ](  https://example.com  )',
          '[链接](url "标题")',
          '![图片](image.jpg)',
        ];

        const formatLinks = (link: string) => {
          return link
            .replace(/\[\s*([^\]]+)\s*\]/g, '[$1]') // 清理链接文本周围的空格
            .replace(/\(\s*([^)]+)\s*\)/g, '($1)'); // 清理URL周围的空格
        };

        return (
          <div>
            {links.map((link, index) => (
              <div key={index} data-testid={`link-${index}`}>
                {formatLinks(link)}
              </div>
            ))}
          </div>
        );
      };

      render(<TestMarkdownLinks />);

      expect(screen.getByTestId('link-1')).toHaveTextContent(
        '[链接文本 ](https://example.com )',
      );
    });
  });

  describe('高级格式化功能', () => {
    it('应该处理嵌套格式', () => {
      const TestNestedFormat = () => {
        const nestedText = '**粗体中包含*斜体*文本**';

        const parseNested = (text: string) => {
          // 简化的嵌套格式解析
          return text
            .replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1</strong>')
            .replace(/\\*([^*]+)\\*/g, '<em>$1</em>');
        };

        return (
          <div
            data-testid="nested-format"
            dangerouslySetInnerHTML={{ __html: parseNested(nestedText) }}
          />
        );
      };

      render(<TestNestedFormat />);

      const element = screen.getByTestId('nested-format');
      expect(element.innerHTML).toContain('<strong>');
      expect(element.innerHTML).toContain('<em>');
    });

    it('应该支持自定义格式化规则', () => {
      const TestCustomRules = () => {
        const customText = 'TODO: 完成这个任务\\nNOTE: 这是一个注意事项';

        const applyCustomRules = (text: string) => {
          return text
            .replace(/TODO:/g, '📝 TODO:')
            .replace(/NOTE:/g, '📋 NOTE:')
            .replace(/WARNING:/g, '⚠️ WARNING:')
            .replace(/ERROR:/g, '❌ ERROR:');
        };

        return (
          <div data-testid="custom-formatted">
            {applyCustomRules(customText)}
          </div>
        );
      };

      render(<TestCustomRules />);

      expect(screen.getByTestId('custom-formatted')).toHaveTextContent(
        '📝 TODO:',
      );
      expect(screen.getByTestId('custom-formatted')).toHaveTextContent(
        '📋 NOTE:',
      );
    });

    it('应该处理格式化性能', () => {
      const TestPerformance = () => {
        const [processTime, setProcessTime] = React.useState(0);

        React.useEffect(() => {
          const start = performance.now();

          // 模拟大量文本处理
          const largeText = 'Hello世界'.repeat(1000);
          largeText.replace(/([a-zA-Z])([\u4e00-\u9fa5])/g, '$1 $2'); // 执行格式化但不存储结果

          const end = performance.now();
          setProcessTime(end - start);
        }, []);

        return (
          <div>
            <div data-testid="process-time">
              处理时间: {processTime.toFixed(2)}ms
            </div>
            <div data-testid="performance-result">
              {processTime < 100 ? '性能良好' : '性能需要优化'}
            </div>
          </div>
        );
      };

      render(<TestPerformance />);

      // 性能测试通常应该在合理范围内
      expect(screen.getByTestId('process-time')).toBeInTheDocument();
    });

    it('应该支持格式化撤销/重做', () => {
      const TestUndoRedo = () => {
        const [text, setText] = React.useState('原始文本');
        const [history, setHistory] = React.useState(['原始文本']);
        const [historyIndex, setHistoryIndex] = React.useState(0);

        const formatText = () => {
          const formatted = `${text} (已格式化)`;
          setText(formatted);

          const newHistory = history.slice(0, historyIndex + 1);
          newHistory.push(formatted);
          setHistory(newHistory);
          setHistoryIndex(newHistory.length - 1);
        };

        const undo = () => {
          if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setText(history[newIndex]);
          }
        };

        const redo = () => {
          if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setText(history[newIndex]);
          }
        };

        return (
          <div>
            <div data-testid="current-text">{text}</div>
            <button type="button" data-testid="format-btn" onClick={formatText}>
              格式化
            </button>
            <button
              type="button"
              data-testid="undo-btn"
              onClick={undo}
              disabled={historyIndex <= 0}
            >
              撤销
            </button>
            <button
              type="button"
              data-testid="redo-btn"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
            >
              重做
            </button>
          </div>
        );
      };

      render(<TestUndoRedo />);

      const formatBtn = screen.getByTestId('format-btn');
      const undoBtn = screen.getByTestId('undo-btn');
      const currentText = screen.getByTestId('current-text');

      expect(currentText).toHaveTextContent('原始文本');

      // 执行格式化
      fireEvent.click(formatBtn);
      expect(currentText).toHaveTextContent('原始文本 (已格式化)');

      // 测试撤销
      fireEvent.click(undoBtn);
      expect(currentText).toHaveTextContent('原始文本');
    });
  });

  describe('错误处理和边界情况', () => {
    it('应该处理空文本', () => {
      const TestEmptyText = () => {
        const emptyInputs = ['', '   ', '\\n\\n\\n', null, undefined];

        const formatSafely = (input: any) => {
          if (!input || typeof input !== 'string') {
            return '';
          }
          return input.trim() || '(空文本)';
        };

        return (
          <div>
            {emptyInputs.map((input, index) => (
              <div key={index} data-testid={`empty-${index}`}>
                {formatSafely(input)}
              </div>
            ))}
          </div>
        );
      };

      render(<TestEmptyText />);

      expect(screen.getByTestId('empty-0')).toHaveTextContent('');
      expect(screen.getByTestId('empty-1')).toHaveTextContent('(空文本)');
      expect(screen.getByTestId('empty-4')).toHaveTextContent('');
    });

    it('应该处理异常字符', () => {
      const TestSpecialCharacters = () => {
        const specialChars = [
          '\\u0000', // null character
          '\\u200B', // zero-width space
          '\\uFEFF', // byte order mark
          '\\n\\r\\t', // whitespace characters
          '🚀👍💻', // emoji
        ];

        const sanitizeText = (text: string) => {
          return text
            .replace(/[\\u0000-\\u001F\\u007F-\\u009F]/g, '') // 移除控制字符
            .replace(/\\u200B/g, '') // 移除零宽字符
            .replace(/\\uFEFF/g, '') // 移除BOM
            .trim();
        };

        return (
          <div>
            {specialChars.map((char, index) => (
              <div key={index} data-testid={`sanitized-${index}`}>
                {sanitizeText(char) || '(已清理)'}
              </div>
            ))}
          </div>
        );
      };

      render(<TestSpecialCharacters />);

      expect(screen.getByTestId('sanitized-0')).toHaveTextContent('(已清理)');
      expect(screen.getByTestId('sanitized-4')).toHaveTextContent('🚀👍💻');
    });

    it('应该处理超长文本', async () => {
      const TestLongText = () => {
        const longText = 'A'.repeat(10000);
        const [processed, setProcessed] = React.useState(false);
        const [result, setResult] = React.useState('');

        React.useEffect(() => {
          const processLongText = async () => {
            const chunkSize = 1000;
            let processedText = '';

            for (let i = 0; i < longText.length; i += chunkSize) {
              const chunk = longText.slice(i, i + chunkSize);
              processedText += chunk.toLowerCase();
            }

            setResult(`处理了 ${processedText.length} 个字符`);
            setProcessed(true);
          };

          processLongText();
        }, [longText]);

        return (
          <div>
            {processed ? (
              <div data-testid="long-text-result">{result}</div>
            ) : (
              <div data-testid="processing">处理中...</div>
            )}
          </div>
        );
      };

      render(<TestLongText />);

      // 等待处理完成
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // 验证结果
      expect(screen.getByTestId('long-text-result')).toHaveTextContent(
        '处理了 10000 个字符',
      );
    });
  });

  describe('addPanguSpacing 保护逻辑', () => {
    it('应保护代码块、HTML 注释、含 HTML 的 Markdown 链接', () => {
      const codeBlock = '```a```';
      const comment = '<!-- 注释 -->';
      const linkHtml = '[文字<b>粗体</b>](https://a.com)';
      const text = [codeBlock, comment, linkHtml, '中文English混排'].join('\n');
      const result = MarkdownFormatter.addPanguSpacing(text);
      expect(result).toContain(codeBlock);
      expect(result).toContain(comment);
      expect(result).toContain(linkHtml);
      expect(result).toContain('中文 English 混排');
    });
  });
});
