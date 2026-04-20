import React, { useState } from 'react';
import { User, Mail, Lock, Key, CheckCircle, Shield, AlertCircle, Trash2, Plus, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, employees, addEmployee, deleteEmployee } = useAuth();

  // Mock User Data for Admin Profile
  const [userInfo, setUserInfo] = useState({
    name: user?.name || 'Admin User',
    email: user?.email || 'admin@fahimshop.com'
  });

  // Admin Password State
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // New Employee Form State
  const [newEmp, setNewEmp] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  // Notification State
  const [notification, setNotification] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({ 
    show: false, 
    message: '', 
    type: 'success' 
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.current || !passwords.new) {
        showToast('Please fill required fields', 'error');
        return;
    }
    if (passwords.new !== passwords.confirm) {
        showToast('Passwords do not match', 'error');
        return;
    }
    // Simulate update
    setTimeout(() => {
        showToast('Password updated successfully!');
        setPasswords({ current: '', new: '', confirm: '' });
    }, 500);
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.name || !newEmp.email || !newEmp.password) {
        showToast('All fields are required', 'error');
        return;
    }
    if (employees.some(e => e.email === newEmp.email)) {
        showToast('Email already exists', 'error');
        return;
    }
    addEmployee(newEmp);
    setNewEmp({ name: '', email: '', password: '' });
    showToast('Employee added successfully');
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {notification.show && (
        <div className={`fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-5 duration-300 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 text-white ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
        <p className="text-gray-500 text-sm">Manage your account and employee access.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Personal Info & Password */}
        <div className="space-y-6">
          
          {/* Personal Information */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="text-blue-600" size={20} />
                Personal Information
            </h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            value={userInfo.name}
                            onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-gray-900"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="email" 
                            value={userInfo.email}
                            readOnly
                            disabled
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
                </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="text-blue-600" size={20} />
                Security Settings
            </h3>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="password" 
                            value={passwords.current}
                            onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-gray-900"
                            placeholder="••••••••"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                type="password" 
                                value={passwords.new}
                                onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-gray-900"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                type="password" 
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-gray-900"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                </div>
                <div className="pt-2 flex justify-end">
                    <button 
                        type="submit"
                        className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors shadow-lg shadow-gray-900/10"
                    >
                        Update Password
                    </button>
                </div>
            </form>
          </div>

        </div>

        {/* Right Column: Employee Management - Only Visible to Admin */}
        {user?.role === 'admin' && (
            <div className="space-y-6">
                
                {/* Add New Employee */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Users className="text-blue-600" size={20} />
                        Add Employee
                    </h3>
                    <form onSubmit={handleAddEmployee} className="space-y-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input 
                                type="text" 
                                value={newEmp.name}
                                onChange={(e) => setNewEmp({...newEmp, name: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-gray-900"
                                placeholder="Employee Name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input 
                                type="email" 
                                value={newEmp.email}
                                onChange={(e) => setNewEmp({...newEmp, email: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-gray-900"
                                placeholder="employee@fahimshop.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input 
                                type="text" 
                                value={newEmp.password}
                                onChange={(e) => setNewEmp({...newEmp, password: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-gray-900"
                                placeholder="Set password"
                            />
                        </div>
                        <button 
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md shadow-blue-500/20"
                        >
                            <Plus size={18} /> Add Employee
                        </button>
                    </form>
                </div>

                {/* Existing Employees List */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Existing Employees</h3>
                    <div className="space-y-3">
                        {employees.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">No employees added yet.</p>
                        ) : (
                            employees.map(emp => (
                                <div key={emp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="overflow-hidden">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-gray-900 text-sm truncate">{emp.name}</p>
                                            {emp.role === 'admin' && (
                                                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase">Admin</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">{emp.email}</p>
                                    </div>
                                    
                                    {emp.role !== 'admin' ? (
                                        <button 
                                            onClick={() => deleteEmployee(emp.id)}
                                            className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                                            title="Remove Employee"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    ) : (
                                        <div className="p-2 text-gray-300 cursor-not-allowed" title="Admin accounts cannot be deleted">
                                            <Shield size={16} />
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Profile;