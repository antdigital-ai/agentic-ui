/**
 * 语言检测工具函数集合
 *
 * 提供完整的语言检测、判断和转换功能，支持多种检测方式：
 * 1. 浏览器语言设置检测
 * 2. Ant Design ConfigProvider 的 locale 检测
 * 3. localStorage 中保存的用户选择检测
 * 4. 语言代码转换和标准化
 */

export type LanguageType = 'zh-CN' | 'en-US';

/**
 * 支持的语言类型
 */
export const SUPPORTED_LANGUAGES: LanguageType[] = ['zh-CN', 'en-US'];

/**
 * 语言映射配置
 */
export const LANGUAGE_MAP = {
  'zh-CN': {
    code: 'zh-CN',
    name: '简体中文',
    nativeName: '简体中文',
    flag: '🇨🇳',
    antdLocale: 'zh_CN',
  },
  'en-US': {
    code: 'en-US',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    antdLocale: 'en_US',
  },
} as const;

/**
 * 检测浏览器语言设置
 *
 * @returns 检测到的语言代码，如果无法检测则返回 null
 *
 * @example
 * ```ts
 * const browserLang = detectBrowserLanguage();
 * console.log(browserLang); // 'zh-CN' | 'en-US' | null
 * ```
 */
export function detectBrowserLanguage(): LanguageType | null {
  if (typeof navigator === 'undefined') {
    return null;
  }

  // 获取浏览器语言列表
  const browserLanguages = navigator.languages || [navigator.language];

  for (const lang of browserLanguages) {
    const langLower = lang.toLowerCase();

    // 检测中文
    if (langLower.startsWith('zh')) {
      return 'zh-CN';
    }

    // 检测英文
    if (langLower.startsWith('en')) {
      return 'en-US';
    }
  }

  return null;
}

/**
 * 检测 Ant Design ConfigProvider 的 locale
 *
 * @returns 检测到的语言代码，如果无法检测则返回 null
 *
 * @example
 * ```ts
 * const antdLang = detectAntdLocale();
 * console.log(antdLang); // 'zh-CN' | 'en-US' | null
 * ```
 */
export function detectAntdLocale(): LanguageType | null {
  if (typeof document === 'undefined') {
    return null;
  }

  try {
    // 尝试从 DOM 属性中获取 Ant Design locale
    const antdLocale = document
      .querySelector('[data-antd-locale]')
      ?.getAttribute('data-antd-locale');

    if (antdLocale) {
      const localeLower = antdLocale.toLowerCase();
      if (localeLower.includes('zh')) {
        return 'zh-CN';
      }
      if (localeLower.includes('en')) {
        return 'en-US';
      }
    }
  } catch (error) {
    // 忽略错误，继续其他检测方式
  }

  return null;
}

/**
 * 从 localStorage 中获取用户保存的语言选择
 *
 * @param key - localStorage 中的键名，默认为 'md-editor-language'
 * @returns 保存的语言代码，如果没有保存则返回 null
 *
 * @example
 * ```ts
 * const savedLang = getSavedLanguage();
 * console.log(savedLang); // 'zh-CN' | 'en-US' | null
 * ```
 */
export function getSavedLanguage(
  key: string = 'md-editor-language',
): LanguageType | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const savedLanguage = localStorage.getItem(key);
    if (
      savedLanguage &&
      SUPPORTED_LANGUAGES.includes(savedLanguage as LanguageType)
    ) {
      return savedLanguage as LanguageType;
    }
  } catch (error) {
    // 忽略 localStorage 访问错误
  }

  return null;
}

/**
 * 保存用户语言选择到 localStorage
 *
 * @param language - 要保存的语言代码
 * @param key - localStorage 中的键名，默认为 'md-editor-language'
 *
 * @example
 * ```ts
 * saveLanguage('en-US');
 * ```
 */
export function saveLanguage(
  language: LanguageType,
  key: string = 'md-editor-language',
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(key, language);
  } catch (error) {
    // 忽略 localStorage 访问错误
    console.warn('Failed to save language preference:', error);
  }
}

/**
 * 智能语言检测
 *
 * 按优先级检测用户语言偏好：
 * 1. localStorage 中保存的用户选择
 * 2. Ant Design ConfigProvider 的 locale
 * 3. 浏览器语言设置
 * 4. 默认语言
 *
 * @param defaultLanguage - 默认语言，当所有检测方式都失败时使用
 * @returns 检测到的语言代码
 *
 * @example
 * ```ts
 * const detectedLang = detectUserLanguage();
 * console.log(detectedLang); // 'zh-CN' | 'en-US'
 *
 * // 指定默认语言
 * const lang = detectUserLanguage('en-US');
 * ```
 */
