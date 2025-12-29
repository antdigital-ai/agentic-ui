import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  LANGUAGE_MAP,
  LanguageManager,
  SUPPORTED_LANGUAGES,
  createLanguageManager,
  detectAntdLocale,
  detectBrowserLanguage,
  detectUserLanguage,
  getAllLanguages,
  getLanguageInfo,
  getSavedLanguage,
  isValidLanguage,
  normalizeLanguage,
  saveLanguage,
  type LanguageType,
} from '../language';

// Mock DOM APIs
const mockNavigator = {
  language: 'en-US',
  languages: ['en-US', 'zh-CN'],
};

const mockDocument = {
  querySelector: vi.fn(),
};

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock console.warn to avoid test output noise
const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

describe('Language Utils', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock global objects
    Object.defineProperty(global, 'navigator', {
      value: mockNavigator,
      writable: true,
    });

    Object.defineProperty(global, 'document', {
      value: mockDocument,
      writable: true,
    });

    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    Object.defineProperty(global, 'window', {
      value: { localStorage: mockLocalStorage },
      writable: true,
    });
  });

  afterEach(() => {
    mockConsoleWarn.mockClear();
  });

  describe('Constants and Types', () => {
    it('should have correct supported languages', () => {
      expect(SUPPORTED_LANGUAGES).toEqual(['zh-CN', 'en-US']);
      expect(SUPPORTED_LANGUAGES).toHaveLength(2);
    });

    it('should have complete language map', () => {
      expect(LANGUAGE_MAP).toHaveProperty('zh-CN');
      expect(LANGUAGE_MAP).toHaveProperty('en-US');

      expect(LANGUAGE_MAP['zh-CN']).toEqual({
        code: 'zh-CN',
        name: '简体中文',
        nativeName: '简体中文',
        flag: '🇨🇳',
        antdLocale: 'zh_CN',
      });

      expect(LANGUAGE_MAP['en-US']).toEqual({
        code: 'en-US',
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸',
        antdLocale: 'en_US',
      });
    });
  });

  describe('detectBrowserLanguage', () => {
    it('should detect Chinese language from navigator.language', () => {
      Object.defineProperty(global, 'navigator', {
        value: { language: 'zh-CN', languages: ['zh-CN'] },
        writable: true,
      });

      expect(detectBrowserLanguage()).toBe('zh-CN');
    });

    it('should detect Chinese language from navigator.languages', () => {
      Object.defineProperty(global, 'navigator', {
        value: { language: 'en-US', languages: ['zh-CN', 'en-US'] },
        writable: true,
      });

      expect(detectBrowserLanguage()).toBe('zh-CN');
    });

    it('should detect English language', () => {
      Object.defineProperty(global, 'navigator', {
        value: { language: 'en-US', languages: ['en-US'] },
        writable: true,
      });

      expect(detectBrowserLanguage()).toBe('en-US');
    });

    it('should handle case insensitive detection', () => {
      Object.defineProperty(global, 'navigator', {
        value: { language: 'ZH-cn', languages: ['ZH-cn'] },
        writable: true,
      });

      expect(detectBrowserLanguage()).toBe('zh-CN');
    });

    it('should return null for unsupported languages', () => {
      Object.defineProperty(global, 'navigator', {
        value: { language: 'fr-FR', languages: ['fr-FR'] },
        writable: true,
      });

      expect(detectBrowserLanguage()).toBe(null);
    });

    it('should return null when navigator is undefined', () => {
      Object.defineProperty(global, 'navigator', {
        value: undefined,
        writable: true,
      });

      expect(detectBrowserLanguage()).toBe(null);
    });

    it('should handle navigator.languages being undefined', () => {
      Object.defineProperty(global, 'navigator', {
        value: { language: 'zh-CN', languages: undefined },
        writable: true,
      });

      expect(detectBrowserLanguage()).toBe('zh-CN');
    });
  });

  describe('detectAntdLocale', () => {
    it('should detect Chinese locale from DOM', () => {
      const mockElement = {
        getAttribute: vi.fn().mockReturnValue('zh_CN'),
      };
      mockDocument.querySelector.mockReturnValue(mockElement);

      expect(detectAntdLocale()).toBe('zh-CN');
      expect(mockDocument.querySelector).toHaveBeenCalledWith(
        '[data-antd-locale]',
      );
    });

    it('should detect English locale from DOM', () => {
      const mockElement = {
        getAttribute: vi.fn().mockReturnValue('en_US'),
      };
      mockDocument.querySelector.mockReturnValue(mockElement);

      expect(detectAntdLocale()).toBe('en-US');
    });

    it('should handle case insensitive locale detection', () => {
      const mockElement = {
        getAttribute: vi.fn().mockReturnValue('ZH_CN'),
      };
      mockDocument.querySelector.mockReturnValue(mockElement);

      expect(detectAntdLocale()).toBe('zh-CN');
    });

    it('should return null when no element found', () => {
      mockDocument.querySelector.mockReturnValue(null);

      expect(detectAntdLocale()).toBe(null);
    });

    it('should return null when element has no attribute', () => {
      const mockElement = {
        getAttribute: vi.fn().mockReturnValue(null),
      };
      mockDocument.querySelector.mockReturnValue(mockElement);

      expect(detectAntdLocale()).toBe(null);
    });

    it('should return null when document is undefined', () => {
      Object.defineProperty(global, 'document', {
        value: undefined,
        writable: true,
      });

      expect(detectAntdLocale()).toBe(null);
    });

    it('should handle DOM errors gracefully', () => {
      mockDocument.querySelector.mockImplementation(() => {
        throw new Error('DOM error');
      });

      expect(detectAntdLocale()).toBe(null);
    });
  });

  describe('getSavedLanguage', () => {
    it('should return saved Chinese language', () => {
      mockLocalStorage.getItem.mockReturnValue('zh-CN');

      expect(getSavedLanguage()).toBe('zh-CN');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        'md-editor-language',
      );
    });

    it('should return saved English language', () => {
      mockLocalStorage.getItem.mockReturnValue('en-US');

      expect(getSavedLanguage()).toBe('en-US');
    });

    it('should return null for unsupported language', () => {
      mockLocalStorage.getItem.mockReturnValue('fr-FR');

      expect(getSavedLanguage()).toBe(null);
    });

    it('should return null when no saved language', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      expect(getSavedLanguage()).toBe(null);
    });

    it('should use custom key', () => {
      mockLocalStorage.getItem.mockReturnValue('zh-CN');

      getSavedLanguage('custom-key');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('custom-key');
    });

    it('should return null when window is undefined', () => {
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
      });

      expect(getSavedLanguage()).toBe(null);
    });

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      expect(getSavedLanguage()).toBe(null);
    });
  });

  describe('saveLanguage', () => {
    it('should save Chinese language', () => {
      saveLanguage('zh-CN');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'md-editor-language',
        'zh-CN',
      );
    });

    it('should save English language', () => {
      saveLanguage('en-US');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'md-editor-language',
        'en-US',
      );
    });

    it('should use custom key', () => {
      saveLanguage('zh-CN', 'custom-key');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'custom-key',
        'zh-CN',
      );
    });

    it('should handle window undefined gracefully', () => {
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
      });

      saveLanguage('zh-CN');
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      saveLanguage('zh-CN');
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Failed to save language preference:',
        expect.any(Error),
      );
    });
  });

  describe('detectUserLanguage', () => {
    it('should prioritize saved language', () => {
      mockLocalStorage.getItem.mockReturnValue('en-US');

      expect(detectUserLanguage()).toBe('en-US');
    });

    it('should fallback to Ant Design locale when no saved language', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      const mockElement = {
        getAttribute: vi.fn().mockReturnValue('zh_CN'),
      };
      mockDocument.querySelector.mockReturnValue(mockElement);

      expect(detectUserLanguage()).toBe('zh-CN');
    });

    it('should fallback to browser language when no saved or Ant Design locale', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockDocument.querySelector.mockReturnValue(null);
      Object.defineProperty(global, 'navigator', {
        value: { language: 'en-US', languages: ['en-US'] },
        writable: true,
      });

      expect(detectUserLanguage()).toBe('en-US');
    });

    it('should use default language when all detection fails', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockDocument.querySelector.mockReturnValue(null);
      Object.defineProperty(global, 'navigator', {
        value: { language: 'fr-FR', languages: ['fr-FR'] },
        writable: true,
      });

      expect(detectUserLanguage()).toBe('zh-CN');
    });

    it('should use custom default language', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockDocument.querySelector.mockReturnValue(null);
      Object.defineProperty(global, 'navigator', {
        value: { language: 'fr-FR', languages: ['fr-FR'] },
        writable: true,
      });

      expect(detectUserLanguage('en-US')).toBe('en-US');
    });
  });

  describe('isValidLanguage', () => {
    it('should return true for valid languages', () => {
      expect(isValidLanguage('zh-CN')).toBe(true);
      expect(isValidLanguage('en-US')).toBe(true);
    });

    it('should return false for invalid languages', () => {
      expect(isValidLanguage('fr-FR')).toBe(false);
      expect(isValidLanguage('de-DE')).toBe(false);
      expect(isValidLanguage('')).toBe(false);
      expect(isValidLanguage('invalid')).toBe(false);
    });
  });

  describe('normalizeLanguage', () => {
    it('should normalize Chinese variants', () => {
      expect(normalizeLanguage('zh')).toBe('zh-CN');
      expect(normalizeLanguage('zh-CN')).toBe('zh-CN');
      expect(normalizeLanguage('zh-TW')).toBe('zh-CN');
      expect(normalizeLanguage('ZH')).toBe('zh-CN');
    });

    it('should normalize English variants', () => {
      expect(normalizeLanguage('en')).toBe('en-US');
      expect(normalizeLanguage('en-US')).toBe('en-US');
      expect(normalizeLanguage('en-GB')).toBe('en-US');
      expect(normalizeLanguage('EN')).toBe('en-US');
    });

    it('should use fallback for unsupported languages', () => {
      expect(normalizeLanguage('fr')).toBe('zh-CN');
      expect(normalizeLanguage('de')).toBe('zh-CN');
      expect(normalizeLanguage('invalid')).toBe('zh-CN');
    });

    it('should use custom fallback', () => {
      expect(normalizeLanguage('fr', 'en-US')).toBe('en-US');
    });
  });

  describe('getLanguageInfo', () => {
    it('should return Chinese language info', () => {
      const info = getLanguageInfo('zh-CN');
      expect(info).toEqual({
        code: 'zh-CN',
        name: '简体中文',
        nativeName: '简体中文',
        flag: '🇨🇳',
        antdLocale: 'zh_CN',
      });
    });

    it('should return English language info', () => {
      const info = getLanguageInfo('en-US');
      expect(info).toEqual({
        code: 'en-US',
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸',
        antdLocale: 'en_US',
      });
    });
  });

  describe('getAllLanguages', () => {
    it('should return all language info', () => {
      const allLanguages = getAllLanguages();
      expect(allLanguages).toHaveLength(2);
      expect(allLanguages[0]).toEqual({
        code: 'zh-CN',
        name: '简体中文',
        nativeName: '简体中文',
        flag: '🇨🇳',
        antdLocale: 'zh_CN',
      });
      expect(allLanguages[1]).toEqual({
        code: 'en-US',
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸',
        antdLocale: 'en_US',
      });
    });
  });

  describe('LanguageManager', () => {
    let languageManager: LanguageManager;

    beforeEach(() => {
      // Reset localStorage mock
      mockLocalStorage.getItem.mockReturnValue(null);
      mockLocalStorage.setItem.mockClear();

      // Reset DOM mock
      mockDocument.querySelector.mockReturnValue(null);

      // Reset navigator mock to return unsupported language
      Object.defineProperty(global, 'navigator', {
        value: { language: 'fr-FR', languages: ['fr-FR'] },
        writable: true,
      });
    });

    it('should initialize with default language', () => {
      languageManager = new LanguageManager();
      expect(languageManager.getCurrentLanguage()).toBe('zh-CN');
    });

    it('should initialize with custom default language', () => {
      languageManager = new LanguageManager('custom-key', 'en-US');
      expect(languageManager.getCurrentLanguage()).toBe('en-US');
    });

    it('should set valid language', () => {
      languageManager = new LanguageManager();
      languageManager.setLanguage('en-US');

      expect(languageManager.getCurrentLanguage()).toBe('en-US');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'md-editor-language',
        'en-US',
      );
    });

    it('should not set invalid language', () => {
      languageManager = new LanguageManager();
      const originalLanguage = languageManager.getCurrentLanguage();

      languageManager.setLanguage('fr-FR' as LanguageType);

      expect(languageManager.getCurrentLanguage()).toBe(originalLanguage);
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });

    it('should toggle language correctly', () => {
      languageManager = new LanguageManager();

      // Start with zh-CN
      expect(languageManager.getCurrentLanguage()).toBe('zh-CN');

      // Toggle to en-US
      const newLanguage = languageManager.toggleLanguage();
      expect(newLanguage).toBe('en-US');
      expect(languageManager.getCurrentLanguage()).toBe('en-US');

      // Toggle back to zh-CN
      const backLanguage = languageManager.toggleLanguage();
      expect(backLanguage).toBe('zh-CN');
      expect(languageManager.getCurrentLanguage()).toBe('zh-CN');
    });

    it('should detect and update language', () => {
      languageManager = new LanguageManager();

      // Mock saved language
      mockLocalStorage.getItem.mockReturnValue('en-US');

      const detectedLanguage = languageManager.detectAndUpdate();
      expect(detectedLanguage).toBe('en-US');
      expect(languageManager.getCurrentLanguage()).toBe('en-US');
    });

    it('should not update if detected language is same', () => {
      languageManager = new LanguageManager();
      const originalLanguage = languageManager.getCurrentLanguage();

      // Mock same language
      mockLocalStorage.getItem.mockReturnValue(originalLanguage);

      const detectedLanguage = languageManager.detectAndUpdate();
      expect(detectedLanguage).toBe(originalLanguage);
      expect(languageManager.getCurrentLanguage()).toBe(originalLanguage);
    });

    it('should use custom key for localStorage', () => {
      languageManager = new LanguageManager('custom-key');
      languageManager.setLanguage('en-US');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'custom-key',
        'en-US',
      );
    });
  });

  describe('createLanguageManager', () => {
    beforeEach(() => {
      // Reset localStorage mock
      mockLocalStorage.getItem.mockReturnValue(null);
      mockLocalStorage.setItem.mockClear();

      // Reset DOM mock
      mockDocument.querySelector.mockReturnValue(null);

      // Reset navigator mock to return unsupported language
      Object.defineProperty(global, 'navigator', {
        value: { language: 'fr-FR', languages: ['fr-FR'] },
        writable: true,
      });
    });

    it('should create LanguageManager with default parameters', () => {
      const manager = createLanguageManager();
      expect(manager).toBeInstanceOf(LanguageManager);
      expect(manager.getCurrentLanguage()).toBe('zh-CN');
    });

    it('should create LanguageManager with custom parameters', () => {
      const manager = createLanguageManager('custom-key', 'en-US');
      expect(manager).toBeInstanceOf(LanguageManager);
      expect(manager.getCurrentLanguage()).toBe('en-US');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty string language', () => {
      expect(isValidLanguage('')).toBe(false);
      expect(normalizeLanguage('')).toBe('zh-CN');
    });

    it('should handle null/undefined language', () => {
      expect(isValidLanguage(null as any)).toBe(false);
      expect(isValidLanguage(undefined as any)).toBe(false);
    });

    it('should handle special characters in language codes', () => {
      expect(normalizeLanguage('zh@CN')).toBe('zh-CN');
      expect(normalizeLanguage('en#US')).toBe('en-US');
    });

    it('should handle very long language strings', () => {
      const longString = 'a'.repeat(1000);
      expect(normalizeLanguage(longString)).toBe('zh-CN');
    });

    it('should handle localStorage quota exceeded', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      saveLanguage('zh-CN');
      expect(mockConsoleWarn).toHaveBeenCalled();
    });
  });
});
