import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NewClientModal: React.FC<{ onClose: () => void; onSave: (data: { fullName: string; email: string; username: string; role: string }) => void }> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('USER');
  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || !username.trim()) return;
    onSave({ fullName: name.trim(), email: email.trim(), username: username.trim().toLowerCase(), role });
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={onClose}>
      <div className="rounded-[20px] p-8 w-full max-w-md mx-4 flex flex-col gap-5 border border-outline-variant/20 animate-fade-in" onClick={e => e.stopPropagation()} style={{ background: 'linear-gradient(145deg, #1a2535, #16202e)' }}>
        <div className="flex justify-between items-center"><h3 className="text-xl font-bold">New User Account</h3><button onClick={onClose} className="p-1 rounded-full hover:bg-surface-container-highest"><span className="material-symbols-outlined">close</span></button></div>
        <div className="flex flex-col gap-2"><label className="text-sm font-semibold text-on-surface-variant">Full Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jane Doe" className="bg-surface border border-outline-variant/30 rounded-xl py-3 px-4 text-on-surface text-sm outline-none focus:border-primary placeholder:text-on-surface-variant/30" /></div>
        <div className="flex flex-col gap-2"><label className="text-sm font-semibold text-on-surface-variant">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com" className="bg-surface border border-outline-variant/30 rounded-xl py-3 px-4 text-on-surface text-sm outline-none focus:border-primary placeholder:text-on-surface-variant/30" /></div>
        <div className="flex flex-col gap-2"><label className="text-sm font-semibold text-on-surface-variant">Username</label><input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="janedoe" className="bg-surface border border-outline-variant/30 rounded-xl py-3 px-4 text-on-surface text-sm outline-none focus:border-primary placeholder:text-on-surface-variant/30" /></div>
        <div className="flex flex-col gap-2"><label className="text-sm font-semibold text-on-surface-variant">Role</label>
          <select value={role} onChange={e => setRole(e.target.value)} className="bg-surface border border-outline-variant/30 rounded-xl py-3 px-4 text-on-surface text-sm outline-none focus:border-primary">
            <option value="USER">USER (Athlete)</option>
            <option value="TRAINER">TRAINER (Coach)</option>
            <option value="ADMIN">ADMIN (System Administrator)</option>
          </select>
        </div>
        <div className="flex gap-3 mt-2"><button onClick={onClose} className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-sm font-bold hover:bg-surface-container-highest">Cancel</button><button onClick={handleSubmit} disabled={!name.trim() || !email.trim() || !username.trim()} className="flex-1 py-3 rounded-xl bg-primary text-on-primary text-sm font-bold hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed">Create User</button></div>
      </div>
    </div>
  );
};

const LogoutModal: React.FC<{ onConfirm: () => void; onClose: () => void }> = ({ onConfirm, onClose }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={onClose}>
    <div className="rounded-[20px] p-8 w-full max-w-sm mx-4 flex flex-col gap-6 text-center border border-outline-variant/20" onClick={e => e.stopPropagation()} style={{ background: 'linear-gradient(145deg, #1a2535, #16202e)' }}>
      <span className="material-symbols-outlined text-5xl text-error/60 mx-auto">logout</span>
      <div><h3 className="text-lg font-bold mb-1">Logout?</h3><p className="text-sm text-on-surface-variant">Are you sure you want to sign out?</p></div>
      <div className="flex gap-3"><button onClick={onClose} className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-sm font-bold hover:bg-surface-container-highest">Cancel</button><button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-3 rounded-xl bg-error text-on-error text-sm font-bold hover:brightness-110">Sign Out</button></div>
    </div>
  </div>
);

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isLight, setIsLight] = useState(false);
  const [showNewClient, setShowNewClient] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleTheme = () => {
    const next = !isLight;
    setIsLight(next);
    if (next) { document.documentElement.classList.add('light'); }
    else { document.documentElement.classList.remove('light'); }
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleLogoutConfirm = () => {
    logout();
    showToast('Signed out successfully.');
    navigate('/login');
  };

  const menuItems = [
    { icon: 'dashboard', label: 'Overview', path: '/' },
    { icon: 'group', label: 'Clients', path: '/clients' },
    { icon: 'rate_review', label: 'Session Review', path: '/session-review' },
    { icon: 'fitness_center', label: 'Workouts', path: '/workouts' },
    { icon: 'calendar_today', label: 'Workout Planner', path: '/planner' },
    { icon: 'chat', label: 'Chat', path: '/chat' },
    { icon: 'person', label: 'Profile', path: '/profile' },
    { icon: 'settings', label: 'Settings', path: '/settings' },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'WK';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-container border-r border-outline-variant/20 p-8 flex flex-col z-50">
        {user && (
          <div className="flex items-center gap-3 mb-12 cursor-pointer hover:opacity-80" onClick={() => navigate('/profile')}>
            <div 
              className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/30 flex items-center justify-center bg-primary/15 text-primary font-bold text-sm"
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                getInitials(user.fullName)
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm text-primary truncate">{user.fullName}</span>
              <span className="text-[10px] text-on-surface-variant/50 uppercase tracking-wider">
                {user.role === 'ADMIN' ? 'Admin Workspace' : user.role === 'TRAINER' ? 'Coach Workspace' : 'Athlete Workspace'}
              </span>
            </div>
          </div>
        )}
        {user?.role === 'ADMIN' && (
          <button onClick={() => setShowNewClient(true)} className="btn-primary w-full mb-10"><span className="material-symbols-outlined text-[20px]">add</span>New User</button>
        )}
        <nav className="flex-1 flex flex-col gap-1">{menuItems.map(item => (
          <NavLink key={item.label} to={item.path} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}><span className="material-symbols-outlined text-[22px]">{item.icon}</span><span className="text-sm font-semibold">{item.label}</span></NavLink>
        ))}</nav>
        <div className="mt-auto pt-4 border-t border-outline-variant/20 flex flex-col gap-1">
          <button onClick={toggleTheme} className="nav-item w-full"><span className="material-symbols-outlined text-[22px]">{isLight ? 'dark_mode' : 'light_mode'}</span><span className="text-sm font-semibold">{isLight ? 'Dark Mode' : 'Light Mode'}</span></button>
          <button onClick={() => setShowLogout(true)} className="nav-item w-full text-error/80 hover:text-error hover:bg-error/5"><span className="material-symbols-outlined text-[22px]">logout</span><span className="text-sm font-semibold">Logout</span></button>
        </div>
      </aside>
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-3 rounded-full bg-primary text-on-primary text-sm font-bold shadow-lg animate-[slideUp_0.3s_ease-out]"><span className="material-symbols-outlined text-[18px]">check_circle</span>{toast}</div>}
      {showNewClient && (
        <NewClientModal 
          onClose={() => setShowNewClient(false)} 
          onSave={async (data) => {
            const token = localStorage.getItem('fitsync_token');
            try {
              const response = await fetch(`http://localhost:3000/users/admin-create?adminId=${user?.id}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                  fullName: data.fullName,
                  email: data.email,
                  username: data.username,
                  role: data.role,
                })
              });
              if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Failed to create user');
              }
              showToast(`User "${data.fullName}" added successfully!`);
              window.dispatchEvent(new CustomEvent('user-added'));
            } catch (err: any) {
              console.error(err);
              showToast(err.message || 'Error creating user');
            }
          }} 
        />
      )}
      {showLogout && <LogoutModal onClose={() => setShowLogout(false)} onConfirm={handleLogoutConfirm} />}
    </>
  );
};

export default Sidebar;
