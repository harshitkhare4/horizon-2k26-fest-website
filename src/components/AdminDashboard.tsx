import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion'; // Check if you use 'motion/react' or 'framer-motion'
import { useRegistrations, updateRegistrationStatus } from '../services/firebaseService';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  CheckCircle, 
  XCircle, 
  Eye, 
  LogOut, 
  TrendingUp, 
  Calendar,
  FileText,
  Loader2,
  AlertCircle,
  Lock,
  User as UserIcon
} from 'lucide-react';
import { EVENTS } from '../constants';
import { Registration } from '../types';

export const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { registrations, loading } = useRegistrations(isAdmin);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEvent, setFilterEvent] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
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
      console.error("Login error:", error);
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
    try {
      await signOut(auth);
      setIsAdmin(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateRegistrationStatus(id, status);
      // UI update is handled by onSnapshot in the hook
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const filteredData = useMemo(() => {
    return registrations.filter(reg => {
      const matchesSearch = reg.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           reg.registrationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           reg.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesEvent = filterEvent === 'all' || reg.events.some(e => e.eventId === filterEvent);
      const matchesStatus = filterStatus === 'all' || reg.status === filterStatus;

      return matchesSearch && matchesEvent && matchesStatus;
    });
  }, [registrations, searchTerm, filterEvent, filterStatus]);

  const totalRevenue = registrations
    .filter(r => r.status === 'approved')
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  const exportCSV = () => {
    const headers = ['Reg ID', 'Name', 'College', 'Email', 'Amount', 'Status'];
    const rows = filteredData.map(r => [
      r.registrationId,
      r.fullName,
      r.collegeName,
      r.email,
      r.totalAmount,
      r.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "registrations.csv");
    document.body.appendChild(link);
    link.click();
  };

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
          <form onSubmit={handleLogin} className="space-y-6 text-left mt-8">
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 focus:border-neon-pink outline-none"
              placeholder="Admin ID"
              required
            />
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-4 focus:border-neon-pink outline-none"
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-bold">Admin <span className="neon-text">Dashboard</span></h2>
          <p className="text-white/50 mt-1">Managing Horizon 2k26</p>
        </div>
        <div className="flex gap-4">
          <button onClick={exportCSV} className="glass px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-white/10">
            <Download size={20} /> Export CSV
          </button>
          <button onClick={handleLogout} className="bg-red-500/20 text-red-500 border border-red-500/30 px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-red-500/30">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass p-6 flex items-center gap-6">
          <Users className="text-neon-pink" size={32} />
          <div>
            <p className="text-sm text-white/40 uppercase font-bold">Total</p>
            <p className="text-3xl font-bold">{registrations.length}</p>
          </div>
        </div>
        <div className="glass p-6 flex items-center gap-6">
          <TrendingUp className="text-green-500" size={32} />
          <div>
            <p className="text-sm text-white/40 uppercase font-bold">Revenue</p>
            <p className="text-3xl font-bold">₹{totalRevenue}</p>
          </div>
        </div>
        <div className="glass p-6 flex items-center gap-6">
          <Calendar className="text-neon-purple" size={32} />
          <div>
            <p className="text-sm text-white/40 uppercase font-bold">Pending</p>
            <p className="text-3xl font-bold">{registrations.filter(r => r.status === 'pending').length}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 text-white/40">ID</th>
                <th className="px-6 py-4 text-white/40">Name</th>
                <th className="px-6 py-4 text-white/40">Status</th>
                <th className="px-6 py-4 text-white/40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredData.map((reg) => (
                <tr key={reg.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-neon-pink">{reg.registrationId}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold">{reg.fullName}</p>
                    <p className="text-xs text-white/40">{reg.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      reg.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                      reg.status === 'rejected' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {reg.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedReg(reg)} className="p-2 hover:bg-white/10 rounded-lg">
                        <Eye size={18} />
                      </button>
                      {reg.status === 'pending' && (
                        <>
                          <button onClick={() => handleStatusUpdate(reg.id, 'approved')} className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg">
                            <CheckCircle size={18} />
                          </button>
                          <button onClick={() => handleStatusUpdate(reg.id, 'rejected')} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedReg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass max-w-2xl w-full p-8 relative">
            <button onClick={() => setSelectedReg(null)} className="absolute top-4 right-4 text-white/50">
              <XCircle size={24} />
            </button>
            <h3 className="text-2xl font-bold mb-6">User Detail</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-white/40">Name</p><p>{selectedReg.fullName}</p></div>
              <div><p className="text-xs text-white/40">Transaction ID</p><p>{selectedReg.transactionId}</p></div>
            </div>
            <div className="mt-6">
               <p className="text-xs text-white/40 mb-2">Payment Proof</p>
               <img src={selectedReg.paymentScreenshotUrl} className="w-full h-64 object-contain bg-black/50 rounded-xl" alt="Proof" />
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => { handleStatusUpdate(selectedReg.id, 'approved'); setSelectedReg(null); }} className="flex-1 bg-green-500 py-3 rounded-xl font-bold">Approve</button>
              <button onClick={() => { handleStatusUpdate(selectedReg.id, 'rejected'); setSelectedReg(null); }} className="flex-1 bg-red-500 py-3 rounded-xl font-bold">Reject</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};