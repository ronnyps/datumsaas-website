export interface ProductVariant {
  id: string;
  label: string;
  detail: string;
  swatchClass: string;
  price: number;
  originalPrice?: number;
  currency: string;
  sku: string;
}

export interface ProductCardItem {
  id: string;
  name: string;
  category: string;
  badge?: string;
  previewTheme: string;
  emoji: string;
  variants: ProductVariant[];
}

export interface ProductVariantsContent {
  products: ProductCardItem[];
}
