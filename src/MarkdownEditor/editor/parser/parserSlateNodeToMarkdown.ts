/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-case-declarations */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { Node, Text } from 'slate';
import stringWidth from 'string-width';
import { debugInfo } from '../../../Utils/debugUtils';
import { ChartNode } from '../../el';
import type { MarkdownEditorPlugin } from '../../plugin';
import { getMediaType } from '../utils/dom';

const inlineNode = new Set(['break']);

/**
 * 尝试使用插件转换节点
 */
const tryPluginConversion = (
  node: any,
  preString: string,
  parent: any[],
  plugins?: MarkdownEditorPlugin[],
): string | null => {
  if (!plugins?.length) return null;

  for (const plugin of plugins) {
    const rule = plugin.toMarkdown?.find((r) => r.match(node));
    if (!rule) continue;

    const converted = rule.convert(node);
    return convertPluginNode(converted, preString, parent, plugins);
  }

  return null;
};

/**
 * 转换插件节点为 Markdown 字符串
 */
const convertPluginNode = (
  converted: any,
  preString: string,
  parent: any[],
  plugins?: MarkdownEditorPlugin[],
): string => {
  switch (converted.type) {
    case 'code':
      return convertCodeNode(converted, preString);
    case 'blockquote':
      return convertBlockquoteNode(converted, preString, parent, plugins);
    case 'paragraph':
      return convertParagraphNode(converted, preString, parent, plugins);
    case 'heading':
      return convertHeadingNode(converted, preString, parent, plugins);
    case 'text':
      return (converted as any).value || '';
    default:
      return '';
  }
};

/**
 * 转换代码节点
 */
const convertCodeNode = (codeNode: any, preString: string): string => {
  const language = codeNode.lang || '';
  const value = codeNode.value || '';

  if (!value?.trim()) {
    return `${preString}\`\`\`${language}\n${preString}\`\`\``;
  }

  const codeLines = value.split('\n');
  const indentedCode = codeLines
    .map((line: string, index: number) => {
      const isFirstOrLast = index === 0 || index === codeLines.length - 1;
      return isFirstOrLast ? line : preString + line;
    })
    .join('\n');

  return `${preString}\`\`\`${language}\n${indentedCode}\n${preString}\`\`\``;
};

/**
 * 转换引用节点
 */
const convertBlockquoteNode = (
  blockquoteNode: any,
  preString: string,
  parent: any[],
  plugins?: MarkdownEditorPlugin[],
): string => {
  return (
    '> ' +
    parserSlateNodeToMarkdown(
      blockquoteNode.children || [],
      preString,
      [...parent, { ...blockquoteNode, converted: true }],
      plugins,
    )
  );
};

/**
 * 转换段落节点
 */
const convertParagraphNode = (
  paragraphNode: any,
  preString: string,
  parent: any[],
  plugins?: MarkdownEditorPlugin[],
): string => {
  return (
    preString +
    parserSlateNodeToMarkdown(
      paragraphNode.children || [],
      preString,
      [...parent, { ...paragraphNode, converted: true }],
      plugins,
    )
  );
};

/**
 * 转换标题节点
 */
const convertHeadingNode = (
  headingNode: any,
  preString: string,
  parent: any[],
  plugins?: MarkdownEditorPlugin[],
): string => {
  const level = headingNode.depth || 1;
  const content = parserSlateNodeToMarkdown(
    headingNode.children || [],
    preString,
    [...parent, { ...headingNode, converted: true }],
    plugins,
  );
  return '#'.repeat(level) + ' ' + content.replace(/\n+$/, '');
};

/**
 * 解析单个 Slate 节点并转换为对应的 Markdown 字符串
 *
 * @param node - 要解析的 Slate 节点，包含 type、children、value 等属性
 * @param preString - 前缀字符串，用于处理缩进和格式化，默认为空字符串
 * @param parent - 父节点数组，用于上下文信息和嵌套处理，默认为空数组
 * @param plugins - 可选的插件数组，用于自定义转换逻辑
 * @returns 解析后的 Markdown 字符串
 *
 * @description
 * 该函数是 Slate 节点到 Markdown 转换的核心处理器，支持以下节点类型：
 *
 * **容器节点：**
 * - `card`: 卡片容器，递归处理子节点
 * - `paragraph`: 段落节点，添加前缀并处理子节点
 * - `blockquote`: 引用块，递归处理子节点
 * - `list`: 列表容器，递归处理列表项
 * - `list-item`: 列表项，递归处理子节点
 *
 * **标题节点：**
 * - `head`: 标题节点，根据 level 生成对应级别的 Markdown 标题
 *
 * **代码节点：**
 * - `code`: 代码块，支持三种模式：
 *   - HTML 渲染模式（language='html' && render=true）
 *   - Frontmatter 模式（frontmatter=true）
 *   - 普通代码块模式（默认）
 *
 * **媒体节点：**
 * - `image`: 图片节点，支持 width、height、block 参数，URL 参数化
 * - `media`: 多媒体节点，根据类型生成 video、img 或 iframe 标签
 * - `attach`: 附件节点，生成下载链接
 *
 * **表格节点：**
 * - `table`: 表格节点，调用 table 函数处理
 * - `chart`: 图表节点，以表格形式渲染
 * - `column-group`: 列组节点，以表格形式渲染
 * - `description`: 描述列表，转换为表格格式
 *
 * **其他节点：**
 * - `schema`: 模式定义，生成 schema 代码块
 * - `link-card`: 链接卡片，生成 Markdown 链接格式
 * - `hr`: 水平分割线，生成 `***`
 * - `break`: 换行节点，生成 `<br/>` 标签
 * - `footnoteDefinition`: 脚注定义，生成脚注引用格式
 * - 文本节点：调用 composeText 函数处理文本样式
 *
 * **空节点：**
 * - `card-before`, `card-after`: 卡片前后占位符，不输出内容
 *
 * @example
 * ```typescript
 * // 解析段落节点
 * const paragraphNode = { type: 'paragraph', children: [{ text: 'Hello' }] };
 * const result = parserNode(paragraphNode, '', []);
 * // 输出: "Hello"
 *
 * // 解析标题节点
 * const headNode = { type: 'head', level: 2, children: [{ text: 'Title' }] };
 * const result = parserNode(headNode, '', []);
 * // 输出: "## Title"
 *
 * // 解析代码块
 * const codeNode = { type: 'code', language: 'javascript', value: 'console.log("hello");' };
 * const result = parserNode(codeNode, '', []);
 * // 输出: "```javascript\nconsole.log(\"hello\");\n```"
 * ```
 */
