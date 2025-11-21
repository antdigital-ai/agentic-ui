---
nav:
  title: 插件
  order: 2
group:
  title: 通用
  order: 3
---

# 插件

## 概述

Markdown 编辑器插件系统提供了灵活的方式来扩展编辑器的功能。它允许你自定义节点渲染、实现 Markdown 双向转换，以及扩展编辑器行为。

## 插件接口

插件是一个实现了 `MarkdownEditorPlugin` 接口的对象，包含以下可选属性：

### 自定义节点渲染

```typescript | pure
elements?: Record<string, React.ComponentType<ElementProps<any>>>
```

此属性允许你为特定节点类型定义自定义的 React 组件。通过这个属性，你可以自定义 Markdown 元素在编辑器中的渲染方式。

示例：

```typescript | pure
const customBlockquotePlugin: MarkdownEditorPlugin = {
  elements: {
    blockquote: ({ attributes, children }) => (
      <blockquote {...attributes} className="custom-quote">
        {children}
      </blockquote>
    )
  }
}
```

### Markdown 转换

#### Markdown 解析 (`parseMarkdown`)

将 Markdown AST 节点转换为 Slate 元素。这个功能允许你自定义如何将 Markdown 语法解析为编辑器中的元素。

```typescript | pure
parseMarkdown?: {
  match: (node: Node) => boolean;  // 匹配 Markdown 语法
  convert: (node: Node) => Elements | NodeEntry<Text>;  // 转换为 Slate 元素
}[]
```

示例：

```typescript | pure
const customCodeBlockPlugin: MarkdownEditorPlugin = {
  parseMarkdown: [
    {
      match: (node) => node.type === 'code' && (node as any).lang === 'alert',
      convert: (node) => {
        const codeNode = node as any;
        return {
          type: 'code',
          language: 'text',
          value: `🚨 警告: ${codeNode.value}`,
          children: [{ text: `🚨 警告: ${codeNode.value}` }],
        };
      },
    },
  ],
};
```

#### 转换为 Markdown (`toMarkdown`)

将 Slate 元素转换回 Markdown AST 节点。这个功能用于将编辑器内容导出为 Markdown 格式。

```typescript | pure
toMarkdown?: {
  match: (node: Elements) => boolean;  // 匹配 Slate 元素类型
  convert: (node: Elements) => Node;  // 转换为 Markdown AST 节点
}[]
```

示例：

```typescript | pure
const customCodeBlockPlugin: MarkdownEditorPlugin = {
  toMarkdown: [
    {
      match: (node) => node.type === 'code-block',
      convert: (node) => ({
        type: 'code',
        lang: node.language,
        value: node.children[0].text,
      }),
    },
  ],
};
```

#### 如何使用 toMarkdown 插件

要使用 `toMarkdown` 插件导出自定义格式的 Markdown，你需要通过编辑器实例调用 `getMDContent` 方法并传递插件：

```typescript | pure
const editorRef = useRef<MarkdownEditorInstance>();

const handleExportMarkdown = () => {
  if (editorRef.current) {
    // 传递插件参数以启用自定义转换
    const content = editorRef.current.store.getMDContent([customCodeBlockPlugin]);
    console.log('导出的 Markdown:', content);
  }
};

// 在组件中使用
<MarkdownEditor
  editorRef={editorRef}
  plugins={[customCodeBlockPlugin]}
  initValue={markdown}
/>
```

### 编辑器扩展

#### 扩展编辑器 (`withEditor`)

自定义编辑器实例行为。通过这个功能，你可以修改或扩展编辑器的核心行为。

```typescript | pure
withEditor?: (editor: Editor) => Editor
```

示例：

```typescript | pure
const customVoidNodePlugin: MarkdownEditorPlugin = {
  withEditor: (editor) => {
    const { isVoid } = editor;
    editor.isVoid = (element) => {
      return element.type === 'custom-void' ? true : isVoid(element);
    };
    return editor;
  },
};
```

#### 快捷键

定义自定义键盘快捷键，用于触发特定的编辑器操作。

```typescript | pure
hotkeys?: Record<string, (editor: Editor) => void>
```

示例：

```typescript | pure
const customHotkeyPlugin: MarkdownEditorPlugin = {
  hotkeys: {
    'mod+shift+c': (editor) => {
      // 处理自定义快捷键
      // mod 在 Windows 上是 Ctrl，在 Mac 上是 Command
    },
  },
};
```

#### 自定义粘贴处理 (`onPaste`)

使用自定义逻辑处理粘贴事件，可以用于实现特殊的粘贴行为。

```typescript | pure
onPaste?: (text: string) => boolean
```

示例：

```typescript | pure
const customPastePlugin: MarkdownEditorPlugin = {
  onPaste: (text) => {
    if (text.startsWith('custom:')) {
      // 处理自定义粘贴格式
      return true; // 阻止默认粘贴行为
    }
    return false; // 使用默认粘贴行为
  },
};
```

