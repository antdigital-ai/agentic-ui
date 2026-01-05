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
