import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

/**
 * 提取段落节点的文本内容
 * @param paragraphNode - 段落节点
 * @returns 文本内容字符串
 */
function extractParagraphText(paragraphNode: any): string {
  if (!paragraphNode.children || !Array.isArray(paragraphNode.children)) {
    return '';
  }

  return paragraphNode.children
    .map((child: any) => {
      if (child.type === 'text') {
        return child.value || '';
      }
      // 处理嵌套节点（如 strong, emphasis 等）
      if (child.children && Array.isArray(child.children)) {
        return child.children
          .map((grandChild: any) =>
            grandChild.type === 'text' ? grandChild.value || '' : '',
          )
          .join('');
      }
      return '';
    })
    .join('')
    .trim();
}

/**
 * 将段落节点转换为相应的节点类型（根据内容开头字符）
 * - ! 开头 → image
 * - | 开头 → table
 * - [ 开头 → link
 *
 * @returns {(tree: any) => void}
 *   Transformer function.
 */
export function convertParagraphToImage() {
  return (tree: any) => {
    // 使用 visit 访问 paragraph 节点，并通过 index 和 parent 来替换
    visit(
      tree,
      'paragraph',
      (paragraphNode: any, index: number | undefined, parent: any) => {
        const textContent = extractParagraphText(paragraphNode);

        if (!textContent || !index || !parent) {
          return;
        }
        const nextNode = parent?.children?.[index + 1];

        // 检查是否以 ! 开头（图片）
        if (textContent.startsWith('!') && !nextNode) {
          // 提取 URL（去掉开头的 !）
          const imageUrl = textContent.slice(1).trim();

          // 如果 URL 不为空，则创建 image 节点并替换
          if (imageUrl) {
            const imageNode = {
              type: 'image',
              url: imageUrl,
              finished: false,
              alt: '',
            };

            // 替换父节点中的 paragraph 节点为 image 节点
            if (
              parent &&
              Array.isArray(parent.children) &&
              typeof index === 'number'
            ) {
              parent.children[index] = imageNode;
            }
          }
          return;
        }

        // 检查是否以 | 开头（表格）
        // 注意：如果 remark-gfm 已经正确解析了表格，表格节点应该是 'table' 类型，不会进入这里
        // 这里只处理未被解析的表格行（通常是不完整的表格输入）
        if (textContent.startsWith('|') && !nextNode) {
          // 只有不完整的表格输入（比如只有 | 开头，没有结束）才转换为表格节点
          // 创建不完整的表格节点（用于不完整的表格输入）
          const tableNode = {
            type: 'table',
            finished: false,
            align: [],
            children: [
              {
                type: 'tableRow',
                children: [
                  {
                    type: 'tableCell',
                    children: [
                      {
                        type: 'paragraph',
                        children: [
                          {
                            type: 'text',
                            value: textContent,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          };

          // 替换父节点中的 paragraph 节点为 table 节点
          if (
            parent &&
            Array.isArray(parent.children) &&
            typeof index === 'number'
          ) {
            parent.children[index] = tableNode;
          }
          return;
        }
        if (textContent.startsWith('[') && !nextNode) {
          // 检查是否匹配 [内容](url) 格式
          const linkPattern = /^\[([^\]]+)\]\(([^)]+)\)$/;
          const match = textContent.match(linkPattern);
          if (match) {
            const linkNode = {
              type: 'link',
              url: match[2],
              finished: false,
              children: paragraphNode.children,
            };
            if (
              parent &&
              Array.isArray(parent.children) &&
              typeof index === 'number'
            ) {
              parent.children[index] = linkNode;
            }
          }
        }
        return;
      },
    );
  };
}

/**
 * Plugin to fix bold text containing special characters like **$9.698M**, **57%**, etc.
 *
 * @returns {(tree: any) => void}
 *   Transformer function.
 */
export function fixStrongWithSpecialChars() {
  // 返回转换器函数
  return (tree: any) => {
    // 先尝试处理段落中的原始文本
    visit(tree, 'paragraph', (paragraphNode: any) => {
      if (Array.isArray(paragraphNode.children)) {
        for (let i = 0; i < paragraphNode.children.length; i++) {
          const child = paragraphNode.children[i];

          if (
            child.type === 'text' &&
            child.value &&
            typeof child.value === 'string'
          ) {
            // 匹配完整的加粗文本（**text**）
            const strongPattern =
              /\*\*([^*\n]*[$%#@&+\-=\w\d.，。、；：！？""''（）【】《》]+[^*\n]*?)\*\*/g;

            // 匹配不完整的加粗文本（**text 但没有结束的 **）
            const incompleteStrongPattern = /^\*\*([^*\n]+)$/;

            const newNodes: any[] = [];
            let lastIndex = 0;
            let hasMatch = false;

            // 先检查是否有完整的加粗文本
            if (strongPattern.test(child.value)) {
              // 重置正则表达式
              strongPattern.lastIndex = 0;
              hasMatch = true;

              let match;
              // 分割文本并创建新的节点结构
              while ((match = strongPattern.exec(child.value)) !== null) {
                // 添加匹配前的普通文本
                if (match.index > lastIndex) {
                  const beforeText = child.value.slice(lastIndex, match.index);
                  if (beforeText) {
                    newNodes.push({
                      type: 'text',
                      value: beforeText,
                    });
                  }
                }

                // 添加加粗节点
                newNodes.push({
                  type: 'strong',
                  children: [
                    {
                      type: 'text',
                      value: match[1],
                    },
                  ],
                });

                lastIndex = match.index + match[0].length;
              }

              // 添加剩余的普通文本
              if (lastIndex < child.value.length) {
                const afterText = child.value.slice(lastIndex);
                if (afterText) {
                  // 检查剩余文本是否是不完整的加粗
                  const incompleteMatch =
                    incompleteStrongPattern.exec(afterText);
                  if (incompleteMatch) {
                    newNodes.push({
                      type: 'strong',
                      finished: false,
                      children: [
                        {
                          type: 'text',
                          value: incompleteMatch[1],
                        },
                      ],
                    });
                  } else {
                    newNodes.push({
                      type: 'text',
                      value: afterText,
                    });
                  }
                }
              }
            }
            // 如果没有完整匹配，检查是否是不完整的加粗
            else if (incompleteStrongPattern.test(child.value)) {
              const incompleteMatch = incompleteStrongPattern.exec(child.value);
              if (incompleteMatch) {
                hasMatch = true;
                newNodes.push({
                  type: 'strong',
                  finished: false,
                  children: [
                    {
                      type: 'text',
                      value: incompleteMatch[1],
                    },
                  ],
                });
              }
            }

            // 替换当前文本节点
            if (hasMatch && newNodes.length > 0) {
              paragraphNode.children.splice(i, 1, ...newNodes);
              i += newNodes.length - 1; // 调整索引以跳过新插入的节点
            }
          }
        }
      }
    });

    // 处理所有文本节点（作为备用方案）
    visit(tree, 'text', (node: any, index: number | undefined, parent: any) => {
      if (node.value && typeof node.value === 'string') {
        // 匹配完整的加粗文本（**text**）
        const strongPattern =
          /\*\*([^*\n]*[$%#@&+\-=\w\d.，。、；：！？""''（）【】《》]+[^*\n]*?)\*\*/g;

        // 匹配不完整的加粗文本（**text 但没有结束的 **）
        const incompleteStrongPattern = /^\*\*([^*\n]+)$/;

        const newNodes: any[] = [];
        let lastIndex = 0;
        let hasMatch = false;

        // 先检查是否有完整的加粗文本
        if (strongPattern.test(node.value)) {
          // 重置正则表达式
          strongPattern.lastIndex = 0;
          hasMatch = true;

          let match;
          // 分割文本并创建新的节点结构
          while ((match = strongPattern.exec(node.value)) !== null) {
            // 添加匹配前的普通文本
            if (match.index > lastIndex) {
              const beforeText = node.value.slice(lastIndex, match.index);
              if (beforeText) {
                newNodes.push({
                  type: 'text',
                  value: beforeText,
                });
              }
            }

            // 添加加粗节点
            newNodes.push({
              type: 'strong',
              children: [
                {
                  type: 'text',
                  value: match[1],
                },
              ],
            });

            lastIndex = match.index + match[0].length;
          }

          // 添加剩余的普通文本
          if (lastIndex < node.value.length) {
            const afterText = node.value.slice(lastIndex);
            if (afterText) {
              // 检查剩余文本是否是不完整的加粗
              const incompleteMatch = incompleteStrongPattern.exec(afterText);
              if (incompleteMatch) {
                newNodes.push({
                  type: 'strong',
                  finished: false,
                  children: [
                    {
                      type: 'text',
                      value: incompleteMatch[1],
                    },
                  ],
                });
              } else {
                newNodes.push({
                  type: 'text',
                  value: afterText,
                });
              }
            }
          }
        }
        // 如果没有完整匹配，检查是否是不完整的加粗
        else if (incompleteStrongPattern.test(node.value)) {
          const incompleteMatch = incompleteStrongPattern.exec(node.value);
          if (incompleteMatch) {
            hasMatch = true;
            newNodes.push({
              type: 'strong',
              finished: false,
              children: [
                {
                  type: 'text',
                  value: incompleteMatch[1],
                },
              ],
            });
          }
        }

        // 替换原节点
        if (
          hasMatch &&
          newNodes.length > 0 &&
          parent &&
          Array.isArray(parent.children) &&
          typeof index === 'number'
        ) {
          parent.children.splice(index, 1, ...newNodes);
        }
      }
    });
  };
}

// Markdown 解析器（用于解析 Markdown 为 mdast AST）
// 注意：这个解析器只用于解析，不包含 HTML 渲染相关的插件
const markdownParser = unified()
  .use(remarkParse) // 解析 Markdown
  .use(remarkHtml)
  .use(remarkFrontmatter, ['yaml']) // 处理前置元数据
  .use(remarkGfm, { singleTilde: false }) // GFM 插件，禁用单波浪线删除线
  .use(fixStrongWithSpecialChars) // 修复包含特殊字符的加粗文本
  .use(convertParagraphToImage) // 将以 ! 开头的段落转换为图片,将 | 开头的段落转换为表格
  .use(remarkMath as any, {
    singleDollarTextMath: true, // 允许单美元符号渲染内联数学公式
  });

// 默认导出解析器（用于解析 Markdown 为 mdast AST）
export default markdownParser;
