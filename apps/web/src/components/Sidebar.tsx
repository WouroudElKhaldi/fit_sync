import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import usersData from '../data/users.json';

const trainerUser = usersData.find(u => u.role === 'TRAINER')!;

const NewClientModal: React.FC<{ onClose: () => void; onSave: (data: { fullName: string; email: string; goal: string }) => void }> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [goal, setGoal] = useState('Hypertrophy');
  const handleSubmit = () => { if (!name.trim() || !email.trim()) return; onSave({ fullName: name.trim(), email: email.trim(), goal }); onClose(); };
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={onClose}>
      <div className="rounded-[20px] p-8 w-full max-w-md mx-4 flex flex-col gap-5 border border-outline-variant/20" onClick={e => e.stopPropagation()} style={{ background: 'linear-gradient(145deg, #1a2535, #16202e)' }}>
        <div className="flex justify-between items-center"><h3 className="text-xl font-bold">New Client</h3><button onClick={onClose} className="p-1 rounded-full hover:bg-surface-container-highest"><span className="material-symbols-outlined">close</span></button></div>
        <div className="flex flex-col gap-2"><label className="text-sm font-semibold text-on-surface-variant">Full Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jane Doe" className="bg-surface border border-outline-variant/30 rounded-xl py-3 px-4 text-on-surface text-sm outline-none focus:border-primary placeholder:text-on-surface-variant/30" /></div>
        <div className="flex flex-col gap-2"><label className="text-sm font-semibold text-on-surface-variant">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com" className="bg-surface border border-outline-variant/30 rounded-xl py-3 px-4 text-on-surface text-sm outline-none focus:border-primary placeholder:text-on-surface-variant/30" /></div>
        <div className="flex flex-col gap-2"><label className="text-sm font-semibold text-on-surface-variant">Training Goal</label><select value={goal} onChange={e => setGoal(e.target.value)} className="bg-surface border border-outline-variant/30 rounded-xl py-3 px-4 text-on-surface text-sm outline-none focus:border-primary"><option value="Hypertrophy">Hypertrophy</option><option value="Strength">Strength</option><option value="Weight Loss">Weight Loss</option><option value="Endurance">Endurance</option><option value="General Fitness">General Fitness</option></select></div>
        <div className="flex gap-3 mt-2"><button onClick={onClose} className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-sm font-bold hover:bg-surface-container-highest">Cancel</button><button onClick={handleSubmit} disabled={!name.trim() || !email.trim()} className="flex-1 py-3 rounded-xl bg-primary text-on-primary text-sm font-bold hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed">Add Client</button></div>
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

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-container border-r border-outline-variant/20 p-8 flex flex-col z-50">
        <div className="flex items-center gap-3 mb-12 cursor-pointer hover:opacity-80" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/30"><img src={trainerUser.avatar} alt={trainerUser.fullName} className="w-full h-full object-cover" /></div>
          <div className="flex flex-col"><span className="font-bold text-lg text-primary">ProTrainer Elite</span><span className="text-xs text-on-surface-variant/50">Midnight Workspace</span></div>
        </div>
        <button onClick={() => setShowNewClient(true)} className="btn-primary w-full mb-10"><span className="material-symbols-outlined text-[20px]">add</span>New Client</button>
        <nav className="flex-1 flex flex-col gap-1">{menuItems.map(item => (
          <NavLink key={item.label} to={item.path} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}><span className="material-symbols-outlined text-[22px]">{item.icon}</span><span className="text-sm font-semibold">{item.label}</span></NavLink>
        ))}</nav>
        <div className="mt-auto pt-4 border-t border-outline-variant/20 flex flex-col gap-1">
          <button onClick={toggleTheme} className="nav-item w-full"><span className="material-symbols-outlined text-[22px]">{isLight ? 'dark_mode' : 'light_mode'}</span><span className="text-sm font-semibold">{isLight ? 'Dark Mode' : 'Light Mode'}</span></button>
          <button onClick={() => setShowLogout(true)} className="nav-item w-full text-error/80 hover:text-error hover:bg-error/5"><span className="material-symbols-outlined text-[22px]">logout</span><span className="text-sm font-semibold">Logout</span></button>
        </div>
      </aside>
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-3 rounded-full bg-primary text-on-primary text-sm font-bold shadow-lg animate-[slideUp_0.3s_ease-out]"><span className="material-symbols-outlined text-[18px]">check_circle</span>{toast}</div>}
      {showNewClient && <NewClientModal onClose={() => setShowNewClient(false)} onSave={data => { console.log('[API Mock] POST /api/users', { ...data, role: 'USER', trainerId: trainerUser.id }); showToast(`Client "${data.fullName}" added!`); }} />}
      {showLogout && <LogoutModal onClose={() => setShowLogout(false)} onConfirm={() => showToast('Signed out! (mock)')} />}
    </>
  );
};

export default Sidebar;
