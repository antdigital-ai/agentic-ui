import { defineConfig } from '@rspress/core';
import path from 'node:path';
import { pluginPreview } from '@rspress/plugin-preview';
import { dumiDemoPlugin } from './scripts/rspress-plugin-dumi-code-embed.mjs';

// Rspress 站点根目录（相对仓库根）
export const docsRoot = 'docs';

export default defineConfig({
  root: docsRoot,
  title: 'Agentic UI',
  description:
    '基于 React 与 Ant Design 的智能体 UI 组件库：多步推理可视化、工具调用展示、任务执行协同',
  icon: 'https://mdn.alipayobjects.com/huamei_ptjqan/afts/img/A*ObqVQoMht3oAAAAARuAAAAgAekN6AQ/original',
  lang: 'zh',
  outDir: 'doc_build',
  // docs/demos 的 tsx 只作为 demo 源码组件导入，不作为路由页面
  // （默认 extensions 含 ts/tsx，会为无默认导出的 shared.ts 生成死页面）
  route: {
    extensions: ['.md', '.mdx'],
    // E2E 与外链使用无 .html 后缀 URL（/~demos/<id>、/components/bubble）
    cleanUrls: true,
  },
  // 重 DOM 依赖页面（demo 或文档页直接访问 document/window/DOMParser）无法 SSR，
  // 走 CSR fallback：产物仍含完整可交互页面，仅构建期不预渲染
  ssg: {
    experimentalExcludeRoutePaths: [
      /^\/demos\/ChatBootPage/,
      /^\/demos\/ChatFlowContainer/,
      /^\/demos\/FncTooltip/,
      /^\/demos\/HtmlParsing-demo/,
      /^\/demos\/agentic-ui-embed-render-demo/,
      /^\/demos\/back-to/,
      // standalone iframe 路由（/~demos/<id>）本质是浏览器端 demo 宿主页，
      // 全量走 CSR fallback，不再逐组件枚举豁免清单
      /^\/~demos\//,
    ],
  },
  // 与 dumi 时代 docs-dist 对齐：E2E preview 端口 4172 在 playwright.config.ts 固定
  builderConfig: {
    resolve: {
      alias: {
        // DemoCard 由主题目录提供（standalone 页样式并入 agentic-site.css）
        '@internal/demo-card': path.join(__dirname, 'theme/DemoCard.tsx'),
        // 文档站 demo / 首页通过包名自引用源码（对齐 dumi alias）
        '@ant-design/agentic-ui': path.join(__dirname, 'src/index.ts'),
      },
    },
    html: {
      tags: [
        {
          tag: 'script',
          attrs: {
            async: true,
            src: 'https://www.googletagmanager.com/gtag/js?id=G-8V1D6XCMW3',
          },
        },
        {
          tag: 'script',
          children:
            "window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-8V1D6XCMW3');",
        },
      ],
    },
    // @silurus/ooxml 的 wasm-bindgen 胶水使用 BigInt 字面量，默认 es2015 压缩会拒绝；
    // 与 dumi 时代 jsMinifierOptions.target=['es2020'] 对齐（chrome80 完整支持）
    performance: {
      chunkSplit: {
        strategy: 'split-by-experience',
      },
    },
    tools: {
      rspack: (options) => {
        // 静态资源体积上限放宽：图表/lottie 等大资源按需加载
        options.performance = options.performance ?? {};
        return options;
      },
    },
  },
  markdown: {
    // 迁移期兜底：文档中指向 demo 源码文件的链接（dumi 时代可直接点开源码查看，
    // Rspress 不做路由化），保留原链接不再报死链。
    link: {
      checkDeadLinks: {
        excludes: (url) => /\.(tsx?|jsx?)$/.test(url.split('#')[0].split('?')[0]),
      },
    },
  },
  plugins: [
    dumiDemoPlugin(),
    pluginPreview({
      defaultRenderMode: 'pure',
      defaultPreviewMode: 'internal',
    }),
  ],
  globalStyles: path.join(__dirname, 'theme/agentic-site.css'),
  // 顶层 logo（Rspress 2.x：logo 属于 UserConfig，非 themeConfig）
  logo: 'https://mdn.alipayobjects.com/huamei_ptjqan/afts/img/A*ObqVQoMht3oAAAAARuAAAAgAekN6AQ/fmt.webp',
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/ant-design/agentic-ui',
      },
    ],
    footer: {
      message:
        'Powered by <a href="https://github.com/web-infra-dev/rspress" target="_blank">Rspress</a>',
    },
    lastUpdated: false,
  },
});
