import React, { useState, useMemo, useEffect } from 'react';

const _fixReact = React; // 🔥 IMPORTANT FIX (DO NOT REMOVE)

import { motion } from 'framer-motion';
import { useRegistrations, updateRegistrationStatus } from '../services/firebaseService';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { 
  Users, 
  Download, 
  CheckCircle, 
  XCircle, 
  Eye, 
  LogOut, 
  TrendingUp, 
  Calendar,
  Loader2,
  Lock
} from 'lucide-react';
import { Registration } from '../types';

export const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { registrations, loading } = useRegistrations(isAdmin);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user);
      setIsCheckingAdmin(false);
    });
    return unsubscribe;
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const email = username.includes('@') ? username : `${username}@horizon.com`;
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential') {
        setLoginError("Invalid ID or Password.");
      } else {
        setLoginError(error.message || "Login failed.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleStatusUpdate = async (reg: Registration, status: 'approved' | 'rejected') => {
    try {
      await updateRegistrationStatus(reg, status);
    } catch {
      alert("Failed to update status");
    }
  };

  const filteredData = useMemo(() => {
    return registrations.filter(reg => {
      const matchesSearch = reg.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           reg.registrationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           reg.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || reg.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [registrations, searchTerm, filterStatus]);

  const totalRevenue = registrations
    .filter(r => r.status === 'approved')
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-neon-pink" size={48} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-black">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-neon-pink/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <Lock className="text-neon-pink" size={32} />
          </div>

          <h2 className="text-4xl font-bold mb-2">Admin <span className="neon-text">Portal</span></h2>

          <form onSubmit={handleLogin} className="space-y-6 mt-8">
            <input 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4"
              placeholder="Admin ID"
              required
            />

            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4"
              placeholder="Password"
              required
            />

            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}

            <button type="submit" className="neon-btn w-full py-4 rounded-xl font-bold">
              {loginLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Access Dashboard"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto">

      <div className="flex justify-between mb-10">
        <h2 className="text-4xl font-bold">Admin <span className="neon-text">Dashboard</span></h2>
        <button onClick={handleLogout} className="text-red-500 flex gap-2 items-center">
          <LogOut size={20} /> Logout
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="glass p-6"><Users /> {registrations.length}</div>
        <div className="glass p-6"><TrendingUp /> ₹{totalRevenue}</div>
        <div className="glass p-6"><Calendar /> {registrations.filter(r => r.status === 'pending').length}</div>
      </div>

      <div className="glass">
        <table className="w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((reg) => (
              <tr key={reg.id}>
                <td className="text-neon-pink">{reg.registrationId}</td>
                <td>{reg.fullName}</td>
                <td>{reg.status}</td>
                <td className="flex gap-2">
                  <button onClick={() => setSelectedReg(reg)}><Eye /></button>

                  {reg.status === 'pending' && (
                    <>
                      <button onClick={() => handleStatusUpdate(reg, 'approved')}><CheckCircle /></button>
                      <button onClick={() => handleStatusUpdate(reg, 'rejected')}><XCircle /></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedReg && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/90">
          <div className="glass p-8">
            <h3>{selectedReg.fullName}</h3>
            <p>{selectedReg.transactionId}</p>

            {selectedReg.paymentScreenshotUrl && (
              <img src={selectedReg.paymentScreenshotUrl} className="h-40" />
            )}

            <div className="flex gap-4 mt-4">
              <button onClick={() => handleStatusUpdate(selectedReg, 'approved')}>Approve</button>
              <button onClick={() => handleStatusUpdate(selectedReg, 'rejected')}>Reject</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};