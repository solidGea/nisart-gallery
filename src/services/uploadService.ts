interface UploadFileData {
  title: string;
  description: string;
  tags: string[];
  category: string;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    uploadedImages: {
      id: string;
      filename: string;
      originalName: string;
      size: number;
      url: string;
      thumbnailUrl: string | null;
    }[];
    errors?: {
      filename: string;
      error: string;
    }[];
  };
  error?: string;
}

export class UploadService {
  // Use Vite env variable when available; otherwise default to the production host with API prefix
  private static readonly BASE_URL = ((import.meta.env as any).VITE_API_BASE as string) || 'https://nisa.blockdev.my.id/api/v1';
  
  static async uploadImages(
    files: File[],
    fileData: UploadFileData[]
  ): Promise<UploadResponse> {
    try {
      // Create FormData
      const formData = new FormData();
      
      // Add files
      files.forEach((file) => {
        formData.append('images', file);
      });
      
      // Add metadata (current backend expects single metadata for all files)
      // For now, we'll use the first file's metadata
      const data = fileData[0];
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      
      // Add tags as array elements
      data.tags.forEach((tag, index) => {
        formData.append(`tags[${index}]`, tag);
      });

      // Make API request
      const response = await fetch(`${this.BASE_URL}/images/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: UploadResponse = await response.json();
      return result;

    } catch (error) {
      console.error('Upload error:', error);
      
      if (error instanceof Error) {
        return {
          success: false,
          message: 'Upload failed',
          error: error.message
        };
      }
      
      return {
        success: false,
        message: 'Unknown upload error',
        error: 'An unexpected error occurred'
      };
    }
  }

  static async uploadSingleImage(
    file: File,
    data: UploadFileData,
  ): Promise<UploadResponse> {
    return this.uploadImages([file], [data]);
  }

  // Upload with XMLHttpRequest for progress tracking
  static uploadImagesWithProgress(
    files: File[],
    fileData: UploadFileData[],
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Create FormData
      const formData = new FormData();
      
      // Add files
      files.forEach((file) => {
        formData.append('images', file);
      });
      
      // Add metadata (current backend expects single metadata for all files)
      // For now, we'll use the first file's metadata
      const data = fileData[0];
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      
      // Add tags as array elements
      data.tags.forEach((tag, index) => {
        formData.append(`tags[${index}]`, tag);
      });

      // Progress tracking
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded * 100) / event.total)
          };
          onProgress(progress);
        }
      };

      // Handle response
      xhr.onload = () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response: UploadResponse = JSON.parse(xhr.responseText);
            resolve(response);
          } else {
            reject(new Error(`HTTP error! status: ${xhr.status}`));
          }
        } catch (error) {
          reject(error);
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error occurred'));
      };

      xhr.ontimeout = () => {
        reject(new Error('Upload timeout'));
      };

      // Configure request
      xhr.timeout = 5 * 60 * 1000; // 5 minutes timeout
      xhr.open('POST', `${this.BASE_URL}/images/upload`);
      xhr.withCredentials = true; // Include cookies for authentication
      
      // Send request
      xhr.send(formData);
    });
  }
}

export type { UploadFileData, UploadProgress, UploadResponse };