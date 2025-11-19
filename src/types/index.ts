// Peptide Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  base_price: number;
  discount_price: number | null;
  discount_start_date: string | null;
  discount_end_date: string | null;
  discount_active: boolean;
  
  // Peptide-specific fields
  purity_percentage: number;
  molecular_weight: string | null;
  cas_number: string | null;
  sequence: string | null;
  storage_conditions: string;
  inclusions: string[] | null;
  
  // Stock and availability
  stock_quantity: number;
  available: boolean;
  featured: boolean;
  
  // Images and metadata
  image_url: string | null;
  safety_sheet_url: string | null;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  variations?: ProductVariation[];
}

export interface ProductVariation {
  id: string;
  product_id: string;
  name: string;
  quantity_mg: number;
  price: number;
  stock_quantity: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  account_number: string;
  account_name: string;
  qr_code_url: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SiteSetting {
  id: string;
  value: string;
  type: string;
  description: string | null;
  updated_at: string;
}

// Cart Types
export interface CartItem {
  product: Product;
  variation?: ProductVariation;
  quantity: number;
  price: number;
}

// Order Types
export interface OrderDetails {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  payment_method: string;
  notes?: string;
}

// COA Report Types
export interface COAReport {
  id: string;
  product_name: string;
  batch_number: string | null;
  quantity_mg: number | null;
  purity_percentage: number;
  verification_key: string | null;
  verification_url: string | null;
  report_image_url: string;
  lab_name: string;
  test_date: string | null;
  featured: boolean;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}