const parserNode = (
  node: any,
  preString = '',
  parent: any[],
  plugins?: MarkdownEditorPlugin[],
) => {
  let str = '';
  if (!node) {
    debugInfo('parserSlateNodeToMarkdown.parserNode - 空节点');
    return str;
  }

  debugInfo('parserSlateNodeToMarkdown.parserNode - 开始解析节点', {
    nodeType: node.type,
    preString,
    parentType: parent[parent.length - 1]?.type,
  });

  // 首先尝试使用插件处理
  const pluginResult = tryPluginConversion(node, preString, parent, plugins);
  if (pluginResult !== null) {
    debugInfo('parserSlateNodeToMarkdown.parserNode - 使用插件转换', {
      resultLength: pluginResult.length,
    });
    return pluginResult;
  }

  switch (node.type) {
    case 'card-before':
    case 'card-after':
      break;
    case 'card':
      str += handleCard(node, preString, parent, plugins);
      break;
    case 'paragraph':
      str += handleParagraph(node, preString, parent, plugins);
      break;
    case 'head':
      str += handleHead(node, preString, parent, plugins);
      break;
    case 'code':
    case 'apaasify':
      str += handleCode(node, preString);
      break;
    case 'attach':
      str += handleAttach(node);
      break;
    case 'blockquote':
      str += handleBlockquote(node, preString, parent, plugins);
      break;
    case 'image':
      str += handleImage(node);
      break;
    case 'media':
      str += handleMedia(node);
      break;
    case 'bulleted-list':
    case 'numbered-list':
    case 'list': // 向后兼容
      str += '\n' + handleList(node, preString, parent, plugins) + '\n\n';
      break;
    case 'list-item':
      str += handleListItem(node, preString, parent, plugins);
      break;
    case 'table':
      str += table(node, parent, plugins);
      break;
    case 'chart':
      str += table(node, parent, plugins);
      break;
    case 'schema':
      str += handleSchema(node);
      break;
    case 'link-card':
      str += handleLinkCard(node);
      break;
    case 'hr':
      str += handleHr(preString);
      break;
    case 'break':
      str += handleBreak(preString);
      break;
    case 'footnoteDefinition':
      str += handleFootnoteDefinition(node);
      break;
    default:
      str += handleDefault(node, parent);
      break;
  }

  debugInfo('parserSlateNodeToMarkdown.parserNode - 节点解析完成', {
    nodeType: node.type,
    resultLength: str.length,
    resultPreview: str.substring(0, 50),
  });

  return str;
};

/**
 * 将 Slate 节点树解析为 Markdown 字符串。
 *
 * @param tree - Slate 节点树。
 * @param preString - 前缀字符串，默认为空字符串。
 * @param parent - 父节点数组，默认为包含一个根节点的数组。
 * @returns 解析后的 Markdown 字符串。
 *
 * 该函数遍历 Slate 节点树，并根据节点类型和属性生成相应的 Markdown 字符串。
 * 对于具有其他属性的节点，会将这些属性转换为 JSON 字符串并作为注释插入。
 * 对于列表项、引用块、段落等不同类型的节点，会根据其特定的格式生成相应的 Markdown。
 */
