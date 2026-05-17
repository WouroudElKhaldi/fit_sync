import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import workoutTemplates from '../data/workoutTemplates.json';
import NotificationModal from '../components/NotificationModal';

const WorkoutManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");

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

  const filteredWorkouts = workoutTemplates.filter(workout =>
    (filterType === "All" || workout.name.toLowerCase().includes(filterType.toLowerCase())) &&
    workout.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: 'Total Protocols', value: '128', icon: 'fitness_center', color: 'primary' },
    { label: 'Most Deployed', value: 'Hypertrophy Push', icon: 'trending_up', color: 'tertiary' },
    { label: 'System Compliance', value: '94.2%', icon: 'bolt', color: 'emerald-500' },
    { label: 'Protocol Drafts', value: '12', icon: 'edit_square', color: 'error' },
  ];

  const handleExport = () => {
    setModalConfig({
      isOpen: true,
      title: 'Initialize Data Export',
      message: 'The movement library and tactical protocols are being compiled into an encrypted CSV archive.',
      type: 'info',
      onConfirm: closeModal
    });
  };

  const handleDeployFeatured = () => {
    setModalConfig({
      isOpen: true,
      title: 'Initialize Mass Deployment',
      message: 'The "Elite Performance Macro-Cycle" is ready for bulk distribution to high-tier athlete terminals.',
      type: 'warning',
      onConfirm: () => {
        closeModal();
        setModalConfig({
          isOpen: true,
          title: 'Deployment Authorized',
          message: 'The macro-cycle has been added to the tactical pipeline for all eligible subjects.',
          type: 'success',
          onConfirm: closeModal
        });
      }
    });
  };

  return (
    <div className="w-full space-y-10 pb-10">
      {/* Top Header */}
      <div className="border-b border-secondary-container/10 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-on-surface mb-2 tracking-tighter uppercase leading-none">
            Program Architecture
          </h2>
          <p className="text-base text-on-surface-variant font-medium italic opacity-60">
            "Architect, manage, and deploy your professional training ecosystem."
          </p>
        </div>
        <button 
          onClick={() => navigate('/workout-builder')}
          className="bg-primary text-on-primary h-14 px-10 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-3 hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20"
        >
          <span className="material-symbols-outlined text-[22px]">add_circle</span>
          New Program
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-surface-container-low/40 backdrop-blur-xl border border-secondary-container/10 p-8 rounded-[32px] shadow-xl hover-card-motion group relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(208,188,255,0.02),transparent)]"></div>
            <div className={`w-12 h-12 rounded-xl bg-surface-container-high/60 border border-secondary-container/10 flex items-center justify-center text-${stat.color} mb-6 group-hover:scale-110 transition-transform shadow-lg relative z-10`}>
              <span className="material-symbols-outlined text-[24px]">{stat.icon}</span>
            </div>
            <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em] relative z-10 opacity-40">{stat.label}</p>
            <h3 className="text-3xl font-black text-on-surface mt-1 relative z-10 tracking-tighter leading-none">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Main Table Section */}
      <section className="bg-surface-container-low/40 backdrop-blur-xl border border-secondary-container/10 rounded-[40px] overflow-hidden shadow-xl relative">
        <div className="px-8 py-6 border-b border-secondary-container/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface-container-high/20">
          <div className="relative max-w-lg w-full">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/30 text-[20px]">hub</span>
            <input
              type="text"
              className="w-full bg-surface-container-low/60 border border-secondary-container/10 rounded-xl py-3 pl-14 pr-6 text-[13px] font-bold text-on-surface focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all shadow-inner uppercase tracking-tight"
              placeholder="Search programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3 shrink-0">
            <div className="relative">
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-surface-container-high/40 border border-secondary-container/5 text-on-surface text-[9px] font-black uppercase tracking-widest px-8 py-3 rounded-xl hover:bg-surface-container-high transition-all focus:outline-none appearance-none cursor-pointer pr-12 shadow-sm"
              >
                <option value="All">All Categories</option>
                <option value="Hypertrophy">Hypertrophy</option>
                <option value="Strength">Strength</option>
                <option value="Endurance">Endurance</option>
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary opacity-30 pointer-events-none text-[18px]">expand_more</span>
            </div>
            <button 
              onClick={handleExport}
              className="flex items-center gap-3 px-8 py-3 bg-surface-container-high/40 border border-secondary-container/5 text-on-surface-variant/60 hover:text-primary rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-surface-container-high transition-all shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">file_download</span>
              Export
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-surface-container-high/20 border-b border-secondary-container/5">
                <th className="px-8 py-5 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Protocol Architecture</th>
                <th className="px-8 py-5 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Classification</th>
                <th className="px-8 py-5 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Mechanical Volume</th>
                <th className="px-8 py-5 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Temporal Spec</th>
                <th className="px-8 py-5 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em] text-right">Operational Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-container/5">
              {filteredWorkouts.map((workout) => (
                <tr key={workout.id} className="hover:bg-primary/[0.02] transition-all group cursor-pointer">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-lg">
                        <span className="material-symbols-outlined text-[22px]">terminal</span>
                      </div>
                      <div>
                         <span className="text-base font-black text-on-surface block group-hover:text-primary transition-colors uppercase tracking-tight leading-none mb-1">{workout.name}</span>
                         <span className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest">Protocol v2.4</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-4 py-1 rounded-lg bg-primary/5 text-primary border border-primary/10 text-[9px] font-black uppercase tracking-widest shadow-sm">
                      {workout.name.includes('Push') ? 'Push Pattern' : 'Pull Pattern'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <div className="w-20 h-1 bg-surface-container-high rounded-full overflow-hidden shadow-inner">
                          <div className="h-full bg-primary w-2/3 shadow-[0_0_8px_rgba(208,188,255,0.3)]"></div>
                       </div>
                       <span className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">{workout.exercises} Mod</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-on-surface-variant/60 font-black text-[11px] uppercase tracking-tight">
                      <span className="material-symbols-outlined text-[18px] opacity-30">schedule</span>
                      {workout.duration}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="px-6 py-2.5 bg-surface-container-high/40 border border-secondary-container/5 text-on-surface-variant/60 hover:text-primary hover:bg-surface-container-high text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95">
                      Open Module
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Featured Template & Activity Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface-container-low/40 backdrop-blur-xl border border-secondary-container/10 rounded-[40px] p-10 relative overflow-hidden group shadow-2xl min-h-[380px] hover-card-motion flex flex-col justify-center">
          <div className="absolute inset-0 z-0">
            <img
              alt=""
              className="w-full h-full object-cover opacity-10 transition-transform duration-[2s] group-hover:scale-105"
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent"></div>
          </div>
          <div className="relative z-10 h-full flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-8">
               <span className="bg-primary/20 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] shadow-lg">Prime Archive</span>
               <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-emerald-400 text-[8px] font-black uppercase tracking-widest">98% Efficacy</span>
               </div>
            </div>
            <h3 className="text-3xl md:text-5xl leading-tight font-black text-on-surface mb-6 tracking-tighter uppercase">
              The Elite Performance<br/><span className="text-primary">Macro-Cycle</span>
            </h3>
            <p className="text-on-surface-variant/60 text-base font-medium max-w-xl mb-10 leading-relaxed italic">
              "Our most comprehensive 12-week program for professional athletes. Optimized for concurrent strength and hypertrophy gains."
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={handleDeployFeatured} className="bg-primary text-on-primary h-14 px-10 rounded-xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-primary/30 active:scale-95 flex items-center gap-3">
                <span className="material-symbols-outlined text-[22px]">rocket_launch</span>
                Deploy Protocol
              </button>
              <button className="bg-surface-container-high/60 backdrop-blur-md text-on-surface-variant/80 h-14 px-10 rounded-xl font-black text-[10px] uppercase tracking-widest border border-secondary-container/5 hover:text-primary transition-all shadow-xl active:scale-95 flex items-center gap-3">
                <span className="material-symbols-outlined text-[22px]">tune</span>
                Modify Specs
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-surface-container-low/40 backdrop-blur-xl border border-secondary-container/10 rounded-[32px] p-8 flex flex-col gap-8 shadow-xl hover-card-motion relative overflow-hidden group/activity">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(208,188,255,0.02),transparent)]"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
               <h4 className="text-lg font-black text-on-surface uppercase tracking-tight leading-none mb-1">Logic Updates</h4>
               <span className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest">Real-time telemetry</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant/10 text-[28px]">history</span>
          </div>
          <div className="space-y-4 relative z-10">
            {[
              { text: "Macro-Cycle V2 Updated", time: "2m ago", icon: "terminal", color: "emerald-400" },
              { text: "Published: Leg Day C", time: "1h ago", icon: "publish", color: "primary" },
              { text: "Deployed to 12 Subjects", time: "3h ago", icon: "sensors", color: "tertiary" }
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-surface-container-high/40 border border-secondary-container/5 group-hover/item:bg-surface-container-high transition-all group/item shadow-sm">
                <div className={`w-10 h-10 rounded-xl bg-surface-container-high border border-secondary-container/10 text-${activity.color} flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform shadow-md`}>
                  <span className="material-symbols-outlined text-[20px]">{activity.icon}</span>
                </div>
                <div>
                  <p className="text-xs font-black text-on-surface leading-tight uppercase tracking-tight">
                    {activity.text}
                  </p>
                  <p className="text-[9px] font-black text-on-surface-variant/20 uppercase mt-1 tracking-widest">
                    {activity.time} • SECURE_LOG
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-auto w-full py-4 border border-secondary-container/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60 hover:text-primary hover:bg-primary/5 transition-all shadow-lg active:scale-95 relative z-10">
            Access Master Logs
          </button>
        </div>
      </section>

      <NotificationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        onCancel={closeModal}
        confirmLabel="Authorize"
      />
    </div>
  );
};

export default WorkoutManagement;
