
export const CLOUDINARY_CONFIG = {
  cloudName: 'dopo6gjfq',
  uploadPreset: 'care hospital'
};

export const getOptimizedImageUrl = (publicId: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
} = {}) => {
  const { width = 800, height = 600, quality = 80, format = 'webp' } = options;
  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/w_${width},h_${height},q_${quality},f_${format}/${publicId}`;
};
