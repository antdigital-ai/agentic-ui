import { defineConfig } from 'dumi';

export default defineConfig({
  outputPath: 'docs-dist',
  title: 'AgenticUI',
  mfsu: false,
  themeConfig: {
    logo: 'https://mdn.alipayobjects.com/huamei_ptjqan/afts/img/A*ObqVQoMht3oAAAAARuAAAAgAekN6AQ/fmt.webp',
    name: 'AgenticUI',
  },
  favicons: [
    'https://mdn.alipayobjects.com/huamei_ptjqan/afts/img/A*ObqVQoMht3oAAAAARuAAAAgAekN6AQ/original',
  ],
  resolve: {
    docDirs: ['docs', 'src/schema'],
  },
  chainWebpack(config: any) {
    // 确保静态资源可以被正确解析
    config.module
      .rule('svg')
      .test(/\.svg$/)
      .type('asset/resource');

    config.module
      .rule('images')
      .test(/\.(png|jpg|jpeg|gif|webp)$/)
      .type('asset/resource');
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
