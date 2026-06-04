/** CI 上 Slate / dumi iframe 更慢，统一放大轮询与导航超时 */
export const isE2eCi = !!process.env.CI;

export const E2E_POLL_TIMEOUT_MS = isE2eCi ? 15_000 : 8_000;

export const E2E_NAVIGATION_TIMEOUT_MS = isE2eCi ? 90_000 : 60_000;

export const E2E_DEMO_FRAME_TIMEOUT_MS = isE2eCi ? 30_000 : 20_000;

export const E2E_AFTER_SEND_TIMEOUT_MS = isE2eCi ? 15_000 : 10_000;

/** 固定桌面视口，避免 isMobileDevice() 误判导致 Enter 不发消息 */
export const E2E_VIEWPORT = { width: 1280, height: 720 } as const;
