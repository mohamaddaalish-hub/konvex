export interface Spec {
  key: string;
  label: string;
  value: string;
  unit?: string;
  highlight?: boolean;
}
export interface ProductImage {
  url: string;
  alt: string;
}
export interface ProductDocument {
  name: string;
  url: string;
  type: string;
}
export interface Product {
  id: string;
  sku: string;
  slug: string;
  brandId: string;
  brand: string;
  categoryId: string;
  subcategory: string;
  name: string;
  model: string;
  shortDescription: string;
  longDescription: string;
  specifications: Spec[];
  applications: string[];
  features: string[];
  images: ProductImage[];
  videos: string[];
  documents: ProductDocument[];
  manuals: ProductDocument[];
  warranty: string;
  availability: "inquiry" | "in_stock" | "unavailable";
  price: number | null;
  discount: number;
  tags: string[];
  relatedProductIds: string[];
  compatibleProductIds: string[];
  accessoryIds: string[];
  included: string[];
  faq: { question: string; answer: string }[];
  featured: boolean;
  isNew: boolean;
  popularityRank: number;
  isSample: boolean;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  updatedAt: string;
}
export type ProductSummary = {
  displayDictionary?: Record<string, string>;
} & Pick<
  Product,
  | "id"
  | "slug"
  | "name"
  | "model"
  | "sku"
  | "brand"
  | "categoryId"
  | "shortDescription"
  | "specifications"
  | "images"
  | "featured"
  | "isNew"
  | "price"
  | "availability"
  | "isSample"
>;
export interface FilterDefinition {
  key: string;
  label: string;
  numeric?: boolean;
}
export interface Category {
  id: string;
  slug: string;
  name: string;
  english: string;
  description: string;
  image: string;
  filters: FilterDefinition[];
  parentId?: string;
  order: number;
  count?: number;
}
export interface Brand {
  id: string;
  name: string;
  english: string;
  description: string;
  logo: string;
}
export interface Application {
  id: string;
  slug: string;
  name: string;
  title: string;
  description: string;
  image: string;
  icon: string;
  categories: string[];
}
export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  readTime: number;
  sections: { title: string; body: string }[];
  relatedCategory: string;
  publishedAt: string;
  seoTitle: string;
  seoDescription: string;
}
export interface SiteSettings {
  name: string;
  englishName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  hours: string;
  mapUrl: string;
  instagram: string;
  linkedin: string;
  sampleMode: boolean;
}
export interface QueryOptions {
  locale?: "fa" | "en";
  category?: string;
  application?: string;
  query?: string;
  filters?: Record<string, string[]>;
  brand?: string[];
  sort?: string;
  page?: number;
  pageSize?: number;
  collection?: "featured" | "new" | "popular";
}
export interface Facet {
  key: string;
  label: string;
  options: { value: string; label?: string; count: number }[];
}
export interface CatalogResult {
  products: ProductSummary[];
  total: number;
  page: number;
  pages: number;
  pageSize: number;
  facets: Facet[];
}
export interface QuoteItem {
  productId: string;
  quantity: number;
}
export interface Quote {
  id: string;
  reference: string;
  name: string;
  phone: string;
  email: string;
  items: (QuoteItem & { name: string; model: string })[];
  notes: string;
  preferredContact: "phone" | "whatsapp" | "email";
  purpose: "quote" | "consultation";
  status: string;
  createdAt: string;
}
