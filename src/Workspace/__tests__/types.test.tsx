import { describe, expect, it } from 'vitest';
import {
  FileCategory,
  FileType,
  getFileCategory,
  getFileType,
  getMimeType,
} from '../types';

describe('Workspace types 工具函数', () => {
  describe('getFileType', () => {
    it('应该根据扩展名识别文本文件', () => {
      expect(getFileType('document.txt')).toBe('plainText');
      expect(getFileType('README.md')).toBe('markdown');
      expect(getFileType('notes.markdown')).toBe('markdown');
    });

    it('应该根据扩展名识别图片文件', () => {
      expect(getFileType('photo.jpg')).toBe('image');
      expect(getFileType('picture.jpeg')).toBe('image');
      expect(getFileType('icon.png')).toBe('image');
      expect(getFileType('animation.gif')).toBe('image');
      expect(getFileType('bitmap.bmp')).toBe('image');
      expect(getFileType('web.webp')).toBe('image');
      expect(getFileType('vector.svg')).toBe('image');
    });

    it('应该根据扩展名识别视频文件', () => {
      expect(getFileType('video.mp4')).toBe('video');
      expect(getFileType('movie.webm')).toBe('video');
      expect(getFileType('clip.ogg')).toBe('video');
    });

    it('应该根据扩展名识别音频文件', () => {
      expect(getFileType('song.mp3')).toBe('audio');
      expect(getFileType('sound.wav')).toBe('audio');
      expect(getFileType('music.aac')).toBe('audio');
      expect(getFileType('audio.m4a')).toBe('audio');
    });

    it('应该根据扩展名识别PDF文件', () => {
      expect(getFileType('document.pdf')).toBe('pdf');
      expect(getFileType('report.PDF')).toBe('pdf');
    });

    it('应该根据扩展名识别Word文档', () => {
      expect(getFileType('document.doc')).toBe('word');
      expect(getFileType('report.docx')).toBe('word');
    });

    it('应该根据扩展名识别Excel表格', () => {
      expect(getFileType('data.xls')).toBe('excel');
      expect(getFileType('spreadsheet.xlsx')).toBe('excel');
    });

    it('应该根据扩展名识别CSV文件', () => {
      expect(getFileType('data.csv')).toBe('csv');
    });

    it('应该根据扩展名识别压缩文件', () => {
      expect(getFileType('archive.zip')).toBe('archive');
      expect(getFileType('compressed.rar')).toBe('archive');
      expect(getFileType('packed.7z')).toBe('archive');
      expect(getFileType('tarball.tar')).toBe('archive');
      expect(getFileType('gzipped.gz')).toBe('archive');
      expect(getFileType('bzipped.bz2')).toBe('archive');
    });

    it('应该根据扩展名识别JavaScript文件', () => {
      expect(getFileType('script.js')).toBe('javascript');
      expect(getFileType('module.mjs')).toBe('javascript');
      expect(getFileType('common.cjs')).toBe('javascript');
    });

    it('应该根据扩展名识别TypeScript文件', () => {
      expect(getFileType('app.ts')).toBe('typescript');
    });

    it('应该根据扩展名识别React文件', () => {
      expect(getFileType('Component.jsx')).toBe('react');
      expect(getFileType('Component.tsx')).toBe('react');
    });

    it('应该根据扩展名识别Python文件', () => {
      expect(getFileType('script.py')).toBe('python');
      expect(getFileType('app.pyw')).toBe('python');
      expect(getFileType('type.pyi')).toBe('python');
    });

    it('应该根据扩展名识别Java文件', () => {
      expect(getFileType('Main.java')).toBe('java');
    });

    it('应该根据扩展名识别C++文件', () => {
      expect(getFileType('main.cpp')).toBe('cpp');
      expect(getFileType('code.cc')).toBe('cpp');
      expect(getFileType('source.cxx')).toBe('cpp');
      expect(getFileType('file.c++')).toBe('cpp');
      expect(getFileType('header.hpp')).toBe('cpp');
      expect(getFileType('header.hxx')).toBe('cpp');
      expect(getFileType('header.h++')).toBe('cpp');
    });

    it('应该根据扩展名识别C文件', () => {
      expect(getFileType('main.c')).toBe('c');
      expect(getFileType('header.h')).toBe('c');
    });

    it('应该根据扩展名识别C#文件', () => {
      expect(getFileType('Program.cs')).toBe('csharp');
    });

    it('应该根据扩展名识别Go文件', () => {
      expect(getFileType('main.go')).toBe('go');
    });

    it('应该根据扩展名识别Rust文件', () => {
      expect(getFileType('main.rs')).toBe('rust');
    });

    it('应该根据扩展名识别PHP文件', () => {
      expect(getFileType('index.php')).toBe('php');
      expect(getFileType('script.php3')).toBe('php');
      expect(getFileType('script.php4')).toBe('php');
      expect(getFileType('script.php5')).toBe('php');
      expect(getFileType('page.phtml')).toBe('php');
    });

    it('应该根据扩展名识别Ruby文件', () => {
      expect(getFileType('script.rb')).toBe('ruby');
      expect(getFileType('script.rbw')).toBe('ruby');
    });

    it('应该根据扩展名识别Shell脚本', () => {
      expect(getFileType('script.sh')).toBe('shell');
      expect(getFileType('script.bash')).toBe('shell');
      expect(getFileType('script.zsh')).toBe('shell');
      expect(getFileType('script.fish')).toBe('shell');
    });

    it('应该根据扩展名识别PowerShell脚本', () => {
      expect(getFileType('script.ps1')).toBe('powershell');
      expect(getFileType('module.psm1')).toBe('powershell');
      expect(getFileType('manifest.psd1')).toBe('powershell');
    });

    it('应该根据扩展名识别SQL文件', () => {
      expect(getFileType('query.sql')).toBe('sql');
    });

    it('应该根据扩展名识别Lua文件', () => {
      expect(getFileType('script.lua')).toBe('lua');
    });

    it('应该根据扩展名识别Perl文件', () => {
      expect(getFileType('script.pl')).toBe('perl');
      expect(getFileType('module.pm')).toBe('perl');
      expect(getFileType('script.perl')).toBe('perl');
    });

    it('应该根据扩展名识别Scala文件', () => {
      expect(getFileType('Main.scala')).toBe('scala');
      expect(getFileType('script.sc')).toBe('scala');
    });

    it('应该根据扩展名识别配置文件', () => {
      expect(getFileType('package.json')).toBe('config');
      expect(getFileType('config.yaml')).toBe('config');
      expect(getFileType('config.yml')).toBe('config');
      expect(getFileType('config.toml')).toBe('config');
      expect(getFileType('settings.ini')).toBe('config');
      expect(getFileType('nginx.conf')).toBe('config');
      expect(getFileType('app.cfg')).toBe('config');
      expect(getFileType('app.properties')).toBe('config');
    });

    it('应该处理大小写混合的扩展名', () => {
      expect(getFileType('Document.TXT')).toBe('plainText');
      expect(getFileType('Image.PNG')).toBe('image');
      expect(getFileType('Archive.ZIP')).toBe('archive');
    });

    it('应该处理多个点的文件名', () => {
      expect(getFileType('my.backup.tar.gz')).toBe('archive');
      expect(getFileType('app.test.js')).toBe('javascript');
    });

    it('应该处理没有扩展名的文件', () => {
      expect(getFileType('README')).toBe('plainText');
      expect(getFileType('Makefile')).toBe('plainText');
      expect(getFileType('LICENSE')).toBe('plainText');
    });

    it('应该处理只有点的文件名', () => {
      expect(getFileType('.')).toBe('plainText');
      expect(getFileType('..')).toBe('plainText');
    });

    it('应该处理空字符串', () => {
      expect(getFileType('')).toBe('plainText');
    });

    it('应该处理未知扩展名', () => {
      expect(getFileType('file.unknown')).toBe('plainText');
      expect(getFileType('data.xyz')).toBe('plainText');
      expect(getFileType('test.abc123')).toBe('plainText');
    });

    it('应该处理隐藏文件', () => {
      expect(getFileType('.gitignore')).toBe('plainText');
      expect(getFileType('.env')).toBe('plainText');
      expect(getFileType('.bashrc')).toBe('plainText');
    });

    it('应该处理路径中的文件', () => {
      expect(getFileType('/path/to/file.js')).toBe('javascript');
      expect(getFileType('C:\\Users\\file.txt')).toBe('plainText');
      expect(getFileType('./relative/path/image.png')).toBe('image');
    });
  });

  describe('getMimeType', () => {
    it('应该返回文本文件的MIME类型', () => {
      expect(getMimeType('plainText')).toBe('text/plain');
      expect(getMimeType('markdown')).toBe('text/markdown');
    });

    it('应该返回图片文件的MIME类型', () => {
      expect(getMimeType('image')).toBe('image/jpeg');
    });

    it('应该返回视频文件的MIME类型', () => {
      expect(getMimeType('video')).toBe('video/mp4');
    });

    it('应该返回音频文件的MIME类型', () => {
      expect(getMimeType('audio')).toBe('audio/mpeg');
    });

    it('应该返回PDF文件的MIME类型', () => {
      expect(getMimeType('pdf')).toBe('application/pdf');
    });

    it('应该返回Word文档的MIME类型', () => {
      expect(getMimeType('word')).toBe('application/msword');
    });

    it('应该返回Excel表格的MIME类型', () => {
      expect(getMimeType('excel')).toBe('application/vnd.ms-excel');
    });

    it('应该返回CSV文件的MIME类型', () => {
      expect(getMimeType('csv')).toBe('text/csv');
    });

    it('应该返回压缩文件的MIME类型', () => {
      expect(getMimeType('archive')).toBe('application/zip');
    });

    it('应该返回JavaScript文件的MIME类型', () => {
      expect(getMimeType('javascript')).toBe('text/javascript');
    });

    it('应该返回TypeScript文件的MIME类型', () => {
      expect(getMimeType('typescript')).toBe('text/typescript');
    });

    it('应该返回React文件的MIME类型', () => {
      expect(getMimeType('react')).toBe('text/jsx');
    });

    it('应该返回Python文件的MIME类型', () => {
      expect(getMimeType('python')).toBe('text/x-python');
    });

    it('应该返回Java文件的MIME类型', () => {
      expect(getMimeType('java')).toBe('text/x-java-source');
    });

    it('应该返回C++文件的MIME类型', () => {
      expect(getMimeType('cpp')).toBe('text/x-c++src');
    });

    it('应该返回C文件的MIME类型', () => {
      expect(getMimeType('c')).toBe('text/x-csrc');
    });

    it('应该返回C#文件的MIME类型', () => {
      expect(getMimeType('csharp')).toBe('text/x-csharp');
    });

    it('应该返回Go文件的MIME类型', () => {
      expect(getMimeType('go')).toBe('text/x-go');
    });

    it('应该返回Rust文件的MIME类型', () => {
      expect(getMimeType('rust')).toBe('text/x-rust');
    });

    it('应该返回PHP文件的MIME类型', () => {
      expect(getMimeType('php')).toBe('text/x-php');
    });

    it('应该返回Ruby文件的MIME类型', () => {
      expect(getMimeType('ruby')).toBe('text/x-ruby');
    });

    it('应该返回Shell脚本的MIME类型', () => {
      expect(getMimeType('shell')).toBe('text/x-shellscript');
    });

    it('应该返回PowerShell脚本的MIME类型', () => {
      expect(getMimeType('powershell')).toBe('text/x-powershell');
    });

    it('应该返回SQL文件的MIME类型', () => {
      expect(getMimeType('sql')).toBe('text/x-sql');
    });

    it('应该返回Lua文件的MIME类型', () => {
      expect(getMimeType('lua')).toBe('text/x-lua');
    });

    it('应该返回Perl文件的MIME类型', () => {
      expect(getMimeType('perl')).toBe('text/x-perl');
    });

    it('应该返回Scala文件的MIME类型', () => {
      expect(getMimeType('scala')).toBe('text/x-scala');
    });

    it('应该返回配置文件的MIME类型', () => {
      expect(getMimeType('config')).toBe('application/json');
    });

    it('应该总是返回第一个MIME类型', () => {
      // 即使某些文件类型有多个MIME类型,也应该返回第一个
      const mimeType = getMimeType('image');
      expect(typeof mimeType).toBe('string');
      expect(mimeType.length).toBeGreaterThan(0);
    });
  });

  describe('getFileCategory', () => {
    it('应该返回文本文件的分类', () => {
      expect(getFileCategory('plainText')).toBe(FileCategory.Text);
      expect(getFileCategory('markdown')).toBe(FileCategory.Text);
    });

    it('应该返回代码文件的分类', () => {
      expect(getFileCategory('javascript')).toBe(FileCategory.Code);
      expect(getFileCategory('typescript')).toBe(FileCategory.Code);
      expect(getFileCategory('react')).toBe(FileCategory.Code);
      expect(getFileCategory('python')).toBe(FileCategory.Code);
      expect(getFileCategory('java')).toBe(FileCategory.Code);
      expect(getFileCategory('cpp')).toBe(FileCategory.Code);
      expect(getFileCategory('c')).toBe(FileCategory.Code);
      expect(getFileCategory('csharp')).toBe(FileCategory.Code);
      expect(getFileCategory('go')).toBe(FileCategory.Code);
      expect(getFileCategory('rust')).toBe(FileCategory.Code);
      expect(getFileCategory('php')).toBe(FileCategory.Code);
      expect(getFileCategory('ruby')).toBe(FileCategory.Code);
      expect(getFileCategory('shell')).toBe(FileCategory.Code);
      expect(getFileCategory('powershell')).toBe(FileCategory.Code);
      expect(getFileCategory('sql')).toBe(FileCategory.Code);
      expect(getFileCategory('lua')).toBe(FileCategory.Code);
      expect(getFileCategory('perl')).toBe(FileCategory.Code);
      expect(getFileCategory('scala')).toBe(FileCategory.Code);
      expect(getFileCategory('config')).toBe(FileCategory.Code);
    });

    it('应该返回图片文件的分类', () => {
      expect(getFileCategory('image')).toBe(FileCategory.Image);
    });

    it('应该返回视频文件的分类', () => {
      expect(getFileCategory('video')).toBe(FileCategory.Video);
    });

    it('应该返回音频文件的分类', () => {
      expect(getFileCategory('audio')).toBe(FileCategory.Audio);
    });

    it('应该返回PDF文件的分类', () => {
      expect(getFileCategory('pdf')).toBe(FileCategory.PDF);
    });

    it('应该返回Word文档的分类', () => {
      expect(getFileCategory('word')).toBe(FileCategory.Word);
    });

    it('应该返回Excel表格的分类', () => {
      expect(getFileCategory('excel')).toBe(FileCategory.Excel);
      expect(getFileCategory('csv')).toBe(FileCategory.Excel);
    });

    it('应该返回压缩文件的分类', () => {
      expect(getFileCategory('archive')).toBe(FileCategory.Archive);
    });

    it('应该处理不存在的文件类型', () => {
      // 使用可选链操作符,不存在的类型应该返回undefined
      expect(getFileCategory('unknown' as FileType)).toBeUndefined();
    });

    it('应该处理所有已定义的文件类型', () => {
      // 确保所有定义的FileType都有对应的FileCategory
      const fileTypes: FileType[] = [
        'plainText',
        'markdown',
        'image',
        'video',
        'audio',
        'pdf',
        'word',
        'excel',
        'csv',
        'archive',
        'javascript',
        'typescript',
        'react',
        'python',
        'java',
        'cpp',
        'c',
        'csharp',
        'go',
        'rust',
        'php',
        'ruby',
        'shell',
        'powershell',
        'sql',
        'lua',
        'perl',
        'scala',
        'config',
      ];

      fileTypes.forEach((type) => {
        const category = getFileCategory(type);
        expect(category).toBeDefined();
        expect(Object.values(FileCategory)).toContain(category);
      });
    });
  });

  describe('集成测试 - 工具函数组合使用', () => {
    it('应该正确处理文件的完整流程', () => {
      // 从文件名获取类型
      const filename = 'document.pdf';
      const fileType = getFileType(filename);
      expect(fileType).toBe('pdf');

      // 从类型获取MIME类型
      const mimeType = getMimeType(fileType);
      expect(mimeType).toBe('application/pdf');

      // 从类型获取分类
      const category = getFileCategory(fileType);
      expect(category).toBe(FileCategory.PDF);
    });

    it('应该正确处理代码文件的完整流程', () => {
      const filename = 'App.tsx';
      const fileType = getFileType(filename);
      expect(fileType).toBe('react');

      const mimeType = getMimeType(fileType);
      expect(mimeType).toBe('text/jsx');

      const category = getFileCategory(fileType);
      expect(category).toBe(FileCategory.Code);
    });

    it('应该正确处理图片文件的完整流程', () => {
      const filename = 'photo.png';
      const fileType = getFileType(filename);
      expect(fileType).toBe('image');

      const mimeType = getMimeType(fileType);
      expect(mimeType).toBe('image/jpeg');

      const category = getFileCategory(fileType);
      expect(category).toBe(FileCategory.Image);
    });

    it('应该正确处理未知文件的默认流程', () => {
      const filename = 'unknown.xyz';
      const fileType = getFileType(filename);
      expect(fileType).toBe('plainText');

      const mimeType = getMimeType(fileType);
      expect(mimeType).toBe('text/plain');

      const category = getFileCategory(fileType);
      expect(category).toBe(FileCategory.Text);
    });
  });
});