export const parserSlateNodeToMarkdown = (
  tree: any[],
  preString = '',
  parent: any[] = [{ root: true }],
  plugins?: MarkdownEditorPlugin[],
) => {
  debugInfo('parserSlateNodeToMarkdown - 开始转换', {
    treeLength: tree?.length,
    preString,
    parentType: parent[parent.length - 1]?.type || 'root',
    hasPlugins: !!plugins && plugins.length > 0,
  });

  let str = '';
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    debugInfo(`parserSlateNodeToMarkdown - 处理节点 ${i}/${tree.length}`, {
      nodeType: node?.type,
      hasOtherProps: !!node?.otherProps,
      otherPropsKeys: node?.otherProps ? Object.keys(node.otherProps) : [],
    });
    if (node.otherProps && Object.keys(node.otherProps).length) {
      debugInfo(`parserSlateNodeToMarkdown - 处理 otherProps ${i}`, {
        nodeType: node.type,
        originalOtherProps: node.otherProps,
      });

      let configProps = {
        ...node.otherProps,
      };

      delete configProps['columns'];
      delete configProps['dataSource'];
      delete configProps['finished'];
      // paragraph/head 的 align 已输出到 <p align> / <h align>，不再写入注释
      if (node.type === 'paragraph' || node.type === 'head') {
        delete configProps['align'];
      }

      if (node.type === 'link-card') {
        configProps.type = 'card';
        configProps.url = encodeURI(node?.url);
        configProps.name = node.name || node.title || configProps.name;
        configProps.description = node.description || configProps.description;
        configProps.icon = node.icon || configProps.icon;
        debugInfo(`parserSlateNodeToMarkdown - link-card 转换 ${i}`, {
          configProps,
        });
      }
      Object.keys(configProps).forEach((key) => {
        if (typeof configProps[key] === 'object' && configProps[key]) {
          if (
            Array.isArray(configProps[key]) &&
            configProps[key].length === 0
          ) {
            delete configProps[key];
            return;
          }
          if (Object.keys(configProps[key]).length === 0) {
            delete configProps[key];
            return;
          }
        }
      });

      // 只有当 configProps 不为空对象时才生成注释
      // 检查 configProps 是否为空对象（删除 finished 后可能变成空对象）
      const hasValidProps = Object.keys(configProps).length > 0;
      if (hasValidProps) {
        /**
         * 将对象转换为数组（处理 {0: {...}, 1: {...}} 这种错误格式）
         * @param obj - 要转换的对象
         * @returns 转换后的数组，如果不是数字键对象则返回原对象
         */
        const convertObjectToArray = (obj: any): any => {
          if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
            return obj;
          }

          const keys = Object.keys(obj);
          // 检查是否所有键都是数字字符串（如 "0", "1", "2"）
          const allNumericKeys =
            keys.length > 0 && keys.every((key) => /^\d+$/.test(key));

          if (allNumericKeys) {
            // 按数字顺序排序并转换为数组
            const sortedKeys = keys.sort(
              (a, b) => parseInt(a, 10) - parseInt(b, 10),
            );
            return sortedKeys.map((key) => obj[key]);
          }

          return obj;
        };

        // 对于图表类型，配置应该总是以数组形式存储在 config 中
        if (node.type === 'chart') {
          debugInfo(`parserSlateNodeToMarkdown - 处理图表节点 ${i}`, {
            originalConfig: configProps.config,
            hasChartType: !!configProps.chartType,
          });

          let chartConfig = configProps.config;

          // 如果 config 不存在，但 configProps 看起来像图表配置（有 chartType），使用 configProps
          if (!chartConfig && configProps.chartType) {
            chartConfig = configProps;
          }

          // 如果 chartConfig 是对象且键都是数字（如 {0: {...}}），转换为数组
          chartConfig = convertObjectToArray(chartConfig);
          debugInfo(`parserSlateNodeToMarkdown - 图表配置转换后 ${i}`, {
            chartConfig,
            isArray: Array.isArray(chartConfig),
          });

          // 如果 chartConfig 还不是数组，将其包装为数组
          // 这样可以确保即使只有一个配置项，也会被放入数组中
          if (!Array.isArray(chartConfig)) {
            // 如果 chartConfig 是对象，检查是否是 {0: {...}} 格式但转换失败的情况
            if (chartConfig && typeof chartConfig === 'object') {
              const keys = Object.keys(chartConfig);
              // 如果只有一个键且是数字，提取该值
              if (keys.length === 1 && /^\d+$/.test(keys[0])) {
                chartConfig = [chartConfig[keys[0]]];
              } else if (chartConfig.chartType) {
                // 如果 chartConfig 有 chartType，说明是单个配置对象
                chartConfig = [chartConfig];
              } else {
                // 其他情况，也包装为数组
                chartConfig = [chartConfig];
              }
            } else if (chartConfig) {
              chartConfig = [chartConfig];
            } else {
              chartConfig = [];
            }
          }

          // 序列化为 { config: [...] } 格式
          if (chartConfig.length > 0) {
            str += `<!--${JSON.stringify({ config: chartConfig })}-->\n`;
          }
        } else {
          // 非图表类型，使用原有逻辑
          let nodeConfig = configProps;

          // 如果 nodeConfig 是对象且键都是数字（如 {0: {...}}），转换为数组
          nodeConfig = convertObjectToArray(nodeConfig);

          let propsToSerialize: any;

          // 如果 nodeConfig 是数组，直接使用数组
          if (Array.isArray(nodeConfig)) {
            propsToSerialize = nodeConfig;
          } else {
            // 如果是对象，过滤掉 undefined 值，但保留 false 值
            propsToSerialize = Object.keys(nodeConfig).reduce(
              (acc, key) => {
                if (nodeConfig[key] !== undefined) {
                  acc[key] = nodeConfig[key];
                }
                return acc;
              },
              {} as Record<string, any>,
            );
          }

          // 对于数组，直接序列化；对于对象，检查是否为空
          if (Array.isArray(propsToSerialize)) {
            if (propsToSerialize.length > 0) {
              str += `<!--${JSON.stringify({ config: propsToSerialize })}-->\n`;
            }
          } else if (
            propsToSerialize &&
            typeof propsToSerialize === 'object' &&
            Object.keys(propsToSerialize).length > 0
          ) {
            str += `<!--${JSON.stringify(propsToSerialize)}-->\n`;
          }
        }
      }
    }
    const p = parent.at(-1) || ({} as any);

    if (p.type === 'list-item') {
      str += parserNode(node, '', parent, plugins);

      // if (i !== tree.length - 1) {
      //   str += '\n';
      // }
    } else if (p.type === 'blockquote') {
      str += parserNode(node, preString + '> ', parent, plugins);
      if (i !== tree.length - 1) {
        str += '\n' + preString + '> ';
      }
    } else if (node.type === 'blockquote') {
      debugInfo(`parserSlateNodeToMarkdown - 处理引用块 ${i}`, {
        childrenCount: node.children?.length,
        hasNestedBlockquote: node.children?.some(
          (c: any) => c.type === 'blockquote',
        ),
      });
      // Handle blockquotes
      const blockquoteContent = node.children
        .map((child: any) => {
          if (child.type === 'blockquote') {
            // For nested blockquotes, increase the level
            return parserNode(child, '> ', [...parent, node], plugins);
          } else {
            // For regular content, maintain the current level
            const content = parserNode(child, '', [...parent, node], plugins);
            if (!content.trim()) {
              // For empty lines, just add the blockquote marker
              return '>';
            }
            // For regular content, add blockquote marker and handle multi-line content
            return content
              .split('\n')
              .map((line: string) => '> ' + line)
              .join('\n');
          }
        })
        .join('\n');
      str += blockquoteContent;
      debugInfo(`parserSlateNodeToMarkdown - 引用块处理完成 ${i}`, {
        contentLength: blockquoteContent.length,
      });
    } else if (
      node.type === 'bulleted-list' ||
      node.type === 'numbered-list' ||
      node.type === 'list' // 向后兼容
    ) {
      debugInfo(`parserSlateNodeToMarkdown - 处理列表 ${i}`, {
        type: node.type,
        isOrdered: node.type === 'numbered-list' || node.order,
        start: node.start,
        childrenCount: node.children?.length,
      });
      // Handle lists
      const isOrdered =
        node.type === 'numbered-list' || (node.type === 'list' && node.order);
      const listItems = node.children
        .map((item: any, index: number) => {
          const prefix = isOrdered ? `${index + (node.start || 1)}.` : '-';
          return (
            prefix +
            ' ' +
            parserNode(item, '', [...parent, node], plugins).trimEnd()
          );
        })
        .join('\n');

      if (listItems.trim()) {
        str += '\n\n';
        str += listItems;

        if (i !== tree.length - 1) {
          str += '\n\n';
        }
      }
      debugInfo(`parserSlateNodeToMarkdown - 列表处理完成 ${i}`, {
        listItemsLength: listItems.length,
        hasContent: !!listItems.trim(),
      });
    } else if (
      node.type === 'paragraph' &&
      (tree[i - 1]?.type === 'list' ||
        tree[i - 1]?.type === 'bulleted-list' ||
        tree[i - 1]?.type === 'numbered-list') &&
      (tree[i + 1]?.type === 'list' ||
        tree[i + 1]?.type === 'bulleted-list' ||
        tree[i + 1]?.type === 'numbered-list')
    ) {
      if (!Node.string(node)?.replace(/\s|\t/g, '')) {
        str += '<br/>\n\n';
      } else {
        str +=
          preString +
          parserNode(node, preString, parent, plugins)?.replace(
            /^[\s\t]+/g,
            '',
          ) +
          '\n\n';
      }
    } else {
      str += parserNode(node, preString, parent, plugins);

      // Special handling for different node types
      if (node.type && !inlineNode.has(node.type)) {
        // Tables should not have extra newlines between rows
        if (node.type === 'table-row') {
          str += '\n';
        }
        // Code blocks should have double newlines
        else if (node.type === 'code' || node.type === 'media') {
          str += '\n\n';
        }
        // Lists should have double newlines after them
        else if (
          node.type === 'list' ||
          node.type === 'bulleted-list' ||
          node.type === 'numbered-list'
        ) {
          str += '\n\n';
        }
        // Most block elements should have double newlines
        else if (i !== tree.length - 1) {
          // Card 节点不添加额外的换行符，让其子节点自行处理
          if (node.type !== 'card') {
            str += '\n\n';
          }
        }
      }
    }
  }

  // Clean up trailing newlines and handle special cases
  if (str) {
    debugInfo('parserSlateNodeToMarkdown - 开始清理换行符', {
      strLength: str.length,
      trailingNewlines: (str.match(/\n+$/) || [''])[0].length,
    });
    // Remove all trailing newlines first
    str = str.replace(/\n+$/, '');

    // Only add newlines in specific cases
    const lastNode = tree[tree.length - 1];
    const isRoot = parent.length === 1 && parent[0].root;
    const isConverted = lastNode?.converted;
    const parentType = parent[parent.length - 1]?.type;
    const nextNode = tree[tree.indexOf(lastNode) + 1];
    const isLastNodeInParent = !nextNode;
    debugInfo('parserSlateNodeToMarkdown - 换行符处理上下文', {
      lastNodeType: lastNode?.type,
      isRoot,
      isConverted,
      parentType,
      isLastNodeInParent,
    });

    if (lastNode && lastNode.type && !isConverted) {
      if (parentType === 'blockquote') {
        // Only add trailing blockquote marker if this is not the last node in a nested blockquote
        if (
          !isLastNodeInParent ||
          parent.some(
            (p) => p.type === 'blockquote' && p !== parent[parent.length - 1],
          )
        ) {
          str += '\n> ';
        }
      } else if (lastNode.type === 'table') {
        // Do not add any newlines for tables and description lists
        str = str.replace(/\n+$/, '');
      } else if (lastNode.type === 'code' || lastNode.type === 'media') {
        // Add double newlines for code blocks and media, but not if it's the last node
        if (!isLastNodeInParent) {
          str += '\n\n';
        }
      } else if (
        !inlineNode.has(lastNode.type) &&
        !isRoot &&
        !['list-item', 'table-row'].includes(lastNode.type)
      ) {
        // Don't add newlines for list items and table rows
        // Only add newlines if the next node is not a heading
        if (!(lastNode.type === 'head' && nextNode?.type === 'head')) {
          str += '\n\n';
        }
      }
    }
  }

  // Clean up multiple consecutive newlines
  const beforeCleanup = str.length;
  str = str.replace(/\n{3,}/g, '\n\n');
  debugInfo('parserSlateNodeToMarkdown - 清理连续换行符', {
    beforeLength: beforeCleanup,
    afterLength: str.length,
  });

  // Remove leading newlines for root level content
  if (parent.length === 1 && parent[0].root) {
    const beforeLeading = str.length;
    str = str.replace(/^\n+/, '');
    debugInfo('parserSlateNodeToMarkdown - 清理前导换行符', {
      beforeLength: beforeLeading,
      afterLength: str.length,
    });
  }

  debugInfo('parserSlateNodeToMarkdown - 转换完成', {
    finalLength: str.length,
    finalPreview: str.substring(0, 100),
  });

  return str;
};

