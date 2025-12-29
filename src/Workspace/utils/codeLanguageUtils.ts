/**
 * @fileoverview 代码语言识别工具
 * 基于文件扩展名识别编程语言类型，用于代码块预览
 */

import { langIconMap } from '../../plugins/code/langIconMap';

/**
 * 文件扩展名到编程语言的映射表
 * 基于常见的编程语言文件扩展名
 */
const extensionToLanguageMap: Record<string, string> = {
  // Web前端
  js: 'javascript',
  jsx: 'jsx',
  ts: 'typescript',
  tsx: 'tsx',
  html: 'html',
  htm: 'html',
  css: 'css',
  scss: 'scss',
  sass: 'sass',
  less: 'less',
  vue: 'vue',

  // 后端语言
  java: 'java',
  py: 'python',
  pyw: 'python',
  rb: 'ruby',
  php: 'php',
  go: 'go',
  rs: 'rust',
  kt: 'kotlin',
  kts: 'kotlin',
  scala: 'scala',
  cs: 'csharp',
  fs: 'fsharp',
  vb: 'vb',

  // 系统编程
  c: 'c',
  cpp: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  h: 'c',
  hpp: 'cpp',
  hxx: 'cpp',

  // 脚本语言
  sh: 'bash',
  bash: 'bash',
  zsh: 'zsh',
  fish: 'shell',
  ps1: 'powershell',
  psm1: 'powershell',
  bat: 'batch',
  cmd: 'batch',

  // 配置文件
  json: 'json',
  json5: 'json5',
  yaml: 'yaml',
  yml: 'yaml',
  toml: 'toml',
  ini: 'ini',
  conf: 'ini',
  cfg: 'ini',
  properties: 'properties',
  xml: 'xml',

  // 数据库
  sql: 'sql',

  // 标记语言
  md: 'markdown',
  markdown: 'markdown',
  tex: 'latex',
  latex: 'latex',

  // 其他语言
  lua: 'lua',
  pl: 'perl',
  pm: 'perl',
  r: 'r',
  R: 'r',
  matlab: 'matlab',
  m: 'matlab',
  swift: 'swift',
  dart: 'dart',
  ex: 'elixir',
  exs: 'elixir',
  clj: 'clojure',
  cljs: 'clojure',
  hs: 'haskell',
  elm: 'elm',
  jl: 'julia',
  nim: 'nim',
  zig: 'zig',
  v: 'v',

  // 特殊文件
  dockerfile: 'dockerfile',
  Dockerfile: 'dockerfile',
  makefile: 'makefile',
  Makefile: 'makefile',
  gradle: 'gradle',
  cmake: 'cmake',
  'CMakeLists.txt': 'cmake',
};

/**
 * 根据文件名或扩展名获取编程语言类型
 * @param filename 文件名（包含扩展名）
 * @returns 编程语言名称，如果无法识别则返回 'text'
 */
export const getLanguageFromFilename = (filename: string): string => {
  // 特殊文件名处理（如 Dockerfile, Makefile 等）
  const lowerFileName = filename.toLowerCase();

  // 检查特殊文件名
  if (
    lowerFileName === 'dockerfile' ||
    lowerFileName.startsWith('dockerfile.')
  ) {
    return 'dockerfile';
  }
  if (lowerFileName === 'makefile' || lowerFileName.startsWith('makefile.')) {
    return 'makefile';
  }
  if (lowerFileName === 'cmakelists.txt') {
    return 'cmake';
  }

  // 提取文件扩展名
  const extension = filename.split('.').pop()?.toLowerCase();
  if (!extension) {
    return 'text';
  }

  // 从映射表中查找对应的语言
  const language = extensionToLanguageMap[extension];

  // 验证语言是否被 langIconMap 支持
  if (language && langIconMap.has(language)) {
    return language;
  }

  // 如果没找到，尝试直接使用扩展名作为语言
  if (langIconMap.has(extension)) {
    return extension;
  }

  return 'text';
};

/**
 * 检查指定的语言是否被支持
 * @param language 编程语言名称
 * @returns 是否被支持
 */
export const isSupportedLanguage = (language: string): boolean => {
  return langIconMap.has(language.toLowerCase());
};

/**
 * 为代码内容包装 Markdown 代码块格式
 * @param content 代码内容
 * @param language 编程语言类型
 * @returns 包装后的 Markdown 格式字符串
 */
export const wrapContentInCodeBlock = (
  content: string,
  language: string,
): string => {
  // 确保语言标识符是小写的
  const lang = language.toLowerCase();

  // 如果语言不被支持，使用 'text'
  const finalLang = isSupportedLanguage(lang) ? lang : 'text';

  return `\`\`\`${finalLang}\n${content}\n\`\`\``;
};
