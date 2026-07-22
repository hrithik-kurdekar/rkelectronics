import { getMediaLimits } from '@/lib/media-limits';

/**
 * Center-crop to a square WebP using configurable edge length + quality.
 */
export function compressImageToWebp(file, limits = getMediaLimits()) {
  const targetSize = limits.imageMaxEdge;
  const quality = limits.imageWebpQuality;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetSize;
        canvas.height = targetSize;

        let sourceX = 0;
        let sourceY = 0;
        const sourceSize = Math.min(img.width, img.height);

        if (img.width > img.height) {
          sourceX = Math.round((img.width - img.height) / 2);
        } else if (img.height > img.width) {
          sourceY = Math.round((img.height - img.width) / 2);
        }

        const ctx = canvas.getContext('2d');
        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceSize,
          sourceSize,
          0,
          0,
          targetSize,
          targetSize
        );

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Image compression failed.'));
              return;
            }
            resolve(
              new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.webp', {
                type: 'image/webp',
                lastModified: Date.now(),
              })
            );
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => reject(new Error('Could not load image for compression.'));
    };
    reader.onerror = (err) => reject(err);
  });
}
