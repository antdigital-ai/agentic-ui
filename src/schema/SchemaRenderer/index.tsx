import { merge } from 'lodash-es';
import Mustache from 'mustache';
import React, {
  Component,
  ErrorInfo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import partialParse from '../../MarkdownEditor/editor/parser/json-parse';
import {
  createSandbox,
  DEFAULT_SANDBOX_CONFIG,
  ProxySandbox,
} from '../../utils/proxySandbox';
import { LowCodeSchema } from '../types';
import { mdDataSchemaValidator } from '../validator';
import { TemplateEngine } from './templateEngine';
export * from './templateEngine';

/**
 * 创建沙箱实例
 */
const createSandboxInstance = (sandboxConfig: any): ProxySandbox => {
  return createSandbox({
    ...DEFAULT_SANDBOX_CONFIG,
    allowDOM: sandboxConfig.allowDOM ?? true,
    allowedGlobals:
      sandboxConfig.allowedGlobals || DEFAULT_SANDBOX_CONFIG.allowedGlobals,
    forbiddenGlobals:
      sandboxConfig.forbiddenGlobals || DEFAULT_SANDBOX_CONFIG.forbiddenGlobals,
    strictMode: sandboxConfig.strictMode ?? true,
    timeout: sandboxConfig.timeout || 3000,
  });
};

/**
 * 创建沙箱上下文
 */
const createSandboxContext = (
  shadowRoot: ShadowRoot | null,
): Record<string, any> => {
  return {
    shadowRoot: shadowRoot,
    safeWindow: {
      devicePixelRatio:
        typeof window !== 'undefined' ? window.devicePixelRatio : 1,
      innerWidth: typeof window !== 'undefined' ? window.innerWidth : 1024,
      innerHeight: typeof window !== 'undefined' ? window.innerHeight : 768,
    },
  };
};

/**
 * 执行不安全的脚本（沙箱禁用时）
 */
const executeUnsafeScript = (
  script: HTMLScriptElement,
  shadowRoot: ShadowRoot | null,
): void => {
  console.warn('沙箱已禁用，使用不安全的脚本执行方式');

  const scriptFn = new Function(
    'shadowRoot',
    'window',
    script.textContent || '',
  );

  try {
    scriptFn(shadowRoot, {
      devicePixelRatio: window.devicePixelRatio,
    });
  } catch (evalError) {
    console.error('执行脚本错误:', evalError);
  }
};

/**
 * 执行外部脚本
 */
const executeExternalScript = (
  script: HTMLScriptElement,
  shadowRoot: ShadowRoot | null,
): void => {
  console.warn('外部脚本暂时不通过沙箱执行:', script.src);

  try {
    shadowRoot?.appendChild(script);
  } catch (appendError) {
    console.error('Error appending external script:', appendError);
  }
};

/**
 * 在沙箱中执行脚本
 */
const executeSandboxedScript = async (
  script: HTMLScriptElement,
  shadowRoot: ShadowRoot | null,
  sandboxConfig: any,
): Promise<void> => {
  const sandbox = createSandboxInstance(sandboxConfig);

  try {
    const result = await sandbox.execute(
      script.textContent || '',
      createSandboxContext(shadowRoot),
    );

    if (!result.success && result.error) {
      console.error('沙箱脚本执行错误:', result.error);
    }
  } catch (evalError) {
    console.error('沙箱执行失败:', evalError);
  } finally {
    sandbox.destroy();
  }
};

/**
 * 执行内联脚本
 */
const executeInlineScript = async (
  script: HTMLScriptElement,
  shadowRoot: ShadowRoot | null,
  sandboxConfig: any,
): Promise<void> => {
  if (!sandboxConfig.enabled) {
    executeUnsafeScript(script, shadowRoot);
    return;
  }

  await executeSandboxedScript(script, shadowRoot, sandboxConfig);
};

/**
 * 执行脚本（内联或外部）
 */
const executeScript = async (
  script: HTMLScriptElement,
  shadowRoot: ShadowRoot | null,
  sandboxConfig: any,
): Promise<void> => {
  try {
    if (!script.src && script.textContent) {
      await executeInlineScript(script, shadowRoot, sandboxConfig);
      return;
    }

    if (script.src) {
      executeExternalScript(script, shadowRoot);
    }
  } catch (scriptError) {
    console.error('Script execution error:', scriptError);
  }
};

/**
 * ErrorBoundary 组件 - 错误边界组件
 *
 * 用于捕获SchemaRenderer渲染过程中的错误，提供错误处理和回退显示。
 *
 * @component
 * @description 错误边界组件，捕获渲染错误并提供回退显示
 */
class ErrorBoundary extends Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SchemaRenderer error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div
          style={{
            padding: '10px',
            border: '1px solid #f5c2c7',
            borderRadius: '4px',
            background: '#f8d7da',
            color: '#842029',
          }}
        >
          <p>Something went wrong rendering this component.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export interface SchemaRendererProps {
  schema: LowCodeSchema;
  values: Record<string, any>;
  config?: {
    ALLOWED_TAGS?: string[];
    ALLOWED_ATTR?: string[];
  };
  fallbackContent?: React.ReactNode;
  useDefaultValues?: boolean;
  debug?: boolean;
  onRenderSuccess?: (html: string) => void;
  /** 沙箱配置 */
  sandboxConfig?: {
    /** 是否启用沙箱模式 */
    enabled?: boolean;
    /** 允许的全局对象列表 */
    allowedGlobals?: string[];
    /** 禁止的全局对象列表 */
    forbiddenGlobals?: string[];
    /** 是否允许访问 DOM */
    allowDOM?: boolean;
    /** 执行超时时间（毫秒） */
    timeout?: number;
    /** 是否启用严格模式 */
    strictMode?: boolean;
  };
}

/**
 * SchemaRenderer 组件 - Schema渲染器组件
 *
 * 该组件根据JSON Schema和模板引擎渲染动态内容，支持模板语法、数据验证、错误处理等。
 * 提供安全的内容渲染、模板解析、错误边界等功能。
 *
 * @component
 * @description Schema渲染器组件，根据Schema和模板渲染动态内容
 * @param {SchemaRendererProps} props - 组件属性
 * @param {LowCodeSchema} props.schema - 渲染Schema定义
 * @param {Record<string, any>} props.values - 渲染数据值
 * @param {Object} [props.config] - 渲染配置
 * @param {string[]} [props.config.ALLOWED_TAGS] - 允许的HTML标签
 * @param {string[]} [props.config.ALLOWED_ATTR] - 允许的HTML属性
 * @param {React.ReactNode} [props.fallbackContent] - 回退内容
 * @param {boolean} [props.useDefaultValues=true] - 是否使用默认值
 * @param {boolean} [props.debug=true] - 是否启用调试模式
 *
 * @example
 * ```tsx
 * <SchemaRenderer
 *   schema={{
 *     component: {
 *       type: 'div',
 *       template: '<h1>{{title}}</h1><p>{{content}}</p>'
 *     }
 *   }}
 *   values={{
 *     title: '欢迎',
 *     content: '这是一个动态渲染的内容'
 *   }}
 *   config={{
 *     ALLOWED_TAGS: ['h1', 'p', 'div'],
 *     ALLOWED_ATTR: ['class', 'style']
 *   }}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的动态内容组件
 *
 * @remarks
 * - 根据Schema和模板引擎渲染内容
 * - 支持Mustache模板语法
 * - 提供数据验证功能
 * - 包含错误边界处理
 * - 支持安全的内容渲染
 * - 提供调试模式
 * - 支持默认值处理
 * - 响应式布局适配
 */
export const SchemaRenderer: React.FC<SchemaRendererProps> = ({
  schema,
  values,
  config,
  fallbackContent,
  debug = true,
  useDefaultValues = true,
  onRenderSuccess,
  sandboxConfig = {
    enabled: true,
    allowDOM: true,
    timeout: 3000,
    strictMode: true,
  },
}) => {
  const [renderError, setRenderError] = useState<string | null>(null);

  // 安全地获取 schema 属性
  const safeSchema = schema || {};
  const safeComponent = safeSchema.component || {};

  const initialValues = safeSchema.initialValues || {};

  // 验证 schema
  const validationResult = useMemo(() => {
    try {
      return mdDataSchemaValidator.validate(safeSchema);
    } catch (error) {
      console.error('Schema validation error:', error);
      return {
        valid: false,
        errors: [{ message: 'Schema validation failed' }],
      };
    }
  }, [safeSchema]);

  // 从 schema 中提取数据和模板
  const { properties = {}, type = 'html' } = safeComponent;
  const templateHtml = safeComponent.schema || '';

  // 准备模板数据
  const templateData = useMemo(() => {
    try {
      const defaultValues = useDefaultValues
        ? Object.entries(properties || {}).reduce(
            (data, [key, value]) => {
              if (value && 'default' in value) {
                data[key] = value.default;
              }
              return data;
            },
            {} as Record<string, any>,
          )
        : {};

      // 先合并 values
      const mergedData = merge(
        defaultValues,
        initialValues || {},
        values || {},
      );

      // 类型转换：如果 properties 定义为 array/object，但 values 里是 string，则尝试转换
      Object.entries(properties || {}).forEach(([key, property]) => {
        const val = mergedData[key];
        if (property.type === 'array' && typeof val === 'string') {
          try {
            // 尝试 JSON.parse，否则用逗号分割
            mergedData[key] = partialParse(val);
            if (!Array.isArray(mergedData[key])) {
              mergedData[key] = val.split(',').map((s) => s.trim());
            }
          } catch {
            mergedData[key] = val.split(',').map((s) => s.trim());
          }
        }
        if (property.type === 'object' && typeof val === 'string') {
          try {
            try {
              mergedData[key] = partialParse(val);
            } catch (error) {
              mergedData[key] = val;
            }
          } catch {
            mergedData[key] = {};
          }
        }
      });

      // 添加 fallback 值：如果数据在 properties 定义但是 mergedData 中没有
      const dataWithFallbacks = { ...mergedData };

      Object.entries(properties || {}).forEach(([key, property]) => {
        if (
          !(key in dataWithFallbacks) ||
          dataWithFallbacks[key] === undefined ||
          dataWithFallbacks[key] === null
        ) {
          switch (property.type) {
            case 'array':
              dataWithFallbacks[key] = [];
              break;
            case 'string':
              dataWithFallbacks[key] = '-';
              break;
            case 'number':
              dataWithFallbacks[key] = '-';
              break;
            case 'object':
              dataWithFallbacks[key] = {};
              break;
            default:
              dataWithFallbacks[key] = '-';
              break;
          }
        }
      });

      return dataWithFallbacks;
    } catch (error) {
      console.error('Error preparing template data:', error);
      return values || {};
    }
  }, [properties, values, useDefaultValues, initialValues]);

  // 使用模板引擎渲染
  const renderedHtml = useMemo(() => {
    try {
      if (type === 'html') {
        return TemplateEngine.render(templateHtml, templateData);
      }
      if (type === 'mustache') {
        return Mustache.render(templateHtml, templateData);
      }
      return templateHtml;
    } catch (error) {
      console.error('模板渲染错误:', error);
      setRenderError(
        `Template rendering error: ${error instanceof Error ? error.message : String(error)}`,
      );
      return '';
    }
  }, [templateHtml, templateData, type, config]);

  // 应用主题样式
  const containerStyle = useMemo(() => {
    try {
      const safeTheme = safeSchema.theme || {};
      const safeTypography = safeTheme.typography || {};
      const safeSpacing = safeTheme.spacing || {};

      return {
        fontFamily: safeTypography.fontFamily,
        fontSize: `${safeTypography.fontSizes?.[2] ?? '14'}px`,
        lineHeight: safeTypography.lineHeights?.normal ?? 1.6,
        width: safeSpacing.width ?? 'max-content',
        margin: '1em',
      };
    } catch (error) {
      console.error('Error applying theme styles:', error);
      return {
        fontSize: '13px',
        lineHeight: 1.6,
        width: 'max-content',
      };
    }
  }, [safeSchema.theme]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !renderedHtml) return;
    try {
      // 获取或创建Shadow DOM
      let shadowRoot = containerRef.current.shadowRoot;

      if (!shadowRoot) {
        try {
          shadowRoot = containerRef.current.attachShadow({ mode: 'open' });
        } catch (error) {
          console.error('Failed to create shadow root:', error);
          // Fallback to direct innerHTML if shadow DOM is not supported
          containerRef.current.innerHTML = renderedHtml;
          return;
        }
      }

      // 创建一个临时容器来解析HTML
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = renderedHtml;
      // 清空shadowRoot内容
      shadowRoot.innerHTML = '';

      // 添加样式
      try {
        const style = document.createElement('style');
        const safeTheme = safeSchema.theme || {};
        const safeTypography = safeTheme.typography || {};
        style.innerHTML = `
:host {
  display: block;
  font-family: ${safeTypography.fontFamily || 'inherit'};
  font-size: ${safeTypography.fontSizes?.[2] ?? '14'}px;
  line-height: ${safeTypography.lineHeights?.normal ?? 1.6};
}
html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed, 
figure, figcaption, footer, header, hgroup, 
menu, nav, output, ruby, section, summary,
time, mark, audio, video {
	margin: 0;
	padding: 0;
	border: 0;
	font-size: 100%;
	font: inherit;
	vertical-align: baseline;
}
/* HTML5 display-role reset for older browsers */
article, aside, details, figcaption, figure, 
footer, header, hgroup, menu, nav, section {
	display: block;
}
body {
	line-height: 1;
}
ol, ul {
	list-style: none;
}
blockquote, q {
	quotes: none;
}
blockquote:before, blockquote:after,
q:before, q:after {
	content: '';
	content: none;
}
table {
	border-collapse: collapse;
	border-spacing: 0;
}
div {
  white-space: normal;
  overflow-wrap: normal;
}

a {
  text-decoration: none;
  white-space: normal;
  overflow-wrap: normal;
}

a:hover {
  text-decoration: underline;
}

a:visited {
  color: inherit;
}

a:active {
  color: inherit;
}

        `;
        shadowRoot.appendChild(style);
      } catch (styleError) {
        console.error('Error applying styles:', styleError);
      }

      try {
        // 提取所有的script标签
        const scripts: HTMLScriptElement[] = [];
        const scriptElements = tempContainer.querySelectorAll('script');

        scriptElements.forEach((oldScript) => {
          try {
            // 移除原始script标签
            oldScript.parentNode?.removeChild(oldScript);

            // 创建新的script标签
            const newScript = document.createElement('script');

            // 复制属性
            Array.from(oldScript.attributes).forEach((attr) => {
              newScript.setAttribute(attr.name, attr.value);
            });

            // 复制内容
            newScript.textContent = oldScript.textContent;
            scripts.push(newScript);
          } catch (scriptError) {
            console.error('Error processing script:', scriptError);
          }
        });

        // 将其他内容添加到Shadow DOM
        Array.from(tempContainer.childNodes).forEach((node) => {
          try {
            shadowRoot?.appendChild(node.cloneNode(true));
          } catch (nodeError) {
            console.error('Error appending node:', nodeError);
          }
        });

        // 添加并执行脚本
        scripts.forEach(async (script) => {
          await executeScript(script, shadowRoot, sandboxConfig);
        });
      } catch (contentError) {
        console.error('Error processing content:', contentError);
        // Fallback - at least show the HTML content
        try {
          shadowRoot.innerHTML = renderedHtml;
        } catch (fallbackError) {
          console.error('Even fallback rendering failed:', fallbackError);
        }
      }

      onRenderSuccess?.(renderedHtml);
    } catch (error) {
      console.error('Critical rendering error:', error);
      setRenderError(
        `Critical rendering error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }, [renderedHtml, safeSchema.theme]);

  // 如果渲染过程中出现错误，显示错误信息
  if (renderError && debug) {
    return (
      fallbackContent || (
        <div
          style={{
            padding: '16px',
            border: '1px solid #f5c2c7',
            borderRadius: '8px',
            background: '#f8d7da',
            color: '#842029',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            margin: '10px 0',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ marginRight: '8px' }}
            >
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="#842029"
                strokeWidth="2"
              />
              <path
                d="M12 8V12"
                stroke="#842029"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="12" cy="16" r="1" fill="#842029" />
            </svg>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
              渲染错误
            </h3>
          </div>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              background: 'rgba(255,255,255,0.5)',
              padding: '8px',
              borderRadius: '4px',
              fontSize: '13px',
              margin: 0,
            }}
          >
            {renderError}
          </pre>
        </div>
      )
    );
  }

  // Schema 验证失败，显示错误信息
  if (!validationResult?.valid && debug) {
    console.error('Schema validation failed:', validationResult.errors);

    return (
      fallbackContent || (
        <div
          style={{
            padding: '16px',
            border: '1px solid #f5c2c7',
            borderRadius: '8px',
            background: '#f8d7da',
            color: '#842029',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            margin: '10px 0',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ marginRight: '8px' }}
            >
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="#842029"
                strokeWidth="2"
              />
              <path
                d="M12 8V12"
                stroke="#842029"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="12" cy="16" r="1" fill="#842029" />
            </svg>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
              Schema 验证失败
            </h3>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.5)',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '13px',
            }}
          >
            {Array.isArray(validationResult.errors) ? (
              <ul
                style={{
                  margin: '0',
                  paddingLeft: '20px',
                  listStyleType: 'circle',
                }}
              >
                {validationResult.errors.map((error: any, index) => (
                  <li key={index} style={{ marginBottom: '8px' }}>
                    <div style={{ fontWeight: 500 }}>
                      {error.property || error.path ? (
                        <span style={{ color: '#d63939' }}>
                          {(error.property || error.path)
                            .toString()
                            .replace('instance.', '')}
                          :
                        </span>
                      ) : null}
                      <span
                        style={{
                          marginLeft:
                            error.property || error.path ? '4px' : '0',
                        }}
                      >
                        {error.message}
                      </span>
                    </div>
                    {error.schema ? (
                      <div
                        style={{
                          fontSize: '13px',
                          color: '#5c636a',
                          marginTop: '4px',
                          paddingLeft: '12px',
                        }}
                      >
                        预期: {JSON.stringify(error.schema)}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                {JSON.stringify(validationResult.errors, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )
    );
  }

  return (
    <ErrorBoundary fallback={fallbackContent}>
      <div
        ref={containerRef}
        className="schemaRenderer"
        data-testid="schema-renderer"
        style={containerStyle}
      />
    </ErrorBoundary>
  );
};
