export interface StoreItem {
  id: string;
  name: string;
  sizes?: string[];
  active: boolean;
  deadline?: string;
  imageUrls?: string[];
}

export const SIZE_OPTIONS = ['P', 'M', 'G', 'GG'];
