export interface ImageSkinScanResult {
  isNsfw: boolean;
  skinRatio: number;
  skinPercent: number;
  action: 'AUTO_REJECT' | 'QUARANTINE_SUSPICIOUS' | 'CLEAN';
  reason?: string;
}

/**
 * Fast client-side image moderation heuristic scanning skin tone & sensitive content
 * in real-time before any file is uploaded to Cloudflare R2.
 */
export const scanImageSkinTone = (file: File): Promise<ImageSkinScanResult> => {
  return new Promise((resolve) => {
    // If not standard image or SVG/GIF, pass through
    if (!file.type.startsWith('image/') || file.type.includes('svg')) {
      return resolve({
        isNsfw: false,
        skinRatio: 0,
        skinPercent: 0,
        action: 'CLEAN'
      });
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      try {
        const canvas = document.createElement('canvas');
        // Scale to 200px max dimension for fast processing (< 5ms)
        const maxDim = 200;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = Math.max(1, w);
        canvas.height = Math.max(1, h);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve({ isNsfw: false, skinRatio: 0, skinPercent: 0, action: 'CLEAN' });
        }

        ctx.drawImage(img, 0, 0, w, h);
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        let totalPixels = 0;
        let skinPixels = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Skip transparent or near-black pixels
          if (a < 50 || (r < 15 && g < 15 && b < 15)) continue;

          totalPixels++;

          // Multi-space Skin Detection (YCbCr + Normalized RGB for fair / studio skin)
          const cb = -0.168736 * r - 0.331264 * g + 0.5 * b + 128;
          const cr = 0.5 * r - 0.418688 * g - 0.081312 * b + 128;

          const isSkin =
            r > 60 &&
            g > 40 &&
            b > 20 &&
            r >= g &&
            r > b &&
            r - b >= 4 &&
            cb >= 75 &&
            cb <= 135 &&
            cr >= 126 &&
            cr <= 175 &&
            Math.max(r, Math.max(g, b)) - Math.min(r, Math.min(g, b)) >= 8 &&
            !(r > 250 && g > 250 && b > 250);

          if (isSkin) {
            skinPixels++;
          }
        }

        if (totalPixels === 0) {
          return resolve({ isNsfw: false, skinRatio: 0, skinPercent: 0, action: 'CLEAN' });
        }

        const skinRatio = skinPixels / totalPixels;
        const skinPercent = Math.round(skinRatio * 100);

        if (skinRatio >= 0.60) {
          return resolve({
            isNsfw: true,
            skinRatio,
            skinPercent,
            action: 'AUTO_REJECT',
            reason: 'Hình ảnh vi phạm nghiêm trọng Tiêu chuẩn cộng đồng (chứa nội dung mang tính chất 18+, khiêu dâm hoặc khỏa thân). Tệp bị hệ thống từ chối tải lên.'
          });
        }

        if (skinRatio >= 0.12) {
          return resolve({
            isNsfw: true,
            skinRatio,
            skinPercent,
            action: 'QUARANTINE_SUSPICIOUS',
            reason: 'Hình ảnh chứa nội dung nhạy cảm hoặc hở hang, không phù hợp với Tiêu chuẩn cộng đồng. Bài viết sẽ được tạm giữ 3 ngày và ẩn khỏi toàn bộ trang web khi bạn bấm Đăng để chờ giải trình kháng cáo.'
          });
        }

        return resolve({ isNsfw: false, skinRatio, skinPercent, action: 'CLEAN' });
      } catch {
        return resolve({ isNsfw: false, skinRatio: 0, skinPercent: 0, action: 'CLEAN' });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ isNsfw: false, skinRatio: 0, skinPercent: 0, action: 'CLEAN' });
    };
  });
};
