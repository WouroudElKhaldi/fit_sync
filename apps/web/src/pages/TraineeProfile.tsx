import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import usersData from '../data/users.json';
import NotificationModal from '../components/NotificationModal';

const TraineeProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('3M');

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

  const trainee = useMemo(() => {
    const targetId = id || 'u-client-1';
    return usersData.find(u => u.id === targetId);
  }, [id]);

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  const handleDecommissionSession = (sessionName: string) => {
    setModalConfig({
      isOpen: true,
      title: 'Cancel Session?',
      message: `You are about to decommission the "${sessionName}" protocol. This will notify the athlete immediately.`,
      type: 'warning',
      onConfirm: () => {
        closeModal();
      }
    });
  };

  const handleAssignWorkout = () => {
     setModalConfig({
       isOpen: true,
       title: 'Assign New Protocol',
       message: 'Loading global movement library for deployment to this athlete.',
       type: 'info',
       onConfirm: () => {
         closeModal();
         navigate('/workout-builder');
       }
     });
  };

  if (!trainee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-24 h-24 rounded-[32px] bg-error/10 flex items-center justify-center border border-error/20">
           <span className="material-symbols-outlined text-5xl text-error/30">person_off</span>
        </div>
        <div className="text-center">
           <h2 className="text-3xl font-black text-on-surface uppercase tracking-tighter">Subject Not Found</h2>
           <p className="text-on-surface-variant font-medium italic">"The biometric profile for this ID does not exist in the database."</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-(--spacing-section-gap) pb-10">
      {/* Dynamic Profile Header */}
      <section className="glass-card flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden group !p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(208,188,255,0.05),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div className="relative shrink-0">
          <div className="w-32 h-32 rounded-2xl border-4 border-primary/5 p-1 transition-all group-hover:border-primary/20 bg-surface-container-high shadow-inner">
            <img alt="" className="w-full h-full object-cover rounded-xl shadow-2xl" src={trainee.avatar || ''} />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-7 h-7 rounded-lg border-4 border-surface-container-low shadow-2xl flex items-center justify-center">
             <span className="material-symbols-outlined text-white text-[14px] font-black">bolt</span>
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left relative z-10">
          <div className="flex flex-col md:flex-row md:items-end gap-3 mb-3">
            <div>
               <h1 className="text-3xl font-black text-on-surface tracking-tighter uppercase mb-1 leading-none">
                {trainee.fullName}
               </h1>
               <div className="flex items-center gap-3">
                  <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">
                    Goal: {trainee.goal || 'General Fitness'}
                  </span>
                  <span className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest leading-none">ID: {trainee.id}</span>
               </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-on-surface-variant">
            <div className="flex items-center gap-2 hover:text-primary transition-all cursor-pointer group/link">
              <span className="material-symbols-outlined text-[16px] opacity-40 group-hover/link:opacity-100">alternate_email</span>
              <span className="text-[10px] font-bold">{trainee.email}</span>
            </div>
            <div className="flex items-center gap-2 hover:text-primary transition-all cursor-pointer group/link">
              <span className="material-symbols-outlined text-[16px] opacity-40 group-hover/link:opacity-100">call</span>
              <span className="text-[10px] font-bold">+1 (555) {trainee.id.slice(-4)}-5678</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4 md:mt-0 relative z-10">
          <button className="px-6 py-2.5 bg-surface-container-high border border-secondary-container/10 rounded-xl font-black text-[8px] uppercase tracking-widest hover:bg-surface-container-highest transition-all shadow-xl active:scale-95">
            Synchronize
          </button>
          <button onClick={handleAssignWorkout} className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-black text-[8px] uppercase tracking-widest hover:brightness-110 transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-2 active:scale-95">
            <span className="material-symbols-outlined text-[16px]">add_task</span>
            Deploy Protocol
          </button>
        </div>
      </section>

      {/* Grid Layout for Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-(--spacing-section-gap)">
        {/* 1. Biometric Stats */}
        <div className="glass-card flex flex-col justify-between shadow-2xl group/stats !p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(208,188,255,0.03),transparent)]"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[16px]">biometrics</span>
              Biometrics
            </h3>
          </div>
          <div className="space-y-2 relative z-10">
            {[
              { label: 'Mass', value: '62', unit: 'KG', color: 'on-surface' },
              { label: 'Height', value: '165', unit: 'CM', color: 'on-surface' },
              { label: 'Fat', value: '22', unit: '%', color: 'primary' }
            ].map((stat, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 bg-surface-container-high/40 rounded-xl border border-secondary-container/5 group/row hover:bg-surface-container-high transition-all shadow-inner">
                <span className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">{stat.label}</span>
                <span className={`text-${stat.color} text-xl font-black leading-none flex items-baseline`}>
                  {stat.value}<span className="text-[9px] font-black opacity-20 ml-1">{stat.unit}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-2 relative z-10 opacity-40">
            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[7px] font-black uppercase tracking-widest">Established</span>
          </div>
        </div>

        {/* 2. Mass Evolution Chart */}
        <div className="lg:col-span-2 glass-card shadow-2xl group/chart !p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,rgba(208,188,255,0.03),transparent)]"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[16px]">show_chart</span>
              Progression
            </h3>
            <div className="flex gap-1 bg-surface-container-high/60 p-1 rounded-xl border border-secondary-container/10 backdrop-blur-md">
              {['3M', '6M', '1Y'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                    timeRange === range 
                      ? 'bg-primary text-on-primary shadow-lg' 
                      : 'text-on-surface-variant/40 hover:text-on-surface hover:bg-surface-container-highest/50'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-40 w-full relative z-10 px-2">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 200">
              <defs>
                <linearGradient id="traineePurple" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#d0bcff" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#d0bcff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,180 Q100,160 200,170 T400,120 T600,80 T800,70 L800,200 L0,200 Z" fill="url(#traineePurple)" className="animate-pulse duration-[3s]" />
              <path d="M0,180 Q100,160 200,170 T400,120 T600,80 T800,70" fill="none" stroke="#d0bcff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_10px_rgba(208,188,255,0.4)]" />
              {[200, 400, 600, 800].map((cx, i) => (
                <circle key={i} cx={cx} cy={[170, 120, 80, 70][i]} fill="#d0bcff" r="6" className="cursor-pointer hover:r-8 transition-all duration-300 stroke-surface-container-low stroke-[3px]" />
              ))}
            </svg>
            <div className="flex justify-between mt-4 px-2 text-[7px] font-black text-on-surface-variant/20 uppercase tracking-[0.3em]">
              <span>Epoch 0</span>
              <span>Mid Phase</span>
              <span>Optimization</span>
              <span className="text-primary font-black opacity-100">Live Telemetry</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Operational Timeline */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-(--spacing-section-gap)">
        {/* Validated Protocols */}
        <div className="bg-surface-container-low rounded-[32px] border border-secondary-container/10 p-8 hover-card-motion shadow-2xl">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
               <span className="material-symbols-outlined text-[24px] fill">verified</span>
            </div>
            <div>
               <h3 className="text-lg font-black text-on-surface uppercase tracking-tight leading-none mb-1">Archived Protocols</h3>
               <span className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest">Historical Compliance</span>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { name: "Hypertrophy Volume A", date: "JUN 12", duration: "55M", intensity: "HIGH" },
              { name: "Metabolic Conditioning", date: "JUN 10", duration: "40M", intensity: "MED" },
              { name: "Neural Strength Prime", date: "JUN 08", duration: "65M", intensity: "PEAK" }
            ].map((workout, idx) => (
              <div key={idx} onClick={() => navigate('/session-review')} className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-high/40 hover:bg-emerald-500/5 transition-all group cursor-pointer border border-transparent hover:border-emerald-500/20 shadow-inner active:scale-[0.98]">
                <div className="flex items-center gap-4">
                   <div className="w-1.5 h-8 bg-emerald-500/10 rounded-full group-hover:bg-emerald-500 transition-all"></div>
                   <div>
                    <h4 className="text-xs font-black text-on-surface uppercase tracking-tight group-hover:text-emerald-500 transition-colors">
                      {workout.name}
                    </h4>
                    <p className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest mt-0.5">
                      {workout.date} • {workout.duration} • INTENSITY: {workout.intensity}
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant/20 group-hover:text-emerald-500 transition-all group-hover:translate-x-1 text-[16px]">
                   arrow_forward_ios
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Deployment Pipeline */}
        <div className="bg-surface-container-low rounded-[32px] border border-secondary-container/10 p-8 hover-card-motion shadow-2xl">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
               <span className="material-symbols-outlined text-[24px] fill">rocket_launch</span>
            </div>
            <div>
               <h3 className="text-lg font-black text-on-surface uppercase tracking-tight leading-none mb-1">Deployment Pipeline</h3>
               <span className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest">Tactical Feed</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 shadow-2xl relative overflow-hidden group/active">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                 <span className="material-symbols-outlined text-2xl animate-spin-slow">settings</span>
              </div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-xl border border-primary/20">
                    <span className="material-symbols-outlined text-[24px] fill">event</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-on-surface uppercase tracking-tight">Core Stabilization 4.0</h4>
                    <p className="text-[8px] font-black text-primary uppercase tracking-widest mt-1 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary animate-pulse"></span>
                      Tomorrow • 10:00 AM (45M)
                    </p>
                  </div>
                </div>
                <button onClick={() => handleDecommissionSession("Core Stabilization 4.0")} className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant/30 hover:bg-error/10 hover:text-error transition-all shadow-md bg-surface-container-low active:scale-90">
                  <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
                </button>
              </div>
            </div>
            
            {[
              { name: "Metabolic Blast [High]", date: "JUN 16", duration: "60M" },
              { name: "Recovery Flux [Low]", date: "JUN 18", duration: "30M" }
            ].map((session, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-high/40 hover:bg-primary/5 transition-all group cursor-pointer border border-transparent hover:border-primary/20 shadow-inner active:scale-[0.98]">
                <div className="flex items-center gap-4">
                   <div className="w-1.5 h-8 bg-primary/10 rounded-full group-hover:bg-primary transition-all"></div>
                   <div>
                    <h4 className="text-xs font-black text-on-surface uppercase tracking-tight group-hover:text-primary transition-colors">
                      {session.name}
                    </h4>
                    <p className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest mt-0.5">
                      {session.date} • {session.duration}
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant/20 group-hover:text-primary transition-all text-[16px]">
                   tune
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <NotificationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        onCancel={closeModal}
        confirmLabel={modalConfig.type === 'danger' || modalConfig.type === 'warning' ? 'Decommission' : 'Confirm'}
      />
    </div>
  );
};

export default TraineeProfile;
