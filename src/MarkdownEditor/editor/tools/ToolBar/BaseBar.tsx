import { Plus } from '@sofa-design/icons';
import { Divider, Dropdown } from 'antd';
import classnames from 'clsx';
import React, { useContext, useMemo } from 'react';
import { I18nContext } from '../../../../I18n';
import { useEditorStore } from '../../store';
import { getInsertOptions } from '../InsertAutocomplete';
import type { ToolsKeyType as ConfigToolsKeyType } from './config/toolsConfig';
import { useToolsConfig } from './config/toolsConfig';
import { useToolBarLogic } from './hooks/useToolBarLogic';

// Components
import { Node } from 'slate';
import { ClearFormatButton } from './components/ClearFormatButton';
import { ColorPickerButton } from './components/ColorPickerButton';
import { FormatButton } from './components/FormatButton';
import { FormattingTools } from './components/FormattingTools';
import { HeadingDropdown } from './components/HeadingDropdown';
import { LinkButton } from './components/LinkButton';
import { ToolBarItem } from './components/ToolBarItem';
import { UndoRedoButtons } from './components/UndoRedoButtons';

export type ToolsKeyType = ConfigToolsKeyType;

// 节点类型常量
const TABLE_NODE_TYPES = [
  'table-cell',
  'table-row',
  'table',
  'thead',
  'tbody',
  'th',
  'td',
] as const;

const LINK_ALLOWED_NODE_TYPES = [
  'head',
  'paragraph',
  'quote',
  'b-list',
  'n-list',
  't-list',
] as const;

const HEADING_ALLOWED_NODE_TYPES = ['head', 'paragraph'] as const;

// 工具函数
const isTableNode = (nodeType: string): boolean => {
  return TABLE_NODE_TYPES.includes(nodeType as any);
};

const isNodeInTable = (
  currentNode: any,
  markdownEditorRef: React.MutableRefObject<any>,
): boolean => {
  if (!currentNode || !markdownEditorRef.current) {
    return false;
  }

  // 检查当前节点是否为表格类型
  if (isTableNode(currentNode[0]?.type)) {
    return true;
  }

  // 检查父节点是否为表格类型
  try {
    const parentNode = Node.parent(markdownEditorRef.current, currentNode[1]);
    return isTableNode(parentNode?.type);
  } catch (error) {
    // 如果获取父节点失败，假设不在表格内
    return false;
  }
};

/**
 * 基础工具栏
 */
