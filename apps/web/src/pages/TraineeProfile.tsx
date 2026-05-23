import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationModal from '../components/NotificationModal';

const TraineeProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, updateUserLocal } = useAuth();
  
  const [traineeData, setTraineeData] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [prs, setPrs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [triggerReload, setTriggerReload] = useState(0);

  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    role: '',
    bio: '',
    weightUnit: 'KG' as 'KG' | 'LBS',
    lengthUnit: 'METRIC' as 'METRIC' | 'IMPERIAL',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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

  useEffect(() => {
    if (!id || !user) return;

    const fetchProgress = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('fitsync_token');
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [progressRes, plansRes, prsRes] = await Promise.all([
          fetch(`http://localhost:3000/trainers/clients/${id}/progress?trainerId=${user.id}`, { headers }),
          fetch(`http://localhost:3000/workouts/plans/client/${id}`, { headers }),
          fetch(`http://localhost:3000/biometrics/${id}/prs`, { headers })
        ]);

        if (progressRes.ok) {
          setTraineeData(await progressRes.json());
        }
        if (plansRes.ok) {
          setPlans(await plansRes.json());
        }
        if (prsRes.ok) {
          setPrs(await prsRes.json());
        }
      } catch (err) {
        console.error('Failed to load client telemetry:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [id, user, triggerReload]);

  const handleStartEditing = () => {
    if (!traineeData?.client) return;
    const client = traineeData.client;
    setErrorMsg('');
    setSuccessMsg('');
    setEditForm({
      fullName: client.fullName || '',
      email: client.email || '',
      username: client.username || '',
      password: '',
      role: client.role || 'USER',
      bio: client.bio || '',
      weightUnit: client.weightUnit || 'KG',
      lengthUnit: client.lengthUnit || 'METRIC',
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;
    setIsSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    const token = localStorage.getItem('fitsync_token');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const payload: any = {
      fullName: editForm.fullName,
      email: editForm.email,
      username: editForm.username,
      bio: editForm.bio,
      weightUnit: editForm.weightUnit,
      lengthUnit: editForm.lengthUnit,
    };

    if (editForm.password.trim()) {
      payload.password = editForm.password;
    }

    if (user.role === 'ADMIN') {
      payload.role = editForm.role;
    }

    try {
      const response = await fetch(`http://localhost:3000/users/${id}?callerId=${user.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile information');
      }

      setTraineeData((prev: any) => ({
        ...prev,
        client: {
          ...prev.client,
          ...data,
        },
      }));

      if (user.id === id) {
        updateUserLocal(data);
      }

      setSuccessMsg('Profile settings successfully updated.');
      setIsEditing(false);
      setTriggerReload(prev => prev + 1);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during updating.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDecommissionPlan = (planId: string, title: string) => {
    setModalConfig({
      isOpen: true,
      title: 'Delete Workout Plan?',
      message: `You are about to permanently delete the scheduled workout plan "${title}". The athlete will no longer see this.`,
      type: 'warning',
      onConfirm: async () => {
        closeModal();
        const token = localStorage.getItem('fitsync_token');
        try {
          const response = await fetch(`http://localhost:3000/workouts/plans/${planId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            setTriggerReload(prev => prev + 1);
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const handleAssignWorkout = () => {
     setModalConfig({
       isOpen: true,
       title: 'Assign New Workout',
       message: 'Loading workout builder to schedule a routine for this athlete.',
       type: 'info',
       onConfirm: () => {
         closeModal();
         navigate('/workout-builder', { state: { targetClientId: id } });
       }
     });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        <p className="text-on-surface-variant/60 font-bold uppercase tracking-widest text-xs">Loading Athlete Progress Dossier...</p>
      </div>
    );
  }

  if (!traineeData?.client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-24 h-24 rounded-[32px] bg-error/10 flex items-center justify-center border border-error/20">
           <span className="material-symbols-outlined text-5xl text-error/30">person_off</span>
        </div>
        <div className="text-center">
           <h2 className="text-3xl font-black text-on-surface uppercase tracking-tighter">Profile Offline</h2>
           <p className="text-on-surface-variant font-medium italic">"The biometrics dossier for this ID does not exist or has been archived."</p>
        </div>
      </div>
    );
  }

  const { client, biometricsTimeline, trainingSessions } = traineeData;
  const latestWeight = biometricsTimeline?.length ? biometricsTimeline[biometricsTimeline.length - 1].weight : 'N/A';
  
  const latestBodyFat = biometricsTimeline?.length ? [...biometricsTimeline].reverse().find((b: any) => b.bodyFat)?.bodyFat || '--' : '--';
  const latestLeanMass = biometricsTimeline?.length ? [...biometricsTimeline].reverse().find((b: any) => b.leanMass)?.leanMass || '--' : '--';

  const weightUnit = client.weightUnit || 'KG';
  const lengthModeLabel = client.lengthUnit === 'METRIC' ? 'CM' : 'IN';
  const canEdit = user?.id === id || user?.role === 'ADMIN';

  return (
    <div className="w-full space-y-[var(--spacing-section-gap)] pb-10">
      {/* Dynamic Profile Header */}
      <section className="glass-card flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden group !p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(208,188,255,0.05),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div className="relative shrink-0">
          <div className="w-32 h-32 rounded-2xl border-4 border-primary/5 p-1 transition-all group-hover:border-primary/20 bg-surface-container-high shadow-inner flex items-center justify-center text-4xl font-black text-primary bg-primary/10">
            {client.fullName?.charAt(0) || 'A'}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-7 h-7 rounded-lg border-4 border-surface-container-low shadow-2xl flex items-center justify-center">
             <span className="material-symbols-outlined text-white text-[14px] font-black">bolt</span>
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left relative z-10">
          <div className="flex flex-col md:flex-row md:items-end gap-3 mb-3">
            <div>
               <h1 className="text-3xl font-black text-on-surface tracking-tighter uppercase mb-1 leading-none">
                 {client.fullName}
               </h1>
               <div className="flex items-center gap-3">
                  <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">
                    Active Athlete
                  </span>
                  <span className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest leading-none">ID: {client.id.toUpperCase().slice(0, 8)}</span>
               </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-on-surface-variant">
            <div className="flex items-center gap-2 hover:text-primary transition-all cursor-pointer group/link">
              <span className="material-symbols-outlined text-[16px] opacity-40 group-hover/link:opacity-100">alternate_email</span>
              <span className="text-[10px] font-bold">{client.email}</span>
            </div>
            {client.bio && (
              <p className="text-xs text-on-surface-variant/80 mt-1 max-w-xl italic">"{client.bio}"</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4 md:mt-0 relative z-10">
          {canEdit && !isEditing && (
            <button onClick={handleStartEditing} className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-black text-[8px] uppercase tracking-widest hover:brightness-110 transition-all shadow-xl active:scale-95 cursor-pointer flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[12px]">edit</span>
              Edit Profile
            </button>
          )}
          <button onClick={() => setTriggerReload(prev => prev + 1)} className="px-6 py-2.5 bg-surface-container-high border border-secondary-container/10 rounded-xl font-black text-[8px] uppercase tracking-widest hover:bg-surface-container-highest transition-all shadow-xl active:scale-95 cursor-pointer">
            Synchronize
          </button>
          <button onClick={handleAssignWorkout} className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-black text-[8px] uppercase tracking-widest hover:brightness-110 transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-2 active:scale-95 cursor-pointer">
            <span className="material-symbols-outlined text-[16px]">add_task</span>
            Publish Workout
          </button>
        </div>
      </section>

      {isEditing ? (
        <form onSubmit={handleSaveProfile} className="glass-card p-8 space-y-6">
          <h3 className="text-lg font-bold text-on-surface uppercase tracking-tight border-b border-outline-variant/10 pb-3">Edit Athlete Settings</h3>
          
          {errorMsg && (
            <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-xs text-error flex items-center gap-2">
              <span className="material-symbols-outlined">error</span> {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-500 flex items-center gap-2">
              <span className="material-symbols-outlined">check_circle</span> {successMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                required
                value={editForm.fullName}
                onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface outline-none focus:border-primary/60 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Username</label>
              <input
                type="text"
                required
                value={editForm.username}
                onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface outline-none focus:border-primary/60 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                required
                value={editForm.email}
                onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface outline-none focus:border-primary/60 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Password (Optional)</label>
              <input
                type="password"
                placeholder="Leave blank to keep same"
                value={editForm.password}
                onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface outline-none focus:border-primary/60 text-sm"
              />
            </div>
          </div>

          {user?.role === 'ADMIN' && (
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Role override</label>
              <select
                value={editForm.role}
                onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface outline-none focus:border-primary/60 text-sm cursor-pointer"
              >
                <option value="USER">USER</option>
                <option value="TRAINER">TRAINER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Bio / Vision</label>
            <textarea
              rows={3}
              value={editForm.bio}
              onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface outline-none focus:border-primary/60 text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Weight Unit</label>
              <select
                value={editForm.weightUnit}
                onChange={e => setEditForm({ ...editForm, weightUnit: e.target.value as 'KG' | 'LBS' })}
                className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface outline-none focus:border-primary/60 text-sm cursor-pointer animate-none"
              >
                <option value="KG">KG</option>
                <option value="LBS">LBS</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Length Mode / Unit</label>
              <select
                value={editForm.lengthUnit}
                onChange={e => setEditForm({ ...editForm, lengthUnit: e.target.value as 'METRIC' | 'IMPERIAL' })}
                className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface outline-none focus:border-primary/60 text-sm cursor-pointer"
              >
                <option value="METRIC">Metric (CM)</option>
                <option value="IMPERIAL">Imperial (IN)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/10">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 border border-outline-variant/30 text-xs font-bold uppercase rounded-xl hover:bg-surface-container-highest transition-all text-on-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-primary text-on-primary font-bold uppercase text-xs rounded-xl hover:brightness-110 transition-all flex items-center gap-2"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--spacing-section-gap)]">
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
                  { label: 'Mass', value: latestWeight, unit: weightUnit, color: 'on-surface' },
                  { label: 'Body Fat %', value: latestBodyFat, unit: '%', color: 'tertiary' },
                  { label: 'Lean Mass', value: latestLeanMass, unit: weightUnit, color: 'primary' },
                  { label: 'Biometrics Logged', value: biometricsTimeline?.length || 0, unit: 'logs', color: 'primary' }
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
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[7px] font-black uppercase tracking-widest">Active Connection</span>
              </div>
            </div>

            {/* 2. Mass Evolution Chart */}
            <div className="lg:col-span-2 glass-card shadow-2xl group/chart !p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,rgba(208,188,255,0.03),transparent)]"></div>
              <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[16px]">show_chart</span>
                  Progression Chart
                </h3>
              </div>
              
              <div className="h-40 w-full relative z-10 px-2">
                {biometricsTimeline && biometricsTimeline.length > 1 ? (
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 200">
                    <defs>
                      <linearGradient id="traineePurple" x1="0%" x2="0%" y1="0%" y2="100%">
                        <stop offset="0%" stopColor="#d0bcff" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#d0bcff" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,180 Q100,160 200,170 T400,120 T600,80 T800,70 L800,200 L0,200 Z" fill="url(#traineePurple)" />
                    <path d="M0,180 Q100,160 200,170 T400,120 T600,80 T800,70" fill="none" stroke="#d0bcff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    {biometricsTimeline.slice(-5).map((log: any, idx: number) => {
                      const cx = 100 + idx * 150;
                      return (
                        <circle key={log.id} cx={cx} cy={120} fill="#d0bcff" r="6" className="stroke-surface-container-low stroke-[3px]" />
                      );
                    })}
                  </svg>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant/40 italic text-[11px]">
                    Not enough biometric logs to build progression timeline.
                  </div>
                )}
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
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-section-gap)]">
            {/* Performance Records */}
            <div className="bg-surface-container-low rounded-[32px] border border-secondary-container/10 p-8 hover-card-motion shadow-2xl lg:col-span-1">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-10 h-10 rounded-xl bg-[#ffb869]/10 text-[#ffb869] flex items-center justify-center border border-[#ffb869]/20">
                   <span className="material-symbols-outlined text-[24px] fill">emoji_events</span>
                </div>
                <div>
                   <h3 className="text-lg font-black text-on-surface uppercase tracking-tight leading-none mb-1">Performance Records</h3>
                   <span className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest">Verified Maxes</span>
                </div>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2 no-scrollbar">
                {prs.length === 0 ? (
                  <p className="text-[10px] text-on-surface-variant/40 italic text-center py-8">No PRs found.</p>
                ) : prs.map((pr: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-high/40 hover:bg-[#ffb869]/5 transition-all group border border-transparent shadow-inner">
                    <div className="flex items-center gap-4">
                       <div className="w-1.5 h-8 bg-[#ffb869]/10 rounded-full group-hover:bg-[#ffb869] transition-all"></div>
                       <div>
                        <h4 className="text-xs font-black text-[#ffb869] uppercase tracking-tight transition-colors">
                          {pr.exercise.name}
                        </h4>
                        <p className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest mt-0.5">
                          {new Date(pr.achievedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-on-surface">
                       {pr.weight} <span className="text-[8px] font-black opacity-30">{weightUnit}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Completed Protocols */}
            <div className="bg-surface-container-low rounded-[32px] border border-secondary-container/10 p-8 hover-card-motion shadow-2xl lg:col-span-1">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                   <span className="material-symbols-outlined text-[24px] fill">verified</span>
                </div>
                <div>
                   <h3 className="text-lg font-black text-on-surface uppercase tracking-tight leading-none mb-1">Completed History</h3>
                   <span className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest">Archived Compliance</span>
                </div>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2 no-scrollbar">
                {trainingSessions.length === 0 ? (
                  <p className="text-[10px] text-on-surface-variant/40 italic text-center py-8">No completed routines archived.</p>
                ) : trainingSessions.map((workout: any, idx: number) => (
                  <div key={idx} onClick={() => navigate('/session-review')} className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-high/40 hover:bg-emerald-500/5 transition-all group cursor-pointer border border-transparent hover:border-emerald-500/20 shadow-inner active:scale-[0.98]">
                    <div className="flex items-center gap-4">
                       <div className="w-1.5 h-8 bg-emerald-500/10 rounded-full group-hover:bg-emerald-500 transition-all"></div>
                       <div>
                        <h4 className="text-xs font-black text-on-surface uppercase tracking-tight group-hover:text-emerald-500 transition-colors">
                          {workout.title}
                        </h4>
                        <p className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest mt-0.5">
                          Completed {new Date(workout.completedAt).toLocaleDateString()} • {workout.totalVolume || 0} Vol
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
                   <h3 className="text-lg font-black text-on-surface uppercase tracking-tight leading-none mb-1">Scheduled Pipeline</h3>
                   <span className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest">Upcoming Schedules</span>
                </div>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2 no-scrollbar">
                {plans.length === 0 ? (
                  <p className="text-[10px] text-on-surface-variant/40 italic text-center py-8">No workouts currently scheduled.</p>
                ) : plans.map((session) => (
                  <div key={session.id} className="p-6 rounded-2xl bg-primary/5 border border-primary/20 shadow-2xl relative overflow-hidden group/active">
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-xl border border-primary/20">
                          <span className="material-symbols-outlined text-[24px] fill">event</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-on-surface uppercase tracking-tight">{session.title}</h4>
                          <p className="text-[8px] font-black text-primary uppercase tracking-widest mt-1 flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-primary animate-pulse"></span>
                            {new Date(session.scheduledDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button onClick={() => handleDecommissionPlan(session.id, session.title)} className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant/30 hover:bg-error/10 hover:text-error transition-all shadow-md bg-surface-container-low active:scale-90 cursor-pointer">
                        <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <NotificationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        onCancel={closeModal}
        confirmLabel={modalConfig.type === 'danger' || modalConfig.type === 'warning' ? 'Delete' : 'Confirm'}
      />
    </div>
  );
};

export default TraineeProfile;
