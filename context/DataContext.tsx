import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Product, SalesMetric, SaleRecord, MONTHS, SaleItem } from '../types';

interface DataContextType {
  products: Product[];
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  salesData: SalesMetric[];
  getFilteredSalesData: (month: string) => SalesMetric | undefined;
  
  recordSale: (transaction: { 
    customerName: string, 
    customerPhone?: string, 
    date: string, 
    items: Omit<SaleItem, 'buyingPrice' | 'productName' | 'category' | 'brand' | 'total'>[],
    paidAmount?: number,
    dueAmount?: number,
    commitmentDate?: string
  }) => Promise<boolean>;
  
  updateSalePayment: (saleId: string, paymentAmount: number, newCommitmentDate?: string) => Promise<void>;

  recentSales: SaleRecord[];
  allSales: SaleRecord[];

  categories: string[];
  brands: string[];
  models: string[];
  
  removeCategory: (category: string) => void;
  removeBrand: (brand: string) => void;
  removeModel: (model: string) => void;
  
  refreshData: () => void;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children?: React.ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [salesData, setSalesData] = useState<SalesMetric[]>([]);
  const [recentSales, setRecentSales] = useState<SaleRecord[]>([]);
  const [allSales, setAllSales] = useState<SaleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic Lists State
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    
    // 1. Fetch Products
    const { data: prodData } = await supabase
      .from('products')
      .select('*')
      .order('category', { ascending: true });
    
    if (prodData) {
        // Map snake_case to camelCase
        const mappedProducts: Product[] = prodData.map((p: any) => ({
            id: p.id,
            category: p.category,
            brand: p.brand,
            modelName: p.model_name,
            price: p.price,
            quantity: p.quantity,
            description: p.description
        }));
        setProducts(mappedProducts);

        // Extract Lists
        const cats = new Set<string>();
        const brs = new Set<string>();
        const mods = new Set<string>();
        mappedProducts.forEach(p => {
            cats.add(p.category);
            brs.add(p.brand);
            mods.add(p.modelName);
        });
        setCategories(Array.from(cats));
        setBrands(Array.from(brs));
        setModels(Array.from(mods));
    }

    // 2. Fetch Sales History (Last 12 Months for dashboard, All for history)
    // For simplicity in this demo, fetching all. In prod, use pagination.
    const { data: saleData } = await supabase
        .from('sales')
        .select(`
            *,
            sale_items (*)
        `)
        .order('timestamp', { ascending: false });

