import React, { useState } from "react";
import usersData from "../data/users.json";
import NotificationModal from "../components/NotificationModal";

const AccountSettings: React.FC = () => {
  // Mock current trainer profile from JSON
  const trainer = usersData.find(u => u.role === 'TRAINER') || usersData[0];

  // State for user preferences
  const [weightUnit, setWeightUnit] = useState<"metric" | "imperial">("metric");
  const [distanceUnit, setDistanceUnit] = useState<"metric" | "imperial">("metric");
  const [leadTime, setLeadTime] = useState<number>(60);
  const [pushNotifications, setPushNotifications] = useState<boolean>(true);
  const [dailyDigest, setDailyDigest] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState(false);

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

  const handleSave = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setModalConfig({
        isOpen: true,
        title: 'Configuration Synced',
        message: 'Your neural preferences and automated protocols have been successfully synchronized with the core database.',
        type: 'success',
        onConfirm: closeModal
      });
    }, 1200);
  };

  const handleDiscard = () => {
    setModalConfig({
      isOpen: true,
      title: 'Reset Matrix?',
      message: 'This will revert all current configuration changes to their default state. This action cannot be undone.',
      type: 'danger',
      onConfirm: () => {
        setWeightUnit("metric");
        setDistanceUnit("metric");
        setLeadTime(60);
        setPushNotifications(true);
        setDailyDigest(false);
        closeModal();
      }
    });
  };

  return (
    <div className="w-full space-y-[var(--spacing-section-gap)] pb-10">
      {/* Page Header */}
      <div className="border-b border-secondary-container/20 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black text-on-surface mb-1 tracking-tighter uppercase leading-none">
             Neural Configuration
           </h1>
           <p className="text-xs text-on-surface-variant font-medium italic opacity-60">
             "Synchronize your professional environment, biomechanical standards, and automated protocols."
           </p>
        </div>
        <div className="flex gap-4">
           <div className="px-5 py-2.5 bg-surface-container-high/60 backdrop-blur-md rounded-xl border border-secondary-container/10 flex items-center gap-3 shadow-xl">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                 <span className="material-symbols-outlined text-[20px]">verified_user</span>
              </div>
              <div className="flex flex-col">
                 <span className="text-[7px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">System Integrity</span>
                 <span className="text-[10px] font-black text-on-surface uppercase leading-tight">Encrypted</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--spacing-section-gap)]">
        {/* Profile Card */}
        <aside className="lg:col-span-1 space-y-6">
           <div className="glass-card !p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(208,188,255,0.03),transparent)]"></div>
              <div className="flex flex-col items-center text-center mb-6 relative z-10">
                 <div className="relative group/avatar mb-6">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-1000"></div>
                    <img src={trainer.avatar || ''} className="w-32 h-32 rounded-[40px] object-cover border-2 border-primary/20 shadow-[0_20px_40px_rgba(0,0,0,0.4)] group-hover/avatar:border-primary transition-all duration-700 relative z-10 grayscale hover:grayscale-0" alt="" />
                    <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-on-primary rounded-xl flex items-center justify-center shadow-2xl hover:scale-110 transition-transform active:scale-90 z-20">
                       <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                    </button>
                 </div>
                 <h3 className="text-xl font-black text-on-surface uppercase tracking-tight mb-1">{trainer.fullName}</h3>
                 <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 shadow-inner">Elite Practitioner</span>
              </div>
              
              <div className="space-y-3 pt-6 border-t border-secondary-container/10 relative z-10">
                 <div className="flex justify-between items-center px-4 py-3.5 bg-surface-container-high/40 rounded-2xl border border-secondary-container/5 hover:bg-surface-container-high transition-all">
                    <span className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">Rank</span>
                    <span className="text-sm font-black text-on-surface">TOP 1%</span>
                 </div>
                 <div className="flex justify-between items-center px-4 py-3.5 bg-surface-container-high/40 rounded-2xl border border-secondary-container/5 hover:bg-surface-container-high transition-all">
                    <span className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">Cohorts</span>
                    <span className="text-sm font-black text-on-surface">12 CLIENTS</span>
                 </div>
              </div>
           </div>

           <div className="floating-card !p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                 <span className="material-symbols-outlined text-[60px]">health_and_safety</span>
              </div>
              <h4 className="text-[8px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-8 relative z-10 opacity-40">System Health</h4>
              <div className="space-y-6 relative z-10">
                 <div className="space-y-3">
                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest mb-1 items-end">
                       <span className="opacity-40">DB Sync</span>
                       <span className="text-emerald-500 text-sm">98.4%</span>
                    </div>
                    <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden shadow-inner border border-secondary-container/10">
                       <div className="h-full bg-emerald-500 w-[98%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></div>
                    </div>
                 </div>
                 <div className="space-y-3">
                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest mb-1 items-end">
                       <span className="opacity-40">Neural Latency</span>
                       <span className="text-primary text-sm">12ms</span>
                    </div>
                    <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden shadow-inner border border-secondary-container/10">
                       <div className="h-full bg-primary w-[20%] rounded-full shadow-[0_0_10px_rgba(208,188,255,0.8)]"></div>
                    </div>
                 </div>
              </div>
           </div>
        </aside>

        {/* Settings Grid */}
        <div className="lg:col-span-2 space-y-6">
          <section className="glass-card !p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(208,188,255,0.03),transparent)] pointer-events-none"></div>

            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-secondary-container/10 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shadow-xl shrink-0">
                 <span className="material-symbols-outlined text-[24px] ">cardio_load</span>
              </div>
              <div>
                 <h2 className="text-lg font-black text-on-surface uppercase tracking-tight leading-none mb-1">Standards</h2>
                 <p className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest">Establish the measurement matrix for all sessions.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-4">
                <label className="text-[8px] font-black text-on-surface-variant uppercase tracking-[0.2em] px-2 block opacity-40">Biomass</label>
                <div className="flex p-1.5 bg-surface-container-high/60 backdrop-blur-md rounded-2xl border border-secondary-container/10 shadow-inner">
                  <button
                    onClick={() => setWeightUnit("metric")}
                    className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer ${
                      weightUnit === "metric" ? "bg-primary text-on-primary shadow-xl shadow-primary/30" : "text-on-surface-variant/40 hover:text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    Metric (KG)
                  </button>
                  <button
                    onClick={() => setWeightUnit("imperial")}
                    className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer ${
                      weightUnit === "imperial" ? "bg-primary text-on-primary shadow-xl shadow-primary/30" : "text-on-surface-variant/40 hover:text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    Imperial (LB)
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[8px] font-black text-on-surface-variant uppercase tracking-[0.2em] px-2 block opacity-40">Spatial Metrics</label>
                <div className="flex p-1.5 bg-surface-container-high/60 backdrop-blur-md rounded-2xl border border-secondary-container/10 shadow-inner">
                  <button
                    onClick={() => setDistanceUnit("metric")}
                    className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer ${
                      distanceUnit === "metric" ? "bg-primary text-on-primary shadow-xl shadow-primary/30" : "text-on-surface-variant/40 hover:text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    Standard (CM)
                  </button>
                  <button
                    onClick={() => setDistanceUnit("imperial")}
                    className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer ${
                      distanceUnit === "imperial" ? "bg-primary text-on-primary shadow-xl shadow-primary/30" : "text-on-surface-variant/40 hover:text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    US Custom (IN)
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="glass-card !p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(208,188,255,0.03),transparent)] pointer-events-none"></div>

            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-secondary-container/10 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shadow-xl shrink-0">
                 <span className="material-symbols-outlined text-[24px] fill">automation</span>
              </div>
              <div>
                 <h2 className="text-lg font-black text-on-surface uppercase tracking-tight leading-none mb-1">Protocols</h2>
                 <p className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest">Configure autonomous notification nodes and sync schedules.</p>
              </div>
            </div>

            <div className="space-y-10 relative z-10">
              <div className="space-y-6">
                <div className="flex justify-between items-end px-2">
                   <div>
                      <label className="text-[8px] font-black text-on-surface-variant uppercase tracking-[0.2em] block mb-1 opacity-40">Intelligence Window</label>
                      <p className="text-sm font-bold text-on-surface italic uppercase tracking-tight">Deployment Lead Time</p>
                   </div>
                   <div className="flex flex-col items-end">
                      <span className="text-2xl font-black text-primary leading-none">{leadTime}</span>
                      <span className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest mt-1">MINUTES</span>
                   </div>
                </div>
                <div className="relative pt-6 pb-4 px-2">
                   <div className="absolute top-1/2 left-2 right-2 h-2 bg-surface-container-high rounded-full -translate-y-1/2 shadow-inner border border-secondary-container/5"></div>
                   <input
                     className="w-full h-2 bg-transparent appearance-none cursor-pointer accent-primary relative z-10"
                     max="120" min="0" step="15" type="range" value={leadTime}
                     onChange={(e) => setLeadTime(Number(e.target.value))}
                   />
                   <div className="flex justify-between mt-4 text-[7px] font-black text-on-surface-variant/20 uppercase tracking-[0.2em]">
                      <span>0M</span><span>30M</span><span>60M</span><span>90M</span><span>120M</span>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div onClick={() => setPushNotifications(!pushNotifications)} className={`p-6 rounded-2xl flex items-center justify-between cursor-pointer transition-all border-2 ${pushNotifications ? 'bg-primary/5 border-primary/20 shadow-xl' : 'bg-surface-container-high/40 border-secondary-container/5 hover:bg-surface-container-high shadow-lg'}`}>
                   <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${pushNotifications ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant/40'}`}>
                         <span className="material-symbols-outlined text-[20px] fill">smartphone</span>
                      </div>
                      <div>
                         <span className="text-xs font-black text-on-surface uppercase tracking-tight block leading-none mb-1">Push Relay</span>
                         <span className="text-[8px] font-bold text-on-surface-variant/40 italic uppercase tracking-widest">Mobile Link</span>
                      </div>
                   </div>
                   <div className={`w-10 h-5.5 rounded-full relative transition-all shadow-inner shrink-0 ${pushNotifications ? 'bg-primary' : 'bg-surface-container-highest'}`}>
                      <div className={`absolute top-1 w-3.5 h-3.5 rounded-full bg-white transition-all shadow-2xl ${pushNotifications ? 'right-1' : 'left-1'}`}></div>
                   </div>
                </div>

                <div onClick={() => setDailyDigest(!dailyDigest)} className={`p-6 rounded-2xl flex items-center justify-between cursor-pointer transition-all border-2 ${dailyDigest ? 'bg-primary/5 border-primary/20 shadow-xl' : 'bg-surface-container-high/40 border-secondary-container/5 hover:bg-surface-container-high shadow-lg'}`}>
                   <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${dailyDigest ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant/40'}`}>
                         <span className="material-symbols-outlined text-[20px] fill">alternate_email</span>
                      </div>
                      <div>
                         <span className="text-xs font-black text-on-surface uppercase tracking-tight block leading-none mb-1">Daily Sync</span>
                         <span className="text-[8px] font-bold text-on-surface-variant/40 italic uppercase tracking-widest">Audit Digest</span>
                      </div>
                   </div>
                   <div className={`w-10 h-5.5 rounded-full relative transition-all shadow-inner shrink-0 ${dailyDigest ? 'bg-primary' : 'bg-surface-container-highest'}`}>
                      <div className={`absolute top-1 w-3.5 h-3.5 rounded-full bg-white transition-all shadow-2xl ${dailyDigest ? 'right-1' : 'left-1'}`}></div>
                   </div>
                </div>
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-4 pt-4">
            <button 
              onClick={handleDiscard} 
              className="px-8 py-4 bg-surface-container-high/60 backdrop-blur-md text-on-surface text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-surface-container-highest transition-all active:scale-95 shadow-xl border border-secondary-container/10"
            >
              Reset Matrix
            </button>
            <button 
              onClick={handleSave} 
              disabled={isSyncing}
              className="px-10 py-4 bg-primary text-on-primary text-[9px] font-black uppercase tracking-widest rounded-xl hover:brightness-110 shadow-[0_15px_40px_rgba(208,188,255,0.3)] transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3 group"
            >
              <span className={`material-symbols-outlined text-[20px] ${isSyncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`}>sync</span>
              {isSyncing ? 'Synchronizing...' : 'Commit Configuration'}
            </button>
          </div>
        </div>
      </div>

      <NotificationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        onCancel={closeModal}
        confirmLabel={modalConfig.type === 'danger' ? 'Reset Matrix' : 'Authorization Confirmed'}
      />
    </div>
  );
};

export default AccountSettings;
