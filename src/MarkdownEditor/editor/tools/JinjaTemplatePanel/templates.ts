import type { JinjaTemplateItem } from '../../../types';

/** 内置 Jinja 模板数据，与 agent-ui-pc JinjaTemplateData 文案一致 */
export const JINJA_TEMPLATE_DATA: JinjaTemplateItem[] = [
  {
    title: '变量插值',
    description: '{{ variable }}',
    template: '{{ }}',
  },
  {
    title: '条件语句',
    description: '{% if condition %}...{% endif %}',
    template: '{% if  %}\n  \n{% endif %}',
  },
  {
    title: '循环遍历',
    description: '{% for item in list %}...{% endfor %}',
    template: '{% for  in  %}\n  \n{% endfor %}',
  },
  {
    title: '过滤器',
    description: '{{ value | filter }}',
    template: '{{  | }}',
  },
  {
    title: '设置变量',
    description: '{% set name = value %}',
    template: '{% set  =  %}',
  },
];

/** 默认使用说明链接，未配置 jinja.docLink 时使用 */
export const JINJA_DOC_LINK = 'https://jinja.palletsprojects.com/';