export const isMix = (t: Text) => {
  return (
    Object.keys(t).filter((key) =>
      ['bold', 'code', 'italic', 'strikethrough'].includes(key),
    ).length > 1
  );
};

/**
 * Converts a Text object to an HTML string with appropriate formatting.
 *
 * @param {Text} t - The Text object to be converted.
 * @returns {string} - The formatted HTML string.
 *
 * The function applies the following HTML tags based on the properties of the Text object:
 * - `<span style="color:{highColor}">` if `highColor` is defined.
 * - `<code>` if `code` is true.
 * - `<i>` if `italic` is true.
 * - `<b>` if `bold` is true.
 * - `<del>` if `strikethrough` is true.
 * - `<a href="{url}">` if `url` is defined.
 */
const textHtml = (t: Text) => {
  let str = t.text || '';
  if (t.highColor) str = `<span style="color:${t.highColor}">${str}</span>`;
  if (t.code) str = `<code>${str}</code>`;
  if (t.italic) str = `<i>${str}</i>`;
  if (t.bold) str = `<b>${str}</b>`;
  if (t.strikethrough) str = `<del>${str}</del>`;
  if (t?.url) str = `<a href="${t?.url}">${str}</a>`;
  if (t?.identifier || t?.fnc) str = `[^${str}]`;
  return str;
};

