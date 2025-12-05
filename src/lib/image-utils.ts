/**
 * Compresses an image file using HTML Canvas API.
 * Returns a Promise that resolves to a Base64 string (Data URL).
 * 
 * @param file - The image file to compress
 * @param maxWidth - Maximum width of the output image (default: 1200px)
 * @param quality - JPEG quality between 0 and 1 (default: 0.7)
 */
export async function compressImage(file: File, maxWidth = 1200, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
        }
        // Draw image to canvas
        ctx.drawImage(img, 0, 0, width, height);
        // Convert to Base64 (JPEG)
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(new Error('Failed to load image for compression'));
    };
    reader.onerror = (err) => reject(new Error('Failed to read file'));
  });
}