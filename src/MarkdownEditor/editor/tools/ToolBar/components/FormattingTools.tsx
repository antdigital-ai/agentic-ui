import classnames from 'clsx';
import React from 'react';
import { ToolBarItem } from './ToolBarItem';

interface FormattingToolsProps {
  baseClassName: string;
  hashId?: string;
  i18n: any;
  tools: Array<{
    key: string;
    type: string;
    title?: string;
    icon: React.ReactNode;
    onClick?: (editor: any) => void;
    isActive?: (editor: any) => boolean;
  }>;
  editor: any;
  isCodeNode: boolean;
  onToolClick: (tool: any) => void;
  isFormatActive: (type: string) => boolean;
  isInTable?: boolean; // 新增：是否在表格内
  hideTools?: string[]; // 新增：隐藏的工具列表
}

export const FormattingTools = React.memo<FormattingToolsProps>(
  ({
    baseClassName,
    hashId,
    i18n,
    tools,
    editor,
    isCodeNode,
    onToolClick,
    isFormatActive,
    isInTable = false,
    hideTools = [],
  }) => {
    // 在表格内时，只允许这些基本格式化工具：加粗、斜体、删除线、行内代码
    const allowedInTable = ['bold', 'italic', 'strikethrough', 'inline-code'];

    // 根据是否在表格内过滤工具，表格内不支持对齐等复杂格式
    let filteredTools = isInTable
      ? tools.filter((tool) => allowedInTable.includes(tool.key))
      : tools;

    // 过滤掉隐藏的工具
    filteredTools = filteredTools.filter(
      (tool) => !hideTools.includes(tool.key),
    );

    return (
      <>
        {filteredTools.map((tool) => {
          const isActive = tool.isActive
            ? tool.isActive(editor)
            : isFormatActive(tool.type);

          return (
            <ToolBarItem
              key={tool.key}
              title={
                (i18n?.locale?.[
                  tool.key as keyof typeof i18n.locale
                ] as string) || tool.title
              }
              icon={tool.icon}
              onClick={() => !isCodeNode && onToolClick(tool)}
              className={classnames(`${baseClassName}-item`, hashId)}
              style={{
                color: isActive ? '#1677ff' : undefined,
              }}
            />
          );
        })}
      </>
    );
  },
);

FormattingTools.displayName = 'FormattingTools';
