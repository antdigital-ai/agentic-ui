---
nav:
  order: 1
atomId: MarkdownEditor
group:
  title: 意图输入
  order: 3
---

# MarkdownEditor API 文档

MarkdownEditor 是一个功能强大的 Markdown 编辑器组件，基于 React + TypeScript 构建，提供丰富的编辑功能、实时预览、插件系统等特性。

## 🌟 功能特点

### 核心功能

- ✍️ **富文本编辑**: 支持完整的 Markdown 语法，包括标题、列表、表格、代码块等
- 🎯 **实时预览**: 所见即所得的编辑体验，支持双栏或单栏模式
- 🎨 **语法高亮**: 基于 Prism.js 的多语言代码高亮显示
- 📊 **数学公式**: 基于 KaTeX 的数学公式渲染支持

### 扩展功能

- 💬 **评论系统**: 内置评论功能，支持@提及用户
- 🖼️ **图片处理**: 支持图片上传、拖拽插入、自定义渲染
- 📑 **目录生成**: 自动生成文档目录(TOC)，支持锚点跳转
- ⌨️ **打字机模式**: 专注写作的打字机效果

### 高级特性

- 🧰 **工具栏定制**: 可自定义工具栏和浮动工具栏
- 🔌 **插件系统**: 支持自定义插件扩展功能
- 🎨 **元素渲染**: 支持自定义元素和叶子节点渲染
- 📱 **响应式设计**: 完美适配桌面端和移动端

## 🚀 快速开始

### 基础使用

```tsx
import React from 'react';
import { MarkdownEditor } from '@ant-design/agentic-ui';

export default () => {
  return (
    <MarkdownEditor
      initValue={`# 高级配置示例 
4 Do not wear yourself out to get rich;  
Stop and show understanding.
5 You will fix your eyes on wealth, and it is no more,  
For it will surely sprout wings and fly off to the sky like an eagle
 \n * 数据表1 \n * 数据表二 8. 绘制表格

