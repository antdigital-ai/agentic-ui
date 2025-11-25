import { CircleDashed, Copy, Play } from '@sofa-design/icons';
import { Button, ConfigProvider, message } from 'antd';
import classNames from 'classnames';
import copy from 'copy-to-clipboard';
import React, {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { I18nContext } from '../../I18n';
import { SchemaRenderer } from '../SchemaRenderer';
import { LowCodeSchema } from '../types';
import { mdDataSchemaValidator } from '../validator';
import { AceEditorWrapper } from './AceEditorWrapper';
import { useStyle } from './style';

export interface SchemaEditorProps {
  /** 初始schema数据 */
  initialSchema?: LowCodeSchema;
  /** 初始值 */
  initialValues?: Record<string, any>;
  /** 编辑器高度 */
  height?: number | string;
  /** 是否只读 */
  readonly?: boolean;
  /** 变更回调 */
  onChange?: (schema: LowCodeSchema, values: Record<string, any>) => void;
  /** 错误回调 */
  onError?: (error: Error) => void;
  /** 自定义样式 */
  className?: string;
  /** 是否显示预览 */
  showPreview?: boolean;
  /** 预览配置 */
  previewConfig?: {
    ALLOWED_TAGS?: string[];
    ALLOWED_ATTR?: string[];
  };
  /** 自定义操作按钮，插入到 HTML 编辑器头部按钮区域 */
  htmlActions?: React.ReactNode[];
}

export interface SchemaEditorRef {
  /** 设置 Schema 数据 */
  setSchema: (schema: LowCodeSchema) => void;
  /** 设置 HTML 模板内容 */
  setHtmlContent: (html: string) => void;
  /** 设置 Schema JSON 字符串 */
  setSchemaString: (jsonString: string) => void;
  /** 获取当前 Schema 数据 */
  getSchema: () => LowCodeSchema;
  /** 获取当前 HTML 模板内容 */
  getHtmlContent: () => string;
  /** 获取当前 Schema JSON 字符串 */
  getSchemaString: () => string;
  /** 运行预览 */
  run: () => void;
  /** 复制 HTML 内容 */
  copyHtml: () => void;
  /** 复制 JSON 内容 */
  copyJson: () => void;
}

/**
 * Schema编辑器组件
 *
 * 提供schema的实时编辑和预览功能，底层使用AceEditor编辑schema中的HTML内容
 */
const SchemaEditorComponent = forwardRef<SchemaEditorRef, SchemaEditorProps>(
  (
    {
      initialSchema,
      initialValues = {},
      height = 600,
      readonly = false,
      onChange,
      className = '',
      showPreview = true,
      previewConfig,
      htmlActions,
    },
    ref,
  ) => {
    // 使用 ConfigProvider 获取前缀类名
    const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
    const prefixCls = getPrefixCls('schema-editor');
    const { wrapSSR, hashId } = useStyle(prefixCls);
    const { locale } = useContext(I18nContext);
    const [schema, setSchema] = useState<LowCodeSchema>(() => {
      return (
        initialSchema || {
          version: '1.0.0',
          name: locale['schemaEditor.untitledSchema'],
          description: '',
          component: {
            type: 'html',
            schema: '<div>Hello World</div>',
          },
        }
      );
    });

    const [values, setValues] = useState<Record<string, any>>(
      initialValues || {},
    );
    const [schemaString, setSchemaString] = useState<string>('');
    const [htmlContent, setHtmlContent] = useState<string>('');
    const [validationError, setValidationError] = useState<string>('');
    const [renderedSchema, setRenderedSchema] = useState<LowCodeSchema>(
      {} as LowCodeSchema,
    );
    const [isSchemaRendered, setIsSchemaRendered] = useState<boolean>(false);

    // 使用 ref 存储最新值，确保 ref 方法能立即获取到最新状态
    const schemaRef = React.useRef<LowCodeSchema>(schema);
    const htmlContentRef = React.useRef<string>(htmlContent);
    const schemaStringRef = React.useRef<string>(schemaString);

    // 同步更新 ref 值
    React.useEffect(() => {
      schemaRef.current = schema;
    }, [schema]);

    React.useEffect(() => {
      htmlContentRef.current = htmlContent;
    }, [htmlContent]);

    React.useEffect(() => {
      schemaStringRef.current = schemaString;
    }, [schemaString]);

    // 将schema转换为JSON字符串
    const schemaToJson = useCallback(
      (schemaData: LowCodeSchema): string => {
        try {
          return JSON.stringify(schemaData, null, 2);
        } catch (error) {
          console.error(locale['schemaEditor.schemaSerializationError'], error);
          return '{}';
        }
      },
      [locale],
    );

    // 将JSON字符串转换为schema对象
    const jsonToSchema = useCallback(
      (jsonString: string): LowCodeSchema | null => {
        try {
          return JSON.parse(jsonString);
        } catch (error) {
          console.error(locale['schemaEditor.schemaParseError'], error);
          return null;
        }
      },
      [locale],
    );

    // 初始化schema字符串
    useEffect(() => {
      const jsonString = schemaToJson(schema);
      const html = schema.component?.schema || '';
      setSchemaString(jsonString);
      setHtmlContent(html);
      // 同步更新 ref 值
      schemaRef.current = schema;
      schemaStringRef.current = jsonString;
      htmlContentRef.current = html;
    }, [schema, schemaToJson]);

    // 验证schema
    const validateSchema = useCallback(
      (schemaData: LowCodeSchema): string => {
        try {
          const result = mdDataSchemaValidator.validate(schemaData);
          if (!result.valid) {
            return (
              result.errors?.map((err: any) => err.message).join(', ') ||
              locale['schemaEditor.validationFailed']
            );
          }
          return '';
        } catch (error) {
          return error instanceof Error
            ? error.message
            : locale['schemaEditor.validationFailed'];
        }
      },
      [locale],
    );

    // 处理schema变更
    const handleSchemaChange = useCallback(
      (newSchema: LowCodeSchema) => {
        setSchema(newSchema);
        setValidationError(validateSchema(newSchema));
        onChange?.(newSchema, values);
      },
      [values, onChange, validateSchema],
    );

    // 处理HTML内容变更
    const handleHtmlChange = useCallback(
      (newHtml: string) => {
        setHtmlContent(newHtml);
        htmlContentRef.current = newHtml;
        const newSchema = {
          ...schemaRef.current,
          component: {
            ...schemaRef.current.component,
            schema: newHtml,
          },
        };
        handleSchemaChange(newSchema);
      },
      [handleSchemaChange],
    );

    // 处理JSON编辑器变更
    const handleJsonChange = useCallback(
      (newJsonString: string) => {
        setSchemaString(newJsonString);
        schemaStringRef.current = newJsonString;
        const newSchema = jsonToSchema(newJsonString);
        if (newSchema) {
          const html = newSchema.component?.schema || '';
          handleSchemaChange(newSchema);
          setHtmlContent(html);
          htmlContentRef.current = html;
        }
      },
      [jsonToSchema, handleSchemaChange],
    );

    // 处理运行按钮点击
    const handleRunClick = useCallback(() => {
      const currentSchema = schemaRef.current;
      setRenderedSchema({ ...currentSchema });

      // 更新values状态，使用schema中的initialValues
      if (currentSchema.initialValues) {
        setValues(currentSchema.initialValues);
      }
      setIsSchemaRendered(true);
    }, []);

    // 复制函数
    const handleCopyContent = useCallback(
      (content: string, type: 'html' | 'json') => {
        if (!content || !content.trim()) {
          message.warning(locale['schemaEditor.noContentToCopy']);
          return;
        }

        try {
          const ok = copy(content);
          if (ok) {
            message.success(
              `${type === 'html' ? 'HTML' : 'JSON'}${locale['schemaEditor.copySuccess']}`,
            );
          } else {
            message.error(locale['schemaEditor.copyFailed']);
          }
        } catch (error) {
          message.error(locale['schemaEditor.copyFailed']);
          console.error(locale['schemaEditor.copyFailed'], error);
        }
      },
      [locale],
    );

    // 处理复制HTML内容
    const handleCopyHtml = useCallback(() => {
      handleCopyContent(htmlContent, 'html');
    }, [htmlContent, handleCopyContent]);

    // 处理复制JSON内容
    const handleCopyJson = useCallback(() => {
      handleCopyContent(schemaString, 'json');
    }, [schemaString, handleCopyContent]);

    // 暴露 ref 方法
    useImperativeHandle(
      ref,
      () => ({
        setSchema: (newSchema: LowCodeSchema) => {
          handleSchemaChange(newSchema);
          const newJsonString = schemaToJson(newSchema);
          setSchemaString(newJsonString);
          setHtmlContent(newSchema.component?.schema || '');
          // 立即更新 ref 值，确保 get 方法能立即获取到最新值
          schemaRef.current = newSchema;
          schemaStringRef.current = newJsonString;
          htmlContentRef.current = newSchema.component?.schema || '';
        },
        setHtmlContent: (newHtml: string) => {
          handleHtmlChange(newHtml);
          // 立即更新 ref 值
          htmlContentRef.current = newHtml;
        },
        setSchemaString: (newJsonString: string) => {
          handleJsonChange(newJsonString);
          // 立即更新 ref 值
          schemaStringRef.current = newJsonString;
          const newSchema = jsonToSchema(newJsonString);
          if (newSchema) {
            schemaRef.current = newSchema;
            htmlContentRef.current = newSchema.component?.schema || '';
          }
        },
        getSchema: () => schemaRef.current,
        getHtmlContent: () => htmlContentRef.current,
        getSchemaString: () => schemaStringRef.current,
        run: handleRunClick,
        copyHtml: handleCopyHtml,
        copyJson: handleCopyJson,
      }),
      [
        handleSchemaChange,
        handleHtmlChange,
        handleJsonChange,
        handleRunClick,
        handleCopyHtml,
        handleCopyJson,
        schemaToJson,
        jsonToSchema,
      ],
    );

    // 渲染预览区域
    const renderPreview = useMemo(() => {
      if (!showPreview) return null;

      return (
        <div className={classNames(`${prefixCls}-preview`, hashId)}>
          <div className={classNames(`${prefixCls}-preview-header`, hashId)}>
            <h3>{locale['schemaEditor.realtimePreview']}</h3>
            {validationError && (
              <div className={classNames(`${prefixCls}-error`, hashId)}>
                <span>⚠️ {validationError}</span>
              </div>
            )}
          </div>
          <div className={classNames(`${prefixCls}-preview-content`, hashId)}>
            {isSchemaRendered ? (
              <SchemaRenderer
                schema={renderedSchema}
                values={values}
                config={previewConfig}
                fallbackContent={
                  <div className={classNames(`${prefixCls}-fallback`, hashId)}>
                    <p>{locale['schemaEditor.previewLoadFailed']}</p>
                    <p>{locale['schemaEditor.checkSchemaFormat']}</p>
                  </div>
                }
              />
            ) : (
              <div
                className={classNames(
                  `${prefixCls}-preview-content-empty`,
                  hashId,
                )}
              >
                <CircleDashed style={{ width: 80, height: 80 }} />
                <p>{locale['schemaEditor.inputSchemaToPreview']}</p>
              </div>
            )}
          </div>
        </div>
      );
    }, [
      showPreview,
      isSchemaRendered,
      renderedSchema,
      values,
      validationError,
      previewConfig,
      hashId,
      locale,
      prefixCls,
    ]);

    // 渲染HTML编辑器
    const renderHtmlEditor = useMemo(() => {
      return (
        <div className={classNames(`${prefixCls}-html`, hashId)}>
          <div className={classNames(`${prefixCls}-html-header`, hashId)}>
            <h3>{locale['schemaEditor.htmlTemplate']}</h3>
            <div style={{ display: 'flex' }}>
              <Button
                type="text"
                icon={<Play style={{ width: 14, height: 14 }} />}
                onClick={handleRunClick}
              >
                {locale['schemaEditor.run']}
              </Button>
              <Button
                type="text"
                icon={<Copy style={{ width: 14, height: 14 }} />}
                onClick={handleCopyHtml}
              />
              {htmlActions}
            </div>
          </div>
          <div className={classNames(`${prefixCls}-html-content`, hashId)}>
            <AceEditorWrapper
              value={htmlContent}
              language="html"
              onChange={handleHtmlChange}
              readonly={readonly}
            />
          </div>
        </div>
      );
    }, [
      htmlContent,
      handleHtmlChange,
      readonly,
      hashId,
      locale,
      handleRunClick,
      handleCopyHtml,
      htmlActions,
      prefixCls,
    ]);

    // 渲染JSON编辑器
    const renderJsonEditor = useMemo(() => {
      return (
        <div className={classNames(`${prefixCls}-json`, hashId)}>
          <div className={classNames(`${prefixCls}-json-header`, hashId)}>
            <h3>{locale['schemaEditor.schemaJson']}</h3>
            <div style={{ display: 'flex' }}>
              <Button
                type="text"
                icon={<Copy style={{ width: 14, height: 14 }} />}
                onClick={handleCopyJson}
              />
            </div>
          </div>
          <div className={classNames(`${prefixCls}-json-content`, hashId)}>
            <AceEditorWrapper
              value={schemaString}
              language="json"
              onChange={handleJsonChange}
              readonly={readonly}
            />
          </div>
        </div>
      );
    }, [
      schemaString,
      handleJsonChange,
      readonly,
      hashId,
      locale,
      handleCopyJson,
      prefixCls,
    ]);

    return wrapSSR(
      <div
        className={classNames(prefixCls, className, hashId)}
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        <div className={classNames(`${prefixCls}-container`, hashId)}>
          <div className={classNames(`${prefixCls}-left`, hashId)}>
            {renderPreview}
          </div>
          <div className={classNames(`${prefixCls}-right`, hashId)}>
            {renderHtmlEditor}
            {renderJsonEditor}
          </div>
        </div>
      </div>,
    );
  },
);

SchemaEditorComponent.displayName = 'SchemaEditor';

export const SchemaEditor = SchemaEditorComponent;

export default SchemaEditor;
