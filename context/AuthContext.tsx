import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface User {
  role: 'admin' | 'employee';
  name: string;
  email?: string;
  id?: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  password?: string; // Optional in frontend object to avoid exposing always
  role: 'admin' | 'employee';
}

interface AuthContextType {
  user: User | null;
  employees: Employee[];
  loginAdmin: (email: string, pass: string) => Promise<boolean>;
  loginEmployee: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  addEmployee: (employee: Omit<Employee, 'id' | 'role'>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true); // Start true to check localStorage

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('admin_nexus_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem('admin_nexus_user');
      }
    }
    setLoading(false);
  }, []);

  // Fetch employees list (Admin only view essentially, but loaded for context)
  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setEmployees(data);
    }
  };

  useEffect(() => {
    // Initial fetch if user is logged in
    if (user?.role === 'admin') {
      fetchEmployees();
    }
  }, [user]);

  const login = async (email: string, pass: string, requiredRole?: 'admin' | 'employee'): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .eq('password', pass) // Note: In production, use Supabase Auth or hash passwords
        .single();

      if (error || !data) {
        setLoading(false);
        return false;
      }

      if (requiredRole && data.role !== requiredRole && data.role !== 'admin') {
          // Allow admin to login as employee if testing, but generally strict
          setLoading(false);
          return false;
      }

      const userData: User = { role: data.role, name: data.name, email: data.email, id: data.id };
      setUser(userData);
      localStorage.setItem('admin_nexus_user', JSON.stringify(userData));
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error(err);
      setLoading(false);
      return false;
    }
  };

  const loginAdmin = (email: string, pass: string) => login(email, pass, 'admin');
  const loginEmployee = (email: string, pass: string) => login(email, pass);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('admin_nexus_user');
  };

  const addEmployee = async (emp: Omit<Employee, 'id' | 'role'>) => {
    const { error } = await supabase
        .from('employees')
        .insert([{ ...emp, role: 'employee' }]);
    
    if (!error) {
        fetchEmployees();
    } else {
        console.error("Error adding employee:", error);
    }
  };

  const deleteEmployee = async (id: string) => {
    const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

    if (!error) {
        fetchEmployees();
    }
  };

  if (loading && !user) {
      // Optional: Return a loader here if you want to block rendering until auth check is done
      return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      employees, 
      loginAdmin, 
      loginEmployee, 
      logout, 
      addEmployee, 
      deleteEmployee,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};