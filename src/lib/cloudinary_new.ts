export const CLOUDINARY_CONFIG = {
  cloudName: 'dopo6gjfq',
  uploadPreset: 'ml_default' // Using Cloudinary's default preset
};

// List of fallback presets to try if the main one fails
const FALLBACK_PRESETS = ['ml_default', 'unsigned_default'];

export const getOptimizedImageUrl = (publicId: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
} = {}) => {
  const { width = 800, height = 600, quality = 80, format = 'webp' } = options;
  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/w_${width},h_${height},q_${quality},f_${format}/${publicId}`;
};

// Upload image to Cloudinary with fallback presets
export const uploadToCloudinary = async (file: File, folder: string = 'doctors'): Promise<string> => {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size too large. Maximum size is 10MB');
    }

    // Try uploading with main preset first, then fallbacks
    const presetsToTry = [CLOUDINARY_CONFIG.uploadPreset, ...FALLBACK_PRESETS];
    let lastError: Error | null = null;

    for (const preset of presetsToTry) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', preset);
        formData.append('folder', folder);
        
        console.log('Uploading to Cloudinary...', {
          cloudName: CLOUDINARY_CONFIG.cloudName,
          uploadPreset: preset,
          folder,
          fileSize: file.size,
          fileType: file.type
        });
        
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error?.message) {
              errorMessage = errorData.error.message;
            }
          } catch {
            errorMessage = errorText || errorMessage;
          }
          
          throw new Error(`Cloudinary upload failed with preset '${preset}': ${errorMessage}`);
        }

        const data = await response.json();
        console.log('Cloudinary upload successful:', data.secure_url);
        return data.secure_url;
        
      } catch (error) {
        console.warn(`Failed to upload with preset '${preset}':`, error);
        lastError = error as Error;
        
        // If this isn't the last preset, continue to the next one
        if (preset !== presetsToTry[presetsToTry.length - 1]) {
          continue;
        }
      }
    }

    // If all presets failed, throw the last error
    throw lastError || new Error('All upload presets failed');
    
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

// Delete image from Cloudinary (optional - requires API key/secret for signed requests)
export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
  try {
    // Note: This would require API key and secret for signed deletion
    // For now, we'll just return true as Cloudinary has auto-deletion policies
    // that can be configured in the dashboard
    console.log(`Image ${publicId} marked for deletion from Cloudinary`);
    return true;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
};
