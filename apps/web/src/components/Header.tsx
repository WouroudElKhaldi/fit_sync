import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import usersData from '../data/users.json';
import mockData from '../data/mockData.json';

const clientsData = usersData.filter(u => u.role === 'USER');
const trainerUser = usersData.find(u => u.role === 'TRAINER')!;

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (!ref.current || ref.current.contains(e.target as Node)) return; handler(); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [ref, handler]);
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  useClickOutside(searchRef, () => setSearchOpen(false));

  const searchResults = searchQuery.trim().length > 0
    ? clientsData.filter(c => c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase()) || (c.goal || '').toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockData.notifications);
  const notifRef = useRef<HTMLDivElement>(null);
  useClickOutside(notifRef, () => setNotifOpen(false));
  const unreadCount = notifications.filter(n => !n.read).length;

  const [helpOpen, setHelpOpen] = useState(false);
  const helpRef = useRef<HTMLDivElement>(null);
  useClickOutside(helpRef, () => setHelpOpen(false));

  const [quickOpen, setQuickOpen] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  useClickOutside(profileRef, () => setProfileOpen(false));

  return (
    <>
      <header className="fixed top-0 left-64 right-0 h-[72px] bg-surface-container/80 backdrop-blur-md border-b border-outline-variant/20 flex items-center justify-between px-10 z-40">
        {/* Search */}
        <div className="relative w-80" ref={searchRef}>
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 z-10">search</span>
          <input type="text" placeholder="Search clients, workouts..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)}
            className="w-full bg-surface border border-outline-variant/30 rounded-full py-2 pl-10 pr-4 text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary/60 text-sm" />
          {searchOpen && searchQuery.trim().length > 0 && (
            <div className="absolute top-full mt-2 left-0 right-0 rounded-2xl overflow-hidden border border-outline-variant/20 max-h-72 overflow-y-auto z-50" style={{ background: 'linear-gradient(145deg, #1a2535, #16202e)' }}>
              {searchResults.length === 0 ? <div className="p-6 text-center text-sm text-on-surface-variant/50">No results for "{searchQuery}"</div> :
                searchResults.map(c => (
                  <button key={c.id} onClick={() => { setSearchQuery(''); setSearchOpen(false); navigate('/clients'); }} className="flex items-center gap-3 w-full p-3 hover:bg-surface-container-highest text-left">
                    <img src={c.avatar} alt={c.fullName} className="w-9 h-9 rounded-full object-cover" />
                    <div className="flex flex-col min-w-0"><span className="text-sm font-bold truncate">{c.fullName}</span><span className="text-xs text-on-surface-variant/60 truncate">{c.email} • {c.goal || ''}</span></div>
                    <span className={`ml-auto text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${c.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-tertiary/10 text-tertiary'}`}>{c.status}</span>
                  </button>
                ))
              }
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Help */}
          <div className="relative" ref={helpRef}>
            <button onClick={() => { setHelpOpen(!helpOpen); setNotifOpen(false); setProfileOpen(false); }} className={`p-2 rounded-full transition-all ${helpOpen ? 'bg-primary/10 text-primary' : 'text-on-surface-variant/60 hover:bg-surface-container-highest hover:text-on-surface'}`}><span className="material-symbols-outlined">help</span></button>
            {helpOpen && (
              <div className="absolute top-full mt-2 right-0 w-80 rounded-2xl border border-outline-variant/20 overflow-hidden z-50" style={{ background: 'linear-gradient(145deg, #1a2535, #16202e)' }}>
                <div className="p-4 border-b border-outline-variant/20"><h3 className="text-sm font-bold">Help & Support</h3></div>
                <div className="max-h-72 overflow-y-auto">{mockData.helpTopics.map(t => (
                  <button key={t.id} onClick={() => setHelpOpen(false)} className="flex flex-col gap-1 w-full p-4 hover:bg-surface-container-highest text-left border-b border-outline-variant/10 last:border-0"><span className="text-sm font-bold">{t.title}</span><span className="text-xs text-on-surface-variant/60">{t.desc}</span></button>
                ))}</div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button onClick={() => { setNotifOpen(!notifOpen); setHelpOpen(false); setProfileOpen(false); }} className={`p-2 rounded-full relative ${notifOpen ? 'bg-primary/10 text-primary' : 'text-on-surface-variant/60 hover:bg-surface-container-highest hover:text-on-surface'}`}>
              <span className="material-symbols-outlined">notifications</span>
              {unreadCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full text-[9px] font-bold text-on-primary flex items-center justify-center">{unreadCount}</span>}
            </button>
            {notifOpen && (
              <div className="absolute top-full mt-2 right-0 w-96 rounded-2xl border border-outline-variant/20 overflow-hidden z-50" style={{ background: 'linear-gradient(145deg, #1a2535, #16202e)' }}>
                <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center"><h3 className="text-sm font-bold">Notifications</h3>{unreadCount > 0 && <button onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))} className="text-xs text-primary font-bold hover:underline">Mark all read</button>}</div>
                <div className="max-h-80 overflow-y-auto">{notifications.map(n => (
                  <div key={n.id} className={`flex items-start gap-3 p-4 border-b border-outline-variant/10 last:border-0 ${!n.read ? 'bg-primary/[0.03]' : ''}`}>
                    <span className={`material-symbols-outlined p-2 rounded-xl text-[18px] shrink-0 ${!n.read ? 'text-primary bg-primary/10' : 'text-on-surface-variant/50 bg-surface-container-highest'}`}>{n.icon}</span>
                    <div className="flex-1 min-w-0"><p className={`text-sm ${!n.read ? 'font-bold' : 'font-medium text-on-surface-variant'}`}>{n.title}</p><p className="text-xs text-on-surface-variant/60 mt-0.5">{n.body}</p><span className="text-[10px] text-on-surface-variant/40 mt-1 block">{n.time}</span></div>
                    <button onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))} className="p-1 rounded hover:bg-surface-container-highest shrink-0"><span className="material-symbols-outlined text-[14px] text-on-surface-variant/40">close</span></button>
                  </div>
                ))}</div>
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-outline-variant/30"></div>
          <button onClick={() => setQuickOpen(true)} className="btn-primary py-2 px-5 text-sm shadow-none">Quick Action</button>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); setHelpOpen(false); }} className="flex items-center gap-2 p-1 rounded-full hover:bg-surface-container-highest border border-transparent hover:border-primary/20">
              <div className="w-9 h-9 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/30"><img src={trainerUser.avatar} alt={trainerUser.fullName} className="w-full h-full object-cover" /></div>
              <span className="material-symbols-outlined text-on-surface-variant/50 text-[18px]">expand_more</span>
            </button>
            {profileOpen && (
              <div className="absolute top-full mt-2 right-0 w-64 rounded-2xl border border-outline-variant/20 overflow-hidden z-50" style={{ background: 'linear-gradient(145deg, #1a2535, #16202e)' }}>
                <div className="p-4 border-b border-outline-variant/20">
                  <div className="flex items-center gap-3"><img src={trainerUser.avatar} alt={trainerUser.fullName} className="w-10 h-10 rounded-full object-cover" /><div><p className="text-sm font-bold">{trainerUser.fullName}</p><p className="text-xs text-on-surface-variant/60">{trainerUser.email}</p></div></div>
                  <span className="mt-2 inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary tracking-widest">{trainerUser.trainerProfile?.specialties?.[0] || 'Trainer'}</span>
                </div>
                {[{ icon: 'person', label: 'My Profile', path: '/profile' }, { icon: 'settings', label: 'Settings', path: '/settings' }, { icon: 'assessment', label: 'Analytics', path: '/' }].map(item => (
                  <button key={item.label} onClick={() => { setProfileOpen(false); navigate(item.path); }} className="flex items-center gap-3 w-full p-3 hover:bg-surface-container-highest text-left text-sm"><span className="material-symbols-outlined text-[20px] text-on-surface-variant">{item.icon}</span>{item.label}</button>
                ))}
                <div className="border-t border-outline-variant/20"><button onClick={() => { setProfileOpen(false); alert('Logged out! (mock)'); }} className="flex items-center gap-3 w-full p-3 hover:bg-error/5 text-left text-sm text-error/80 hover:text-error"><span className="material-symbols-outlined text-[20px]">logout</span>Logout</button></div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Quick Action Modal — rendered via portal outside header */}
      {quickOpen && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200]" onClick={() => setQuickOpen(false)}>
          <div className="rounded-[20px] p-8 w-full max-w-md mx-4 flex flex-col gap-6 border border-outline-variant/20" onClick={e => e.stopPropagation()} style={{ background: 'linear-gradient(145deg, #1a2535, #16202e)' }}>
            <div className="flex justify-between items-center"><h3 className="text-xl font-bold">Quick Actions</h3><button onClick={() => setQuickOpen(false)} className="p-1 rounded-full hover:bg-surface-container-highest"><span className="material-symbols-outlined">close</span></button></div>
            <div className="grid grid-cols-2 gap-3">{mockData.quickActions.map(qa => (
              <button key={qa.id} onClick={() => { setQuickOpen(false); if (qa.route) navigate(qa.route); else alert(`${qa.label} — mock action (will POST to API)`); }}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-outline-variant/20 hover:border-primary/40 hover:bg-primary/5 transition-all group">
                <span className="material-symbols-outlined text-[28px] text-on-surface-variant group-hover:text-primary">{qa.icon}</span>
                <span className="text-xs font-bold text-on-surface-variant group-hover:text-on-surface">{qa.label}</span>
              </button>
            ))}</div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Header;