/**
 * 将文本对象格式化为带有适当样式的 Markdown 字符串
 *
 * @param t - 要格式化的文本对象
 * @returns 格式化后的 Markdown 字符串
 *
 * 该函数根据文本对象的属性应用以下 Markdown 样式：
 * - `code`: 使用反引号(`)包裹文本
 * - `italic`: 使用单个星号(*)包裹文本
 * - `bold`: 使用双星号(**)包裹文本
 * - `strikethrough`: 使用双波浪线(~~)包裹文本
 *
 * 此外，还会：
 * - 转义反斜杠
 * - 将换行符转换为 Markdown 换行符
 * - 保留文本前后的空白字符
 */
const textStyle = (t: Text) => {
  if (!t.text && !t.tag) return '';
  let str = t?.text?.replace(/(?<!\\)\\/g, '\\').replace(/\n/g, '  \n') || '';
  let preStr = '',
    afterStr = '';

  // Apply formats in a consistent order:
  // 1. Code (most specific)
  // 2. Bold (strong emphasis)
  // 3. Italic (emphasis)
  // 4. Strikethrough (modification)
  if (t.code && !t.tag) {
    // Extract whitespace for non-tag code
    if (t.code || t.bold || t.strikethrough || t.italic) {
      preStr = str.match(/^\s+/)?.[0] || '';
      afterStr = str.match(/\s+$/)?.[0] || '';
      str = str.trim();
    }
    str = `\`${str}\``;
  } else if (t.tag) {
    // 如果是 tag，优先检查是否有 value，如果有 value 则使用 value 和 placeholder
    // 如果没有 value 但有 text（且不为空），则使用 text
    // 如果没有 text 也没有 value，则使用 placeholder
    // 对于 tag，如果 text 只是空白字符，不保留空白字符
    const trimmedStr = str.trim();

    if ((t as any).value) {
      // 有 value，优先使用 value 和 placeholder（即使有 text 也使用 value）
      str = `\`\${placeholder:${(t as any)?.placeholder || '-'},value:${(t as any).value}}\``;
    } else if (trimmedStr) {
      // 没有 value 但有 text 且不为空，提取空白字符并使用 text
      if (t.code || t.bold || t.strikethrough || t.italic) {
        preStr = str.match(/^\s+/)?.[0] || '';
        afterStr = str.match(/\s+$/)?.[0] || '';
      }
      str = `\`${trimmedStr}\``;
    } else if ((t as any).placeholder) {
      // 没有 text 也没有 value，使用 placeholder（不保留空白字符）
      str = `\`\${placeholder:${(t as any).placeholder}}\``;
    } else {
      // 都没有，使用默认值（不保留空白字符）
      str = `\`\${placeholder:-}\``;
    }
  } else {
    // Extract whitespace for other formats
    if (t.bold || t.strikethrough || t.italic) {
      preStr = str.match(/^\s+/)?.[0] || '';
      afterStr = str.match(/\s+$/)?.[0] || '';
      str = str.trim();
    }
  }

  // For mixed formats, we want to ensure proper nesting
  if (t.bold && t.italic) {
    str = `***${str}***`; // Combined bold and italic
  } else {
    if (t.bold) str = `**${str}**`;
    if (t.italic) str = `*${str}*`;
  }

  if (t.strikethrough) str = `~~${str}~~`;

  // Preserve exact whitespace
  return preStr + str + afterStr;
};

/**
 * 根据给定的文本节点及其父节点生成格式化的文本字符串
 *
 * @param t - 要处理的文本节点
 * @param parent - 父节点数组，用于上下文信息
 * @returns 处理后的文本字符串。如果文本节点没有内容，返回空字符串
 *
 * 该函数处理不同的文本样式和格式：
 * - 如果文本有 highColor 属性或者同时具有删除线和其他样式（粗体、斜体、代码），返回 HTML 格式的文本
 * - 如果文本有 URL，返回 Markdown 链接格式
 * - 如果文本有多种样式且不在句子末尾，确保单词之间有适当的空格
 *
 * 特殊处理：
 * - 高亮颜色：使用 span 标签和 style 属性
 * - 脚注标识：使用 [^] 语法
 * - 混合样式：确保相邻文本之间的空格正确
 */
const composeText = (t: Text, parent: any[]) => {
  if (!t.text && !t.tag) return '';
  if (
    t.highColor ||
    t.identifier ||
    t.fnc ||
    (t.strikethrough && (t.bold || t.italic || t.code))
  )
    return textHtml(t);
  const siblings = parent[parent.length - 1]?.children;
  // @ts-ignore
  const index = siblings?.findIndex((n) => n === t);
  let str = textStyle(t)!;
  if (t?.url) {
    str = `[${t.text}](${encodeURI(t?.url)})`;
  } else if (isMix(t) && index !== -1) {
    const next = siblings[index + 1];
    if (!str.endsWith(' ') && next && !Node.string(next).startsWith(' ')) {
      str += ' ';
    }
  }
  return str;
};

/**
 * 将类表格节点结构转换为 Markdown 表格字符串
 *
 * @param el - 表格节点，可以是 TableNode、ColumnNode、DescriptionNode 或 ChartNode 类型
 * @param preString - 前缀字符串，用于在表格每行前添加缩进
 * @param parent - 父节点数组，用于提供上下文信息
 * @param plugins - 可选的插件数组，用于自定义转换逻辑
 * @returns 格式化后的 Markdown 表格字符串
 *
 * 该函数支持以下功能：
 * 1. 列宽处理
 *    - 自动计算每列的最大宽度
 *    - 使用空格填充单元格以对齐
 *
 * 2. 对齐方式
 *    - 左对齐：`:---`
 *    - 居中对齐：`:---:`
 *    - 右对齐：`---:`
 *
 * 3. 特殊节点处理
 *    - column-group：生成带有默认列标题的表格
 *    - table/chart：处理标准表格数据
 *    - description：将描述列表转换为两行表格
 *
 * 4. 格式化细节
 *    - 转义表格分隔符 |
 *    - 保持单元格间距一致
 *    - 处理空行和空单元格
 *
 * @example
 * 生成的表格格式如下：
 * ```markdown
 * | 列1 | 列2 | 列3 |
 * |:--- |:---:| ---:|
 * | 左对齐 | 居中 | 右对齐 |
 * ```
 */