## 使用方法

插件通过 React Context 传递给编辑器。你可以组合多个插件来实现不同的功能：

```typescript | pure
import { MarkdownEditor } from './plugin';

function MarkdownEditorWithPlugins({ children }) {
  const plugins = [
    customBlockquotePlugin,
    customCodeBlockPlugin,
    customVoidNodePlugin,
    customHotkeyPlugin,
    customPastePlugin
  ];

  return (
    <MarkdownEditor plugins={plugins} />
  );
}
```

## 完整示例

### 简单的 toMarkdown 插件示例

以下是一个完整的插件示例，展示了如何创建自定义的笔记代码块：

```typescript | pure
import React, { useRef } from 'react';
import { MarkdownEditor } from '@ant-design/agentic-ui';
import { MarkdownEditorInstance } from '@ant-design/agentic-ui';
import { MarkdownEditorPlugin } from '@ant-design/agentic-ui';

// 简单的自定义代码块插件
const customCodePlugin: MarkdownEditorPlugin = {
  parseMarkdown: [{
    match: (node: any) => node.type === 'code' && node.lang === 'note',
    convert: (node: any) => ({
      type: 'note-code',
      language: 'text',
      value: node.value,
      children: [{ text: node.value }],
    } as any)
  }],
  toMarkdown: [{
    match: (node: any) => node.type === 'note-code',
    convert: (node: any) => ({
      type: 'code',
      lang: 'note',
      value: node.value || '',
    })
  }],
  elements: {
    'note-code': ({ attributes, children, element }) => (
      <div {...attributes} style={{
        border: '1px solid #1890ff',
        borderRadius: '4px',
        padding: '12px',
        backgroundColor: '#f0f8ff',
        margin: '8px 0'
      }}>
        <div style={{
          color: '#1890ff',
          fontWeight: 'bold',
          marginBottom: '4px',
          fontSize: '12px'
        }}>
          📝 笔记
        </div>
        <pre style={{
          margin: 0,
          fontFamily: 'monospace',
          color: '#333',
          whiteSpace: 'pre-wrap'
        }}>
          {(element as any).value}
        </pre>
        {children}
      </div>
    )
  }
};

export default function SimpleToMarkdownExample() {
  const editorRef = useRef<MarkdownEditorInstance>();

  const handleExportMarkdown = () => {
    if (editorRef.current) {
      // 获取编辑器内容并传递插件参数
      const content = editorRef.current.store.getMDContent([customCodePlugin]);
      console.log('导出的 Markdown:', content);

      // 显示在页面上
      const pre = document.getElementById('markdown-output');
      if (pre) {
        pre.textContent = content;
      }
    }
  };

  const markdown = `# toMarkdown 插件示例

这是一个简单的 toMarkdown 插件示例。

## 普通代码块

\`\`\`javascript
console.log("这是普通的 JavaScript 代码");
\`\`\`

## 自定义笔记代码块

下面的代码块会被插件特殊处理：

\`\`\`note
这是一个重要的笔记！
记住要定期保存你的工作。
使用 Ctrl+S 或 Cmd+S 保存文件。
\`\`\`

## 说明

- 使用 \`note\` 语言标识的代码块会被转换为笔记框
- 普通的代码块不会被插件影响
- 导出 Markdown 时，自定义元素会被正确转换回原始格式
`;

  return (
    <div style={{ padding: '12px' }}>
      <h1>简单的 toMarkdown 插件示例</h1>

      <div style={{ marginBottom: '20px' }}>
         <button
          type="button"onClick={handleExportMarkdown}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          导出 Markdown
        </button>
      </div>

      <div style={{ border: '1px solid #d9d9d9', borderRadius: '6px' }}>
        <MarkdownEditor
          editorRef={editorRef}
          initValue={markdown}
          plugins={[customCodePlugin]}
        />
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>导出的 Markdown:</h3>
        <pre
          id="markdown-output"
          style={{
            backgroundColor: '#f5f5f5',
            padding: '16px',
            borderRadius: '4px',
            overflow: 'auto',
            maxHeight: '300px',
            minHeight: '100px',
            border: '1px solid #d9d9d9'
          }}
        >
          点击上面的"导出 Markdown"按钮查看结果
        </pre>
      </div>
    </div>
  );
}
```

### 复杂插件示例

以下是一个更复杂的插件示例，包含多种自定义元素：

```typescript | pure
import React, { useState } from 'react';
import { MarkdownEditor } from '@ant-design/agentic-ui';
import { MarkdownEditorPlugin } from '@ant-design/agentic-ui';

