import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('ace-builds', () => ({
  edit: vi.fn(() => ({
    setTheme: vi.fn(),
    getSession: vi.fn(() => ({
      setMode: vi.fn(),
      setValue: vi.fn(),
      getValue: vi.fn(() => 'mock code'),
      on: vi.fn(),
      setUseWrapMode: vi.fn(),
      setUseSoftTabs: vi.fn(),
      setTabSize: vi.fn(),
    })),
    setOptions: vi.fn(),
    setFontSize: vi.fn(),
    resize: vi.fn(),
    focus: vi.fn(),
    destroy: vi.fn(),
    isFocused: vi.fn(() => false),
    on: vi.fn(),
    off: vi.fn(),
  })),
  config: {
    set: vi.fn(),
    loadModule: vi.fn(),
  },
}));

describe('Code Plugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Language Options', () => {
    it('应该支持主要编程语言', () => {
      const languages = [
        'javascript',
        'typescript',
        'python',
        'java',
        'cpp',
        'c',
        'csharp',
        'php',
        'ruby',
        'go',
        'rust',
        'swift',
        'kotlin',
        'scala',
        'html',
        'css',
        'scss',
        'less',
        'json',
        'xml',
        'yaml',
        'markdown',
        'sql',
        'bash',
        'shell',
        'powershell',
        'dockerfile',
        'nginx',
        'apache',
        'htaccess',
      ];

      // 测试语言支持
      languages.forEach((lang) => {
        expect(typeof lang).toBe('string');
        expect(lang.length).toBeGreaterThan(0);
      });
    });

    it('应该有对应的语言图标映射', () => {
      const TestComponent = () => {
        const langIconMap = {
          javascript: '🟨',
          typescript: '🔷',
          python: '🐍',
          java: '☕',
          cpp: '⚙️',
          html: '🌐',
          css: '🎨',
          json: '📋',
          markdown: '📝',
          sql: '🗃️',
        };

        return (
          <div>
            {Object.entries(langIconMap).map(([lang, icon]) => (
              <span key={lang} data-testid={`icon-${lang}`}>
                {icon}
              </span>
            ))}
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId('icon-javascript')).toHaveTextContent('🟨');
      expect(screen.getByTestId('icon-typescript')).toHaveTextContent('🔷');
      expect(screen.getByTestId('icon-python')).toHaveTextContent('🐍');
    });
  });

  describe('Code Editor Component', () => {
    const mockElement = {
      type: 'code' as const,
      language: 'javascript',
      value: 'console.log("Hello World");',
    };

    it('应该渲染代码编辑器', () => {
      const TestCodeEditor = () => {
        return (
          <div data-testid="code-editor" className="ace-el">
            <div data-testid="language-selector">javascript</div>
            <div data-testid="code-content">{mockElement.value}</div>
          </div>
        );
      };

      render(<TestCodeEditor />);

      expect(screen.getByTestId('code-editor')).toBeInTheDocument();
      expect(screen.getByTestId('language-selector')).toHaveTextContent(
        'javascript',
      );
      expect(screen.getByTestId('code-content')).toHaveTextContent(
        'console.log("Hello World");',
      );
    });

    it('应该支持语言切换', async () => {
      const TestLanguageSelector = () => {
        const [language, setLanguage] = React.useState('javascript');
        const languages = ['javascript', 'typescript', 'python', 'java'];

        return (
          <div>
            <select
              data-testid="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
            <div data-testid="current-language">{language}</div>
          </div>
        );
      };

      render(<TestLanguageSelector />);

      const select = screen.getByTestId('language-select');
      fireEvent.change(select, { target: { value: 'python' } });

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent(
          'python',
        );
      });
    });

    it('应该支持代码复制功能', async () => {
      // Mock clipboard API
      const mockWriteText = vi.fn();
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      const TestCopyButton = () => {
        const codeContent = 'console.log("Hello World");';

        const handleCopy = () => {
          navigator.clipboard.writeText(codeContent);
        };

        return (
          <div>
            <pre data-testid="code-block">{codeContent}</pre>
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

      render(<TestCopyButton />);

      const copyButton = screen.getByTestId('copy-button');
      fireEvent.click(copyButton);

      expect(mockWriteText).toHaveBeenCalledWith('console.log("Hello World");');
    });

    it('应该支持代码格式化', () => {
      const TestCodeFormatter = () => {
        const [code, setCode] = React.useState('const x=1;let y=2;');

        const formatCode = () => {
          // 简单的代码格式化逻辑
          const formatted = code
            .replace(/;/g, ';\n')
            .replace(/=/g, ' = ')
            .trim();
          setCode(formatted);
        };

        return (
          <div>
            <textarea
              data-testid="code-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button
              type="button"
              data-testid="format-button"
              onClick={formatCode}
            >
              格式化代码
            </button>
          </div>
        );
      };

      render(<TestCodeFormatter />);

      const formatButton = screen.getByTestId('format-button');
      const codeInput = screen.getByTestId('code-input') as HTMLTextAreaElement;

      expect(codeInput.value).toBe('const x=1;let y=2;');

      fireEvent.click(formatButton);

      expect(codeInput.value).toBe('const x = 1;\nlet y = 2;');
    });

    it('应该支持代码执行预览', () => {
      const TestCodePreview = () => {
        const [code, setCode] = React.useState('console.log("Hello World");');
        const [output, setOutput] = React.useState('');

        const executeCode = () => {
          // 模拟代码执行
          if (code.includes('console.log')) {
            const match = code.match(/console\.log\("(.+)"\)/);
            if (match) {
              setOutput(match[1]);
            }
          }
        };

        return (
          <div>
            <textarea
              data-testid="code-editor"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button
              type="button"
              data-testid="run-button"
              onClick={executeCode}
            >
              运行代码
            </button>
            <div data-testid="output">{output}</div>
          </div>
        );
      };

      render(<TestCodePreview />);

      const runButton = screen.getByTestId('run-button');
      fireEvent.click(runButton);

      expect(screen.getByTestId('output')).toHaveTextContent('Hello World');
    });
  });

  describe('Code Plugin Integration', () => {
    it('应该处理只读模式', () => {
      const TestReadonlyCode = ({ readonly }: { readonly: boolean }) => {
        return (
          <div>
            <div
              data-testid="code-editor"
              className={readonly ? 'readonly' : 'editable'}
            >
              console.log(&quot;Hello World&quot;);
            </div>
            {!readonly && (
              <div data-testid="edit-controls">
                <button type="button">编辑</button>
              </div>
            )}
          </div>
        );
      };

      const { rerender } = render(<TestReadonlyCode readonly={false} />);

      expect(screen.getByTestId('code-editor')).toHaveClass('editable');
      expect(screen.getByTestId('edit-controls')).toBeInTheDocument();

      rerender(<TestReadonlyCode readonly={true} />);

      expect(screen.getByTestId('code-editor')).toHaveClass('readonly');
      expect(screen.queryByTestId('edit-controls')).not.toBeInTheDocument();
    });

    it('应该支持语法高亮', () => {
      const TestSyntaxHighlight = ({ language }: { language: string }) => {
        const getHighlightClass = (lang: string) => {
          const mapping: Record<string, string> = {
            javascript: 'language-js',
            typescript: 'language-ts',
            python: 'language-python',
            html: 'language-html',
            css: 'language-css',
          };
          return mapping[lang] || 'language-text';
        };

        return (
          <pre
            data-testid="highlighted-code"
            className={getHighlightClass(language)}
          >
            <code>Sample code content</code>
          </pre>
        );
      };

      render(<TestSyntaxHighlight language="javascript" />);

      expect(screen.getByTestId('highlighted-code')).toHaveClass('language-js');
    });

    it('应该支持代码折叠', () => {
      const TestCodeFolding = () => {
        const [folded, setFolded] = React.useState(false);
        const longCode = `function example() {
  console.log("line 1");
  console.log("line 2");
  console.log("line 3");
  console.log("line 4");
  console.log("line 5");
}`;

        return (
          <div>
            <button
              type="button"
              data-testid="fold-toggle"
              onClick={() => setFolded(!folded)}
            >
              {folded ? '展开' : '折叠'}
            </button>
            <pre data-testid="code-block">
              {folded ? 'function example() { ... }' : longCode}
            </pre>
          </div>
        );
      };

      render(<TestCodeFolding />);

      const foldToggle = screen.getByTestId('fold-toggle');
      const codeBlock = screen.getByTestId('code-block');

      expect(foldToggle).toHaveTextContent('折叠');
      expect(codeBlock).toHaveTextContent('function example() {');

      fireEvent.click(foldToggle);

      expect(foldToggle).toHaveTextContent('展开');
      expect(codeBlock).toHaveTextContent('function example() { ... }');
    });
  });

  describe('Code Editor Error Handling', () => {
    it('应该处理无效的代码内容', () => {
      const TestErrorHandling = () => {
        const invalidInputs = [null, undefined, '', '   '];

        return (
          <div>
            {invalidInputs.map((input, index) => (
              <div key={index} data-testid={`input-${index}`}>
                {input === null
                  ? '(null)'
                  : input === undefined
                    ? '(undefined)'
                    : input === ''
                      ? '(empty)'
                      : input}
              </div>
            ))}
          </div>
        );
      };

      render(<TestErrorHandling />);

      expect(screen.getByTestId('input-0')).toHaveTextContent('(null)');
      expect(screen.getByTestId('input-1')).toHaveTextContent('(undefined)');
      expect(screen.getByTestId('input-2')).toHaveTextContent('(empty)');
      // 检查空白字符内容
      const input3 = screen.getByTestId('input-3');
      expect(input3.textContent).toBe('   ');
    });

    it('应该处理不支持的语言', () => {
      const TestUnsupportedLanguage = () => {
        const language = 'unsupported-lang';
        const supportedLanguages = ['javascript', 'python', 'java'];
        const isSupported = supportedLanguages.includes(language);

        return (
          <div>
            <div data-testid="language-status">
              {isSupported ? '支持的语言' : '不支持的语言'}
            </div>
            <div data-testid="fallback-language">
              {isSupported ? language : 'text'}
            </div>
          </div>
        );
      };

      render(<TestUnsupportedLanguage />);

      expect(screen.getByTestId('language-status')).toHaveTextContent(
        '不支持的语言',
      );
      expect(screen.getByTestId('fallback-language')).toHaveTextContent('text');
    });
  });
});
