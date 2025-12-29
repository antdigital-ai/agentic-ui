import { useCallback, useContext } from 'react';
import { I18nContext } from '../I18n';

/**
 * useLanguage Hook - 语言切换 Hook
 *
 * 该 Hook 提供语言切换的便捷接口，包括当前语言状态、切换语言方法等。
 * 自动与 Ant Design ConfigProvider 和浏览器语言设置同步。
 *
 * @description 语言切换 Hook，提供语言状态和切换方法
 * @returns {Object} 语言相关的状态和方法
 * @returns {string} returns.language - 当前语言 ('zh-CN' | 'en-US')
 * @returns {Object} returns.locale - 当前语言的标签对象
 * @returns {Function} returns.setLanguage - 切换语言的方法
 * @returns {Function} returns.toggleLanguage - 切换中英文的方法
 * @returns {boolean} returns.isChinese - 是否为中文
 * @returns {boolean} returns.isEnglish - 是否为英文
 *
 * @example
 * ```tsx
 * const { language, locale, setLanguage, toggleLanguage, isChinese } = useLanguage();
 *
 * // 切换到英文
 * setLanguage('en-US');
 *
 * // 切换中英文
 * toggleLanguage();
 *
 * // 根据语言显示不同内容
 * return (
 *   <div>
 *     {isChinese ? '中文内容' : 'English Content'}
 *     <button onClick={toggleLanguage}>
 *       {locale.switchLanguage}
 *     </button>
 *   </div>
 * );
 * ```
 *
 * @remarks
 * - 必须在 I18nProvide 组件内部使用
 * - 自动与 Ant Design ConfigProvider 同步
 * - 支持 localStorage 持久化
 * - 提供便捷的语言判断方法
 */
export function useLanguage() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useLanguage must be used within I18nProvide');
  }

  const { language, locale, setLanguage } = context;

  // 切换中英文的方法
  const toggleLanguage = useCallback(() => {
    const newLanguage = language === 'zh-CN' ? 'en-US' : 'zh-CN';
    setLanguage?.(newLanguage);
  }, [language, setLanguage]);

  // 语言判断方法
  const isChinese = language === 'zh-CN';
  const isEnglish = language === 'en-US';

  return {
    language,
    locale,
    setLanguage,
    toggleLanguage,
    isChinese,
    isEnglish,
  };
}

export default useLanguage;
