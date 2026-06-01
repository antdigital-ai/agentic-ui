/**
 * 环境检测工具集
 *
 * 集中放置 SSR / 测试 / 移动端 / 设备品牌 / 微信等运行环境判断，
 * 替代散落在 `RefinePromptButton/env.ts`、`AttachmentButton/utils.ts`、
 * `BorderBeamAnimation`、`useInputFieldGeometry` 等模块中的同义实现。
 *
 * 设计原则：
 * - 所有函数对 SSR 安全（`typeof window === 'undefined'` 时返回保守默认值）
 * - 不依赖任何业务模块，可被任意 hook / 组件复用
 * - 设备品牌识别表与具体业务（附件按钮）解耦
 */

/**
 * 是否运行在浏览器环境（同时具备 window + document）。
 * 用于 SSR 防御。
 */
export function isBrowser(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    !!window.document
  );
}

/**
 * 是否运行在 Vitest / Jest 等单测环境。
 * 用于跳过 ResizeObserver 等无意义的副作用，避免污染测试输出。
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}

/**
 * 设备品牌匹配表
 *
 * 注意：仅依据 UA 做粗粒度识别，主要服务于「不同厂商浏览器对 input[accept]
 * 的支持差异」这一具体场景。新增条目请保留首字母大写约定，避免造成歧义。
 */
const UA_MATCH_LIST: Array<{ name: string; matchList: RegExp[] }> = [
  { name: 'iphone', matchList: [/iPhone/i] },
  {
    name: '华为',
    matchList: [
      /HUAWEI/i,
      /SPN-AL00/i,
      /GLK-AL00/i,
      /Huawei/i,
      /HMSCore/i,
      /HW/,
    ],
  },
  { name: '荣耀', matchList: [/HONOR/i] },
  {
    name: 'oppo',
    matchList: [
      /PCAM10/i,
      /OPPO/i,
      /PCH/,
      /PBAM00/,
      /PBEM00/,
      /HeyTapBrowser/,
      /PADT00/,
      /PCDM10/,
    ],
  },
  {
    name: 'vivo',
    matchList: [/V1981A/i, /vivo/i, /V1818A/, /V1838A/, /V19/, /VivoBrowser/],
  },
  { name: '小米', matchList: [/Redmi/i, /HM/, /MIX/i, /MI/, /XiaoMi/] },
  { name: '金利', matchList: [/GN708T/i] },
  { name: 'oneplus', matchList: [/GM1910/i, /ONEPLUS/i] },
  { name: 'sony', matchList: [/SOV/i, /LT29i/, /Xperia/] },
  { name: '三星', matchList: [/SAMSUNG/i, /SM-/, /GT/, /SCH-I939I/] },
  {
    name: '魅族',
    matchList: [/MZ-/, /MX4/i, /M355/, /M353/, /M351/, /M811/, /PRO 7-H/],
  },
  { name: '华硕', matchList: [/ASUS/] },
  { name: '美图', matchList: [/MP/] },
  { name: '天语', matchList: [/K-Touch/] },
  { name: '联想', matchList: [/Lenovo/i] },
  { name: '宇飞来', matchList: [/YU FLY/i] },
  { name: '糖果', matchList: [/SUGAR/i] },
  { name: '酷派', matchList: [/Coolpad/i] },
  { name: 'ecell', matchList: [/ecell/i] },
  { name: '詹姆士', matchList: [/A99A/i] },
  { name: 'tcl', matchList: [/TCL/i] },
  { name: '捷语', matchList: [/6000/i, /V1813A/] },
  { name: '8848', matchList: [/8848/i] },
  { name: 'H6', matchList: [/H6/] },
  { name: '中兴', matchList: [/ZTE/i] },
  { name: '努比亚', matchList: [/NX/] },
  { name: '海信', matchList: [/HS/] },
  { name: 'HTC', matchList: [/HTC/] },
];

/**
 * 获取设备品牌（基于 User Agent 字符串）。
 *
 * @param ua 可选的 UA 字符串；不传则使用 `navigator.userAgent`
 * @returns 命中品牌名；未命中时尝试从 `; XXX Build` 兜底，仍取不到返回 `false`
 */
export function getDeviceBrand(ua?: string): string | false {
  if (typeof navigator === 'undefined' && !ua) return false;
  const userAgent = ua || navigator.userAgent;

  for (const { name, matchList } of UA_MATCH_LIST) {
    for (const re of matchList) {
      if (re.test(userAgent)) return name;
    }
  }

  const brandMatch = /; ([^;]+) Build/.exec(userAgent);
  if (brandMatch) return brandMatch[1];

  return false;
}

/** 是否 vivo 设备 */
export function isVivoDevice(ua?: string): boolean {
  return getDeviceBrand(ua) === 'vivo';
}

/** 是否 oppo 设备 */
export function isOppoDevice(ua?: string): boolean {
  return getDeviceBrand(ua) === 'oppo';
}

/** 是否 vivo / oppo 设备（用于 input[accept] 兼容判断） */
export function isVivoOrOppoDevice(ua?: string): boolean {
  return isVivoDevice(ua) || isOppoDevice(ua);
}

/**
 * 是否移动设备
 *
 * 综合 UA、触摸能力与窗口宽度三重判断；SSR 下返回 `false`。
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;

  const userAgent = navigator.userAgent.toLowerCase();
  const mobileRegex =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|mobile safari|micromessenger/i;

  const hasTouchScreen =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  const isSmallScreen =
    typeof window !== 'undefined' && window.innerWidth <= 768;

  return mobileRegex.test(userAgent) || (hasTouchScreen && isSmallScreen);
}

/** 是否运行在微信内置浏览器 */
export function isWeChat(ua?: string): boolean {
  if (typeof navigator === 'undefined' && !ua) return false;
  const userAgent = (ua || navigator.userAgent).toLowerCase();
  return /micromessenger/i.test(userAgent);
}
