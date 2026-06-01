/**
 * 语音播报参数
 * - 由内置 `useSpeechSynthesis` 或外部传入的 `useSpeech` 适配器消费
 */
export type UseSpeechSynthesisOptions = {
  /** 朗读文本内容 */
  text: string;
  /** 初始倍速，默认 1（范围建议 0.5~2） */
  defaultRate?: number;
  /**
   * 指定音色（按 `SpeechSynthesisVoice.voiceURI` 精确匹配）。
   * - 不传：使用浏览器默认音色（由 `lang` 与系统设置决定）
   * - 传入：在 `getVoices()` 列表中查找匹配项；找不到则回退默认音色
   * - 兼容：`speechSynthesis.getVoices()` 在 Chrome 首次调用常返回空数组，
   *   内置实现会挂 `onvoiceschanged` 等待并重启朗读，外部适配器需自行处理
   */
  voiceURI?: string;
  /**
   * 朗读语种（BCP 47 标签），如 `'zh-CN'`、`'en-US'`。
   * 不传时由浏览器根据 `text` 内容自动推断；与 `voiceURI` 同时传入时，`voiceURI` 优先。
   */
  lang?: string;
};

/**
 * 语音播报结果（适配器统一返回结构）
 */
export type UseSpeechSynthesisResult = {
  /**
   * 是否支持当前环境的语音播报
   * - 外部提供 `useSpeech` 适配器时，可不返回或忽略该字段
   * - 仅默认实现（Web Speech）用于环境探测
   */
  isSupported?: boolean;
  /** 是否正在播放 */
  isPlaying: boolean;
  /** 当前倍速 */
  rate: number;
  /** 设置倍速（如正在播报，调用方可在内部重启以生效） */
  setRate: (value: number) => void;
  /** 开始播报（应为幂等：重复调用不产生副作用） */
  start: () => void;
  /** 停止/取消播报（应清理内部资源与回调） */
  stop: () => void;
  /** 暂停播报（如不支持可为 no-op） */
  pause: () => void;
  /** 恢复播报（如不支持可为 no-op） */
  resume: () => void;
};

/**
 * 通用语音适配器接口
 * - 用于接入除 Web Speech 外的任意 TTS 能力
 * - 返回结构需满足 `UseSpeechSynthesisResult`
 * - 当提供该适配器时，`VoiceButton` 将视语音能力为“可用”，不再受浏览器支持度限制
 */
export type UseSpeechAdapter = (
  options: UseSpeechSynthesisOptions,
) => UseSpeechSynthesisResult;
