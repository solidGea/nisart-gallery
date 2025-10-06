export interface Image {
  id: string;
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  filename?: string;
  originalFilename?: string;
  mimeType?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  category: string;
  tags: string[];
  dateCreated?: Date;
  created_at?: string;
  upload_date?: string;
  photographer?: string;
  downloadable?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageCount: number;
}

export interface Album {
  id: string;
  title: string;
  description?: string;
  coverImage: string;
  images: string[]; // Image IDs
  featured: boolean;
}

export interface FilterOptions {
  category?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}