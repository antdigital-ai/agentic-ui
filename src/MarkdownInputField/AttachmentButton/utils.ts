/**
 * 将KB转换为可读的文件大小格式
 * 支持从字节（B）到TB的所有单位，最小单位为B
 *
 * @param {number} kb - 文件大小（KB）
 * @returns {string} 格式化后的文件大小字符串
 *
 * @example
 * kbToSize(1073741824) // "1 TB"
 * kbToSize(1048576) // "1 GB"
 * kbToSize(1024) // "1 MB"
 * kbToSize(512) // "512 KB"
 * kbToSize(1) // "1 KB"
 * kbToSize(0.5) // "512 B"
 * kbToSize(0.1) // "102.4 B"
 * kbToSize(0.0001) // "0.1 B"
 * kbToSize(0) // "0 B"
 */
export const kbToSize = (kb: number) => {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const bytes = kb * 1024;

  // 处理边界情况：0或负数直接返回0 B
  if (bytes <= 0) {
    return '0 B';
  }

  // 如果小于1KB，直接返回字节
  if (bytes < 1024) {
    return parseFloat(bytes.toFixed(2)) + ' ' + sizes[0];
  }

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 检查文件是否为图片类型
 * 通过 MIME 类型和文件扩展名双重判断
 *
 * @param {File} file - 要检查的文件
 * @returns {boolean} 是否为图片文件
 */
export const isImageFile = (file: File): boolean => {
  // 首先检查 MIME 类型
  if (file.type.startsWith('image/')) {
    return true;
  }

  // 如果 MIME 类型不可用或不准确，检查文件扩展名
  const imageExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.bmp',
    '.webp',
    '.svg',
    '.ico',
    '.tiff',
    '.tif',
  ];

  const fileName = file.name.toLowerCase();
  return imageExtensions.some((ext) => fileName.endsWith(ext));
};

/**
 * 设备品牌匹配列表
 */
const UA_MATCH_LIST = [
  {
    name: 'iphone',
    matchList: [/iPhone/i],
  },
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
  {
    name: '荣耀',
    matchList: [/HONOR/i],
  },
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
  {
    name: '小米',
    matchList: [/Redmi/i, /HM/, /MIX/i, /MI/, /XiaoMi/],
  },
  {
    name: '金利',
    matchList: [/GN708T/i],
  },
  {
    name: 'oneplus',
    matchList: [/GM1910/i, /ONEPLUS/i],
  },
  {
    name: 'sony',
    matchList: [/SOV/i, /LT29i/, /Xperia/],
  },
  {
    name: '三星',
    matchList: [/SAMSUNG/i, /SM-/, /GT/, /SCH-I939I/],
  },
  {
    name: '魅族',
    matchList: [/MZ-/, /MX4/i, /M355/, /M353/, /M351/, /M811/, /PRO 7-H/],
  },
  {
    name: '华硕',
    matchList: [/ASUS/],
  },
  {
    name: '美图',
    matchList: [/MP/],
  },
  {
    name: '天语',
    matchList: [/K-Touch/],
  },
  {
    name: '联想',
    matchList: [/Lenovo/i],
  },
  {
    name: '宇飞来',
    matchList: [/YU FLY/i],
  },
  {
    name: '糖果',
    matchList: [/SUGAR/i],
  },
  {
    name: '酷派',
    matchList: [/Coolpad/i],
  },
  {
    name: 'ecell',
    matchList: [/ecell/i],
  },
  {
    name: '詹姆士',
    matchList: [/A99A/i],
  },
  {
    name: 'tcl',
    matchList: [/TCL/i],
  },
  {
    name: '捷语',
    matchList: [/6000/i, /V1813A/],
  },
  {
    name: '8848',
    matchList: [/8848/i],
  },
  {
    name: 'H6',
    matchList: [/H6/],
  },
  {
    name: '中兴',
    matchList: [/ZTE/i],
  },
  {
    name: '努比亚',
    matchList: [/NX/],
  },
  {
    name: '海信',
    matchList: [/HS/],
  },
  {
    name: 'HTC',
    matchList: [/HTC/],
  },
];

