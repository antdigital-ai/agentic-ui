import { describe, expect, it } from 'vitest';
import {
  getLanguageFromFilename,
  isSupportedLanguage,
  wrapContentInCodeBlock,
} from '../../../src/Workspace/utils/codeLanguageUtils';

describe('codeLanguageUtils', () => {
  describe('getLanguageFromFilename', () => {
    describe('Web前端语言', () => {
      it('应该识别JavaScript文件', () => {
        expect(getLanguageFromFilename('app.js')).toBe('javascript');
        expect(getLanguageFromFilename('index.jsx')).toBe('jsx');
      });

      it('应该识别TypeScript文件', () => {
        expect(getLanguageFromFilename('app.ts')).toBe('typescript');
        expect(getLanguageFromFilename('component.tsx')).toBe('tsx');
      });

      it('应该识别样式文件', () => {
        expect(getLanguageFromFilename('style.css')).toBe('css');
        expect(getLanguageFromFilename('style.scss')).toBe('scss');
        expect(getLanguageFromFilename('style.sass')).toBe('sass');
        expect(getLanguageFromFilename('style.less')).toBe('less');
      });

      it('应该识别HTML文件', () => {
        expect(getLanguageFromFilename('index.html')).toBe('html');
        expect(getLanguageFromFilename('page.htm')).toBe('html');
      });

      it('应该识别Vue文件', () => {
        expect(getLanguageFromFilename('App.vue')).toBe('vue');
      });
    });

    describe('后端语言', () => {
      it('应该识别Java文件', () => {
        expect(getLanguageFromFilename('Main.java')).toBe('java');
      });

      it('应该识别Python文件', () => {
        expect(getLanguageFromFilename('script.py')).toBe('python');
        expect(getLanguageFromFilename('app.pyw')).toBe('python');
      });

      it('应该识别Ruby文件', () => {
        expect(getLanguageFromFilename('app.rb')).toBe('ruby');
      });

      it('应该识别PHP文件', () => {
        expect(getLanguageFromFilename('index.php')).toBe('php');
      });

      it('应该识别Go文件', () => {
        expect(getLanguageFromFilename('main.go')).toBe('go');
      });

      it('应该识别Rust文件', () => {
        expect(getLanguageFromFilename('main.rs')).toBe('rust');
      });

      it('应该识别Kotlin文件', () => {
        expect(getLanguageFromFilename('Main.kt')).toBe('kotlin');
        expect(getLanguageFromFilename('script.kts')).toBe('kotlin');
      });

      it('应该识别Scala文件', () => {
        expect(getLanguageFromFilename('Main.scala')).toBe('scala');
      });

      it('应该识别C#文件', () => {
        expect(getLanguageFromFilename('Program.cs')).toBe('csharp');
      });
    });

    describe('系统编程语言', () => {
      it('应该识别C文件', () => {
        expect(getLanguageFromFilename('main.c')).toBe('c');
        expect(getLanguageFromFilename('header.h')).toBe('c');
      });

      it('应该识别C++文件', () => {
        expect(getLanguageFromFilename('main.cpp')).toBe('cpp');
        expect(getLanguageFromFilename('main.cc')).toBe('cpp');
        expect(getLanguageFromFilename('main.cxx')).toBe('cpp');
        expect(getLanguageFromFilename('header.hpp')).toBe('cpp');
        expect(getLanguageFromFilename('header.hxx')).toBe('cpp');
      });
    });

    describe('脚本语言', () => {
      it('应该识别Shell脚本', () => {
        expect(getLanguageFromFilename('script.sh')).toBe('bash');
        expect(getLanguageFromFilename('script.bash')).toBe('bash');
        expect(getLanguageFromFilename('script.zsh')).toBe('zsh');
        expect(getLanguageFromFilename('script.fish')).toBe('shell');
      });

      it('应该识别PowerShell脚本', () => {
        expect(getLanguageFromFilename('script.ps1')).toBe('powershell');
        expect(getLanguageFromFilename('module.psm1')).toBe('powershell');
      });
    });

    describe('配置文件', () => {
      it('应该识别JSON文件', () => {
        expect(getLanguageFromFilename('config.json')).toBe('json');
        expect(getLanguageFromFilename('config.json5')).toBe('json5');
      });

      it('应该识别YAML文件', () => {
        expect(getLanguageFromFilename('config.yaml')).toBe('yaml');
        expect(getLanguageFromFilename('config.yml')).toBe('yaml');
      });

      it('应该识别TOML文件', () => {
        expect(getLanguageFromFilename('config.toml')).toBe('toml');
      });

      it('应该识别INI文件', () => {
        expect(getLanguageFromFilename('config.ini')).toBe('ini');
        expect(getLanguageFromFilename('config.conf')).toBe('ini');
        expect(getLanguageFromFilename('config.cfg')).toBe('ini');
      });

      it('应该识别Properties文件', () => {
        expect(getLanguageFromFilename('app.properties')).toBe('properties');
      });

      it('应该识别XML文件', () => {
        expect(getLanguageFromFilename('config.xml')).toBe('xml');
      });
    });

    describe('数据库', () => {
      it('应该识别SQL文件', () => {
        expect(getLanguageFromFilename('query.sql')).toBe('sql');
      });
    });

    describe('标记语言', () => {
      it('应该识别Markdown文件', () => {
        expect(getLanguageFromFilename('README.md')).toBe('markdown');
        expect(getLanguageFromFilename('doc.markdown')).toBe('markdown');
      });

      it('应该识别LaTeX文件', () => {
        expect(getLanguageFromFilename('paper.tex')).toBe('latex');
        expect(getLanguageFromFilename('doc.latex')).toBe('latex');
      });
    });

    describe('其他语言', () => {
      it('应该识别Lua文件', () => {
        expect(getLanguageFromFilename('script.lua')).toBe('lua');
      });

      it('应该识别Perl文件', () => {
        expect(getLanguageFromFilename('script.pl')).toBe('perl');
        expect(getLanguageFromFilename('module.pm')).toBe('perl');
      });

      it('应该识别R文件', () => {
        expect(getLanguageFromFilename('analysis.r')).toBe('r');
        expect(getLanguageFromFilename('analysis.R')).toBe('r');
      });

      it('应该识别MATLAB文件', () => {
        expect(getLanguageFromFilename('script.matlab')).toBe('matlab');
        expect(getLanguageFromFilename('script.m')).toBe('matlab');
      });

      it('应该识别Swift文件', () => {
        expect(getLanguageFromFilename('App.swift')).toBe('swift');
      });

      it('应该识别Dart文件', () => {
        expect(getLanguageFromFilename('main.dart')).toBe('dart');
      });

      it('应该识别Elixir文件', () => {
        expect(getLanguageFromFilename('app.ex')).toBe('elixir');
        expect(getLanguageFromFilename('script.exs')).toBe('elixir');
      });

      it('应该识别Clojure文件', () => {
        expect(getLanguageFromFilename('core.clj')).toBe('clojure');
        expect(getLanguageFromFilename('app.cljs')).toBe('clojure');
      });

      it('应该识别Julia文件', () => {
        expect(getLanguageFromFilename('script.jl')).toBe('julia');
      });

      it('应该识别Nim文件', () => {
        expect(getLanguageFromFilename('app.nim')).toBe('nim');
      });

      it('应该识别Zig文件', () => {
        expect(getLanguageFromFilename('main.zig')).toBe('zig');
      });
    });

    describe('特殊文件', () => {
      it('应该识别Dockerfile', () => {
        expect(getLanguageFromFilename('Dockerfile')).toBe('dockerfile');
        expect(getLanguageFromFilename('dockerfile')).toBe('dockerfile');
        expect(getLanguageFromFilename('Dockerfile.dev')).toBe('dockerfile');
        expect(getLanguageFromFilename('dockerfile.prod')).toBe('dockerfile');
      });

      it('应该识别Makefile', () => {
        expect(getLanguageFromFilename('Makefile')).toBe('makefile');
        expect(getLanguageFromFilename('makefile')).toBe('makefile');
        expect(getLanguageFromFilename('Makefile.include')).toBe('makefile');
        expect(getLanguageFromFilename('makefile.test')).toBe('makefile');
      });

      it('应该识别 CMakeLists.txt', () => {
        expect(getLanguageFromFilename('CMakeLists.txt')).toBe('cmake');
        expect(getLanguageFromFilename('cmakelists.txt')).toBe('cmake');
      });
    });

    describe('扩展名在 langIconMap 但映射语言未命中时使用扩展名', () => {
      it('应返回 make 当扩展名为 make 时', () => {
        expect(getLanguageFromFilename('build.make')).toBe('make');
      });
    });

    describe('边界情况', () => {
      it('应该处理没有扩展名的文件', () => {
        expect(getLanguageFromFilename('README')).toBe('text');
        expect(getLanguageFromFilename('LICENSE')).toBe('text');
      });

      it('应该处理空字符串', () => {
        expect(getLanguageFromFilename('')).toBe('text');
      });

      it('应该处理未知扩展名', () => {
        expect(getLanguageFromFilename('file.unknown')).toBe('text');
        expect(getLanguageFromFilename('data.xyz')).toBe('text');
      });

      it('应该处理大小写混合', () => {
        expect(getLanguageFromFilename('App.JS')).toBe('javascript');
        expect(getLanguageFromFilename('Style.CSS')).toBe('css');
        expect(getLanguageFromFilename('DOCKERFILE')).toBe('dockerfile');
      });

      it('应该处理多个点的文件名', () => {
        expect(getLanguageFromFilename('my.config.json')).toBe('json');
        expect(getLanguageFromFilename('test.spec.ts')).toBe('typescript');
      });

      it('应该处理只有扩展名的文件', () => {
        expect(getLanguageFromFilename('.gitignore')).toBe('text');
        expect(getLanguageFromFilename('.js')).toBe('javascript');
      });
    });
  });

  describe('isSupportedLanguage', () => {
    it('应该识别支持的语言', () => {
      expect(isSupportedLanguage('javascript')).toBe(true);
      expect(isSupportedLanguage('typescript')).toBe(true);
      expect(isSupportedLanguage('python')).toBe(true);
      expect(isSupportedLanguage('java')).toBe(true);
      expect(isSupportedLanguage('cpp')).toBe(true);
    });

    it('应该识别不支持的语言', () => {
      expect(isSupportedLanguage('unknown')).toBe(false);
      expect(isSupportedLanguage('fake-language')).toBe(false);
    });

    it('应该处理大小写', () => {
      expect(isSupportedLanguage('JavaScript')).toBe(true);
      expect(isSupportedLanguage('PYTHON')).toBe(true);
      expect(isSupportedLanguage('TypeScript')).toBe(true);
    });

    it('应该处理空字符串', () => {
      expect(isSupportedLanguage('')).toBe(false);
    });
  });

  describe('wrapContentInCodeBlock', () => {
    it('应该包装JavaScript代码', () => {
      const content = 'console.log("Hello");';
      const result = wrapContentInCodeBlock(content, 'javascript');
      expect(result).toBe('```javascript\nconsole.log("Hello");\n```');
    });

    it('应该包装Python代码', () => {
      const content = 'print("Hello")';
      const result = wrapContentInCodeBlock(content, 'python');
      expect(result).toBe('```python\nprint("Hello")\n```');
    });

    it('应该处理多行代码', () => {
      const content = 'function test() {\n  return 42;\n}';
      const result = wrapContentInCodeBlock(content, 'javascript');
      expect(result).toBe(
        '```javascript\nfunction test() {\n  return 42;\n}\n```',
      );
    });

    it('应该将大写语言转为小写', () => {
      const content = 'test';
      const result = wrapContentInCodeBlock(content, 'JAVASCRIPT');
      expect(result).toBe('```javascript\ntest\n```');
    });

    it('应该处理不支持的语言', () => {
      const content = 'some content';
      const result = wrapContentInCodeBlock(content, 'unknown-lang');
      expect(result).toBe('```text\nsome content\n```');
    });

    it('应该处理空内容', () => {
      const result = wrapContentInCodeBlock('', 'javascript');
      expect(result).toBe('```javascript\n\n```');
    });

    it('应该处理包含特殊字符的内容', () => {
      const content = 'const x = `template ${var}`;';
      const result = wrapContentInCodeBlock(content, 'javascript');
      expect(result).toBe('```javascript\nconst x = `template ${var}`;\n```');
    });

    it('应该处理已有反引号的内容', () => {
      const content = 'This has ` backticks';
      const result = wrapContentInCodeBlock(content, 'text');
      expect(result).toBe('```text\nThis has ` backticks\n```');
    });

    it('应该处理各种语言', () => {
      const testCases = [
        { lang: 'typescript', code: 'const x: number = 42;' },
        { lang: 'python', code: 'def hello(): pass' },
        { lang: 'java', code: 'public class Main {}' },
        { lang: 'cpp', code: 'int main() { return 0; }' },
        { lang: 'go', code: 'func main() {}' },
        { lang: 'rust', code: 'fn main() {}' },
      ];

      testCases.forEach(({ lang, code }) => {
        const result = wrapContentInCodeBlock(code, lang);
        expect(result).toBe(`\`\`\`${lang}\n${code}\n\`\`\``);
      });
    });

    it('应该保持内容不变（不处理内部格式）', () => {
      const content = '  indented code\n    more indent';
      const result = wrapContentInCodeBlock(content, 'python');
      expect(result).toBe('```python\n  indented code\n    more indent\n```');
    });
  });
});
