import { debugInfo } from '../../../../Utils/debugUtils';
import json5 from 'json5';
import { isCodeBlockLikelyComplete } from '../../utils/findMatchingClose';
import partialJsonParse from '../json-parse';

// 代码块检测相关的常量
const NOT_SPACE_START = /^\S*/;
const ENDING_NEWLINE = /\n$/;

// 类型定义
export type CodeElement = {
  type: string;
  language?: string | null;
  render?: boolean;
  value: any;
  isConfig?: boolean;
  children: Array<{ text: string }>;
  otherProps?: Record<string, any>;
};

export type LanguageHandler = (
  element: CodeElement,
  value: string,
) => CodeElement;

/**
 * 处理schema类型语言的辅助函数
 */
const processSchemaLanguage = (
  element: CodeElement,
  value: string,
): CodeElement => {
  let json = [];
  try {
    json = json5.parse(value || '[]');
  } catch {
    try {
      json = partialJsonParse(value || '[]');
    } catch (error) {
      json = value as any;
      console.error('parse schema error', error);
    }
  }
  return {
    ...element,
    type: 'apaasify',
    value: json,
    children: [{ text: value }],
  };
};

/**
 * 语言类型处理策略配置
 */
const LANGUAGE_HANDLERS: Record<string, LanguageHandler> = {
  mermaid: (element) => ({
    ...element,
    type: 'mermaid',
  }),
  schema: processSchemaLanguage,
  apaasify: processSchemaLanguage,
  apassify: processSchemaLanguage,
  katex: (element) => ({
    ...element,
    type: 'katex',
  }),
  'agentar-card': processSchemaLanguage,
};

/**
 * 处理代码块节点
 * @param currentElement - 当前处理的代码块元素，包含语言和内容
 * @param config - 可选的配置对象，可能包含从 HTML 注释中解析的属性
 * @returns 返回格式化的代码块节点对象，根据语言类型进行特殊处理
 */
export const handleCode = (currentElement: any, config?: any): CodeElement => {
  debugInfo('handleCode - 处理代码块', {
    rawValueLength: currentElement.value?.length,
    lang: currentElement.lang,
    configLanguage: config?.['data-language'],
    meta: currentElement.meta,
  });

  const rawValue = currentElement.value || '';

  // 如果 config 中包含 data-language，优先使用它来恢复语言类型
  const configLanguage = config?.['data-language'];
  // 保持原有的行为：如果没有语言，应该使用 null 而不是空字符串
  const effectiveLang = configLanguage || currentElement.lang || null;
  const langString = effectiveLang
    ? effectiveLang.match(NOT_SPACE_START)?.[0] || ''
    : '';

  debugInfo('handleCode - 语言处理', {
    effectiveLang,
    langString,
  });

  const code = `${rawValue.replace(ENDING_NEWLINE, '')}\n`;

  // 检查代码块是否完整
  // 如果是缩进代码块，认为是完整的（因为没有结束标记）
  const isIndentedCode = currentElement.meta === 'indented';

  // 使用更智能的方法判断代码块是否完整
  let streamStatus: 'loading' | 'done' = 'loading';

  if (isIndentedCode) {
    // 缩进代码块没有结束标记，认为是完整的
    streamStatus = 'done';
  } else {
    // 对于围栏代码块，使用多种方法判断
    const endsWithNewline = code.match(ENDING_NEWLINE);

    // 如果代码以换行结尾，可能是完整的
    if (endsWithNewline) {
      // 进一步检查代码内容是否完整（特别是对于 Mermaid 等需要完整语法的情况）
      const isLikelyComplete = isCodeBlockLikelyComplete(
        rawValue,
        currentElement.lang,
      );
      streamStatus = isLikelyComplete ? 'done' : 'loading';
    } else {
      // 没有换行结尾，肯定不完整
      streamStatus = 'loading';
    }
  }

  // 如果已经在 parseNodes 中设置了 finished（基于是否是最后一个节点），优先使用它
  // 否则使用 streamStatus 判断
  const finishValue =
    currentElement.otherProps?.finished !== undefined
      ? currentElement.otherProps.finished
      : streamStatus === 'done';

  const otherProps = {
    ...(currentElement.otherProps || {}),
    'data-block': 'true',
    'data-state': streamStatus,
    // 优先使用 parseNodes 中设置的 finish，否则使用 streamStatus 判断
    finished: finishValue,
    ...(langString ? { 'data-language': langString } : {}),
  };

  if (finishValue !== false) {
    delete otherProps.finished;
  }

  const baseCodeElement: CodeElement = {
    type: 'code',
    language: effectiveLang === 'apaasify' ? 'apaasify' : effectiveLang || null,
    render: currentElement.meta === 'render',
    value: currentElement.value,
    isConfig: currentElement?.value.trim()?.startsWith('<!--'),
    children: [{ text: currentElement.value }],
    // 添加流式状态支持
    otherProps,
  };

  const handler =
    LANGUAGE_HANDLERS[effectiveLang as keyof typeof LANGUAGE_HANDLERS];

  debugInfo('handleCode - 语言处理器', {
    effectiveLang,
    hasHandler: !!handler,
    handlerName: handler ? Object.keys(LANGUAGE_HANDLERS).find(k => LANGUAGE_HANDLERS[k] === handler) : undefined,
  });

  const result = handler
    ? handler(baseCodeElement, currentElement.value)
    : baseCodeElement;

  // 确保 otherProps 被保留，并合并 config 中的属性
  const resultWithProps = result as CodeElement;
  if (baseCodeElement.otherProps && !resultWithProps.otherProps) {
    resultWithProps.otherProps = {
      ...baseCodeElement.otherProps,
      ...(config || {}),
    };
  } else if (baseCodeElement.otherProps && resultWithProps.otherProps) {
    resultWithProps.otherProps = {
      ...resultWithProps.otherProps,
      ...baseCodeElement.otherProps,
      ...(config || {}),
    };
  } else if (config && Object.keys(config).length > 0) {
    resultWithProps.otherProps = {
      ...(resultWithProps.otherProps || {}),
      ...config,
    };
  }

  debugInfo('handleCode - 代码块处理完成', {
    type: resultWithProps.type,
    language: resultWithProps.language,
    render: resultWithProps.render,
    isConfig: resultWithProps.isConfig,
    valueLength: resultWithProps.value?.length,
    hasOtherProps: !!resultWithProps.otherProps,
    otherPropsKeys: resultWithProps.otherProps ? Object.keys(resultWithProps.otherProps) : [],
  });

  return resultWithProps;
};

/**
 * 处理YAML节点
 * @param currentElement - 当前处理的YAML元素
 * @returns 返回格式化的YAML代码块节点对象
 */
export const handleYaml = (currentElement: any) => {
  debugInfo('handleYaml - 处理 YAML', {
    valueLength: currentElement.value?.length,
  });
  const result = {
    type: 'code',
    language: 'yaml',
    value: currentElement.value,
    frontmatter: true,
    children: [{ text: currentElement.value }],
  };
  debugInfo('handleYaml - YAML 处理完成', {
    type: result.type,
    language: result.language,
    frontmatter: result.frontmatter,
  });
  return result;
};