/**
 * 获取设备品牌
 *
 * @param {string} [ua] - User Agent 字符串，如果不提供则使用 navigator.userAgent
 * @returns {string | false} 设备品牌名称，如果无法匹配则返回 false
 *
 * @example
 * ```ts
 * getDeviceBrand() // 'vivo' | '华为' | 'iphone' | false
 * getDeviceBrand('Mozilla/5.0...vivo...') // 'vivo'
 * ```
 */
export const getDeviceBrand = (ua?: string): string | false => {
  if (typeof navigator === 'undefined' && !ua) {
    return false;
  }

  const userAgent = ua || navigator.userAgent;

  // 遍历匹配列表
  for (let i = 0; i < UA_MATCH_LIST.length; i++) {
    const uaDetail = UA_MATCH_LIST[i];
    for (let j = 0; j < uaDetail.matchList.length; j++) {
      const re = uaDetail.matchList[j];
      if (re.test(userAgent)) {
        return uaDetail.name;
      }
    }
  }

  // 如果匹配列表中没有找到，尝试从 Build 信息中提取
  const brandMatch = /; ([^;]+) Build/.exec(userAgent);
  if (brandMatch) {
    return brandMatch[1];
  }

  return false;
};

/**
 * 检测是否为 vivo 手机
 *
 * @param {string} [ua] - User Agent 字符串，如果不提供则使用 navigator.userAgent
 * @returns {boolean} 是否为 vivo 设备
 *
 * @example
 * ```ts
 * isVivoDevice() // true | false
 * ```
 */
export const isVivoDevice = (ua?: string): boolean => {
  const brand = getDeviceBrand(ua);
  return brand === 'vivo';
};

/**
 * 检测是否为 oppo 手机
 *
 * @param {string} [ua] - User Agent 字符串，如果不提供则使用 navigator.userAgent
 * @returns {boolean} 是否为 oppo 设备
 *
 * @example
 * ```ts
 * isOppoDevice() // true | false
 * ```
 */
export const isOppoDevice = (ua?: string): boolean => {
  const brand = getDeviceBrand(ua);
  return brand === 'oppo';
};

/**
 * 检测是否为 vivo 或 oppo 手机
 *
 * @param {string} [ua] - User Agent 字符串，如果不提供则使用 navigator.userAgent
 * @returns {boolean} 是否为 vivo 或 oppo 设备
 *
 * @example
 * ```ts
 * isVivoOrOppoDevice() // true | false
 * ```
 */
export const isVivoOrOppoDevice = (ua?: string): boolean => {
  return isVivoDevice(ua) || isOppoDevice(ua);
};

/**
 * 检测是否为移动设备
 *
 * @returns {boolean} 是否为移动设备
 *
 * @example
 * ```ts
 * isMobileDevice() // true | false
 * ```
 */
export const isMobileDevice = (): boolean => {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent.toLowerCase();

  // 检测常见的移动设备标识
  const mobileRegex =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|mobile safari|micromessenger/i;

  // 检测触摸设备
  const hasTouchScreen =
    'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // 检测屏幕宽度（移动设备通常小于 768px）
  const isSmallScreen =
    typeof window !== 'undefined' && window.innerWidth <= 768;

  return mobileRegex.test(userAgent) || (hasTouchScreen && isSmallScreen);
};

/**
 * 检测是否为微信环境
 *
 * @param {string} [ua] - User Agent 字符串，如果不提供则使用 navigator.userAgent
 * @returns {boolean} 是否为微信环境
 *
 * @example
 * ```ts
 * isWeChat() // true | false
 * ```
 */
export const isWeChat = (ua?: string): boolean => {
  if (typeof navigator === 'undefined' && !ua) {
    return false;
  }

  const userAgent = (ua || navigator.userAgent).toLowerCase();
  return /micromessenger/i.test(userAgent);
};
