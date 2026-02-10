---
nav:
  title: 组件
  order: 1
atomId: SchemaEditor
group:
  title: 图文输出
  order: 4
---

# SchemaEditor - schema 编辑工具

SchemaEditor 是一个强大的 schema 编辑和预览工具，提供 HTML 模板和 JSON schema 的实时编辑功能，底层使用 AceEditor 来编辑 schema 中的 HTML 内容。

## 功能特性

- 🎨 **实时编辑**: 支持 HTML 模板和 JSON schema 的实时编辑
- 👀 **实时预览**: 实时显示编辑结果，支持模板变量替换
- 🔍 **语法高亮**: 使用 AceEditor 提供 HTML 和 JSON 语法高亮
- ⚡ **错误提示**: 自动检测 schema 格式错误并显示提示
- 📱 **响应式设计**: 支持不同屏幕尺寸的适配
- 🛡️ **安全渲染**: 支持配置允许的 HTML 标签和属性
- 🔧 **类型安全**: 完整的 TypeScript 类型支持
- 🎯 **模板引擎**: 支持 Mustache 模板语法

## 基本用法

<code src="../demos/SchemaEditorBasicDemo.tsx">Schema 编辑器基础用法</code>

## API 参考

### Props

| 属性            | 类型                                                           | 默认值  | 说明             |
| --------------- | -------------------------------------------------------------- | ------- | ---------------- |
| `initialSchema` | `LowCodeSchema`                                                | -       | 初始 schema 数据 |
| `initialValues` | `Record<string, any>`                                          | `{}`    | 初始值           |
| `height`        | `number \| string`                                             | `600`   | 编辑器高度       |
| `readonly`      | `boolean`                                                      | `false` | 是否只读         |
| `onChange`      | `(schema: LowCodeSchema, values: Record<string, any>) => void` | -       | 变更回调         |
| `onError`       | `(error: Error) => void`                                       | -       | 错误回调         |
| `className`     | `string`                                                       | `''`    | 自定义样式类名   |
| `showPreview`   | `boolean`                                                      | `true`  | 是否显示预览     |
| `previewConfig` | `object`                                                       | -       | 预览配置         |

### previewConfig

| 属性           | 类型       | 默认值 | 说明             |
| -------------- | ---------- | ------ | ---------------- |
| `ALLOWED_TAGS` | `string[]` | -      | 允许的 HTML 标签 |
| `ALLOWED_ATTR` | `string[]` | -      | 允许的 HTML 属性 |

## 高级用法

### 自定义预览配置

```tsx | pure
<SchemaEditor
  initialSchema={schema}
  initialValues={values}
  previewConfig={{
    ALLOWED_TAGS: ['div', 'h1', 'h2', 'p', 'span', 'button'],
    ALLOWED_ATTR: ['class', 'style', 'onclick'],
  }}
/>
```

### 隐藏预览

```tsx | pure
<SchemaEditor
  initialSchema={schema}
  initialValues={values}
  showPreview={false}
/>
```

配置错误处理：

```tsx | pure
<SchemaEditor
  initialSchema={schema}
  initialValues={values}
  onError={(error) => {
    console.error('SchemaEditor 错误:', error);
    // 显示错误提示
  }}
/>
```

### 复杂 Schema 示例