export const BaseToolBar = React.memo<{
  prefix?: string;
  showInsertAction?: boolean;
  extra?: React.ReactNode[];
  min?: boolean;
  readonly?: boolean;
  hashId?: string;
  hideTools?: ToolsKeyType[];
  showEditor?: boolean;
}>((props) => {
  const baseClassName = props.prefix || `toolbar-action`;
  const { hashId } = props;

  const {
    markdownEditorRef,
    keyTask$,
    editorProps,
    openInsertLink$,
    domRect,
    store,
    setDomRect,

    refreshFloatBar,
  } = useEditorStore();

  const i18n = useContext(I18nContext);
  const toolsConfig = useToolsConfig();

  const toolBarLogic = useToolBarLogic({
    markdownEditorRef,
    keyTask$,
    store,
    openInsertLink$,
    setDomRect,
    refreshFloatBar,
    domRect,
  });

  const {
    currentNode,
    highColor,
    isCodeNode,
    isFormatActive,
    isHighColorActive,
    isLinkActive,
    handleUndo,
    handleRedo,
    handleClearFormat,
    handleFormat,
    handleHeadingChange,
    handleColorChange,
    handleToggleHighColor,
    handleToolClick,
    handleInsertLink,
    handleInsert,
  } = toolBarLogic;

  // 插入选项
  const insertOptions = useMemo(() => {
    const filterOption = (option: any): boolean => {
      // 过滤上传图片功能
      if (!editorProps?.image && option.task === 'uploadImage') {
        return false;
      }
      // 根据 showInsertAction 决定显示哪些选项
      return props.showInsertAction || option.task === 'list';
    };

    return getInsertOptions({ isTop: false }, i18n.locale)
      .map((o) => o?.children)
      .flat()
      .filter(filterOption);
  }, [editorProps?.image, props.showInsertAction, i18n.locale]);

  // 插入选项元素
  const insertOptionElements = useMemo(
    () =>
      insertOptions.map((option) => (
        <ToolBarItem
          key={option.key}
          title={option.label.join(' ')}
          icon={option.icon}
          onClick={() => handleInsert(option)}
          className={classnames(`${baseClassName}-item`, hashId)}
        />
      )),
    [insertOptions, handleInsert, baseClassName, hashId],
  );

  // 显示条件
  const showConditions = useMemo(() => {
    // 检查是否在表格内
    const isInTable = isNodeInTable(currentNode, markdownEditorRef);

    return {
      linkButton:
        currentNode &&
        LINK_ALLOWED_NODE_TYPES.includes(currentNode?.[0]?.type as any) &&
        !isInTable,
      headingDropdown:
        currentNode &&
        HEADING_ALLOWED_NODE_TYPES.includes(currentNode?.[0]?.type as any) &&
        !isInTable,
      isInTable,
    };
  }, [currentNode]);

  // 通用属性
  const commonProps = {
    baseClassName,
    hashId,
    i18n,
  };

  // 工具栏元素生成器
  const createToolbarElement = (
    key: string,
    Component: React.ComponentType<any>,
    props: any,
  ) => <Component key={key} {...commonProps} {...props} />;

  // 渲染常规工具栏
  const renderFullToolbar = useMemo(() => {
    const elements: React.ReactNode[] = [];

    // 如果在表格内，只显示基本格式化工具
    if (showConditions.isInTable) {
      // 清除格式按钮
      elements.push(
        createToolbarElement('clear', ClearFormatButton, {
          onClear: handleClearFormat,
        }),
      );

      // 格式化按钮
      elements.push(
        createToolbarElement('format', FormatButton, {
          onFormat: handleFormat,
        }),
      );

      // 颜色选择器
      elements.push(
        createToolbarElement('color', ColorPickerButton, {
          highColor,
          isHighColorActive,
          onColorChange: handleColorChange,
          onToggleHighColor: handleToggleHighColor,
        }),
      );

      // 格式化工具（只显示加粗、斜体等基本格式）
      elements.push(
        createToolbarElement('formatting', FormattingTools, {
          tools: toolsConfig,
          editor: markdownEditorRef.current,
          isCodeNode: isCodeNode(),
          onToolClick: handleToolClick,
          isFormatActive,
          isInTable: true, // 传递表格内标志
          hideTools: props.hideTools,
        }),
      );

      return elements;
    }

    // 非表格内的完整工具栏
    // 撤销重做按钮
    if (props.showEditor) {
      elements.push(
        createToolbarElement('undo-redo', UndoRedoButtons, {
          onUndo: handleUndo,
          onRedo: handleRedo,
        }),
      );
    }

    // 清除格式按钮
    elements.push(
      createToolbarElement('clear', ClearFormatButton, {
        onClear: handleClearFormat,
      }),
    );

    // 格式化按钮
    elements.push(
      createToolbarElement('format', FormatButton, {
        onFormat: handleFormat,
      }),
    );

    // 标题下拉框
    if (showConditions.headingDropdown) {
      elements.push(
        createToolbarElement('heading', HeadingDropdown, {
          node: currentNode,
          hideTools: props.hideTools,
          onHeadingChange: handleHeadingChange,
        }),
      );
    }

    // 颜色选择器
    elements.push(
      createToolbarElement('color', ColorPickerButton, {
        highColor,
        isHighColorActive,
        onColorChange: handleColorChange,
        onToggleHighColor: handleToggleHighColor,
      }),
    );

    // 插入选项
    elements.push(...insertOptionElements);

    // 格式化工具
    elements.push(
      createToolbarElement('formatting', FormattingTools, {
        tools: toolsConfig,
        editor: markdownEditorRef.current,
        isCodeNode: isCodeNode(),
        onToolClick: handleToolClick,
        isFormatActive,
        hideTools: props.hideTools,
      }),
    );

    // 链接按钮
    if (showConditions.linkButton) {
      elements.push(
        createToolbarElement('link', LinkButton, {
          onInsertLink: handleInsertLink,
          isLinkActive,
        }),
      );
    }

    // 过滤隐藏的工具
    return props.hideTools
      ? elements.filter((element) => {
          if (React.isValidElement(element) && element.key) {
            return !props.hideTools?.includes(element.key as ToolsKeyType);
          }
          return true;
        })
      : elements;
  }, [
    props.showEditor,
    props.hideTools,
    showConditions,
    currentNode,
    highColor,
    isHighColorActive,
    insertOptionElements,
    markdownEditorRef,
    isCodeNode,
    isFormatActive,
    isLinkActive,
    handleUndo,
    handleRedo,
    handleClearFormat,
    handleFormat,
    handleHeadingChange,
    handleColorChange,
    handleToggleHighColor,
    handleToolClick,
    handleInsertLink,
  ]);

  // 渲染精简工具栏
  const renderMinToolbar = useMemo(() => {
    if (!props.min) return null;

    // 如果在表格内，精简工具栏也要相应调整
    if (showConditions.isInTable) {
      return (
        <>
          {createToolbarElement('clear', ClearFormatButton, {
            onClear: handleClearFormat,
          })}

          {createToolbarElement('color', ColorPickerButton, {
            highColor,
            isHighColorActive,
            onColorChange: handleColorChange,
            onToggleHighColor: handleToggleHighColor,
          })}

          {createToolbarElement('formatting', FormattingTools, {
            tools: toolsConfig,
            editor: markdownEditorRef.current,
            isCodeNode: isCodeNode(),
            onToolClick: handleToolClick,
            isFormatActive,
            isInTable: true,
            hideTools: props.hideTools,
          })}
        </>
      );
    }

    const dropdownItems = insertOptions.map((option) => ({
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {option.icon}
          {option.label?.at(0)}
        </div>
      ),
      key: `min-${option.key}`,
      onClick: () => handleInsert(option),
    }));

    return (
      <>
        <ToolBarItem
          title="更多操作"
          icon={<Plus />}
          className={classnames(
            `${baseClassName}-item`,
            `${baseClassName}-item-min-plus-icon`,
            hashId,
          )}
          tabIndex={-1}
        >
          <Dropdown menu={{ items: dropdownItems }}>
            <Plus role="img" aria-label="Plus" />
          </Dropdown>
        </ToolBarItem>

        <Divider
          type="vertical"
          style={{
            margin: '0 4px',
            height: '18px',
            borderColor: 'rgba(0,0,0,0.15)',
          }}
        />

        {/* 精简版的主要工具 */}
        {createToolbarElement('undo-redo', UndoRedoButtons, {
          onUndo: handleUndo,
          onRedo: handleRedo,
        })}

        {createToolbarElement('clear', ClearFormatButton, {
          onClear: handleClearFormat,
        })}

        {createToolbarElement('heading', HeadingDropdown, {
          node: currentNode,
          hideTools: props.hideTools,
          onHeadingChange: handleHeadingChange,
        })}

        {createToolbarElement('color', ColorPickerButton, {
          highColor,
          isHighColorActive,
          onColorChange: handleColorChange,
          onToggleHighColor: handleToggleHighColor,
        })}

        {createToolbarElement('formatting', FormattingTools, {
          tools: toolsConfig,
          editor: markdownEditorRef.current,
          isCodeNode: isCodeNode(),
          onToolClick: handleToolClick,
          isFormatActive,
          hideTools: props.hideTools,
        })}
      </>
    );
  }, [
    props.min,
    insertOptions,
    handleInsert,
    baseClassName,
    hashId,
    currentNode,
    props.hideTools,
    highColor,
    isHighColorActive,
    markdownEditorRef,
    isCodeNode,
    isFormatActive,
    handleUndo,
    handleRedo,
    handleClearFormat,
    handleHeadingChange,
    handleColorChange,
    handleToggleHighColor,
    handleToolClick,
  ]);

  // 渲染额外内容
  const renderExtra = useMemo(() => {
    if (!props.extra) return null;

    const extraStyle = {
      flex: 1,
      display: 'flex' as const,
      justifyContent: 'flex-end' as const,
      alignItems: 'center' as const,
      height: '100%',
    };

    return (
      <div style={extraStyle}>
        {props.extra.map((item, index) => {
          const key = `extra-${index}`;

          if (React.isValidElement(item)) {
            return item.type === 'span' ? (
              <div
                className={classnames(`${baseClassName}-item`, hashId)}
                key={`${key}-span`}
              >
                {item}
              </div>
            ) : (
              React.cloneElement(item, { key })
            );
          }

          return (
            <div
              className={classnames(`${baseClassName}-item`, hashId)}
              key={`${key}-div`}
            >
              {item}
            </div>
          );
        })}
      </div>
    );
  }, [props.extra, baseClassName, hashId]);

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        gap: '1px',
        alignItems: 'center',
      }}
    >
      {props.min ? renderMinToolbar : renderFullToolbar}
      {renderExtra}
    </div>
  );
});

BaseToolBar.displayName = 'BaseToolBar';
