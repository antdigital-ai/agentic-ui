import { defineConfig } from 'dumi';

export default defineConfig({
  outputPath: 'docs-dist',
  title: 'Agentic UI',
  mfsu: false,
  // @silurus/ooxml 的 wasm-bindgen 胶水使用 BigInt 字面量（Chrome 67+ 原生支持），
  // 默认 es2015 压缩目标会拒绝 BigInt 语法；提升到 es2020（chrome80 完整支持）
  jsMinifierOptions: { target: ['es2020'] },
  themeConfig: {
    logo: 'https://mdn.alipayobjects.com/huamei_ptjqan/afts/img/A*ObqVQoMht3oAAAAARuAAAAgAekN6AQ/fmt.webp',
    name: 'Agentic UI',
  },
  favicons: [
    'https://mdn.alipayobjects.com/huamei_ptjqan/afts/img/A*ObqVQoMht3oAAAAARuAAAAgAekN6AQ/original',
  ],
  resolve: {
    docDirs: ['docs', 'src/schema'],
  },
  headScripts: [
    {
      src: 'https://www.googletagmanager.com/gtag/js?id=G-8V1D6XCMW3',
      async: true,
    },
    `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-8V1D6XCMW3');
    `,
  ],
});