export function detectUserLanguage(
  defaultLanguage: LanguageType = 'zh-CN',
): LanguageType {
  // 1. 检查 localStorage 中保存的用户选择
  const savedLanguage = getSavedLanguage();
  if (savedLanguage) {
    return savedLanguage;
  }

  // 2. 检查 Ant Design ConfigProvider 的 locale
  const antdLanguage = detectAntdLocale();
  if (antdLanguage) {
    return antdLanguage;
  }

  // 3. 检测浏览器语言
  const browserLanguage = detectBrowserLanguage();
  if (browserLanguage) {
    return browserLanguage;
  }

  // 4. 返回默认语言
  return defaultLanguage;
}

/**
 * 验证语言代码是否有效
 *
 * @param language - 要验证的语言代码
 * @returns 是否为有效的语言代码
 *
 * @example
 * ```ts
 * isValidLanguage('zh-CN'); // true
 * isValidLanguage('fr-FR'); // false
 * ```
 */
export function isValidLanguage(language: string): language is LanguageType {
  return SUPPORTED_LANGUAGES.includes(language as LanguageType);
}

/**
 * 标准化语言代码
 *
 * @param language - 输入的语言代码
 * @param fallback - 当无法标准化时返回的默认值
 * @returns 标准化后的语言代码
 *
 * @example
 * ```ts
 * normalizeLanguage('zh'); // 'zh-CN'
 * normalizeLanguage('en'); // 'en-US'
 * normalizeLanguage('fr'); // 'zh-CN' (fallback)
 * ```
 */
export function normalizeLanguage(
  language: string,
  fallback: LanguageType = 'zh-CN',
): LanguageType {
  const langLower = language.toLowerCase();

  if (langLower.startsWith('zh')) {
    return 'zh-CN';
  }

  if (langLower.startsWith('en')) {
    return 'en-US';
  }

  return fallback;
}

/**
 * 获取语言信息
 *
 * @param language - 语言代码
 * @returns 语言信息对象
 *
 * @example
 * ```ts
 * const langInfo = getLanguageInfo('zh-CN');
 * console.log(langInfo); // { code: 'zh-CN', name: '简体中文', flag: '🇨🇳', ... }
 * ```
 */
export function getLanguageInfo(language: LanguageType) {
  return LANGUAGE_MAP[language];
}

/**
 * 获取所有支持的语言信息
 *
 * @returns 所有支持的语言信息数组
 *
 * @example
 * ```ts
 * const allLanguages = getAllLanguages();
 * console.log(allLanguages); // [{ code: 'zh-CN', name: '简体中文', ... }, ...]
 * ```
 */
export function getAllLanguages() {
  return SUPPORTED_LANGUAGES.map((lang) => getLanguageInfo(lang));
}

/**
 * 语言切换工具类
 */
export class LanguageManager {
  private key: string;
  private currentLanguage: LanguageType;

  constructor(
    key: string = 'md-editor-language',
    defaultLanguage: LanguageType = 'zh-CN',
  ) {
    this.key = key;
    this.currentLanguage = detectUserLanguage(defaultLanguage);
  }

  /**
   * 获取当前语言
   */
  getCurrentLanguage(): LanguageType {
    return this.currentLanguage;
  }

  /**
   * 设置语言
   */
  setLanguage(language: LanguageType): void {
    if (isValidLanguage(language)) {
      this.currentLanguage = language;
      saveLanguage(language, this.key);
    }
  }

  /**
   * 切换语言
   */
  toggleLanguage(): LanguageType {
    const newLanguage = this.currentLanguage === 'zh-CN' ? 'en-US' : 'zh-CN';
    this.setLanguage(newLanguage);
    return newLanguage;
  }

  /**
   * 检测并更新语言
   */
  detectAndUpdate(): LanguageType {
    const detectedLanguage = detectUserLanguage(this.currentLanguage);
    if (detectedLanguage !== this.currentLanguage) {
      this.setLanguage(detectedLanguage);
    }
    return this.currentLanguage;
  }
}

/**
 * 创建语言管理器实例
 *
 * @param key - localStorage 键名
 * @param defaultLanguage - 默认语言
 * @returns 语言管理器实例
 *
 * @example
 * ```ts
 * const langManager = createLanguageManager();
 * langManager.setLanguage('en-US');
 * const current = langManager.getCurrentLanguage();
 * ```
 */
export function createLanguageManager(
  key: string = 'md-editor-language',
  defaultLanguage: LanguageType = 'zh-CN',
): LanguageManager {
  return new LanguageManager(key, defaultLanguage);
}