// 自定义代码块插件 - 将特殊的代码块转换为警告格式
const customCodeBlockPlugin: MarkdownEditorPlugin = {
  parseMarkdown: [{
    match: (node: any) => node.type === 'code' && node.lang === 'warning',
    convert: (node: any) => ({
      type: 'warning-code',
      language: 'text',
      value: node.value,
      children: [{ text: node.value }],
    } as any)
  }],
  toMarkdown: [{
    match: (node: any) => node.type === 'warning-code',
    convert: (node: any) => ({
      type: 'code',
      lang: 'warning',
      value: node.value || '',
    })
  }],
  elements: {
    'warning-code': ({ attributes, children, element }) => (
      <div {...attributes} style={{
        border: '2px solid #ff6b6b',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#fff5f5',
        margin: '16px 0'
      }}>
        <div style={{
          color: '#ff6b6b',
          fontWeight: 'bold',
          marginBottom: '8px',
          fontSize: '13px'
        }}>
          ⚠️ 警告
        </div>
        <pre style={{
          margin: 0,
          fontFamily: 'monospace',
          color: '#333',
          whiteSpace: 'pre-wrap'
        }}>
          {(element as any).value}
        </pre>
        {children}
      </div>
    )
  }
};

// 自定义引用块插件 - 将特殊的引用块转换为提示格式
const customBlockquotePlugin: MarkdownEditorPlugin = {
  parseMarkdown: [{
    match: (node: any) => {
      // 检查是否是包含 "💡 提示:" 的引用块
      if (node.type === 'blockquote' &&
          node.children?.[0]?.children?.[0]?.value?.startsWith('💡 提示:')) {
        return true;
      }
      return false;
    },
    convert: (node: any) => ({
      type: 'tip-blockquote',
      children: node.children || [],
    } as any)
  }],
  toMarkdown: [{
    match: (node: any) => node.type === 'tip-blockquote',
    convert: (node: any) => ({
      type: 'blockquote',
      children: node.children || [],
    })
  }],
  elements: {
    'tip-blockquote': ({ attributes, children }) => (
      <div {...attributes} style={{
        border: '2px solid #4dabf7',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#f0f8ff',
        margin: '16px 0',
        borderLeft: '4px solid #4dabf7'
      }}>
        {children}
      </div>
    )
  }
};

export default function ComplexPluginDemo() {
  const [markdown, setMarkdown] = useState('');

  const initialValue = `# 复杂插件演示

这个演示展示了如何使用多个插件来自定义 Markdown 输出格式。

## 警告代码块

下面是一个警告代码块，它会被特殊处理：

\`\`\`warning
这是一个重要的警告信息！
请仔细阅读并遵循相关指导。
系统可能会因为不当操作而出现问题。
\`\`\`

## 提示引用块

> 💡 提示: 这是一个特殊的提示引用块
> 它会被渲染为蓝色的提示框
> 用于提供有用的建议和信息

## 普通内容

这些是普通的内容，不会被插件特殊处理：

\`\`\`javascript
console.log("这是普通的 JavaScript 代码");
\`\`\`

> 这是普通的引用块
> 不会被特殊处理

## 说明

- 使用 \`warning\` 语言标识的代码块会被转换为警告框
- 以 "💡 提示:" 开头的引用块会被转换为提示框
- 其他内容保持原样
- 导出 Markdown 时，自定义元素会被正确转换回原始格式
`;

  return (
    <div style={{ padding: '12px' }}>
      <h1>复杂插件演示</h1>

      <div style={{ border: '1px solid #d9d9d9', borderRadius: '6px' }}>
        <MarkdownEditor
          initValue={initialValue}
          plugins={[customCodeBlockPlugin, customBlockquotePlugin]}
          onChange={(value) => {
            setMarkdown(value);
            console.log('编辑器内容变化:', value);
          }}
        />
      </div>

      {markdown && (
        <div style={{ marginTop: '20px' }}>
          <h3>实时 Markdown 输出:</h3>
          <pre style={{
            backgroundColor: '#f5f5f5',
            padding: '16px',
            borderRadius: '4px',
            overflow: 'auto',
            maxHeight: '300px'
          }}>
            {markdown}
          </pre>
        </div>
      )}
    </div>
  );
}
```

### 复杂例子

<code src="../demos/useCreateComponentPlugin.tsx" background="var(--main-bg-color)" iframe=540></code>

## 最佳实践

1. **模块化设计**：每个插件应该专注于一个特定的功能，这样可以更好地组织和维护代码。

2. **插件优先级**：当多个插件处理相同类型的节点时，插件列表中靠后的插件优先级更高。

3. **性能考虑**：在实现转换函数时，应该注意性能优化，特别是在处理大文档时。

4. **错误处理**：插件应该优雅地处理异常情况，不应该因为单个插件的错误而影响整个编辑器的功能。

5. **类型安全**：建议使用 TypeScript 来开发插件，这样可以获得更好的类型提示和错误检查。

6. **测试驱动**：为插件编写单元测试，确保 `parseMarkdown` 和 `toMarkdown` 功能的正确性。

7. **文档完善**：为自定义插件编写清晰的文档，说明插件的功能、使用方法和注意事项。
