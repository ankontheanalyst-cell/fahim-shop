import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import SalesEntry from './pages/SalesEntry';
import Profile from './pages/Profile';
import Login from './pages/Login';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Menu } from 'lucide-react';

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans relative overflow-hidden">
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Responsive Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 w-full h-screen overflow-y-auto relative">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 pb-2 sticky top-0 bg-gray-50 z-10 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <button 
               onClick={() => setSidebarOpen(true)}
               className="p-2 bg-white rounded-lg border border-gray-200 text-gray-600 shadow-sm hover:bg-gray-50"
             >
               <Menu size={24} />
             </button>
             <span className="font-bold text-lg text-gray-800">Fahim Shop</span>
           </div>
        </div>

        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto pb-20">
          {children}
        </div>
      </main>
    </div>
  );
};

// Component to handle Auth state redirection
const AppContent = () => {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  const isEmployee = user.role === 'employee';

  return (
    <DataProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route 
              path="/" 
              element={isEmployee ? <Navigate to="/sales" replace /> : <Dashboard />} 
            />
            <Route path="/sales" element={<SalesEntry />} />
            <Route 
              path="/products" 
              element={isEmployee ? <Navigate to="/sales" replace /> : <Products />} 
            />
            <Route 
              path="/inventory" 
              element={isEmployee ? <Navigate to="/sales" replace /> : <Inventory />} 
            />
            <Route 
              path="/profile" 
              element={isEmployee ? <Navigate to="/sales" replace /> : <Profile />} 
            />
            <Route 
              path="*" 
              element={<Navigate to={isEmployee ? "/sales" : "/"} replace />} 
            />
          </Routes>
        </Layout>
      </HashRouter>
    </DataProvider>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;