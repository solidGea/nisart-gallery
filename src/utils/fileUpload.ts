// File upload utilities
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
export const ALLOWED_EXTENSIONS = ['jpeg', 'jpg', 'png', 'svg', 'img'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateFileType = (file: File): FileValidationResult => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
    return {
      isValid: false,
      error: `File type not allowed. Only ${ALLOWED_EXTENSIONS.join(', ').toUpperCase()} files are accepted.`
    };
  }

  // Special handling for 'img' extension (treat as generic image)
  if (fileExtension === 'img') {
    // Allow .img files as they might be generic image files
    return { isValid: true };
  }

  // Check MIME type for other extensions
  if (!ALLOWED_FILE_TYPES.includes(file.type) && fileExtension !== 'img') {
    return {
      isValid: false,
      error: `Invalid file type. Only image files are allowed.`
    };
  }

  return { isValid: true };
};

export const validateFileSize = (file: File): FileValidationResult => {
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size too large. Maximum size allowed is ${formatFileSize(MAX_FILE_SIZE)}.`
    };
  }

  return { isValid: true };
};

export const validateFile = (file: File): FileValidationResult => {
  const typeValidation = validateFileType(file);
  if (!typeValidation.isValid) {
    return typeValidation;
  }

  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.isValid) {
    return sizeValidation;
  }

  return { isValid: true };
};

export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const generateImageId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};