/**
 * 处理内联代码节点
 * @param currentElement - 当前处理的内联代码元素
 * @returns 返回格式化的内联代码节点对象，支持占位符和初始值
 */
export const handleInlineCode = (currentElement: any) => {
  const hasPlaceHolder = currentElement.value?.match(/\$\{(.*?)\}/);
  let values: any = undefined;

  if (hasPlaceHolder) {
    // 使用逗号分割多个键值对，例如：placeholder:目标场景,initialValue:已选择
    const content = hasPlaceHolder[1];
    values = {};

    // 匹配 key:value 格式，支持逗号分隔
    const keyValuePattern = /(\w+):([^,]+)/g;
    let match;
    while ((match = keyValuePattern.exec(content)) !== null) {
      const key = match[1];
      const value = match[2];
      if (key && value !== undefined && value !== null) {
        values[key] = value;
      }
    }
  }

  const isTag = currentElement.value?.startsWith('${');
  const result: any = {
    code: true,
    tag: isTag ? true : false,
  };

  // 优先使用 initialValue，其次使用 placeholder，最后使用原始值
  if (values?.initialValue) {
    result.text = values.initialValue || ' ';
  }
  if (!result.text && values?.placeholder) {
    // 当有 placeholder 时，text 设置为空格，避免空字符串导致 tag 被移除
    result.text = ' ';
  }
  if (!result.text) {
    // 只有当不是 ${ 开头的占位符时，才使用原始值
    if (!isTag) {
      result.text = currentElement.value;
    } else {
      // 如果是 ${ 开头但没有匹配到值，使用空格避免空字符串
      result.text = ' ';
    }
  }

  // 设置 placeholder 和 initialValue
  // 如果是 tag 且值存在，设置实际值；否则设置为 undefined（符合测试期望）
  if (isTag) {
    result.placeholder = values?.placeholder;
    result.initialValue = values?.initialValue;
  } else {
    result.placeholder = undefined;
    result.initialValue = undefined;
  }

  return result;
};

/**
 * 处理分割线节点
 * @returns 返回格式化的分割线节点对象
 */
export const handleThematicBreak = () => {
  return { type: 'hr', children: [{ text: '' }] };
};

/**
 * 处理定义节点
 * @param currentElement - 当前处理的定义元素，包含标签和URL
 * @returns 返回格式化的定义段落节点对象
 */
export const handleDefinition = (currentElement: any) => {
  return {
    type: 'paragraph',
    children: [
      {
        text:
          `[${currentElement.label}]: ` +
          (currentElement.url ? `${currentElement.url}` : ''),
      },
    ],
  };
};