const table = (
  el: ChartNode,
  parent: any[],
  plugins?: MarkdownEditorPlugin[],
) => {
  debugInfo('parserSlateNodeToMarkdown.table - 开始处理表格', {
    elType: el.type,
    childrenCount: el.children?.length,
  });

  const children = el.children;
  const head = children[0]?.children;
  if (!children.length || !head.length) {
    debugInfo('parserSlateNodeToMarkdown.table - 空表格，返回空字符串');
    return '';
  }

  debugInfo('parserSlateNodeToMarkdown.table - 表格头部信息', {
    headLength: head.length,
    headCells: head.map((h: any) => ({
      type: h.type,
      align: h.align,
    })),
  });

  const data: string[][] = new Array(children.length);
  let maxColumns = 0;

  // 使用策略模式处理不同类型的表格
  const tableProcessors = {
    default: () => {
      let rowIndex = 0;
      for (const c of children) {
        if (!c) continue;

        const processRow = (
          cells: any[],
          processCell: (cell: any) => string,
        ) => {
          const row: string[] = new Array(cells.length);

          // 处理每个单元格，包括空单元格
          for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            const content = processCell(cell);
            row[i] = content; // 保持原始位置，不跳过空单元格
          }

          // 只要有单元格存在就添加这一行，即使所有单元格都是空的
          if (cells.length > 0) {
            data[rowIndex] = row;
            maxColumns = Math.max(maxColumns, cells.length);
            rowIndex++;
          }
        };

        const cellProcessor = (cell: any) => {
          if (cell.type !== 'table-cell') return '';

          // 对于表格单元格，直接提取文本内容，避免段落格式化
          return cell.children
            .map((child: any) => {
              if (child.type === 'paragraph') {
                // 对于段落，直接处理其文本内容
                return parserSlateNodeToMarkdown(
                  child.children,
                  '',
                  [...parent, cell, child],
                  plugins,
                );
              }
              return parserSlateNodeToMarkdown(
                [child],
                '',
                [...parent, cell],
                plugins,
              );
            })
            .join('')
            .trim();
        };

        if (c.type === 'table-row' && c?.children) {
          processRow(c.children, cellProcessor);
        } else if (c.type === 'table-cell') {
          processRow([c], cellProcessor);
        }
      }
      return rowIndex;
    },
  };

  const processor =
    tableProcessors[el.type as keyof typeof tableProcessors] ||
    tableProcessors.default;
  const rowCount = processor();
  data.length = rowCount;

  debugInfo('parserSlateNodeToMarkdown.table - 表格数据处理完成', {
    rowCount,
    maxColumns,
    dataPreview: data.slice(0, 2).map((row) => row.slice(0, 3)),
  });

  // 计算列宽
  const colLength = new Array(maxColumns).fill(0);
  for (const row of data) {
    for (let i = 0; i < row.length; i++) {
      colLength[i] = Math.max(colLength[i], stringWidth(row[i] || ''));
    }
  }

  // 对齐策略表
  const alignStrategies = {
    right: (str: string, diff: number) => ' '.repeat(diff) + str,
    center: (str: string, diff: number) => {
      const pre = Math.floor(diff / 2);
      return ' '.repeat(pre) + str + ' '.repeat(diff - pre);
    },
    left: (str: string, diff: number) => str + ' '.repeat(diff),
    default: (str: string, diff: number) => str + ' '.repeat(diff),
  };

  // 修改分隔符策略表
  const separatorStrategies = {
    left: (length: number) => ':' + '-'.repeat(Math.max(3, length - 1)),
    center: (length: number) => ':' + '-'.repeat(Math.max(3, length - 2)) + ':',
    right: (length: number) => '-'.repeat(Math.max(3, length - 1)) + ':',
    default: (length: number) => ':' + '-'.repeat(Math.max(3, length - 1)), // 默认使用左对齐
  };

  const output: string[] = [];

  // 构建表格内容
  for (let i = 0; i < data.length; i++) {
    const cells = new Array(maxColumns);
    const row = data[i];

    // 处理单元格
    for (let j = 0; j < maxColumns; j++) {
      let str = row[j] || '';
      const strLength = stringWidth(str);
      const length = Math.max(3, colLength[j]);
      const diff = length - strLength;

      // 检查是否有明确的对齐信息
      const hasExplicitAlignment = head[j]?.align !== undefined;

      str =
        diff > 0 && hasExplicitAlignment
          ? (
              alignStrategies[head[j]?.align as keyof typeof alignStrategies] ||
              alignStrategies.default
            )(str, diff)
          : str;

      cells[j] = str.replace(/\|/g, '\\|');
    }

    output.push(`| ${cells.join(' | ')} |`);

    // 处理分隔行
    if (i === 0) {
      const separators = new Array(maxColumns);
      for (let j = 0; j < maxColumns; j++) {
        const minLength = Math.max(3, colLength[j]); // 确保至少有3个字符的长度
        separators[j] = (
          separatorStrategies[
            head[j]?.align as keyof typeof separatorStrategies
          ] || separatorStrategies.default
        )(minLength);
      }
      output.push(`| ${separators.join(' | ')} |`);
    }
  }

  const result = output.join('\n');
  debugInfo('parserSlateNodeToMarkdown.table - 表格转换完成', {
    outputRows: output.length,
    resultLength: result.length,
    resultPreview: result.substring(0, 200),
  });

  return result;
};

/**
 * 处理卡片节点，递归处理其子节点
 * @param node - 卡片节点
 * @param preString - 前缀字符串，用于处理缩进
 * @param parent - 父节点数组
 * @param plugins - 可选的插件数组
 * @returns 处理后的 Markdown 字符串
 */
