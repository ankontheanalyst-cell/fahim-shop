import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, ShieldCheck, Briefcase } from 'lucide-react';

const Login = () => {
  const { loginAdmin, loginEmployee } = useAuth();
  
  const [role, setRole] = useState<'admin' | 'employee'>('employee'); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ensure fields are blank on mount
  useEffect(() => {
    setEmail('');
    setPassword('');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (role === 'admin') {
      const success = await loginAdmin(email, password);
      if (!success) {
        const msg = 'Invalid admin credentials.';
        window.alert(msg);
        setError(msg);
        setIsSubmitting(false);
      } else {
        // Clear fields
        setEmail('');
        setPassword('');
        // Force redirect to Dashboard root, ignoring previous hash
        window.location.hash = '/';
      }
    } else {
      const success = await loginEmployee(email, password);
      if (!success) {
        const msg = 'Invalid employee email or password.';
        window.alert(msg);
        setError(msg);
        setIsSubmitting(false);
      } else {
         // Clear fields
        setEmail('');
        setPassword('');
        // Force redirect to Sales
        window.location.hash = '/sales';
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-blue-600 p-8 text-center">
           <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 text-white text-3xl font-bold shadow-lg">
              F
           </div>
           <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
           <p className="text-blue-100 text-sm mt-1">Sign in to Fahim Shop Dashboard</p>
        </div>

        <div className="p-8">
            {/* Role Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
                <button
                    type="button"
                    onClick={() => { setRole('employee'); setError(''); setEmail(''); setPassword(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${role === 'employee' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Briefcase size={18} /> Employee
                </button>
                <button
                    type="button"
                    onClick={() => { setRole('admin'); setError(''); setEmail(''); setPassword(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${role === 'admin' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <ShieldCheck size={18} /> Admin
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {role === 'admin' ? 'Admin Email' : 'Employee Email'}
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-white text-black"
                                placeholder={role === 'admin' ? "admin@fahimshop.com" : "employee@fahimshop.com"}
                                autoFocus
                                autoComplete="off"
                                name="email_off" 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-white text-black"
                                placeholder="••••••"
                                autoComplete="new-password"
                                name="password_off"
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                        {error}
                    </div>
                )}

                <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                >
                   {isSubmitting ? 'Verifying...' : (role === 'employee' ? 'Login' : 'Login as Admin')}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default Login;