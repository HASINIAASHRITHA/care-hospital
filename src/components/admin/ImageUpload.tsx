import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  initialImage?: string;
  onImageChange: (file: File | null) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ initialImage = '', onImageChange }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(initialImage || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Update preview when initialImage changes
  useEffect(() => {
    if (initialImage) {
      setImagePreview(initialImage);
    }
  }, [initialImage]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    
    if (!file) {
      return;
    }
    
    // Validate file type
    if (!file.type.match('image.*')) {
      setError('Please select an image file (JPEG, PNG, etc.)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Send file to parent component
    onImageChange(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    onImageChange(null);
    setError(null);
  };
  
  // Handle errors with external image URLs (e.g., CORS issues)
  const handleImageError = () => {
    if (initialImage && imagePreview === initialImage) {
      toast({
        title: "Image Loading Error",
        description: "Unable to load the existing image due to CORS restrictions. Upload a new image or see setup instructions.",
        variant: "destructive"
      });
      // Keep the URL but show fallback UI
      setError('Unable to preview the image due to CORS restrictions');
    }
  };

  return (
    <div className="space-y-4">
      {imagePreview ? (
        <div className="relative rounded-md overflow-hidden border border-gray-200 max-w-xs">
          {error ? (
            <div className="flex flex-col items-center justify-center bg-gray-100 h-48 w-full text-center p-4">
              <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-500 text-sm">Image preview unavailable</p>
              <p className="text-red-500 text-xs mt-1">{error}</p>
            </div>
          ) : (
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="h-48 w-auto object-cover"
              onError={handleImageError} 
            />
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-90"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border border-dashed border-gray-300 rounded-md p-6 text-center">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-4">
            Drag and drop an image, or click to select
          </p>
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="image-upload"
          />
          <Button
            type="button"
            variant="outline"
            className="mt-2"
            onClick={() => fileInputRef.current?.click()}
          >
            Select Image
          </Button>
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>
      )}
    </div>
  );
};
