import { ConfigProvider } from 'antd';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { cnLabels, enLabels } from './locales';

export { cnLabels, enLabels };

export type LocalKeys = typeof cnLabels;

/**
 * 语言检测工具函数
 *
 * 检测用户的语言偏好，支持多种检测方式：
 * 1. 浏览器语言设置
 * 2. Ant Design ConfigProvider 的 locale
 * 3. localStorage 中保存的用户选择
 * 4. 默认语言
 */
export function detectUserLanguage(): 'zh-CN' | 'en-US' {
  // 1. 优先检查 localStorage 中用户的选择
  if (typeof window !== 'undefined') {
    const savedLanguage = localStorage.getItem('md-editor-language');
    if (savedLanguage === 'zh-CN' || savedLanguage === 'en-US') {
      return savedLanguage;
    }
  }

  // 2. 检查 Ant Design ConfigProvider 的 locale
  try {
    const antdLocale = document
      .querySelector('[data-antd-locale]')
      ?.getAttribute('data-antd-locale');
    if (antdLocale) {
      if (antdLocale.toLowerCase().includes('zh')) {
        return 'zh-CN';
      }
      if (antdLocale.toLowerCase().includes('en')) {
        return 'en-US';
      }
    }
  } catch (error) {
    // 忽略错误，继续其他检测方式
  }

  // 3. 检测浏览器语言
  if (typeof navigator !== 'undefined') {
    const browserLanguages = navigator.languages || [navigator.language];

    for (const lang of browserLanguages) {
      const langLower = lang?.toLowerCase() || 'zh-CN';
      if (langLower.startsWith('zh')) {
        return 'zh-CN';
      }
      if (langLower.startsWith('en')) {
        return 'en-US';
      }
    }
  }

  // 4. 在测试环境中默认返回英文，其他环境返回中文
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    return 'en-US';
  }

  return 'zh-CN';
}

/**
 * 获取对应的语言标签对象
 */
export function getLocaleByLanguage(
  language: 'zh-CN' | 'en-US',
): typeof cnLabels {
  return language === 'zh-CN' ? cnLabels : enLabels;
}

/**
 * 保存用户语言选择到 localStorage
 */
export function saveUserLanguage(language: 'zh-CN' | 'en-US'): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('md-editor-language', language);
  }
}

/**
 * 国际化上下文
 *
 * 提供国际化功能的React Context，包含当前语言环境和设置语言的方法。
 */
export const I18nContext = React.createContext<{
  locale: LocalKeys;
  language: 'zh-CN' | 'en-US';
  setLanguage?: (language: 'zh-CN' | 'en-US') => void;
  setLocale?: (locale: LocalKeys) => void;
}>({
  locale: cnLabels,
  language: 'zh-CN',
});

/**
 * I18nProvide 组件 - 国际化提供者组件
 *
 * 该组件提供国际化功能，支持中英文切换，自动检测用户语言偏好。
 * 集成Ant Design的ConfigProvider，提供完整的国际化支持。
 *
 * @component
 * @description 国际化提供者组件，支持多语言切换
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件
 * @param {typeof cnLabels} [props.locale] - 自定义语言环境
 * @param {'zh-CN' | 'en-US'} [props.defaultLanguage] - 默认语言
 * @param {boolean} [props.autoDetect=true] - 是否自动检测语言
 *
 * @example
 * ```tsx
 * <I18nProvide defaultLanguage="en-US" autoDetect={true}>
 *   <App />
 * </I18nProvide>
 * ```
 *
 * @returns {React.ReactElement} 渲染的国际化提供者组件
 *
 * @remarks
 * - 支持中英文语言切换
 * - 自动检测用户浏览器语言
 * - 集成Ant Design国际化
 * - 提供语言环境上下文
 * - 支持自定义语言配置
 * - 响应式语言切换
 * - 提供模板字符串编译功能
 * - 支持 localStorage 持久化语言选择
 * - 支持 Ant Design ConfigProvider 同步
 */
export const I18nProvide: React.FC<{
  children: React.ReactNode;
  locale?: typeof cnLabels;
  defaultLanguage?: 'zh-CN' | 'en-US';
  autoDetect?: boolean;
}> = (props) => {
  const { autoDetect = true, defaultLanguage = 'zh-CN' } = props;
  const antdContext = useContext(ConfigProvider.ConfigContext);

  // 初始化语言状态
  const [language, setLanguageState] = useState<'zh-CN' | 'en-US'>(() => {
    if (!autoDetect) {
      return defaultLanguage;
    }

    // 自动检测语言
    return detectUserLanguage();
  });

  // 根据语言获取对应的标签对象
  const locale = useMemo(() => {
    return getLocaleByLanguage(language);
  }, [language]);

  // 监听 Ant Design ConfigProvider 的 locale 变化
  useEffect(() => {
    if (!autoDetect || !antdContext?.locale) {
      return;
    }

    const antdLocale = antdContext.locale.locale;
    if (antdLocale) {
      const newLanguage = antdLocale.toLowerCase().includes('zh')
        ? 'zh-CN'
        : 'en-US';
      if (newLanguage !== language) {
        setLanguageState(newLanguage);
        saveUserLanguage(newLanguage);
      }
    }
  }, [antdContext?.locale, autoDetect, language]);

  // 语言切换处理函数
  const setLanguage = useCallback((newLanguage: 'zh-CN' | 'en-US') => {
    setLanguageState(newLanguage);
    saveUserLanguage(newLanguage);
  }, []);

  // 兼容旧的 setLocale 接口
  const setLocale = useCallback(
    (newLocale: typeof cnLabels) => {
      // 根据传入的 locale 对象判断语言
      const newLanguage = newLocale === cnLabels ? 'zh-CN' : 'en-US';
      setLanguage(newLanguage);
    },
    [setLanguage],
  );

  const contextValue = useMemo(
    () => ({
      locale: props.locale || locale,
      language,
      setLanguage,
      setLocale,
    }),
    [props.locale, locale, language, setLanguage, setLocale],
  );

  return (
    <I18nContext.Provider value={contextValue}>
      {props.children}
    </I18nContext.Provider>
  );
};

/**
 * 编译模板字符串，将其中的变量占位符替换为对应的值
 *
 * @param template - 包含变量占位符的模板字符串，格式为 ${variableName}
 * @param variables - 变量名和对应值的键值对对象，默认为空对象
 * @returns 替换变量后的字符串。如果变量在variables中不存在，则显示为[variableName]
 *
 * @example
 * // 返回 "你好，世界！"
 * compileTemplate("你好，${name}！", { name: "世界" });
 *
 * // 返回 "你好，[name]！"（当变量未提供时）
 * compileTemplate("你好，${name}！");
 */
export function compileTemplate(
  template: string,
  variables: Record<string, string> = {},
) {
  return template.replace(/\$\{(\w+)\}/g, (_, varName) => {
    // 优先使用传入变量，找不到时显示变量名
    return variables[varName] ?? `[${varName}]`;
  });
}