const handleCard = (
  node: any,
  preString: string,
  parent: any[],
  plugins?: MarkdownEditorPlugin[],
) => {
  return parserSlateNodeToMarkdown(
    node?.children,
    preString,
    [...parent, node],
    plugins,
  );
};

/**
 * 处理段落节点，添加前缀并处理其子节点
 * @param node - 段落节点
 * @param preString - 前缀字符串，用于处理缩进
 * @param parent - 父节点数组
 * @param plugins - 可选的插件数组
 * @returns 处理后的 Markdown 字符串
 */
const handleParagraph = (
  node: any,
  preString: string,
  parent: any[],
  plugins?: MarkdownEditorPlugin[],
) => {
  let str = '';

  // 如果有对齐属性，使用 HTML 标签包裹以支持对齐（兼容 align 在 otherProps 的情况）
  const align = node.align ?? node.otherProps?.align;
  if (align) {
    // 递归处理子节点
    const content = parserSlateNodeToMarkdown(
      node?.children,
      '',
      [...parent, node],
      plugins,
    );
    return `<p align="${align}">${content}</p>`;
  }

  str += parserSlateNodeToMarkdown(
    node?.children,
    preString,
    [...parent, node],
    plugins,
  );

  return str;
};

/**
 * 处理标题节点，根据级别生成对应的 Markdown 标题
 * @param node - 标题节点，包含 level 属性
 * @param preString - 前缀字符串，用于处理缩进
 * @param parent - 父节点数组
 * @param plugins - 可选的插件数组
 * @returns 处理后的 Markdown 标题字符串
 */
const handleHead = (
  node: any,
  preString: string,
  parent: any[],
  plugins?: MarkdownEditorPlugin[],
) => {
  let str = '';

  // 如果有对齐属性，使用 HTML 标签包裹以支持对齐（兼容 align 在 otherProps 的情况）
  const align = node.align ?? node.otherProps?.align;
  if (align) {
    // 递归处理子节点
    const content = parserSlateNodeToMarkdown(
      node?.children,
      '',
      [...parent, node],
      plugins,
    );
    return `<h${node.level} align="${align}">${content}</h${node.level}>`;
  }

  str +=
    '#'.repeat(node.level) +
    ' ' +
    parserSlateNodeToMarkdown(
      node?.children,
      preString,
      [...parent, node],
      plugins,
    );

  return str;
};

/**
 * 处理代码节点，支持三种模式：HTML渲染、Frontmatter、普通代码块
 * @param node - 代码节点，包含 language、value、render、frontmatter 等属性
 * @param preString - 前缀字符串，用于处理缩进
 * @returns 处理后的代码块字符串
 */
const handleCode = (node: any, preString: string) => {
  let code = node?.value || '';

  // 如果 code 是对象，则转换为 JSON 字符串，实现对 apaasify 等节点的支持
  if (typeof code === 'object') {
    try {
      code = JSON.stringify(code, null, 2);
    } catch (e) {
      console.warn('Invalid code object', e);
    }
  }

  // 如果语言是 think，转换为 <think> 标签
  if (node.language === 'think') {
    // 恢复内容中的代码块特殊标记为 Markdown 格式
    const marker = '\u200B'; // 零宽空格
    const restoredCode = code.replace(
      new RegExp(
        `${marker}【CODE_BLOCK:([\\w]*)】\\n?([\\s\\S]*?)\\n?【/CODE_BLOCK】${marker}`,
        'g',
      ),
      (_: string, lang: string, codeContent: string) => {
        return `\`\`\`${lang}\n${codeContent}\n\`\`\``;
      },
    );
    return `<think>${restoredCode}</think>`;
  }

  if (node.language === 'html' && node.render) {
    return code;
  }

  if (node.frontmatter) {
    return `${preString}---\n${code}\n${preString}---`;
  }

  const language = node.language || '';

  if (!code.trim()) {
    return `${preString}\`\`\`${language}\n${preString}\`\`\``;
  }

  const codeLines = code.split('\n');
  const indentedCode = codeLines
    .map((line: string, index: number) => {
      if (index === 0 || index === codeLines.length - 1) {
        return line;
      }
      return preString + line;
    })
    .join('\n');

  return `${preString}\`\`\`${language}\n${indentedCode}\n${preString}\`\`\``;
};

/**
 * 处理附件节点，生成带下载属性的链接标签
 * @param node - 附件节点，包含 url、size、name 属性
 * @returns 处理后的 HTML 链接标签字符串
 */
const handleAttach = (node: any) => {
  return `<a href="${encodeURI(node?.url)}" download data-size="${node.size}">${node.name}</a>`;
};

/**
 * 处理引用块节点，递归处理其子节点
 * @param node - 引用块节点
 * @param preString - 前缀字符串，用于处理缩进
 * @param parent - 父节点数组
 * @param plugins - 可选的插件数组
 * @returns 处理后的 Markdown 引用字符串
 */
const handleBlockquote = (
  node: any,
  preString: string,
  parent: any[],
  plugins?: MarkdownEditorPlugin[],
) => {
  // Handle empty blockquotes
  if (!node.children || node.children.length === 0) {
    return '> ';
  }

  // Process each child node
  const blockquoteContent = node.children
    .map((child: any) => {
      if (child.type === 'blockquote') {
        // For nested blockquotes, increase the level
        const nestedContent = parserNode(child, '', [...parent, node], plugins);
        return nestedContent
          .split('\n')
          .map((line: string) => '> ' + line)
          .join('\n');
      } else {
        // For regular content
        const content = parserNode(child, '', [...parent, node], plugins);
        if (!content.trim()) {
          return '> ';
        }
        // Add blockquote marker and handle multi-line content
        return content
          .split('\n')
          .map((line: string) => '> ' + line)
          .join('\n');
      }
    })
    .join('\n');

  return blockquoteContent;
};

/**
 * 处理图片节点，支持宽度、高度和块级显示参数
 * @param node - 图片节点，包含 url、width、height、block、alt 属性
 * @returns 处理后的 Markdown 图片字符串
 */
