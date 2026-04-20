import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, LogOut, FileText, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      isActive
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
    }`;

  const footerNavClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-center p-3 rounded-lg transition-all duration-200 flex-1 ${
      isActive
        ? 'bg-blue-100 text-blue-600'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <>
      <div 
        className={`
          fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-30
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:static lg:h-screen lg:z-auto
        `}
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-lg">
              F
            </div>
            <span className="text-lg md:text-xl">Fahim Shop</span>
          </h1>
          {/* Mobile Close Button */}
          <button 
            onClick={onClose}
            className="lg:hidden p-1 text-gray-500 hover:bg-gray-100 rounded-md"
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-6 pb-2 pt-2">
            {user && (
            <p className="text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded inline-block">
                Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </p>
            )}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {user?.role === 'admin' && (
            <NavLink to="/" className={navClass} onClick={() => window.innerWidth < 1024 && onClose()}>
              <LayoutDashboard size={20} />
              <span className="font-medium">Dashboard</span>
            </NavLink>
          )}
          
          <NavLink to="/sales" className={navClass} onClick={() => window.innerWidth < 1024 && onClose()}>
            <FileText size={20} />
            <span className="font-medium">Sales Entry</span>
          </NavLink>
          
          {user?.role === 'admin' && (
            <>
              <NavLink to="/products" className={navClass} onClick={() => window.innerWidth < 1024 && onClose()}>
                <ShoppingBag size={20} />
                <span className="font-medium">Products</span>
              </NavLink>
              <NavLink to="/inventory" className={navClass} onClick={() => window.innerWidth < 1024 && onClose()}>
                <Package size={20} />
                <span className="font-medium">Inventory</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100 mt-auto">
          <div className="flex gap-2">
              {user?.role === 'admin' && (
                <NavLink to="/profile" className={footerNavClass} title="Profile" onClick={() => window.innerWidth < 1024 && onClose()}>
                    <User size={20} />
                </NavLink>
              )}
              <button 
                  onClick={logout}
                  className="flex items-center justify-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg flex-[2] transition-colors font-medium text-sm"
              >
                  <LogOut size={20} />
                  <span>Logout</span>
              </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;