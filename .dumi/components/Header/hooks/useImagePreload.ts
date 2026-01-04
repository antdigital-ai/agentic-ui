import { useEffect, useState } from 'react';

/**
 * 预加载图片 Hook
 * @param imageUrls 需要预加载的图片 URL 数组
 * @returns 加载状态
 */
export const useImagePreload = (imageUrls: string[]) => {
  const [loadedCount, setLoadedCount] = useState(0);
  const [isAllLoaded, setIsAllLoaded] = useState(false);

  useEffect(() => {
    if (!imageUrls || imageUrls.length === 0) {
      setIsAllLoaded(true);
      return;
    }

    let loaded = 0;
    const images: HTMLImageElement[] = [];

    imageUrls.forEach((url) => {
      const img = new Image();

      // 设置高优先级加载
      img.loading = 'eager';

      img.onload = () => {
        loaded++;
        setLoadedCount(loaded);
        if (loaded === imageUrls.length) {
          setIsAllLoaded(true);
        }
      };

      img.onerror = () => {
        loaded++;
        setLoadedCount(loaded);
        console.warn(`Failed to preload image: ${url}`);
        if (loaded === imageUrls.length) {
          setIsAllLoaded(true);
        }
      };

      img.src = url;
      images.push(img);
    });

    // Cleanup
    return () => {
      images.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [imageUrls]);

  return { loadedCount, isAllLoaded, total: imageUrls.length };
};
