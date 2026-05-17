import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usersData from '../data/users.json';
import NotificationModal from '../components/NotificationModal';

type ClientUser = {
  id: string;
  fullName: string;
  avatar: string | null;
  goal: string;
  status: string;
};

const ClientsList: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'pending'>('active');
  const [searchQuery, setSearchQuery] = useState("");
  
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

  const allClients = usersData.filter(u => u.role === 'USER') as ClientUser[];
  const activeClients = allClients.filter(c => c.status === 'active');
  const pendingClients = allClients.filter(c => c.status === 'pending');

  const displayedClients = (activeTab === 'active' ? activeClients : pendingClients).filter(c => 
    c.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  const handleAcceptRequest = (client: ClientUser) => {
    setModalConfig({
      isOpen: true,
      title: 'Initialize Onboarding?',
      message: `You are about to accept ${client.fullName} into your professional roster. This will grant them access to your movement library and scheduling system.`,
      type: 'success',
      onConfirm: () => {
        closeModal();
        setModalConfig({
          isOpen: true,
          title: 'Athlete Synced',
          message: `${client.fullName} has been successfully integrated into your active roster.`,
          type: 'success',
          onConfirm: closeModal
        });
      }
    });
  };

  const handleDeclineRequest = (client: ClientUser) => {
    setModalConfig({
      isOpen: true,
      title: 'Decline Application?',
      message: `This action will permanently purge ${client.fullName}'s application data from your pending requests queue.`,
      type: 'danger',
      onConfirm: () => {
        closeModal();
      }
    });
  };

  return (
    <div className="w-full space-y-(--spacing-section-gap) pb-10 pt-4">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-secondary-container/10 pb-6">
        <div>
          <h2 className="text-2xl font-black text-on-surface mb-1 tracking-tighter uppercase leading-none">
            Client Directory
          </h2>
          <p className="text-[10px] text-on-surface-variant font-medium italic opacity-60">
            "Manage your elite roster and review incoming tactical requests in real-time."
          </p>
        </div>
        
        <div className="flex gap-1.5 bg-surface-container-high/40 p-1 rounded-xl border border-secondary-container/10 self-start md:self-auto shadow-xl backdrop-blur-md">
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
        </div>
      </div>

      {/* Global Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-(--spacing-section-gap)">
        {[
          { label: 'Total Clients', value: activeClients.length, icon: 'hub', color: 'primary', trend: '+12%', trendUp: true },
          { label: 'Active Today', value: Math.floor(activeClients.length * 0.7), icon: 'bolt', color: 'tertiary', trend: '70% Rate', trendUp: true },
          { label: 'Avg. Compliance', value: '84%', icon: 'verified', color: 'emerald-500', trend: '+4%', trendUp: true },
          { label: 'Tactical Alerts', value: 3, icon: 'priority_high', color: 'error', trend: 'Critical', trendUp: false }
        ].map((stat, i) => (
          <div key={i} className="glass-card shadow-xl group relative overflow-hidden !p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(208,188,255,0.02),transparent)]"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className={`w-8 h-8 rounded-lg bg-surface-container-high/60 border border-secondary-container/10 flex items-center justify-center text-${stat.color} group-hover:scale-110 transition-transform shadow-lg`}>
                <span className="material-symbols-outlined text-[18px]">{stat.icon}</span>
              </div>
              <span className={`text-[7px] font-black uppercase tracking-widest ${stat.trendUp ? 'text-emerald-500' : 'text-error'}`}>{stat.trend}</span>
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
          <div className="flex items-center gap-1.5">
             <button className="w-8 h-8 rounded-lg bg-surface-container-high/40 border border-secondary-container/5 text-on-surface-variant/40 hover:text-primary transition-all flex items-center justify-center shadow-lg active:scale-90 cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">tune</span>
             </button>
             <button className="w-8 h-8 rounded-lg bg-surface-container-high/40 border border-secondary-container/5 text-on-surface-variant/40 hover:text-primary transition-all flex items-center justify-center shadow-lg active:scale-90 cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">cloud_download</span>
             </button>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-container-high/10 border-b border-secondary-container/5">
                <th className="px-5 py-3 text-[8px] font-black text-on-surface-variant uppercase tracking-[0.2em] opacity-50">Athlete</th>
                <th className="px-5 py-3 text-[8px] font-black text-on-surface-variant uppercase tracking-[0.2em] opacity-50">Activity</th>
                <th className="px-5 py-3 text-[8px] font-black text-on-surface-variant uppercase tracking-[0.2em] opacity-50">Objective</th>
                <th className="px-5 py-3 text-[8px] font-black text-on-surface-variant uppercase tracking-[0.2em] opacity-50">Scheduled</th>
                <th className="px-5 py-3 text-[8px] font-black text-on-surface-variant uppercase tracking-[0.2em] opacity-50">Sync</th>
                <th className="px-5 py-3 text-[8px] font-black text-on-surface-variant uppercase tracking-[0.2em] text-right opacity-50">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-container/5">
              {displayedClients.map((client, index) => (
                <tr key={client.id} className="hover:bg-primary/[0.02] transition-all group cursor-pointer" onClick={() => activeTab === 'active' && navigate(`/clients/${client.id}`)}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-lg border border-secondary-container/10 group-hover:border-primary/40 transition-all overflow-hidden shadow-lg">
                           <img alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" src={client.avatar || ''} />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full border-2 border-surface-container-low shadow-xl ${activeTab === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                      </div>
                      <div>
                        <span className="text-xs font-black text-on-surface block group-hover:text-primary transition-colors uppercase tracking-tight leading-none mb-1">{client.fullName}</span>
                        <span className="text-[7px] font-black text-on-surface-variant/40 uppercase tracking-widest block">ID: {client.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-on-surface uppercase tracking-tight">{activeTab === 'active' ? `${index + 1}D AGO` : 'URGENT'}</span>
                      <span className="text-[7px] font-black text-on-surface-variant/20 uppercase tracking-widest mt-0.5 leading-none">Telemetry</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest shadow-sm">
                      {client.goal || 'OPTIMIZE'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 text-on-surface font-black text-[9px] uppercase tracking-tight opacity-30">
                       <span className="material-symbols-outlined text-[14px] text-tertiary">calendar_clock</span>
                       {activeTab === 'active' ? 'TMRW' : 'QUEUED'}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className={`flex items-center gap-1.5 ${index % 2 === 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                       <span className="material-symbols-outlined text-[16px] fill">{index % 2 === 0 ? 'verified' : 'priority_high'}</span>
                       <span className="text-[7px] font-black uppercase tracking-widest leading-none">{index % 2 === 0 ? 'SYNC' : 'DESYNC'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right" onClick={e => e.stopPropagation()}>
                    {activeTab === 'active' ? (
                      <button 
                        onClick={() => navigate(`/clients/${client.id}`)}
                        className="px-3 py-1.5 bg-primary text-on-primary text-[8px] font-black uppercase tracking-[0.2em] rounded-lg hover:brightness-110 transition-all shadow-lg shadow-primary/20 active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">person_search</span>
                        Intel
                      </button>
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
              ))}
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
        confirmLabel={modalConfig.type === 'danger' ? 'Purge' : 'Authorize'}
      />
    </div>
  );
};

export default ClientsList;