```tsx | pure
const complexSchema = {
  version: '1.2.0',
  name: '7-Day Weather Forecast Component',
  description: 'A component displaying 7-day weather forecast data',
  author: 'Forecast Team',
  createTime: '2024-03-22T08:00:00Z',
  updateTime: '2024-03-22T08:00:00Z',
  pageConfig: {
    layout: 'flex',
    router: { mode: 'hash', basePath: '/7days-weather' },
    globalVariables: {
      colors: {
        sunny: '#FFD700',
        cloudy: '#A9A9A9',
        rainy: '#4682B4',
        snow: '#87CEEB',
      },
      constants: { refreshInterval: 3600000 },
    },
  },
  dataSources: {
    restAPI: {
      baseURL: 'https://api.7days-weather.com/v3',
      defaultHeaders: { 'Content-Type': 'application/json' },
      timeout: 5000,
      interceptors: { request: true, response: true },
    },
    mock: {
      enable: true,
      responseDelay: 150,
      dataPath: '/mock/7days-weather',
    },
  },
  component: {
    properties: {
      title: {
        title: '标题',
        type: 'string',
        default: '天气预报',
      },
      days: {
        title: '天数',
        type: 'number',
        default: 7,
        minimum: 1,
        maximum: 14,
      },
    },
    type: 'html',
    schema: `
      <div class="weather-forecast">
        <h1>{{title}}</h1>
        <div class="forecast-days">
          {{#each days}}
          <div class="day-card">
            <h3>{{date}}</h3>
            <p>{{temperature}}°C</p>
            <p>{{condition}}</p>
          </div>
          {{/each}}
        </div>
      </div>
    `,
  },
};
```

## Schema 格式

SchemaEditor 使用 `LowCodeSchema` 类型定义，主要包含以下字段：

```tsx | pure
interface LowCodeSchema {
  version?: string;
  name?: string;
  description?: string;
  author?: string;
  createTime?: string;
  updateTime?: string;
  pageConfig?: PageConfig;
  dataSources?: DataSourceConfig;
  component?: ComponentConfig;
  theme?: ThemeConfig;
  previewSettings?: PreviewSettings;
  initialValues?: Record<string, any>;
}

interface ComponentConfig {
  properties?: ComponentProperties;
  type?: 'html' | 'mustache';
  schema?: string;
}
```

### 组件属性类型

```tsx | pure
interface StringProperty extends BaseProperty {
  type: 'string';
  default?: string;
  enum?: string[];
  pattern?: string;
  patternMessage?: string;
  minLength?: number;
  maxLength?: number;
}

interface NumberProperty extends BaseProperty {
  type: 'number';
  default?: number;
  minimum?: number;
  maximum?: number;
  step?: number;
  unit?: string;
}

interface ArrayProperty extends BaseProperty {
  type: 'array';
  default?: any[];
  items?: SchemaProperty;
  minItems?: number;
  maxItems?: number;
}

interface ObjectProperty extends BaseProperty {
  type: 'object';
  default?: Record<string, any>;
  properties?: ComponentProperties;
}
```

### 示例 Schema

```json
{
  "version": "1.0.0",
  "name": "用户卡片",
  "description": "显示用户信息的卡片组件",
  "component": {
    "type": "html",
    "schema": "<div class=\"user-card\">\n  <h2>{{name}}</h2>\n  <p>{{email}}</p>\n  <button onclick=\"alert('{{name}}')\">点击</button>\n</div>",
    "properties": {
      "name": {
        "title": "姓名",
        "type": "string",
        "default": "张三"
      },
      "email": {
        "title": "邮箱",
        "type": "string",
        "default": "zhangsan@example.com"
      }
    }
  },
  "initialValues": {
    "name": "张三",
    "email": "zhangsan@example.com"
  }
}
```

## 模板语法

SchemaEditor 支持 Mustache 模板语法，可以在 HTML 中使用 `{{变量名}}` 来插入动态内容。

### 基本变量

```html
<div>
  <h1>{{title}}</h1>
  <p>{{description}}</p>
</div>
```

### 条件渲染

```html
<div>
  {{#if showTitle}}
  <h1>{{title}}</h1>
  {{/if}}
  <p>{{content}}</p>
</div>
```

### 循环渲染

```html
<ul>
  {{#each items}}
  <li>{{name}}: {{value}}</li>
  {{/each}}
</ul>
```

### 嵌套对象

```html
<div>
  <h2>{{user.name}}</h2>
  <p>{{user.email}}</p>
  <p>{{user.address.city}}</p>
</div>
```

## 错误处理

SchemaEditor 提供了完善的错误处理机制：

### 验证错误

- **Schema 格式验证**: 自动检测 JSON 格式错误
- **类型验证**: 验证组件属性类型
- **必填字段验证**: 检查必填字段是否提供

### 渲染错误

- **模板语法错误**: 检测 Mustache 模板语法错误
- **变量未定义**: 提示模板中使用的未定义变量
- **HTML 安全**: 过滤不安全的 HTML 标签和属性

### 错误边界

SchemaEditor 使用 React Error Boundary 来捕获渲染过程中的错误，并提供友好的错误提示。

## 注意事项

1. **安全性**: 在生产环境中，建议配置 `previewConfig` 来限制允许的 HTML 标签和属性
2. **性能**: 大型 schema 可能会影响编辑性能，建议适当分页或懒加载
3. **兼容性**: 组件依赖 AceEditor，确保在支持的环境中运行
4. **模板语法**: 目前支持 Mustache 模板语法，未来可能支持更多模板引擎
5. **浏览器支持**: 需要支持 ES6+ 的现代浏览器
6. **依赖要求**: 需要安装 `ace-builds` 依赖包

## 示例文件

本文档提供了以下示例文件，您可以直接导入使用：

- [`SchemaEditorBasicDemo.tsx`](./demos/SchemaEditorBasicDemo.tsx) - 基本用法示例
- [`SchemaEditorComplexDemo.tsx`](./demos/SchemaEditorComplexDemo.tsx) - 复杂 Schema 示例
- [`SchemaEditorReadonlyDemo.tsx`](./demos/SchemaEditorReadonlyDemo.tsx) - 只读模式示例
- [`SchemaEditorErrorDemo.tsx`](./demos/SchemaEditorErrorDemo.tsx) - 错误处理示例

## 相关组件

- [SchemaRenderer](./SchemaRenderer.md) - Schema 渲染器
- [SchemaForm](./SchemaForm.md) - Schema 表单生成器
- [AceEditor](../../plugins/code/components/AceEditor.md) - 代码编辑器

## 更新日志

### v1.2.0

- 新增完整的 `LowCodeSchema` 类型支持
- 新增页面配置、数据源配置等功能
- 优化错误处理和验证机制
- 改进响应式设计

### v1.1.0

- 新增 Mustache 模板语法支持
- 新增安全渲染配置
- 优化 AceEditor 集成
- 改进样式系统

### v1.0.0

- 初始版本发布
- 支持基本的 HTML 和 JSON 编辑
- 支持实时预览功能