| 作品名称        | 在线地址   |  上线日期  |
| :--------  | :-----  | :----:  |
| 逍遥自在轩 | [https://niceshare.site](https://niceshare.site/?ref=markdown.lovejade.cn) |2024-04-26|
| 玉桃文飨轩 | [https://share.lovejade.cn](https://share.lovejade.cn/?ref=markdown.lovejade.cn) |2022-08-26|
| 缘知随心庭 | [https://fine.niceshare.site](https://fine.niceshare.site/?ref=markdown.lovejade.cn) |2022-02-26|
| 静轩之别苑 | [http://quickapp.lovejade.cn](http://quickapp.lovejade.cn/?ref=markdown.lovejade.cn) |2019-01-12|
| 晚晴幽草轩 | [https://www.jeffjade.com](https://www.jeffjade.com/?ref=markdown.lovejade.cn) |2014-09-20|

---`}
      height="400px"
      onChange={(value, schema) => {
        console.log('内容变化:', value);
      }}
    />
  );
};
```

### 高级配置

```tsx
import React, { useRef } from 'react';
import { MarkdownEditor, MarkdownEditorInstance } from '@ant-design/agentic-ui';

export default () => {
  const editorRef = useRef<MarkdownEditorInstance>();

  return (
    <MarkdownEditor
      editorRef={editorRef}
      initValue={`# 高级配置示例

<p align="right">**4 Do not wear yourself out to get rich;**</p>

Stop and show understanding.  
**5 You will fix your eyes on wealth, and it is no more,**  
For it will surely sprout wings and fly off to the sky like an eagle

- 数据表1
- 数据表二 8. 绘制表格

<think>这是一个思考块，表示正在分析需求或处理复杂逻辑。</think>

| 作品名称   | 在线地址                                                                             |  上线日期  |
| :--------- | :----------------------------------------------------------------------------------- | :--------: |
| 逍遥自在轩 | [https://niceshare.site](https://niceshare.site/?ref=markdown.lovejade.cn)           | 2024-04-26 |
| 玉桃文飨轩 | [https://share.lovejade.cn](https://share.lovejade.cn/?ref=markdown.lovejade.cn)     | 2022-08-26 |
| 缘知随心庭 | [https://fine.niceshare.site](https://fine.niceshare.site/?ref=markdown.lovejade.cn) | 2022-02-26 |
| 静轩之别苑 | [http://quickapp.lovejade.cn](http://quickapp.lovejade.cn/?ref=markdown.lovejade.cn) | 2019-01-12 |
| 晚晴幽草轩 | [https://www.jeffjade.com](https://www.jeffjade.com/?ref=markdown.lovejade.cn)       | 2014-09-20 |

***`}
      height="600px"
      toolBar={{
        enable: true,
        extra: [
          <button
            type="button"
            key="save"
            onClick={() => console.log(editorRef.current?.getValue())}
          >
            保存
          </button>,
        ],
      }}
      image={{
        upload: async (files) => {
          // 自定义图片上传逻辑
          return ['https://example.com/image.png'];
        },
      }}
      comment={{
        enable: true,
        onSubmit: (id, comment) => console.log('新评论:', comment),
      }}
      onChange={(value, schema) => console.log('内容变化:', value)}
    />
  );
};
```

## 📋 完整 API 文档

### 基础属性

| 属性            | 类型                  | 默认值   | 描述                   |
| --------------- | --------------------- | -------- | ---------------------- |
| **布局配置**    |
| className       | `string`              | -        | 自定义 CSS 类名        |
| width           | `string \| number`    | `'100%'` | 编辑器宽度             |
| height          | `string \| number`    | `'auto'` | 编辑器高度             |
| style           | `React.CSSProperties` | -        | 容器自定义样式         |
| contentStyle    | `React.CSSProperties` | -        | 内容区域自定义样式     |
| editorStyle     | `React.CSSProperties` | -        | 编辑器区域自定义样式   |
| **内容配置**    |
| initValue       | `string`              | -        | 初始 Markdown 文本内容 |
| initSchemaValue | `Elements[]`          | -        | 初始 Schema 数据结构   |
| readonly        | `boolean`             | `false`  | 是否为只读模式         |
| **功能开关**    |
| toc             | `boolean`             | `true`   | 是否显示目录           |
| reportMode      | `boolean`             | `false`  | 是否开启报告模式       |
| slideMode       | `boolean`             | `false`  | 是否开启 PPT 模式      |
| typewriter      | `boolean`             | `false`  | 是否开启打字机模式     |
| compact         | `boolean`             | `false`  | 是否启用紧凑模式       |
| id              | `string`              | -        | 编辑器唯一标识         |

### 浮动工具栏配置 (floatBar)

| 属性   | 类型      | 默认值 | 描述               |
| ------ | --------- | ------ | ------------------ |
| enable | `boolean` | -      | 是否启用浮动工具栏 |

### 文本区域配置 (textAreaProps)

| 属性        | 类型      | 默认值 | 描述             |
| ----------- | --------- | ------ | ---------------- |
| enable      | `boolean` | -      | 是否启用文本区域 |
| placeholder | `string`  | -      | 占位符文本       |

### 拖拽配置 (drag)

| 属性   | 类型      | 默认值 | 描述             |
| ------ | --------- | ------ | ---------------- |
| enable | `boolean` | -      | 是否启用拖拽功能 |

### Markdown 输入配置 (markdown)

| 属性             | 类型      | 默认值  | 描述                                                                           |
| ---------------- | --------- | ------- | ------------------------------------------------------------------------------ |
| matchLeaf        | `boolean` | -       | 是否启用叶子节点匹配                                                           |
| matchInputToNode | `boolean` | `false` | 是否启用输入到节点匹配（如输入 `- ` 转为列表），默认关闭，需显式传 `true` 开启 |

### 工具栏配置 (toolBar)

| 属性      | 类型                | 默认值  | 描述                   |
| --------- | ------------------- | ------- | ---------------------- |
| enable    | `boolean`           | `true`  | 是否启用工具栏         |
| min       | `boolean`           | `false` | 是否使用最小化工具栏   |
| extra     | `React.ReactNode[]` | -       | 额外的自定义工具栏项目 |
| hideTools | `ToolsKeyType[]`    | -       | 需要隐藏的工具栏选项   |

**ToolsKeyType 可选值:**
`'bold'` | `'italic'` | `'strikethrough'` | `'code'` | `'heading'` | `'quote'` | `'unordered-list'` | `'ordered-list'` | `'link'` | `'image'` | `'table'` | `'code-block'` | `'divider'` | `'formula'` | `'undo'` | `'redo'`

### 图片配置 (image)

| 属性   | 类型                                                                  | 描述                       |
| ------ | --------------------------------------------------------------------- | -------------------------- |
| upload | `(files: File[] \| string[]) => Promise<string[] \| string>`          | 图片上传函数，返回图片 URL |
| render | `(props: ImageProps, defaultDom: React.ReactNode) => React.ReactNode` | 自定义图片渲染函数         |

### 评论配置 (comment)

| 属性                | 类型                                                              | 描述              |
| ------------------- | ----------------------------------------------------------------- | ----------------- |
| enable              | `boolean`                                                         | 是否启用评论功能  |
| onSubmit            | `(id: string, comment: CommentDataType) => void`                  | 评论提交回调      |
| commentList         | `CommentDataType[]`                                               | 评论列表数据      |
| deleteConfirmText   | `string`                                                          | 删除评论确认文本  |
| loadMentions        | `(keyword: string) => Promise<{name: string; avatar?: string}[]>` | 加载@提及用户列表 |
| mentionsPlaceholder | `string`                                                          | @提及输入框占位符 |
| onDelete            | `(id: string \| number, item: CommentDataType) => void`           | 删除评论回调      |
| onEdit              | `(id: string \| number, item: CommentDataType) => void`           | 编辑评论回调      |
| onClick             | `(id: string \| number, item: CommentDataType) => void`           | 点击评论回调      |

### 代码配置 (codeProps)

| 属性                    | 类型       | 默认值     | 描述                                                                |
| ----------------------- | ---------- | ---------- | ------------------------------------------------------------------- |
| Languages               | `string[]` | -          | 支持的编程语言列表                                                  |
| hideToolBar             | `boolean`  | `false`    | 是否隐藏代码块工具栏                                                |
| alwaysExpandedDeepThink | `boolean`  | `false`    | 是否始终展开深度思考块                                              |
| theme                   | `string`   | `'chrome'` | 代码编辑器主题，支持所有 Ace Editor 主题                            |
| fontSize                | `number`   | `12`       | 代码字体大小                                                        |
| tabSize                 | `number`   | `4`        | Tab 缩进大小                                                        |
| showLineNumbers         | `boolean`  | `true`     | 是否显示行号                                                        |
| showGutter              | `boolean`  | `true`     | 是否显示代码栏                                                      |
| wrap                    | `boolean`  | `true`     | 是否自动换行                                                        |
| ...                     | -          | -          | 支持所有 [Ace.EditorOptions](https://ace.c9.io/#nav=api&api=editor) |

**常用 Ace Editor 主题:**

- `chrome` (默认浅色主题)
- `monokai` (深色主题)
- `github` (GitHub 风格)
- `twilight` (暮光主题)
- `dracula` (德古拉主题)
- `tomorrow_night` (Tomorrow Night 主题)
- `solarized_dark` / `solarized_light` (Solarized 主题)
- `nord_dark` (Nord 主题)
- 更多主题请参考 [Ace Editor Themes](https://ace.c9.io/build/kitchen-sink.html)

### 表格配置 (tableConfig)

| 属性         | 类型           | 描述                |
| ------------ | -------------- | ------------------- |
| minRows      | `number`       | 最小行数            |
| minColumn    | `number`       | 最小列数            |
| excelMode    | `boolean`      | 是否启用 Excel 模式 |
| previewTitle | `ReactNode`    | 预览模式标题        |
| actions      | `TableActions` | 表格操作配置        |

### 高级配置

| 属性                    | 类型                                                                          | 描述               |
| ----------------------- | ----------------------------------------------------------------------------- | ------------------ |
| **引用和回调**          |
| editorRef               | `React.Ref<MarkdownEditorInstance>`                                           | 编辑器实例引用     |
| rootContainer           | `React.MutableRefObject<HTMLDivElement>`                                      | 根容器引用         |
| containerClassName      | `string`                                                                      | 容器自定义类名     |
| onChange                | `(value: string, schema: Elements[]) => void`                                 | 内容变化回调       |
| onSelectionChange       | `(selection: Selection \| null, markdown: string, nodes: Elements[]) => void` | 选区变化回调       |
| **自定义渲染**          |
| eleItemRender           | `(props: ElementProps, defaultDom: React.ReactNode) => React.ReactElement`    | 自定义元素渲染     |
| leafRender              | `(props: RenderLeafProps, defaultDom: React.ReactNode) => React.ReactElement` | 自定义叶子节点渲染 |
| **插件系统**            |
| plugins                 | `MarkdownEditorPlugin[]`                                                      | 编辑器插件配置     |
| **其他功能**            |
| insertAutocompleteProps | `InsertAutocompleteProps`                                                     | 插入自动补全配置   |
| titlePlaceholderContent | `string`                                                                      | 标题占位符内容     |
| attachment              | `Record<string, unknown>`                                                     | 附件配置           |
| anchorProps             | `AnchorProps`                                                                 | 锚点链接配置       |
| fncProps                | `FootnoteProps`                                                               | 脚注配置           |

## 🔧 编辑器实例方法 (MarkdownEditorInstance)

通过 `editorRef` 可以获取编辑器实例，调用以下方法：

| 方法       | 类型                      | 描述                           |
| ---------- | ------------------------- | ------------------------------ |
| getValue   | `() => string`            | 获取当前编辑器的 Markdown 内容 |
| setValue   | `(value: string) => void` | 设置编辑器内容                 |
| getSchema  | `() => Elements[]`        | 获取当前文档的 Schema 结构     |
| insertText | `(text: string) => void`  | 在光标位置插入文本             |
| focus      | `() => void`              | 聚焦编辑器                     |
| blur       | `() => void`              | 失焦编辑器                     |
| clear      | `() => void`              | 清空编辑器内容                 |
| undo       | `() => void`              | 撤销操作                       |
| redo       | `() => void`              | 重做操作                       |

## 📝 使用示例

### 只读模式

```tsx
import { MarkdownEditor } from '@ant-design/agentic-ui';

export default () => {
  return (
    <MarkdownEditor
      readonly
      initValue={`# 只读模式示例

\`\`\`think
这是一个思考块，表示正在分析需求或处理复杂逻辑。
\`\`\`


这是一个只读模式的编辑器，用户无法编辑内容，但可以查看和复制。

## 功能特点

- ✅ 支持所有 Markdown 语法
- ✅ 保持完整的渲染效果
- ✅ 支持代码高亮和数学公式
- ✅ 可以选择和复制文本

> 只读模式常用于文档展示、内容预览等场景。`}
      height="300px"
    />
  );
};
```

### 监听选区变化

```tsx
import { MarkdownEditor } from '@ant-design/agentic-ui';
import { message } from 'antd';
import { useState } from 'react';

export default () => {
  const [selectedText, setSelectedText] = useState('');

  return (
    <>
      <MarkdownEditor
        initValue={`# 选区变化监听示例

尝试选中下面的文本，查看选中内容的 Markdown 格式。

## 示例文本

这是一段**加粗**的文本，还有*斜体*文本。

- 列表项 1
- 列表项 2
- 列表项 3

\`\`\`javascript
const hello = 'world';
console.log(hello);
\`\`\`


| 作品名称        | 在线地址   |  上线日期  |
| :--------  | :-----  | :----:  |
| 逍遥自在轩 | [https://niceshare.site](https://niceshare.site/?ref=markdown.lovejade.cn) |2024-04-26|
| 玉桃文飨轩 | [https://share.lovejade.cn](https://share.lovejade.cn/?ref=markdown.lovejade.cn) |2022-08-26|
| 缘知随心庭 | [https://fine.niceshare.site](https://fine.niceshare.site/?ref=markdown.lovejade.cn) |2022-02-26|
| 静轩之别苑 | [http://quickapp.lovejade.cn](http://quickapp.lovejade.cn/?ref=markdown.lovejade.cn) |2019-01-12|
| 晚晴幽草轩 | [https://www.jeffjade.com](https://www.jeffjade.com/?ref=markdown.lovejade.cn) |2014-09-20|


`}
        height="400px"
        readonly
        onSelectionChange={(selection, markdown, nodes) => {
          if (markdown) {
            setSelectedText(markdown);
            console.log('选中的文本:', markdown);
            console.log('选区信息:', selection);
            console.log('选中的节点:', nodes);
          }
        }}
      />
      {selectedText && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: '#f5f5f5',
            borderRadius: 4,
          }}
        >
          <strong>选中的 Markdown 内容:</strong>
          <pre style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
            {selectedText}
          </pre>
        </div>
      )}
    </>
  );
};
```

### 自定义工具栏

```tsx
import { MarkdownEditor } from '@ant-design/agentic-ui';
import { Button } from 'antd';

export default () => {
  const handleSave = () => {
    console.log('保存文档');
  };

  return (
    <MarkdownEditor
      initValue="# 自定义工具栏示例"
      toolBar={{
        enable: true,
        hideTools: ['image', 'formula'], // 隐藏图片和公式工具
        extra: [
          <Button key="save" type="primary" size="small" onClick={handleSave}>
            保存
          </Button>,
          <Button key="preview" size="small">
            预览
          </Button>,
        ],
      }}
      height="400px"
    />
  );
};
```

### 图片上传功能

```tsx
import { MarkdownEditor } from '@ant-design/agentic-ui';
import { message } from 'antd';

export default () => {
  const handleImageUpload = async (files: File[]) => {
    try {
      // 模拟上传过程
      const uploadPromises = files.map(async (file) => {
        // 这里应该是真实的上传逻辑
        return new Promise<string>((resolve) => {
          setTimeout(() => {
            const url = URL.createObjectURL(file);
            resolve(url);
          }, 1000);
        });
      });

      const urls = await Promise.all(uploadPromises);
      message.success(`成功上传 ${urls.length} 张图片`);
      return urls;
    } catch (error) {
      message.error('图片上传失败');
      return [];
    }
  };

  return (
    <MarkdownEditor
      toolBar={{
        enable: true,
        extra: [
          <button
            type="button"
            key="save"
            onClick={() => console.log(editorRef.current?.getValue())}
          >
            保存
          </button>,
        ],
      }}
      initValue="拖拽图片到编辑器或使用工具栏上传按钮"
      image={{
        upload: handleImageUpload,
      }}
      height="400px"
    />
  );
};
```

### 评论功能

```tsx
import { MarkdownEditor } from '@ant-design/agentic-ui';
import { useState } from 'react';

export default () => {
  const [comments, setComments] = useState([]);

  const handleCommentSubmit = (id: string, comment: any) => {
    const newComment = {
      id: Date.now(),
      content: comment.content,
      author: comment.author || '匿名用户',
      time: new Date().toISOString(),
      ...comment,
    };
    setComments((prev) => [...prev, newComment]);
  };

  const handleCommentDelete = (id: string | number) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <MarkdownEditor
      readonly
      reportMode
      initValue={`# 评论功能示例

这是一个支持评论的文档。在报告模式下，用户可以对文档内容进行评论。

## 如何使用评论功能

1. 选中要评论的文本
2. 点击出现的评论按钮
3. 输入评论内容
4. 支持@提及其他用户

> 评论功能常用于文档审阅、协作编辑等场景。`}
      comment={{
        enable: true,
        onSubmit: handleCommentSubmit,
        onDelete: handleCommentDelete,
        commentList: comments,
        loadMentions: async (keyword) => {
          // 模拟加载用户列表
          const users = [
            {
              name: 'Alice',
              avatar: 'https://avatars.githubusercontent.com/u/1',
            },
            {
              name: 'Bob',
              avatar: 'https://avatars.githubusercontent.com/u/2',
            },
            {
              name: 'Charlie',
              avatar: 'https://avatars.githubusercontent.com/u/3',
            },
          ];
          return users.filter((user) =>
            user.name.toLowerCase().includes(keyword.toLowerCase()),
          );
        },
      }}
      height="500px"
    />
  );
};
```

### 自定义渲染

```tsx
import { MarkdownEditor } from '@ant-design/agentic-ui';

export default () => {
  return (
    <MarkdownEditor
      initValue="**加粗文本** *斜体文本* `行内代码` ~~删除线~~"
      leafRender={(props, defaultDom) => {
        const { leaf, children } = props;

        // 自定义加粗样式
        if (leaf.bold) {
          return (
            <strong
              style={{
                color: '#1890ff',
                backgroundColor: '#e6f7ff',
                padding: '2px 4px',
                borderRadius: '4px',
              }}
            >
              {children}
            </strong>
          );
        }

        // 自定义斜体样式
        if (leaf.italic) {
          return (
            <em
              style={{
                color: '#722ed1',
                backgroundColor: '#f9f0ff',
                padding: '2px 4px',
                borderRadius: '4px',
              }}
            >
              {children}
            </em>
          );
        }

        // 自定义行内代码样式
        if (leaf.code) {
          return (
            <code
              style={{
                color: '#d83931',
                backgroundColor: '#fff2f0',
                border: '1px solid #ffccc7',
                padding: '2px 6px',
                borderRadius: '4px',
                fontFamily: 'Monaco, Consolas, monospace',
              }}
            >
              {children}
            </code>
          );
        }

        return defaultDom;
      }}
      height="300px"
    />
  );
};
```

## 🎯 最佳实践

### 性能优化

1. **合理使用 memo**: 对于频繁变化的组件，使用 React.memo 进行优化
2. **图片懒加载**: 对于包含大量图片的文档，启用图片懒加载
3. **插件按需加载**: 只加载必要的插件，减少包体积

### 用户体验

1. **提供加载状态**: 在图片上传等异步操作时显示加载状态
2. **错误处理**: 为所有用户操作提供适当的错误提示
3. **响应式设计**: 确保在不同设备上都有良好的使用体验

### 安全考虑

1. **内容过滤**: 对用户输入进行适当的过滤和验证
2. **XSS 防护**: 使用 DOMPurify 等工具清理 HTML 内容
3. **文件上传限制**: 对上传文件的类型和大小进行限制

## 🔗 相关链接

- [组件演示](/components/api)
- [插件开发指南](/plugin/)
- [开发指南](/development/)
- [常见问题](/faq/)
