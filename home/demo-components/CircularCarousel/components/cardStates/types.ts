export interface FeatureItem {
  id: string;
  label: string; // Used in the menu (e.g. "01.精准预期")
  title: string | string[]; // Main title in card (e.g. "01. 精准预期" or ["第一行", "第二行"])
  description: string;
  subFeatures: string[];
  color: string;
}

// Re-export FeatureItem type; FEATURES data is now language-aware,
// use useFeatures() hook from '../../data' instead of a static import.
export { useFeatures } from '../../data';
