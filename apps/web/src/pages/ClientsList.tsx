import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationModal from '../components/NotificationModal';

type ClientUser = {
  id: string;
  fullName: string;
  avatar: string | null;
  goal?: string;
  status?: string;
  email: string;
  username: string;
  createdAt: string;
  trainerId?: string | null;
  biometrics?: any[];
  workoutPlans?: any[];
  role?: string;
};

const EditUserModal: React.FC<{
  user: ClientUser;
  onClose: () => void;
  onSave: (data: { fullName: string; email: string; role: string; password?: string }) => void;
}> = ({ user, onClose, onSave }) => {
  const { user: currentUser } = useAuth();
  const [name, setName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role || 'USER');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = () => {
    if (!name.trim() || !email.trim()) return;
    if (newPassword && newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    onSave({ 
      fullName: name.trim(), 
      email: email.trim(), 
      role, 
      password: newPassword.trim() || undefined 
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={onClose}>
      <div className="rounded-[20px] p-8 w-full max-w-md mx-4 flex flex-col gap-5 border border-outline-variant/20 animate-fade-in" onClick={e => e.stopPropagation()} style={{ background: 'linear-gradient(145deg, #1a2535, #16202e)' }}>
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Edit User Profile</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-container-highest">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-on-surface-variant">Full Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="bg-surface border border-outline-variant/30 rounded-xl py-3 px-4 text-on-surface text-sm outline-none focus:border-primary" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-on-surface-variant">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-surface border border-outline-variant/30 rounded-xl py-3 px-4 text-on-surface text-sm outline-none focus:border-primary" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-on-surface-variant">Role</label>
          <select value={role} onChange={e => setRole(e.target.value)} className="bg-surface border border-outline-variant/30 rounded-xl py-3 px-4 text-on-surface text-sm outline-none focus:border-primary">
            <option value="USER">USER (Athlete)</option>
            <option value="TRAINER">TRAINER (Coach)</option>
            <option value="ADMIN">ADMIN (System Administrator)</option>
          </select>
        </div>
        {currentUser?.role === 'ADMIN' && (
          <div className="flex flex-col gap-2 relative">
            <label className="text-sm font-semibold text-on-surface-variant flex justify-between">
              <span>New Password</span>
              <span className="text-[10px] text-on-surface-variant/40 font-normal italic">Leave blank to keep current</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => {
                  setNewPassword(e.target.value);
                  setPasswordError('');
                }}
                placeholder="Min. 8 characters"
                className="w-full bg-surface border border-outline-variant/30 rounded-xl py-3 pl-4 pr-10 text-on-surface text-sm outline-none focus:border-primary placeholder:text-on-surface-variant/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
            {passwordError && (
              <p className="text-xs text-error font-semibold mt-1">{passwordError}</p>
            )}
          </div>
        )}
        <div className="flex gap-3 mt-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-sm font-bold hover:bg-surface-container-highest">Cancel</button>
          <button onClick={handleSubmit} disabled={!name.trim() || !email.trim()} className="flex-1 py-3 rounded-xl bg-primary text-on-primary text-sm font-bold hover:brightness-110 disabled:opacity-30">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

const ClientsList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('active');
  const [searchQuery, setSearchQuery] = useState("");
  const [triggerReload, setTriggerReload] = useState(0);

  const [activeClients, setActiveClients] = useState<ClientUser[]>([]);
  const [allUsers, setAllUsers] = useState<ClientUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<ClientUser | null>(null);
  
  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'danger' | 'warning' | 'success';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => {},
  });

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  // Load clients and users
  useEffect(() => {
    if (user) {
      setActiveTab(user.role === 'ADMIN' ? 'all' : 'active');
    }
  }, [user]);

  useEffect(() => {
    const handleReload = () => setTriggerReload(prev => prev + 1);
    window.addEventListener('user-added', handleReload);
    return () => window.removeEventListener('user-added', handleReload);
  }, []);

  // Load clients and users
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('fitsync_token');
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      try {
        if (user.role === 'ADMIN') {
          const res = await fetch(`http://localhost:3000/users`, { headers });
          if (!res.ok) throw new Error('Failed to load roster data from database');
          const allUsersData = await res.json();
          setAllUsers(allUsersData);
        } else {
          const [clientsRes, allUsersRes] = await Promise.all([
            fetch(`http://localhost:3000/trainers/clients?trainerId=${user.id}`, { headers }),
            fetch(`http://localhost:3000/users?role=USER`, { headers }),
          ]);

          if (!clientsRes.ok || !allUsersRes.ok) {
            throw new Error('Failed to load roster data from database');
          }

          const clientsData = await clientsRes.json();
          const allUsersData = await allUsersRes.json();

          setActiveClients(clientsData);
          setAllUsers(allUsersData);
        }
      } catch (err: any) {
        console.error('Error fetching roster:', err);
        setError(err.message || 'An error occurred while synchronizing clients list');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, triggerReload]);

  // Pending clients: registered USERs that are not assigned to any trainer
  const pendingClients = useMemo(() => {
    return allUsers.filter(u => !u.trainerId);
  }, [allUsers]);

  const displayedClients = useMemo(() => {
    let list: ClientUser[] = [];
    if (user?.role === 'ADMIN') {
      if (activeTab === 'all') list = allUsers;
      else if (activeTab === 'trainers') list = allUsers.filter(u => u.role === 'TRAINER');
      else if (activeTab === 'users') list = allUsers.filter(u => u.role === 'USER');
      else if (activeTab === 'admins') list = allUsers.filter(u => u.role === 'ADMIN');
    } else {
      list = activeTab === 'active' ? activeClients : pendingClients;
    }
    return list.filter(c => 
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeTab, activeClients, pendingClients, allUsers, searchQuery, user]);

  const handleAcceptRequest = (client: ClientUser) => {
    setModalConfig({
      isOpen: true,
      title: 'Initialize Onboarding?',
      message: `You are about to accept ${client.fullName} into your professional roster. This will grant them access to your movement library and scheduling system.`,
      type: 'success',
      onConfirm: async () => {
        closeModal();
        const token = localStorage.getItem('fitsync_token');
        try {
          const response = await fetch(`http://localhost:3000/users/${client.id}/assign-trainer`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ trainerId: user?.id }),
          });
          if (!response.ok) throw new Error('Failed to assign trainer');
          setTriggerReload(prev => prev + 1);
          
          setModalConfig({
            isOpen: true,
            title: 'Athlete Synced',
            message: `${client.fullName} has been successfully integrated into your active roster.`,
            type: 'success',
            onConfirm: closeModal
          });
        } catch (err: any) {
          console.error(err);
        }
      }
    });
  };

  const handleDeclineRequest = (client: ClientUser) => {
    setModalConfig({
      isOpen: true,
      title: 'Decline Application?',
      message: `This action will decline ${client.fullName}'s application data from your pending requests queue.`,
      type: 'danger',
      onConfirm: async () => {
        closeModal();
        const token = localStorage.getItem('fitsync_token');
        try {
          const response = await fetch(`http://localhost:3000/users/${client.id}/trainer`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) throw new Error('Failed to clear trainer assignment');
          setTriggerReload(prev => prev + 1);
        } catch (err: any) {
          console.error(err);
        }
      }
    });
  };

  const handleDeleteUser = (client: ClientUser) => {
    setModalConfig({
      isOpen: true,
      title: 'Delete User Account?',
      message: `You are about to permanently delete the account for ${client.fullName} (@${client.username}). This will purge all related workouts, plans, and metrics from the system.`,
      type: 'danger',
      onConfirm: async () => {
        closeModal();
        const token = localStorage.getItem('fitsync_token');
        try {
          const response = await fetch(`http://localhost:3000/users/${client.id}?callerId=${user?.id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) throw new Error('Failed to delete user');
          setTriggerReload(prev => prev + 1);
          setModalConfig({
            isOpen: true,
            title: 'User Purged',
            message: `The user account has been successfully deleted.`,
            type: 'success',
            onConfirm: closeModal
          });
        } catch (err: any) {
          console.error(err);
        }
      }
    });
  };

  const handleEditUserSave = async (data: { fullName: string; email: string; role: string; password?: string }) => {
    if (!editingUser) return;
    const token = localStorage.getItem('fitsync_token');
    try {
      const response = await fetch(`http://localhost:3000/users/${editingUser.id}?callerId=${user?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update user');
      setEditingUser(null);
      setTriggerReload(prev => prev + 1);
    } catch (err: any) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        <p className="text-on-surface-variant/60 font-bold uppercase tracking-widest text-xs">Synchronizing athlete directory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center max-w-md mx-auto">
        <span className="material-symbols-outlined text-error text-5xl">warning</span>
        <h2 className="text-xl font-bold">Data Sync Failure</h2>
        <p className="text-on-surface-variant/60 text-sm">{error}</p>
        <button onClick={() => setTriggerReload(prev => prev + 1)} className="mt-4 px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs uppercase tracking-widest">Retry Connection</button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-10 pt-4">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-secondary-container/10 pb-6">
        <div>
          <h2 className="font-black text-on-surface mb-1 tracking-tighter uppercase leading-none">
            {user?.role === 'ADMIN' ? 'User Directory' : 'Client Directory'}
          </h2>
          <blockquote className="text-on-surface-variant font-medium italic opacity-60">
            {user?.role === 'ADMIN' 
              ? 'Global administrative panel for fitSync platform record management.'
              : '"Manage your elite roster and review incoming tactical requests in real-time."'}
          </blockquote>
        </div>
        
        <div className="flex gap-1.5 bg-surface-container-high/40 p-1 rounded-xl border border-secondary-container/10 self-start md:self-auto shadow-xl backdrop-blur-md">
          {user?.role === 'ADMIN' ? (
            <>
              {[
                { id: 'all', label: 'All Users', icon: 'group' },
                { id: 'trainers', label: 'Coaches', icon: 'sports' },
                { id: 'users', label: 'Athletes', icon: 'directions_run' },
                { id: 'admins', label: 'Admins', icon: 'shield' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg font-black text-[8px] uppercase tracking-[0.2em] transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === tab.id 
                      ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                      : 'text-on-surface-variant/40 hover:text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('active')}
                className={`px-5 py-2 rounded-lg font-black text-[8px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'active' 
                    ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                    : 'text-on-surface-variant/40 hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">group</span>
                Active ({activeClients.length})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-5 py-2 rounded-lg font-black text-[8px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 relative cursor-pointer ${
                  activeTab === 'pending'
                    ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                    : 'text-on-surface-variant/40 hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">person_add</span>
                Pending
                {pendingClients.length > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[6px] font-black absolute -top-1 -right-1 shadow-xl ${activeTab === 'pending' ? 'bg-on-primary text-primary' : 'bg-error text-on-error'}`}>
                    {pendingClients.length}
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Global Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {(user?.role === 'ADMIN'
          ? [
              { label: 'Total Users', value: allUsers.length, icon: 'hub', color: 'text-primary', trend: 'Global Registry', trendUp: true },
              { label: 'Total Coaches', value: allUsers.filter(u => u.role === 'TRAINER').length, icon: 'sports', color: 'text-amber-500', trend: 'Active Trainers', trendUp: true },
              { label: 'Total Athletes', value: allUsers.filter(u => u.role === 'USER').length, icon: 'directions_run', color: 'text-emerald-500', trend: 'Active Clients', trendUp: true },
              { label: 'System Admins', value: allUsers.filter(u => u.role === 'ADMIN').length, icon: 'shield', color: 'text-primary', trend: 'Root Privilege', trendUp: true }
            ]
          : [
              { label: 'Total Clients', value: activeClients.length, icon: 'hub', color: 'text-primary', trend: 'Roster Capacity', trendUp: true },
              { label: 'Pending Requests', value: pendingClients.length, icon: 'person_add', color: 'text-amber-500', trend: 'Awaiting Review', trendUp: false },
              { label: 'Roster Limit', value: 'Unlimited', icon: 'verified', color: 'text-emerald-500', trend: 'Unlimited plan', trendUp: true },
              { label: 'Tactical Sync', value: '100%', icon: 'sync', color: 'text-primary', trend: 'Active Connection', trendUp: true }
            ]
        ).map((stat, i) => (
          <div key={i} className="glass-card shadow-xl group relative overflow-hidden !p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(208,188,255,0.02),transparent)]"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className={`w-8 h-8 rounded-lg bg-surface-container-high/60 border border-secondary-container/10 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform shadow-lg`}>
                <span className="material-symbols-outlined text-[18px]">{stat.icon}</span>
              </div>
              <span className="text-[7px] font-black uppercase tracking-widest text-on-surface-variant/60">{stat.trend}</span>
            </div>
            <p className="text-[7px] font-black text-on-surface-variant uppercase tracking-[0.2em] relative z-10 opacity-40 mb-0.5">{stat.label}</p>
            <h3 className="text-xl font-black text-on-surface relative z-10 tracking-tighter leading-none">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Client Table Interface */}
      <div className="glass-card !p-0 overflow-hidden shadow-xl relative">
        <div className="p-4 border-b border-secondary-container/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-high/20">
          <div className="relative max-w-xs w-full">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/30 text-[16px]">person_search</span>
            <input
              type="text"
              className="w-full bg-surface-container-low/60 border border-secondary-container/10 rounded-lg pl-10 pr-4 py-2 text-[10px] font-bold text-on-surface focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all shadow-inner uppercase tracking-tight"
              placeholder="Filter roster..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-container-high/10 border-b border-secondary-container/5">
                <th className="px-5 py-3 text-[8px] font-black text-on-surface-variant uppercase tracking-[0.2em] opacity-50">{user?.role === 'ADMIN' ? 'User' : 'Athlete'}</th>
                <th className="px-5 py-3 text-[8px] font-black text-on-surface-variant uppercase tracking-[0.2em] opacity-50">Username</th>
                <th className="px-5 py-3 text-[8px] font-black text-on-surface-variant uppercase tracking-[0.2em] opacity-50">Email</th>
                <th className="px-5 py-3 text-[8px] font-black text-on-surface-variant uppercase tracking-[0.2em] opacity-50">{user?.role === 'ADMIN' ? 'Role' : 'Weight Log'}</th>
                <th className="px-5 py-3 text-[8px] font-black text-on-surface-variant uppercase tracking-[0.2em] opacity-50">Joined</th>
                <th className="px-5 py-3 text-[8px] font-black text-on-surface-variant uppercase tracking-[0.2em] text-right opacity-50">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-container/5">
              {displayedClients.map((client) => {
                const latestWeight = client.biometrics && client.biometrics[0] ? `${client.biometrics[0].weight} kg` : 'N/A';
                const createdDate = new Date(client.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' });
                return (
                  <tr key={client.id} className="hover:bg-primary/[0.02] transition-all group cursor-pointer" onClick={() => user?.role !== 'ADMIN' && activeTab === 'active' && navigate(`/clients/${client.id}`)}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <div className="w-9 h-9 rounded-lg border border-secondary-container/10 group-hover:border-primary/40 transition-all overflow-hidden shadow-lg bg-primary/10 flex items-center justify-center font-bold text-sm text-primary">
                             {client.fullName.charAt(0)}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full border-2 border-surface-container-low shadow-xl ${
                            client.role === 'ADMIN' ? 'bg-primary' : client.role === 'TRAINER' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}></div>
                        </div>
                        <div>
                          <span className="text-xs font-black text-on-surface block group-hover:text-primary transition-colors uppercase tracking-tight leading-none mb-1">{client.fullName}</span>
                          <span className="text-[7px] font-black text-on-surface-variant/40 uppercase tracking-widest block">ID: {client.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[9px] font-black text-on-surface uppercase tracking-tight">@{client.username}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[9px] font-medium text-on-surface-variant">{client.email}</span>
                    </td>
                    <td className="px-5 py-3">
                      {user?.role === 'ADMIN' ? (
                        <span className={`px-2.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest shadow-sm ${
                          client.role === 'ADMIN' ? 'bg-primary/10 border border-primary/20 text-primary' :
                          client.role === 'TRAINER' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-500' :
                          'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500'
                        }`}>
                          {client.role}
                        </span>
                      ) : (
                        <span className="bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest shadow-sm">
                          {latestWeight}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-on-surface font-black text-[9px] uppercase tracking-tight opacity-50">
                         {createdDate}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right" onClick={e => e.stopPropagation()}>
                      {user?.role === 'ADMIN' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => {
                              if (client.role === 'TRAINER') {
                                navigate(`/profile/${client.id}`);
                              } else {
                                navigate(`/trainee/${client.id}`);
                              }
                            }}
                            className="w-7 h-7 bg-secondary/10 border border-secondary/20 text-secondary hover:bg-secondary hover:text-on-secondary rounded-lg flex items-center justify-center transition-all active:scale-90 shadow-lg cursor-pointer"
                            title="View Profile"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                          </button>
                          <button 
                            onClick={() => setEditingUser(client)}
                            className="w-7 h-7 bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-on-primary rounded-lg flex items-center justify-center transition-all active:scale-90 shadow-lg cursor-pointer"
                            title="Edit User"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(client)}
                            className="w-7 h-7 bg-surface-container-high/60 border border-error/20 text-error hover:bg-error hover:text-white rounded-lg flex items-center justify-center transition-all active:scale-90 shadow-lg cursor-pointer"
                            title="Delete User"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      ) : activeTab === 'active' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => navigate(`/trainee/${client.id}`)}
                            className="w-7 h-7 bg-secondary/10 border border-secondary/20 text-secondary hover:bg-secondary hover:text-on-secondary rounded-lg flex items-center justify-center transition-all active:scale-90 shadow-lg cursor-pointer"
                            title="View Trainee Profile"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                          </button>
                          <button 
                            onClick={() => navigate(`/clients/${client.id}`)}
                            className="px-3 py-1.5 bg-primary text-on-primary text-[8px] font-black uppercase tracking-[0.2em] rounded-lg hover:brightness-110 transition-all shadow-lg shadow-primary/20 active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">person_search</span>
                            Intel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleAcceptRequest(client)}
                            className="w-7 h-7 bg-emerald-500 text-white rounded-lg flex items-center justify-center transition-all shadow-lg shadow-emerald-500/20 active:scale-90 hover:brightness-110 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">check</span>
                          </button>
                          <button 
                            onClick={() => handleDeclineRequest(client)}
                            className="w-7 h-7 bg-surface-container-high/60 border border-error/20 text-error hover:bg-error hover:text-white rounded-lg flex items-center justify-center transition-all active:scale-90 shadow-lg cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {displayedClients.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-5">
                      <span className="material-symbols-outlined text-[48px]">person_off</span>
                      <p className="text-lg font-black uppercase tracking-[0.5em]">No matches</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <NotificationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        onCancel={closeModal}
        confirmLabel={modalConfig.type === 'danger' ? 'Decline' : 'Authorize'}
      />

      {editingUser && (
        <EditUserModal 
          user={editingUser} 
          onClose={() => setEditingUser(null)} 
          onSave={handleEditUserSave} 
        />
      )}
    </div>
  );
};

export default ClientsList;