const handleImage = (node: any) => {
  try {
    let nodeImageUrl = new URL(node?.url);
    if (node.width) {
      nodeImageUrl.searchParams.set('width', node.width);
    }
    if (node.height) {
      nodeImageUrl.searchParams.set('height', node.height);
    }
    if (node.block) {
      nodeImageUrl.searchParams.set('block', node.block);
    }
    return `![${node.alt || ''}](${nodeImageUrl.toString()})`;
  } catch (e) {
    console.warn('Invalid image URL:', node?.url, e);
    return `![${node.alt || ''}](${encodeURI(node?.url)})`;
  }
};

/**
 * 处理媒体节点，支持视频、图片和 iframe
 * @param node - 媒体节点，包含 url、mediaType、height、align、alt 属性
 * @returns 处理后的 HTML 媒体标签或 Markdown 图片字符串
 */
const handleMedia = (node: any) => {
  let nodeUrl = node?.url;
  let type = node.mediaType || getMediaType(nodeUrl, node?.alt);
  if (node.height) {
    if (type === 'video') {
      return `<video src="${encodeURI(nodeUrl)}" alt="" height="${node.height || ''}"/>`;
    } else if (type === 'image' || type === 'media') {
      return `<img src="${encodeURI(nodeUrl)}" alt="" height="${node.height || ''}" ${node.align ? `data-align="${node.align}"` : ''}/>`;
    }
  } else {
    if (type === 'video') {
      return `<video src="${encodeURI(nodeUrl)}"/>`;
    } else if (type === 'image' || type === 'media') {
      if (node.align) {
        return `<img src="${encodeURI(nodeUrl)}" alt="" ${node.align ? `data-align="${node.align}"` : ''}/>`;
      } else {
        return `![${node.alt || ''}](${encodeURI(nodeUrl)})`;
      }
    } else {
      return `<iframe src="${encodeURI(nodeUrl)}"/>`;
    }
  }
  return '';
};

/**
 * 处理列表节点，递归处理其子节点
 * @param node - 列表节点（bulleted-list、numbered-list 或 list）
 * @param preString - 前缀字符串，用于处理缩进
 * @param parent - 父节点数组
 * @param plugins - 可选的插件数组
 * @returns 处理后的 Markdown 列表字符串
 */
const handleList = (
  node: any,
  preString: string,
  parent: any[],
  plugins?: MarkdownEditorPlugin[],
) => {
  // 检查是否在嵌套列表中（父节点是 list-item）
  const isNested =
    parent.length > 0 && parent[parent.length - 1]?.type === 'list-item';

  // 如果是嵌套列表，需要添加缩进
  const indent = isNested ? '  ' : '';

  // 递归处理列表项，每个列表项都会添加缩进前缀
  const listItems = node.children
    .map((item: any, index: number) => {
      const isOrdered =
        node.type === 'numbered-list' || (node.type === 'list' && node.order);
      const prefix = isOrdered ? `${index + (node.start || 1)}.` : '-';

      // 处理列表项内容，如果是嵌套列表，需要额外缩进
      const itemContent = parserNode(
        item,
        indent + preString,
        [...parent, node],
        plugins,
      ).trimEnd();

      return indent + prefix + ' ' + itemContent;
    })
    .join('\n' + indent);

  return listItems;
};

/**
 * 处理列表项节点，递归处理其子节点
 * @param node - 列表项节点
 * @param preString - 前缀字符串，用于处理缩进
 * @param parent - 父节点数组
 * @param plugins - 可选的插件数组
 * @returns 处理后的 Markdown 列表项字符串
 */
const handleListItem = (
  node: any,
  preString: string,
  parent: any[],
  plugins?: MarkdownEditorPlugin[],
) => {
  // 列表项的第一个子节点应该是段落或其他块级元素
  // 后续子节点可能是嵌套的列表
  const result: string[] = [];

  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    const childResult = parserNode(
      child,
      preString,
      [...parent, node],
      plugins,
    );

    if (i === 0) {
      // 第一个子节点是主要内容
      result.push(childResult);
    } else {
      // 后续子节点可能是嵌套列表，需要换行并添加缩进
      if (
        child.type === 'bulleted-list' ||
        child.type === 'numbered-list' ||
        child.type === 'list'
      ) {
        result.push('\n' + childResult);
      } else {
        // 其他块级元素也需要换行
        result.push('\n' + childResult);
      }
    }
  }

  return result.join('');
};

/**
 * 处理模式定义节点，生成 schema 代码块
 * @param node - 模式定义节点，包含 otherProps 属性
 * @returns 处理后的 schema 代码块字符串
 */
const handleSchema = (node: any) => {
  return '```schema\n' + JSON.stringify(node.otherProps, null, 2) + '\n```';
};

/**
 * 处理链接卡片节点，生成 Markdown 链接格式
 * @param node - 链接卡片节点，包含 name、url 属性
 * @returns 处理后的 Markdown 链接字符串
 */
const handleLinkCard = (node: any) => {
  return `[${node.name}](${node?.url} "${node.name}")`;
};

/**
 * 处理水平分割线节点
 * @param preString - 前缀字符串，用于处理缩进
 * @returns 处理后的 Markdown 分割线字符串
 */
const handleHr = (preString: string) => {
  return preString + '***';
};

/**
 * 处理换行节点
 * @param preString - 前缀字符串，用于处理缩进
 * @returns 处理后的 HTML 换行标签字符串
 */
const handleBreak = (preString: string) => {
  return preString + '<br/>';
};

/**
 * 处理脚注定义节点
 * @param node - 脚注定义节点，包含 identifier、value、url 属性
 * @returns 处理后的 Markdown 脚注字符串
 */
const handleFootnoteDefinition = (node: any) => {
  return `[^${node.identifier}]: [${node.value}](${node.url})\n`;
};

/**
 * 处理默认文本节点
 * @param node - 文本节点
 * @param parent - 父节点数组
 * @returns 处理后的文本字符串
 */
const handleDefault = (node: any, parent: any[]) => {
  if (node.text || node.tag) return composeText(node, parent);
  return '';
};
