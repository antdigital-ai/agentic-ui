/**
 * @file Schema 组件模块导出
 *
 * 该文件导出基于 Schema 的低代码组件。
 * 所有组件的详细文档请参考各自的组件定义文件。
 */

import { SchemaEditor } from './SchemaEditor';
import { SchemaForm } from './SchemaForm';
import { SchemaRenderer, TemplateEngine } from './SchemaRenderer';
import {
  CardRenderersContext,
  useCardRenderers,
} from './SchemaRenderer/CardRenderersContext';
import { SchemaValidator, mdDataSchemaValidator } from './validator';

export type { LowCodeSchema } from './types';
export type {
  CardRenderer,
  CardRenderers,
} from './SchemaRenderer/CardRenderersContext';

// 导出组件类型
export type { SchemaEditorProps, SchemaEditorRef } from './SchemaEditor';
export type { SchemaFormProps } from './SchemaForm';

export {
  CardRenderersContext,
  SchemaEditor,
  SchemaForm,
  SchemaRenderer,
  SchemaValidator,
  TemplateEngine,
  useCardRenderers,
  mdDataSchemaValidator as validator,
};
