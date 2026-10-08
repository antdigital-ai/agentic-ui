/**
 * Rspress 插件：dumi `<code src>` demo 嵌入迁移层。
 *
 * 职责：
 * 1. addPages 阶段扫描 docs 下所有 .md 中的 code src 嵌入（如 iframe=540），
 *    为每个 demo 生成独立路由页 /~demos/<demoId>，复刻 dumi 的 ~demos/<id> 语义，
 *    E2E（_test_helpers）无需改导航地址。
 *    注意：addPages 在所有 markdown 编译之前执行（build.js 顺序：
 *    addPages → RouteService → rsbuild），不能依赖 remark 阶段的收集结果，
 *    因此这里直接用正则扫描源文件。
 * 2. remark 阶段把 <code src> 节点转成 <DemoCard demoId height ... />
 *    （demo 源码经 ?standalone-demo 查询导入），demoId 与 addPages 用同一
 *    deriveDemoId 推导，保证两端路由一致。
 *
 * DemoCard 组件在 theme/DemoCard（运行时 iframe 嵌入 /~demos/<id>）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { visit } from 'unist-util-visit';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEMO_REGISTRY_FILE = path.resolve(__dirname, '../docs/_demoRegistry.json');

/** mdx import 声明节点 */
function mdxImport(name, from) {
  return {
    type: 'mdxjsEsm',
    value: `import { ${name} } from '${from}';`,
    data: {
      estree: {
        type: 'Program',
        sourceType: 'module',
        body: [
          {
            type: 'ImportDeclaration',
            specifiers: [
              {
                type: 'ImportSpecifier',
                imported: { type: 'Identifier', name },
                local: { type: 'Identifier', name },
              },
            ],
            source: { type: 'Literal', value: from, raw: `'${from}'` },
          },
        ],
      },
    },
  };
}

/** 字符串属性 */
function strAttr(name, value) {
  return { type: 'mdxJsxAttribute', name, value: String(value) };
}

/** 表达式属性（用于数字等非字符串字面量）。MDX 编译要求表达式节点携带 estree，否则输出为空。 */
function exprAttr(name, expr) {
  const raw = String(expr);
  const numeric = raw.trim();
  const isNumericLiteral = /^\d+(\.\d+)?$/.test(numeric);
  return {
    type: 'mdxJsxAttribute',
    name,
    value: {
      type: 'mdxJsxAttributeValueExpression',
      value: raw,
      data: {
        estree: {
          type: 'Program',
          sourceType: 'module',
          body: [
            {
              type: 'ExpressionStatement',
              expression: isNumericLiteral
                ? { type: 'Literal', value: Number(numeric), raw }
                : { type: 'Identifier', name: raw },
            },
          ],
        },
      },
    },
  };
}

/** 解析 HTML 属性（兼容 iframe=540 无引号写法） */
function parseAttrs(raw) {
  const attrs = {};
  const re = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let m;
  while ((m = re.exec(raw)) !== null) {
    attrs[m[1]] = m[2] ?? m[3] ?? m[4] ?? '';
  }
  return attrs;
}

/** mdxJsxAttribute 数组 → 纯 string 映射（表达式属性取原始代码文本） */
function attrsFromJsx(node) {
  const attrs = {};
  for (const a of node.attributes ?? []) {
    if (!a.name) continue;
    attrs[a.name] = typeof a.value === 'string' ? a.value : (a.value?.value ?? '');
  }
  return attrs;
}

/** demo 稳定 ID：显式 id 优先（E2E fixtures 约定），否则由路径推导 */
export function deriveDemoId(srcRelative, explicitId) {
  if (explicitId) return explicitId;
  const normalized = srcRelative.replace(/\\/g, '/').replace(/\.(tsx|ts|jsx|js)$/, '');
  const withoutDots = normalized.startsWith('../') ? normalized.slice(3) : normalized;
  return `docs-${withoutDemosSuffix(withoutDots)}`;
}

function withoutDemosSuffix(p) {
  // ../demos/foo → demos/foo（保持 dumi ~demos/<id> 前缀语义）
  return p.replace(/[/.]/g, '-');
}

/** 单文件中的 <code src> 声明 → [{ demoId, srcAbs, attrs }] */
function collectCodeEmbeds(mdPath, docsDir) {
  const text = fs.readFileSync(mdPath, 'utf8');
  const fileDir = path.dirname(mdPath);
  const result = [];
  const re = /<code\s+([^>]*?)><\/code>/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const attrs = parseAttrs(m[1]);
    if (!attrs.src) continue;
    const srcAbs = path.resolve(fileDir, attrs.src);
    if (!fs.existsSync(srcAbs)) continue;
    result.push({
      demoId: deriveDemoId(attrs.src, attrs.id),
      srcAbs,
      attrs,
    });
  }
  return result;
}

/**
 * demo 模块组件名：default 导出优先；dumi 兼容——无 default 时
 * 取第一个具名导出（如 docs/demos/button.tsx 的 BaseButtonDemo）。
 */