    if (saleData) {
        const mappedSales: SaleRecord[] = saleData.map((s: any) => ({
            id: s.id,
            customerName: s.customer_name,
            customerPhone: s.customer_phone,
            date: s.date,
            totalAmount: s.total_amount,
            paidAmount: s.paid_amount,
            dueAmount: s.due_amount,
            commitmentDate: s.commitment_date,
            timestamp: s.timestamp,
            items: s.sale_items.map((i: any) => ({
                productId: i.product_id,
                productName: i.product_name,
                category: i.category,
                brand: i.brand,
                quantity: i.quantity,
                unitPrice: i.unit_price,
                buyingPrice: i.buying_price,
                total: i.total
            }))
        }));

        setAllSales(mappedSales);
        
        // Filter for Recent (Current Month)
        const now = new Date();
        const currentMonthSales = mappedSales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
        });
        setRecentSales(currentMonthSales);

        // Process Dashboard Stats
        processDashboardStats(mappedSales);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const processDashboardStats = (sales: SaleRecord[]) => {
      const metrics: Record<string, SalesMetric> = {};
      
      MONTHS.forEach(m => {
          metrics[m] = { month: m, totalSales: 0, totalProfit: 0, totalOrders: 0, revenue: 0 };
      });

      sales.forEach(sale => {
          const d = new Date(sale.date);
          const monthName = MONTHS[d.getMonth()];
          
          if (metrics[monthName]) {
              const itemsQty = sale.items.reduce((acc, i) => acc + i.quantity, 0);
              metrics[monthName].totalSales += itemsQty;
              metrics[monthName].totalOrders += 1;
              metrics[monthName].revenue += (sale.paidAmount || 0);

              // Profit Calculation: Only if fully paid or calculate partial profit?
              // Simple logic: Profit = (Unit Price - Buying Price) * Qty
              // Recognized Profit logic: If due > 0, maybe don't count profit yet? 
              // Let's stick to: Count profit if sale is fully paid.
              if (!sale.dueAmount || sale.dueAmount <= 0) {
                  const cost = sale.items.reduce((acc, i) => acc + (i.buyingPrice * i.quantity), 0);
                  const saleProfit = sale.totalAmount - cost;
                  metrics[monthName].totalProfit += saleProfit;
              }
          }
      });
      
      setSalesData(Object.values(metrics));
  };

  const addProduct = async (product: Product) => {
    await supabase.from('products').insert([{
        category: product.category,
        brand: product.brand,
        model_name: product.modelName,
        price: product.price,
        quantity: product.quantity,
        description: product.description
    }]);
    fetchData(); // Refresh to get ID and ensure sync
  };

  const updateProduct = async (product: Product) => {
    await supabase.from('products').update({
        category: product.category,
        brand: product.brand,
        model_name: product.modelName,
        price: product.price,
        quantity: product.quantity,
        description: product.description
    }).eq('id', product.id);
    fetchData();
  };

  const deleteProduct = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    fetchData();
  };

  const getFilteredSalesData = (month: string) => {
    return salesData.find(d => d.month === month);
  };

  const recordSale = async (transaction: { 
    customerName: string, 
    customerPhone?: string, 
    date: string, 
    items: Omit<SaleItem, 'buyingPrice' | 'productName' | 'category' | 'brand' | 'total'>[],
    paidAmount?: number,
    dueAmount?: number,
    commitmentDate?: string
  }) => {
    
    // 1. Prepare items with full details for JSONB
    const fullItems = transaction.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) throw new Error("Product not found");
        return {
            productId: item.productId,
            productName: product.modelName,
            category: product.category,
            brand: product.brand,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            buyingPrice: product.price // Current buying cost
        };
    });

    // 2. Call RPC
    const { error } = await supabase.rpc('record_sale_transaction', {
        p_customer_name: transaction.customerName,
        p_customer_phone: transaction.customerPhone || '',
        p_date: transaction.date,
        p_paid_amount: transaction.paidAmount || 0,
        p_due_amount: transaction.dueAmount || 0,
        p_commitment_date: transaction.commitmentDate || null,
        p_timestamp: Date.now(),
        p_items: fullItems
    });

    if (error) {
        console.error("Sale Error:", error);
        return false;
    }

    fetchData(); // Refresh Inventory and Sales History
    return true;
  };

  const updateSalePayment = async (saleId: string, paymentAmount: number, newCommitmentDate?: string) => {
      // Logic: Get current sale -> calculate new due -> update
      const sale = allSales.find(s => s.id === saleId);
      if (!sale) return;

      const newPaid = (sale.paidAmount || 0) + paymentAmount;
      const newDue = Math.max(0, sale.totalAmount - newPaid);

      await supabase.from('sales').update({
          paid_amount: newPaid,
          due_amount: newDue,
          commitment_date: newDue > 0 ? newCommitmentDate : null
      }).eq('id', saleId);

      fetchData();
  };

  const removeCategory = (cat: string) => setCategories(prev => prev.filter(c => c !== cat));
  const removeBrand = (brand: string) => setBrands(prev => prev.filter(b => b !== brand));
  const removeModel = (model: string) => setModels(prev => prev.filter(m => m !== model));

  return (
    <DataContext.Provider value={{ 
      products, 
      addProduct, 
      updateProduct,
      deleteProduct, 
      salesData, 
      getFilteredSalesData, 
      recordSale,
      updateSalePayment,
      recentSales, 
      allSales,          
      categories,
      brands,
      models,
      removeCategory,
      removeBrand,
      removeModel,
      refreshData: fetchData,
      isLoading
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};