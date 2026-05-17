import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import usersData from "../data/users.json";
import NotificationModal from "../components/NotificationModal";

const ClientDetails: React.FC = () => {
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

  const client = useMemo(() => {
    return usersData.find((u) => u.id === id && u.role === "USER");
  }, [id]);

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  const handleDecommissionSession = (sessionName: string) => {
    setModalConfig({
      isOpen: true,
      title: 'Decommission Session?',
      message: `You are about to cancel the "${sessionName}" protocol. This will remove the session from the deployment pipeline and notify the athlete.`,
      type: 'warning',
      onConfirm: closeModal
    });
  };

  const handleAssignProtocol = () => {
     setModalConfig({
       isOpen: true,
       title: 'Initialize Deployment',
       message: 'Synchronizing movement library for deployment to this subject profile.',
       type: 'info',
       onConfirm: () => {
         closeModal();
         navigate('/workout-builder');
       }
     });
  };

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
        <div className="w-24 h-24 rounded-[32px] bg-error/10 flex items-center justify-center border border-error/20">
           <span className="material-symbols-outlined text-5xl text-error/30">person_off</span>
        </div>
        <div className="text-center">
           <h2 className="text-4xl font-black text-on-surface uppercase tracking-tighter leading-none mb-2">Subject Data Expired</h2>
           <p className="text-on-surface-variant font-medium italic opacity-60">"The requested biometric profile could not be retrieved from the central node."</p>
        </div>
        <button
          onClick={() => navigate("/clients")}
          className="px-10 py-4 bg-primary text-on-primary rounded-2xl font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-2xl shadow-primary/30 active:scale-95 flex items-center gap-3"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Return to Registry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-12 pb-20">
      <div className="flex items-center gap-6 mb-10">
        <button
          onClick={() => navigate("/clients")}
          className="w-14 h-14 bg-surface-container-high border border-secondary-container/10 rounded-2xl text-on-surface-variant hover:text-primary transition-all flex items-center justify-center shadow-xl active:scale-90"
        >
          <span className="material-symbols-outlined text-[28px]">arrow_back</span>
        </button>
        <div>
          <h2 className="text-[32px] md:text-[40px] font-black text-on-surface uppercase tracking-tighter leading-none">Subject Dossier</h2>
          <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mt-1">Authorized Profile Access Level II</p>
        </div>
      </div>

      {/* Header Section */}
      <section className="bg-surface-container-low border border-secondary-container/10 rounded-[40px] p-12 flex flex-col md:flex-row items-center md:items-center gap-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(208,188,255,0.05),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div className="relative shrink-0">
          <div className="w-48 h-48 rounded-[48px] border-8 border-primary/5 p-2 transition-all group-hover:border-primary/20 bg-surface-container-high shadow-inner">
            {client.avatar ? (
              <img
                alt=""
                className="w-full h-full object-cover rounded-[36px] shadow-2xl"
                src={client.avatar}
              />
            ) : (
              <div className="w-full h-full rounded-[36px] bg-surface-container flex items-center justify-center text-5xl text-on-surface-variant font-black">
                {client.fullName.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-12 h-12 rounded-2xl border-4 border-surface-container-low shadow-2xl flex items-center justify-center">
             <span className="material-symbols-outlined text-white text-[24px] font-black fill">verified</span>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left relative z-10">
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-6">
            <div>
               <h1 className="text-[48px] md:text-[64px] font-black text-on-surface tracking-tighter uppercase leading-none mb-2">
                {client.fullName}
               </h1>
               <div className="flex items-center gap-3">
                  <span className="bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Optimization Goal: {client.goal || "General Performance"}
                  </span>
                  <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">SUB_ID: {client.id}</span>
               </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-10 text-on-surface-variant">
            <div className="flex items-center gap-4 hover:text-primary transition-all cursor-pointer group/link">
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center border border-secondary-container/10 group-hover/link:border-primary transition-all">
                <span className="material-symbols-outlined text-[20px] opacity-40 group-hover/link:opacity-100">alternate_email</span>
              </div>
              <span className="text-sm font-bold">{client.email}</span>
            </div>
            <div className="flex items-center gap-4 hover:text-primary transition-all cursor-pointer group/link">
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center border border-secondary-container/10 group-hover/link:border-primary transition-all">
                <span className="material-symbols-outlined text-[20px] opacity-40 group-hover/link:opacity-100">call</span>
              </div>
              <span className="text-sm font-bold">+1 (555) 000-{client.id.slice(-4)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-4 md:mt-0 relative z-10">
          <button className="px-10 py-5 bg-surface-container-high border border-secondary-container/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-surface-container-highest transition-all shadow-xl active:scale-95">
            Synchronize Data
          </button>
          <button onClick={handleAssignProtocol} className="px-12 py-5 bg-primary text-on-primary rounded-2xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 active:scale-95">
            <span className="material-symbols-outlined text-[20px]">add_task</span>
            Deploy Protocol
          </button>
        </div>
      </section>

      {/* Grid Layout for Metrics & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* 1. Biometric Telemetry */}
        <div className="bg-surface-container-low border border-secondary-container/10 rounded-[40px] p-12 flex flex-col justify-between shadow-2xl hover-card-motion relative overflow-hidden group/stats">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(208,188,255,0.03),transparent)]"></div>
          <div className="flex items-center justify-between mb-12 relative z-10">
            <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-4">
              <span className="material-symbols-outlined text-primary">biometrics</span>
              Biometric Telemetry
            </h3>
            <span className="material-symbols-outlined text-on-surface-variant/20">monitoring</span>
          </div>
          <div className="space-y-6 relative z-10">
            {[
              { label: 'Current Mass', value: '62', unit: 'KG', color: 'on-surface' },
              { label: 'Verticality', value: '165', unit: 'CM', color: 'on-surface' },
              { label: 'Adipose Level', value: '22', unit: '%', color: 'primary' }
            ].map((stat, i) => (
              <div key={i} className="flex items-center justify-between p-6 bg-surface-container-high/40 rounded-3xl border border-secondary-container/5 group/row hover:bg-surface-container-high transition-all shadow-inner">
                <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">{stat.label}</span>
                <span className={`text-${stat.color} text-4xl font-black leading-none flex items-baseline`}>
                  {stat.value}<span className="text-xs font-black opacity-30 ml-2">{stat.unit}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="mt-12 flex items-center gap-3 relative z-10">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">Cloud Sync Established</span>
          </div>
        </div>

        {/* 2. Weight Variance Chart */}
        <div className="lg:col-span-2 bg-surface-container-low border border-secondary-container/10 rounded-[40px] p-12 relative overflow-hidden shadow-2xl flex flex-col hover-card-motion group/chart">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,rgba(208,188,255,0.03),transparent)]"></div>
          <div className="flex items-center justify-between mb-12 relative z-10">
            <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-4">
              <span className="material-symbols-outlined text-primary">show_chart</span>
              Biomass Progression
            </h3>
            <div className="flex gap-2 bg-surface-container-high/60 p-2 rounded-2xl border border-secondary-container/10 backdrop-blur-md shadow-xl">
              {['3M', '6M', '1Y'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    timeRange === range 
                      ? 'bg-primary text-on-primary shadow-xl shadow-primary/30' 
                      : 'text-on-surface-variant/40 hover:text-on-surface hover:bg-surface-container-highest/50'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full mt-6 relative z-10 px-6">
            <svg
              className="w-full h-full min-h-60"
              preserveAspectRatio="none"
              viewBox="0 0 800 200"
            >
              <defs>
                <linearGradient id="purpleGradClient" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#d0bcff" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#d0bcff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,180 Q100,160 200,170 T400,120 T600,80 T800,70 L800,200 L0,200 Z" fill="url(#purpleGradClient)" className="animate-pulse duration-[4s]" />
              <path d="M0,180 Q100,160 200,170 T400,120 T600,80 T800,70" fill="none" stroke="#d0bcff" strokeLinecap="round" strokeWidth="6" className="drop-shadow-[0_0_15px_rgba(208,188,255,0.5)]" />
              {[200, 400, 600, 800].map((cx, i) => (
                <circle key={i} cx={cx} cy={[170, 120, 80, 70][i]} fill="#d0bcff" r="8" className="cursor-pointer hover:r-12 transition-all stroke-surface-container-low stroke-[4px]" />
              ))}
            </svg>
            <div className="flex justify-between mt-10 px-6 text-[9px] font-black text-on-surface-variant/30 uppercase tracking-[0.3em]">
              <span>Cycle Start</span>
              <span>Mid Phase</span>
              <span>Tactical Peak</span>
              <span className="text-primary font-black opacity-100">Live Metric</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Workout Timeline */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Completed Workouts */}
        <div className="bg-surface-container-low border border-secondary-container/10 rounded-[40px] p-12 shadow-2xl hover-card-motion">
          <div className="flex items-center gap-5 mb-12">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shadow-inner">
              <span className="material-symbols-outlined text-[32px] fill">verified</span>
            </div>
            <div>
               <h3 className="text-xl font-black text-on-surface uppercase tracking-tight leading-none mb-1">Validated Sessions</h3>
               <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Historical Compliance Logs</span>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { title: "Hypertrophy Lower Body [T1]", date: "JUN 12", duration: "55M", intensity: "HIGH" },
              { title: "Metabolic Flux & Mobility", date: "JUN 10", duration: "40M", intensity: "MED" },
              { title: "Neural Strength Prime A", date: "JUN 08", duration: "65M", intensity: "PEAK" },
            ].map((workout, i) => (
              <div key={i} onClick={() => navigate('/session-review')} className="flex items-center justify-between p-6 rounded-3xl bg-surface-container-high/40 hover:bg-emerald-500/5 transition-all group cursor-pointer border border-transparent hover:border-emerald-500/20 shadow-inner">
                <div className="flex items-center gap-6">
                   <div className="w-2 h-10 bg-emerald-500/20 rounded-full group-hover:bg-emerald-500 transition-all"></div>
                   <div>
                    <h4 className="text-sm font-black text-on-surface uppercase tracking-tight group-hover:text-emerald-500 transition-colors">
                      {workout.title}
                    </h4>
                    <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mt-1">
                      {workout.date} • {workout.duration} • INTENSITY: {workout.intensity}
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant/20 group-hover:text-emerald-500 transition-all group-hover:translate-x-2">
                  arrow_forward_ios
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled Sessions */}
        <div className="bg-surface-container-low border border-secondary-container/10 rounded-[40px] p-12 shadow-2xl hover-card-motion">
          <div className="flex items-center gap-5 mb-12">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-inner">
              <span className="material-symbols-outlined text-[32px] fill">rocket_launch</span>
            </div>
            <div>
               <h3 className="text-xl font-black text-on-surface uppercase tracking-tight leading-none mb-1">Deployment Pipeline</h3>
               <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Upcoming Tactical Actions</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-8 rounded-[32px] bg-primary/5 border border-primary/20 shadow-2xl relative overflow-hidden group/active">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <span className="material-symbols-outlined text-4xl animate-spin-slow">settings</span>
              </div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-xl border border-primary/20">
                    <span className="material-symbols-outlined text-[36px] fill">event</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-on-surface uppercase tracking-tight">Functional Core 4.0</h4>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-2 flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                      Tomorrow • 10:00 AM (45M)
                    </p>
                  </div>
                </div>
                <button onClick={() => handleDecommissionSession("Functional Core 4.0")} className="w-14 h-14 rounded-2xl flex items-center justify-center text-on-surface-variant/40 hover:bg-error/10 hover:text-error transition-all shadow-md bg-surface-container-low border border-secondary-container/10 active:scale-90">
                  <span className="material-symbols-outlined text-[28px]">delete_sweep</span>
                </button>
              </div>
            </div>

            {[
              { title: "Metabolic Blast [H1]", date: "JUN 16", duration: "60M" },
              { title: "Recovery Flux Level I", date: "JUN 18", duration: "30M" },
            ].map((session, i) => (
              <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-surface-container-high/40 hover:bg-primary/5 transition-all group cursor-pointer border border-transparent hover:border-primary/20 shadow-inner">
                <div className="flex items-center gap-6">
                   <div className="w-2 h-10 bg-primary/20 rounded-full group-hover:bg-primary transition-all"></div>
                   <div>
                    <h4 className="text-sm font-black text-on-surface uppercase tracking-tight group-hover:text-primary transition-colors">
                      {session.title}
                    </h4>
                    <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mt-1">
                      {session.date} • {session.duration}
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant/20 group-hover:text-primary transition-all">
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
        confirmLabel={modalConfig.type === 'danger' || modalConfig.type === 'warning' ? 'Purge Data' : 'Initialize'}
      />
    </div>
  );
};

export default ClientDetails;
