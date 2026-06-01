import { useEffect, useState } from 'react';

type LottieJsonModule = { default?: unknown } | unknown;

const getDefaultExport = (mod: LottieJsonModule): unknown => {
  if (
    mod &&
    typeof mod === 'object' &&
    'default' in mod &&
    (mod as { default: unknown }).default !== undefined
  ) {
    return (mod as { default: unknown }).default;
  }
  return mod;
};

/**
 * 通过动态 import 异步加载 Lottie JSON，避免与主包同步打包。
 * @param load 稳定引用，例如 `useMemo(() => () => import('./x.json'), [])`
 */
export const useAsyncLottieData = (
  load: () => Promise<LottieJsonModule>,
): unknown | null => {
  const [data, setData] = useState<unknown | null>(null);

  useEffect(() => {
    let cancelled = false;
    void load()
      .then((mod) => {
        if (cancelled) {
          return;
        }
        setData(getDefaultExport(mod));
      })
      .catch((error) => {
        if (!cancelled) {
          // eslint-disable-next-line no-console
          console.error('Failed to load Lottie JSON:', error);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [load]);

  return data;
};
