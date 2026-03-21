import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useRegistrations, updateRegistrationStatus } from '../services/firebaseService';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, setDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
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
  ShieldCheck,
  UserPlus,
  Trash2,
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

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // In a real app, you'd check a custom claim or a Firestore document
        // For this "specific ID" request, we'll assume any logged in user in this portal is admin
        // Security is enforced by the firestore.rules
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
      // Treat username as email (e.g. admin -> admin@horizon.com)
      const email = username.includes('@') ? username : `${username}@horizon.com`;
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === 'auth/invalid-credential') {
        setLoginError("Invalid ID or Password. Have you created this user in the Firebase Console?");
      } else if (error.code === 'auth/operation-not-allowed') {
        setLoginError("Email/Password login is not enabled in Firebase Console.");
      } else {
        setLoginError(error.message || "Login failed. Please check your credentials.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAdmin(false);
      setUsername('');
      setPassword('');
    } catch (error) {
      console.error("Logout error:", error);
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
    const headers = ['Reg ID', 'Name', 'College', 'Branch', 'Year', 'Email', 'Phone', 'Events', 'Amount', 'Status', 'Transaction ID'];
    const rows = filteredData.map(r => [
      r.registrationId,
      r.fullName,
      r.collegeName,
      r.branch,
      r.year,
      r.email,
      r.phoneNumber,
      r.events.map(e => {
        const ev = EVENTS.find(ev => ev.id === e.eventId);
        return `${ev?.name}${e.subEventId ? ` (${e.subEventId})` : ''}`;
      }).join('; '),
      r.totalAmount,
      r.status,
      r.transactionId
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `registrations_${new Date().toISOString().split('T')[0]}.csv`);
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
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-neon-pink/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <Lock className="text-neon-pink" size={32} />
          </div>
          <h2 className="text-4xl font-bold mb-2">Admin <span className="neon-text">Portal</span></h2>
          <p className="text-white/50 mb-8">Enter your credentials to access the dashboard</p>
          
          <form onSubmit={handleLogin} className="space-y-6 text-left">
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase mb-2 ml-1">Admin ID</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-12 py-4 focus:outline-none focus:border-neon-pink transition-all"
                  placeholder="e.g. admin"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/40 uppercase mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-12 py-4 focus:outline-none focus:border-neon-pink transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {loginError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl text-sm flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <AlertCircle size={18} />
                  {loginError}
                </div>
                <button 
                  type="button"
                  onClick={() => setShowSetup(!showSetup)}
                  className="text-xs underline text-left mt-1 opacity-80 hover:opacity-100"
                >
                  {showSetup ? "Hide Setup Guide" : "How to fix this? (Setup Guide)"}
                </button>
              </div>
            )}

            {showSetup && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="bg-white/5 border border-white/10 p-4 rounded-xl text-[11px] text-white/60 space-y-2 overflow-hidden">
                <p className="font-bold text-neon-pink uppercase mb-1">One-Time Setup Required:</p>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Go to <b>Firebase Console</b> &gt; <b>Authentication</b>.</li>
                  <li>In <b>Sign-in method</b>, enable <b>Email/Password</b>.</li>
                  <li>In <b>Users</b> tab, click <b>Add user</b>.</li>
                  <li>Email: <code className="text-white">admin@horizon.com</code></li>
                  <li>Password: <code className="text-white">your_password</code></li>
                </ol>
                <p className="mt-2 italic">Then use "admin" and your password to log in here.</p>
              </motion.div>
            )}

            <button 
              type="submit" 
              disabled={loginLoading}
              className="neon-btn w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Access Dashboard"
              )}
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
          <p className="text-white/50 mt-1">Managing Horizon 2k26 Registrations</p>
        </div>
        <div className="flex gap-4">
          <button onClick={exportCSV} className="glass px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-all">
            <Download size={20} /> Export CSV
          </button>
          <button onClick={handleLogout} className="bg-red-500/20 text-red-500 border border-red-500/30 px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-red-500/30 transition-all">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass p-6 flex items-center gap-6">
          <div className="w-16 h-16 bg-neon-pink/20 rounded-2xl flex items-center justify-center text-neon-pink">
            <Users size={32} />
          </div>
          <div>
            <p className="text-sm text-white/40 uppercase font-bold">Total Registrations</p>
            <p className="text-3xl font-bold">{registrations.length}</p>
          </div>
        </div>
        <div className="glass p-6 flex items-center gap-6">
          <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-500">
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-sm text-white/40 uppercase font-bold">Total Revenue</p>
            <p className="text-3xl font-bold">₹{totalRevenue}</p>
          </div>
        </div>
        <div className="glass p-6 flex items-center gap-6">
          <div className="w-16 h-16 bg-neon-purple/20 rounded-2xl flex items-center justify-center text-neon-purple">
            <Calendar size={32} />
          </div>
          <div>
            <p className="text-sm text-white/40 uppercase font-bold">Pending Approval</p>
            <p className="text-3xl font-bold">{registrations.filter(r => r.status === 'pending').length}</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="glass p-6 mb-8 flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
          <input 
            type="text" 
            placeholder="Search by name, ID or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-neon-pink transition-all"
          />
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <select 
              value={filterEvent}
              onChange={(e) => setFilterEvent(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl pl-12 pr-8 py-3 focus:outline-none focus:border-neon-pink transition-all appearance-none"
            >
              <option value="all">All Events</option>
              {EVENTS.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div className="relative">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-pink transition-all appearance-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden">
        {loading ? (
          <div className="p-20 text-center">
            <Loader2 className="animate-spin mx-auto mb-4 text-neon-pink" size={48} />
            <p className="text-white/40">Loading registrations...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 text-sm font-bold uppercase text-white/40">Registration ID</th>
                <th className="px-6 py-4 text-sm font-bold uppercase text-white/40">Name</th>
                <th className="px-6 py-4 text-sm font-bold uppercase text-white/40">Events</th>
                <th className="px-6 py-4 text-sm font-bold uppercase text-white/40">Amount</th>
                <th className="px-6 py-4 text-sm font-bold uppercase text-white/40">Status</th>
                <th className="px-6 py-4 text-sm font-bold uppercase text-white/40">Actions</th>
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
                    <div className="flex flex-wrap gap-1">
                      {reg.events.map((e, i) => (
                        <span key={i} className="text-[10px] bg-white/10 px-2 py-0.5 rounded">
                          {EVENTS.find(ev => ev.id === e.eventId)?.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold">₹{reg.totalAmount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      reg.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                      reg.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                      'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {reg.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedReg(reg)} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all">
                        <Eye size={18} />
                      </button>
                      {reg.status === 'pending' && (
                        <>
                          <button onClick={() => updateRegistrationStatus(reg, 'approved')} className="p-2 hover:bg-green-500/20 rounded-lg text-green-500/60 hover:text-green-500 transition-all">
                            <CheckCircle size={18} />
                          </button>
                          <button onClick={() => updateRegistrationStatus(reg, 'rejected')} className="p-2 hover:bg-red-500/20 rounded-lg text-red-500/60 hover:text-red-500 transition-all">
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
            {filteredData.length === 0 && (
              <div className="p-20 text-center text-white/30">
                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                <p>No registrations found matching your criteria.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal for Details */}
      {selectedReg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 relative">
            <button onClick={() => setSelectedReg(null)} className="absolute top-6 right-6 text-white/50 hover:text-white">
              <XCircle size={24} />
            </button>
            
            <h3 className="text-3xl font-bold mb-8">Registration <span className="neon-text">Details</span></h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-bold text-white/40 uppercase mb-1">Full Name</p>
                    <p className="text-lg font-semibold">{selectedReg.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/40 uppercase mb-1">College</p>
                    <p className="text-lg font-semibold">{selectedReg.collegeName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/40 uppercase mb-1">Branch</p>
                    <p className="text-lg font-semibold">{selectedReg.branch}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/40 uppercase mb-1">Year</p>
                    <p className="text-lg font-semibold">{selectedReg.year}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/40 uppercase mb-1">Email</p>
                    <p className="text-lg font-semibold">{selectedReg.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/40 uppercase mb-1">Phone</p>
                    <p className="text-lg font-semibold">{selectedReg.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/40 uppercase mb-1">Transaction ID</p>
                    <p className="text-lg font-mono text-neon-pink">{selectedReg.transactionId}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/40 uppercase mb-1">Total Amount</p>
                    <p className="text-2xl font-bold">₹{selectedReg.totalAmount}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-white/40 uppercase mb-4">Selected Events</p>
                  <div className="space-y-4">
                    {selectedReg.events.map((e, i) => {
                      const ev = EVENTS.find(ev => ev.id === e.eventId);
                      return (
                        <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/10">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold">{ev?.name}</p>
                              {e.subEventId && <p className="text-xs text-neon-pink">Sub-event: {e.subEventId}</p>}
                              {e.type === 'team' && (
                                <p className="text-xs text-white/50 mt-1">
                                  Team: {e.teamName} ({e.teamSize} members)
                                </p>
                              )}
                            </div>
                            <p className="font-bold">₹{e.fee}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-xs font-bold text-white/40 uppercase mb-2">Payment Screenshot</p>
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 aspect-[3/4]">
                  <img src={selectedReg.paymentScreenshotUrl} alt="Payment Proof" className="w-full h-full object-contain" />
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => { updateRegistrationStatus(selectedReg, 'approved'); setSelectedReg(null); }}
                    className="flex-1 bg-green-500 py-3 rounded-xl font-bold hover:bg-green-600 transition-all"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => { updateRegistrationStatus(selectedReg, 'rejected'); setSelectedReg(null); }}
                    className="flex-1 bg-red-500 py-3 rounded-xl font-bold hover:bg-red-600 transition-all"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
