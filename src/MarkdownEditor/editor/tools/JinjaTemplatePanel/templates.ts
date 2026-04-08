import type { LocalKeys } from '../../../../I18n';
import { cnLabels } from '../../../../I18n';
import type { JinjaTemplateItem } from '../../../types';

const JINJA_TEMPLATE_IDS = [
  'variableInterpolation',
  'condition',
  'loop',
  'filter',
  'setVariable',
] as const;

/** 内置 Jinja 模板基础数据（不含 i18n 文案） */
export const JINJA_TEMPLATE_BASE: {
  id: (typeof JINJA_TEMPLATE_IDS)[number];
  template: string;
}[] = [
  { id: 'variableInterpolation', template: '{{ }}' },
  { id: 'condition', template: '{% if  %}\n  \n{% endif %}' },
  { id: 'loop', template: '{% for  in  %}\n  \n{% endfor %}' },
  { id: 'filter', template: '{{  | }}' },
  { id: 'setVariable', template: '{% set  =  %}' },
];

/**
 * 根据 locale 生成带国际化文案的 Jinja 模板列表
 */
export function getJinjaTemplateData(locale: LocalKeys): JinjaTemplateItem[] {
  return JINJA_TEMPLATE_BASE.map(({ id, template }) => {
    const titleKey = `jinja.template.${id}.title` as keyof LocalKeys;
    const descKey = `jinja.template.${id}.description` as keyof LocalKeys;
    return {
      title: (locale[titleKey] as string) ?? id,
      description: (locale[descKey] as string) ?? undefined,
      template,
    };
  });
}

/** 内置 Jinja 模板数据（默认中文），与 agent-ui-pc JinjaTemplateData 文案一致 */
export const JINJA_TEMPLATE_DATA: JinjaTemplateItem[] =
  getJinjaTemplateData(cnLabels);

/** 默认使用说明链接，未配置 jinja.docLink 时使用 */
export const JINJA_DOC_LINK = 'https://jinja.palletsprojects.com/';
