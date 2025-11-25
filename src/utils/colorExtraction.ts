interface ColorCount {
  color: string;
  count: number;
  rgb: { r: number; g: number; b: number };
}

const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

const colorDistance = (c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }): number => {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
};

const isColorDistinct = (color: { r: number; g: number; b: number }, existingColors: { r: number; g: number; b: number }[], minDistance: number = 50): boolean => {
  return existingColors.every(existing => colorDistance(color, existing) > minDistance);
};

export const extractColorsFromImage = async (imageUrl: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Resize image for faster processing
        const maxSize = 200;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const colorMap = new Map<string, ColorCount>();
        
        // Sample pixels (every 4th pixel for performance)
        for (let i = 0; i < data.length; i += 16) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          
          // Skip transparent or near-white/near-black pixels
          if (a < 128) continue;
          if (r > 240 && g > 240 && b > 240) continue;
          if (r < 15 && g < 15 && b < 15) continue;
          
          // Quantize colors to reduce variations
          const qR = Math.round(r / 10) * 10;
          const qG = Math.round(g / 10) * 10;
          const qB = Math.round(b / 10) * 10;
          
          const hex = rgbToHex(qR, qG, qB);
          
          if (colorMap.has(hex)) {
            const existing = colorMap.get(hex)!;
            existing.count++;
          } else {
            colorMap.set(hex, { color: hex, count: 1, rgb: { r: qR, g: qG, b: qB } });
          }
        }
        
        // Sort by frequency
        const sortedColors = Array.from(colorMap.values())
          .sort((a, b) => b.count - a.count);
        
        // Select distinct colors
        const selectedColors: string[] = [];
        const selectedRgb: { r: number; g: number; b: number }[] = [];
        
        for (const colorData of sortedColors) {
          if (selectedColors.length >= 5) break;
          
          if (isColorDistinct(colorData.rgb, selectedRgb, 60)) {
            selectedColors.push(colorData.color);
            selectedRgb.push(colorData.rgb);
          }
        }
        
        // Ensure we have at least 5 colors
        while (selectedColors.length < 5 && sortedColors.length >= selectedColors.length) {
          const nextColor = sortedColors[selectedColors.length];
          if (nextColor && !selectedColors.includes(nextColor.color)) {
            selectedColors.push(nextColor.color);
          } else {
            break;
          }
        }
        
        resolve(selectedColors.slice(0, 5));
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
};

export const extractColorsFromFile = async (file: File): Promise<string[]> => {
  const imageUrl = URL.createObjectURL(file);
  try {
    const colors = await extractColorsFromImage(imageUrl);
    URL.revokeObjectURL(imageUrl);
    return colors;
  } catch (error) {
    URL.revokeObjectURL(imageUrl);
    throw error;
  }
};
