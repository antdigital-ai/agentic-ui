import { useSiteI18n } from '../../i18n';
import type { SiteMessages } from '../../i18n/locales';
import { FeatureItem } from './components/cardStates/types';

/** 根据当前语言构建特性卡片数据 */
const buildFeatures = (messages: SiteMessages): FeatureItem[] => {
  const { features } = messages;
  return [
    {
      id: 'intro',
      label: features.intro.label,
      title: [...features.intro.title],
      description: features.intro.description,
      subFeatures: [...features.intro.subFeatures],
      color: '68, 47, 107',
    },
    {
      id: '01',
      label: features.f01.label,
      title: [...features.f01.title],
      description: features.f01.description,
      subFeatures: [...features.f01.subFeatures],
      color: '91, 59, 159',
    },
    {
      id: '02',
      label: features.f02.label,
      title: [...features.f02.title],
      description: features.f02.description,
      subFeatures: [...features.f02.subFeatures],
      color: '0, 130, 133',
    },
    {
      id: '03',
      label: features.f03.label,
      title: [...features.f03.title],
      description: features.f03.description,
      subFeatures: [...features.f03.subFeatures],
      color: '0, 179, 0',
    },
    {
      id: '04',
      label: features.f04.label,
      title: [...features.f04.title],
      description: features.f04.description,
      subFeatures: [...features.f04.subFeatures],
      color: '0, 92, 157',
    },
    {
      id: '05',
      label: features.f05.label,
      title: [...features.f05.title],
      description: features.f05.description,
      subFeatures: [...features.f05.subFeatures],
      color: '204, 153, 0',
    },
  ];
};

/** 在组件内使用：随语言切换重建 FEATURES */
export function useFeatures(): FeatureItem[] {
  const { messages } = useSiteI18n();
  return buildFeatures(messages);
}

export { buildFeatures };
