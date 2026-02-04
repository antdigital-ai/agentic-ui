import type { MermaidApi } from './types';

let mermaidLoader: Promise<MermaidApi> | null = null;

/**
 * 加载 Mermaid 库
 * 使用单例模式确保只加载一次，并初始化配置
 */
export const loadMermaid = async (): Promise<MermaidApi> => {
  if (typeof window === 'undefined') {
    throw new Error('Mermaid 仅在浏览器环境中可用');
  }

  if (!mermaidLoader) {
    // 使用 webpack 魔法注释确保正确代码分割和解析
    // webpackChunkName 指定 chunk 名称，webpackMode 指定加载模式
    mermaidLoader = import(
      /* webpackChunkName: "mermaid" */
      /* webpackMode: "lazy" */
      'mermaid'
    )
      .then((module) => {
        const api = module.default;
        if (api?.initialize) {
          api.initialize({ startOnLoad: false });
        }
        return api;
      })
      .catch((error) => {
        mermaidLoader = null;
        throw error;
      });
  }

  return mermaidLoader;
};

/**
 * 渲染 SVG 到容器
 */
export const renderSvgToContainer = (
  svg: string,
  container: HTMLDivElement,
): void => {
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.setAttribute('data-mermaid-wrapper', 'true');
  wrapper.style.display = 'flex';
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svg, 'image/svg+xml');
  const svgElement = svgDoc.querySelector('svg');

  if (svgElement) {
    const existingStyle = svgElement.getAttribute('style') || '';
    const newStyle =
      `${existingStyle}; max-width: 100%; height: auto; overflow: hidden;`.trim();
    svgElement.setAttribute('style', newStyle);
    svgElement.setAttribute('data-mermaid-svg', 'true');
    svgElement.setAttribute(
      'class',
      (svgElement.getAttribute('class') || '') + ' mermaid-isolated',
    );

    const allElements = svgElement.querySelectorAll('*');
    allElements.forEach((el) => {
      if (el instanceof SVGElement) {
        el.setAttribute('data-mermaid-internal', 'true');
      }
    });

    wrapper.appendChild(svgElement);
  } else {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = svg;
    const extractedSvg = tempDiv.querySelector('svg');
    if (extractedSvg) {
      extractedSvg.setAttribute(
        'style',
        'max-width: 100%; height: auto; overflow: hidden;',
      );
      extractedSvg.setAttribute('data-mermaid-svg', 'true');
      wrapper.appendChild(extractedSvg);
    } else {
      wrapper.innerHTML = svg;
    }
  }

  container.appendChild(wrapper);
};

/**
 * 清理 Mermaid 生成的临时元素
 */
export const cleanupTempElement = (id: string): void => {
  const tempElement = document.querySelector('#d' + id);
  if (tempElement) {
    tempElement.classList.add('hidden');
    try {
      if (tempElement.parentNode) {
        tempElement.parentNode.removeChild(tempElement);
      }
    } catch (e) {
      // 忽略移除失败
    }
  }
};
