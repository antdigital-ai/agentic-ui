---
nav:
  title: 常见问题
  order: 6
group:
  title: 通用
  order: 3
---

# 常见问题与故障排除

本页面整理了使用 agentic-ui 过程中经常遇到的问题和解决方案。

## 📋 目录

- [安装和配置问题](#安装和配置问题)
- [编辑器功能问题](#编辑器功能问题)
- [性能和优化问题](#性能和优化问题)
- [样式和主题问题](#样式和主题问题)
- [插件相关问题](#插件相关问题)
- [TypeScript 类型问题](#typescript-类型问题)
- [构建和部署问题](#构建和部署问题)

## 🔧 安装和配置问题

### Q: 安装后出现 "Cannot resolve module '@ant-design/agentic-ui'" 错误

**A:** 检查以下几个方面：

1. **确认安装状态**

   ```bash
   npm list @ant-design/agentic-ui
   # 或
   pnpm list @ant-design/agentic-ui
   ```

2. **重新安装依赖**

   ```bash
   # 清理 node_modules
   rm -rf node_modules package-lock.json
   npm install

   # 或使用 pnpm
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

3. **检查 Node.js 版本**
   ```bash
   node --version  # 需要 >= 16.0.0
   ```

### Q: TypeScript 项目中出现类型错误

**A:** 确保正确配置 TypeScript：

1. **安装类型依赖**

   ```bash
   npm install --save-dev @types/react @types/react-dom
   ```

2. **配置 tsconfig.json**

   ```json
   {
     "compilerOptions": {
       "lib": ["ES2020", "DOM", "DOM.Iterable"],
       "allowSyntheticDefaultImports": true,
       "esModuleInterop": true,
       "jsx": "react-jsx",
       "moduleResolution": "node"
     }
   }
   ```

3. **使用正确的导入语法**

   ```tsx | pure
   // ✅ 正确
   import { MarkdownEditor } from '@ant-design/agentic-ui';

   // ❌ 错误
   import MarkdownEditor from '@ant-design/agentic-ui';
   ```

### Q: Webpack 构建时出现错误

**A:** 配置 Webpack 正确处理 agentic-ui：

```tsx | pure
// webpack.config.js
module.exports = {
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: ['file-loader'],
      },
    ],
  },
};
```

## ✏️ 编辑器功能问题

### Q: 编辑器无法正常渲染或显示空白

**A:** 检查以下配置：

1. **确保容器有固定高度**

   ```tsx | pure
   <MarkdownEditor
     height="400px" // 必须设置高度
     width="100%"
   />
   ```

2. **检查 CSS 样式冲突**

   ```css
   /* 确保编辑器容器可见 */
   .markdown-editor {
     min-height: 300px;
     position: relative;
   }
   ```

3. **检查控制台错误**
   ```tsx | pure
   // 添加错误边界
   <ErrorBoundary fallback={<div>编辑器加载失败</div>}>
     <MarkdownEditor />
   </ErrorBoundary>
   ```

### Q: 图片上传功能不工作

**A:** 确保正确配置图片上传：

```tsx | pure
const handleImageUpload = async (files: File[]) => {
  try {
    // 实现上传逻辑
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return data.urls; // 返回图片 URL 数组
  } catch (error) {
    console.error('上传失败:', error);
    throw error;
  }
};

<MarkdownEditor
  image={{
    upload: handleImageUpload,
  }}
/>;
```

### Q: 粘贴内容格式不正确

**A:** 自定义粘贴处理：

````tsx | pure
const customPastePlugin = {
  onPaste: (text: string, html?: string) => {
    // 处理特殊格式
    if (html && html.includes('<table>')) {
      // 处理表格粘贴
      return handleTablePaste(html);
    }

    if (text.includes('```')) {
      // 处理代码块粘贴
      return handleCodePaste(text);
    }

    return false; // 使用默认处理
  },
};

<MarkdownEditor plugins={[customPastePlugin]} />;
````

### Q: 数学公式不显示

**A:** 确保 KaTeX 配置正确：

1. **检查公式语法**

   ```markdown
   // ✅ 正确的行内公式
   这是行内公式 $E=mc^2$ 示例

   // ✅ 正确的块级公式

   $$
   \int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
   $$

   // ❌ 错误的语法
   $E=mc^2 // 缺少结束符
   ```

2. **检查 KaTeX 插件**

   ```tsx | pure
   import { MarkdownEditor } from '@ant-design/agentic-ui';

   // 确保启用 KaTeX 插件
   <MarkdownEditor
     plugins={
       [
         /* 包含 KaTeX 插件 */
       ]
     }
   />;
   ```

## ⚡ 性能和优化问题

### Q: 大文档编辑时出现卡顿

**A:** 实施性能优化策略：

1. **启用虚拟滚动**

   ```tsx | pure
   <MarkdownEditor virtualScrolling={true} maxVisibleLines={100} />
   ```

2. **使用 React.memo 优化组件**

   ```tsx | pure
   const OptimizedEditor = React.memo(
     MarkdownEditor,
     (prevProps, nextProps) => {
       return prevProps.initValue === nextProps.initValue;
     },
   );
   ```

3. **防抖输入处理**

   ```tsx | pure
   const debouncedOnChange = useMemo(
     () =>
       debounce((value: string) => {
         console.log('内容变化:', value);
       }, 300),
     [],
   );

   <MarkdownEditor onChange={debouncedOnChange} />;
   ```

### Q: 内存使用过高

**A:** 优化内存使用：

1. **清理事件监听器**

   ```tsx | pure
   useEffect(() => {
     const handleKeydown = (e: KeyboardEvent) => {
       // 处理快捷键
     };

     document.addEventListener('keydown', handleKeydown);

     return () => {
       document.removeEventListener('keydown', handleKeydown);
     };
   }, []);
   ```

2. **避免内存泄漏**

   ```tsx | pure
   const useAsyncData = () => {
     const abortControllerRef = useRef<AbortController>();

     useEffect(() => {
       return () => {
         abortControllerRef.current?.abort();
       };
     }, []);

     // ... 使用 AbortController
   };
   ```

## 🎨 样式和主题问题

### Q: 自定义主题不生效

**A:** 正确配置主题：

```tsx | pure
import { ConfigProvider } from 'antd';
import { MarkdownEditor } from '@ant-design/agentic-ui';

const customTheme = {
  token: {
    colorPrimary: '#00b96b',
    borderRadius: 6,
  },
};

<ConfigProvider theme={customTheme}>
  <MarkdownEditor />
</ConfigProvider>;
```

### Q: CSS 样式冲突

**A:** 解决样式冲突：

1. **使用 CSS Modules**

   ```css
   /* editor.module.css */
   .editorContainer {
     /* 自定义样式 */
   }
   ```

2. **提高选择器优先级**

   ```css
   /* 使用更具体的选择器 */
   .my-app .markdown-editor .editor-content {
     color: #333;
   }
   ```

3. **使用 CSS-in-JS**
   ```tsx | pure
   const useStyles = createStyles(({ token }) => ({
     editor: {
       backgroundColor: token.colorBgContainer,
       '& .editor-content': {
         padding: token.padding,
       },
     },
   }));
   ```

### Q: 暗色主题不工作

**A:** 配置暗色主题：

```tsx | pure
import { ConfigProvider, theme } from 'antd';

<ConfigProvider
  theme={{
    algorithm: theme.darkAlgorithm,
  }}
>
  <MarkdownEditor />
</ConfigProvider>;
```

## 🔌 插件相关问题

### Q: 自定义插件不生效

**A:** 检查插件配置：

1. **确保插件格式正确**

   ```tsx | pure
   const myPlugin: MarkdownEditorPlugin = {
     parseMarkdown: [
       {
         match: (node) => node.type === 'custom',
         convert: (node) => ({ type: 'custom-element', children: [] }),
       },
     ],
     elements: {
       'custom-element': ({ children, attributes }) => (
         <div {...attributes}>{children}</div>
       ),
     },
   };
   ```

2. **正确传递插件**
   ```tsx | pure
   <MarkdownEditor
     plugins={[myPlugin]} // 确保传递为数组
   />
   ```

### Q: 插件之间冲突

**A:** 解决插件冲突：

1. **调整插件顺序**

   ```tsx | pure
   // 后面的插件优先级更高
   <MarkdownEditor plugins={[basePlugin, conflictingPlugin]} />
   ```

2. **使用条件插件**
   ```tsx | pure
   const conditionalPlugins = useMemo(() => {
     const plugins = [basePlugin];
     if (enableAdvanced) {
       plugins.push(advancedPlugin);
     }
     return plugins;
   }, [enableAdvanced]);
   ```

## 📘 TypeScript 类型问题

### Q: 类型定义不完整或错误

**A:** 解决类型问题：

1. **使用正确的类型导入**

   ```tsx | pure
   import type {
     MarkdownEditorProps,
     MarkdownEditorInstance,
     Elements,
   } from '@ant-design/agentic-ui';
   ```

2. **扩展类型定义**

   ```tsx | pure
   // 扩展插件类型
   interface CustomElementProps extends ElementProps {
     customProp?: string;
   }

   const CustomElement: React.FC<CustomElementProps> = ({
     customProp,
     ...props
   }) => {
     // 组件实现
   };
   ```

3. **类型断言（谨慎使用）**

   ```tsx | pure
   const editorRef = useRef<MarkdownEditorInstance>(null);

   const handleSave = () => {
     const content = editorRef.current?.getValue() as string;
   };
   ```

## 🚀 构建和部署问题

### Q: 生产环境构建失败

**A:** 解决构建问题：

1. **检查依赖版本兼容性**

   ```bash
   npm outdated
   npm audit
   ```

2. **配置 Babel**

   ```tsx | pure
   // .babelrc
   {
     "presets": [
       "@babel/preset-env",
       "@babel/preset-react",
       "@babel/preset-typescript"
     ]
   }
   ```

3. **优化 bundle 大小**
   ```tsx | pure
   // webpack.config.js
   module.exports = {
     optimization: {
       splitChunks: {
         chunks: 'all',
       },
     },
   };
   ```

### Q: 部署后功能异常

**A:** 检查部署环境：

1. **检查静态资源路径**

   ```tsx | pure
   // 确保资源路径正确
   publicPath: process.env.NODE_ENV === 'production' ? '/your-app/' : '/';
   ```

2. **检查环境变量**

   ```bash
   # 设置正确的环境变量
   NODE_ENV=production
   ```

3. **检查浏览器兼容性**
   ```tsx | pure
   // 添加必要的 polyfill
   import 'core-js/stable';
   import 'regenerator-runtime/runtime';
   ```

## 🔍 调试技巧

### 启用调试模式

```tsx | pure
// 开发环境启用详细日志
<MarkdownEditor
  debug={process.env.NODE_ENV === 'development'}
  onError={(error) => console.error('编辑器错误:', error)}
/>
```

### 使用浏览器调试工具

1. **React Developer Tools**
   - 安装 React DevTools 浏览器扩展
   - 检查组件状态和 props

2. **Performance Tab**
   - 分析渲染性能
   - 识别性能瓶颈

3. **Console 调试**
   ```tsx | pure
   // 在控制台中访问编辑器实例
   window.editorInstance = editorRef.current;
   ```

## 🆘 寻求帮助

如果以上解决方案无法解决您的问题：

1. **搜索已有 Issues**
   - [GitHub Issues](https://github.com/ant-design/agentic-ui/issues)
   - 使用关键词搜索类似问题

2. **提交新 Issue**
   - 提供详细的问题描述
   - 包含最小可复现示例
   - 说明环境信息（Node 版本、浏览器等）

3. **参与社区讨论**
   - [GitHub Discussions](https://github.com/ant-design/agentic-ui/discussions)
   - 技术交流和经验分享

## 📚 相关资源

- [API 文档](/components/api)
- [开发指南](/development/development-guide)
- [插件开发](/plugin/)
- [性能优化指南](/development/development-guide#性能优化)

---

如果您发现文档中的错误或有改进建议，欢迎提交 PR 帮助完善文档！
