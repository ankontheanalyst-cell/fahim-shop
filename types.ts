export type Category = string;

export const CATEGORIES: Category[] = [
  'Smartphone', 
  'Button Phone', 
  'Airbuds', 
  'Neckband', 
  'Smart Watch', 
  'Power Bank'
];

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export interface Product {
  id: string;
  category: Category;
  brand: string;
  modelName: string;
  price: number;
  quantity: number;
  description?: string;
}

export interface SalesMetric {
  month: string;
  totalSales: number;
  totalProfit: number;
  totalOrders: number;
  revenue: number;
}

export interface CategorySales {
  name: string;
  sales: number;
}

export interface RevenueDistribution {
  name: string;
  value: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  category: string;
  brand: string;
  quantity: number;
  unitPrice: number;
  total: number;
  buyingPrice: number; // Stored to calculate profit later if needed
}

export interface SaleRecord {
  id: string;
  customerName: string;
  customerPhone?: string;
  items: SaleItem[];
  totalAmount: number;
  paidAmount?: number;
  dueAmount?: number;
  commitmentDate?: string; // Date when the due amount is promised to be paid
  date: string; // ISO Date string YYYY-MM-DD
  timestamp: number;
}