function pickDemoExportName(srcAbs) {
  const src = fs.readFileSync(srcAbs, 'utf8');
  if (/export\s+default/.test(src) || /export\s*\{\s*default\s*\}/.test(src)) return 'Demo';
  const named = [...src.matchAll(/export\s+(?:const|function|class)\s+([A-Za-z_$][\w$]*)/g)].map(
    (m) => m[1],
  );
  return named[0] ?? 'Demo';
}

/** 递归收集 docs 下的 .md 文件 */
function collectMdFiles(dir) {
  const files = [];
  const walk = (d) => {
    for (const name of fs.readdirSync(d)) {
      const p = path.join(d, name);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (name.endsWith('.md') || name.endsWith('.mdx')) files.push(p);
    }
  };
  walk(dir);
  return files;
}

export function dumiDemoPlugin() {
  /** demoId → { srcAbs, attrs }；addPages 与 remark 共享（remark 阶段读取补全 attrs） */
  const registry = new Map();
  let docsDirResolved = null;

  const remarkDumiCodeEmbed = () => (tree, vfile) => {
    const fileDir = path.dirname(vfile.path || vfile.history[0] || '');
    let seq = 0;

    /**
     * 把 <code src=...> 节点改写为 <DemoCard ... />，并注入 import。
     * MDX 下 dumi 标签可能解析为 html（小写标签默认 HTML 语义）或
     * mdxJsxFlowElement（JSX 语义），两种形态都要处理。
     */
    const replaceWithDemoCard = (node) => {
      const attrs = node.type === 'html' ? parseAttrs(node.value) : attrsFromJsx(node);
      if (!attrs.src) return false;
      const srcAbs = path.resolve(fileDir, attrs.src);
      if (!fs.existsSync(srcAbs)) return false;

      const height = attrs.iframe ? Number.parseInt(attrs.iframe, 10) || null : null;
      const demoId = deriveDemoId(attrs.src, attrs.id);
      const componentName = `StandaloneDemo${++seq}`;

      registry.set(demoId, { srcAbs, attrs });

      // 原位替换为 DemoCard JSX 流节点
      delete node.value;
      node.type = 'mdxJsxFlowElement';
      node.name = 'DemoCard';
      node.attributes = [
        strAttr('demoId', demoId),
        exprAttr('height', String(height ?? 480)),
        ...(attrs.background ? [strAttr('background', attrs.background)] : []),
        ...(attrs.title ? [strAttr('title', attrs.title)] : []),
        ...(attrs.description ? [strAttr('description', attrs.description)] : []),
      ];
      node.children = [];

      tree.children.unshift(
        mdxImport('DemoCard', '@internal/demo-card'),
        mdxImport(componentName, `${srcAbs.split(path.sep).join('/')}?standalone-demo`),
      );
      return true;
    };

    visit(tree, (node) => {
      if (node.type === 'html') {
        // html 节点 value 形如 <code src="..." ...></code>，仅处理 code 嵌入
        if (/<code\s[^>]*src=/i.test(node.value)) replaceWithDemoCard(node);
      } else if (node.type === 'mdxJsxFlowElement' && node.name === 'code') {
        replaceWithDemoCard(node);
      }
    });
  };

  return {
    name: 'dumi-demo-embed',
    markdown: {
      remarkPlugins: [remarkDumiCodeEmbed],
    },
    addPages(config) {
      const docsDir = config.root
        ? path.resolve(__dirname, '..', config.root)
        : path.resolve(__dirname, '..', 'docs');
      docsDirResolved = docsDir;

      const pages = [];
      for (const mdFile of collectMdFiles(docsDir)) {
        for (const { demoId, srcAbs } of collectCodeEmbeds(mdFile, docsDir)) {
          if (registry.has(demoId)) continue;
          registry.set(demoId, { srcAbs, attrs: {} });
          const posixSrc = srcAbs.split(path.sep).join('/');
          const exportName = pickDemoExportName(srcAbs);
          pages.push({
            routePath: `/~demos/${demoId}`,
            content: [
              // blank：Layout 不渲染 Nav/侧栏，等价 dumi ~demos/<id> 裸 iframe 页
              '---',
              'pageType: blank',
              '---',
              '',
              exportName === 'Demo'
                ? `import Demo from '${posixSrc}?standalone-demo';`
                : `import { ${exportName} as Demo } from '${posixSrc}?standalone-demo';`,
              'export default () => <Demo />;',
            ].join('\n'),
          });
        }
      }

      // 写 registry 供脚本/调试使用
      try {
        const serializable = Object.fromEntries(
          [...registry.entries()].map(([id, { srcAbs }]) => [id, srcAbs.split(path.sep).join('/')]),
        );
        fs.mkdirSync(path.dirname(DEMO_REGISTRY_FILE), { recursive: true });
        fs.writeFileSync(DEMO_REGISTRY_FILE, `${JSON.stringify(serializable, null, 2)}\n`);
      } catch {
        /* registry 写失败不阻塞构建 */
      }
      return pages;
    },
  };
}
