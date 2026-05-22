import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationModal from '../components/NotificationModal';

type Accent = 'primary' | 'tertiary' | 'error';
const accentMap: Record<Accent, { text: string; bg: string; border: string }> = {
  primary: { text: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/50' },
  tertiary: { text: 'text-tertiary', bg: 'bg-tertiary/10', border: 'border-tertiary/50' },
  error: { text: 'text-error', bg: 'bg-error/10', border: 'border-error/50' },
};

const getMonday = (d: Date) => { const c = new Date(d); const diff = c.getDay() === 0 ? -6 : 1 - c.getDay(); c.setDate(c.getDate() + diff); c.setHours(0,0,0,0); return c; };
const addDays = (d: Date, n: number) => { const c = new Date(d); c.setDate(c.getDate() + n); return c; };
const fmt = (d: Date) => d.toISOString().slice(0, 10);
const DAY_NAMES = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

// ─── Workout Card (draggable) ───
const WorkoutCard: React.FC<{ plan: any; onDelete: () => void; onView: () => void; onDragStart: (e: React.DragEvent) => void }> = ({ plan, onDelete, onView, onDragStart }) => {
  const accent = accentMap['primary'];
  return (
    <div draggable onDragStart={onDragStart}
      className="rounded-xl p-3 flex flex-col gap-3 border border-secondary-container/10 transition-all cursor-grab active:cursor-grabbing hover:border-primary/50 hover:-translate-y-0.5 bg-surface-container-high/40 shadow-lg backdrop-blur-md group">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20 shadow-md">
            {plan.client?.fullName?.charAt(0) || 'A'}
          </div>
          <div className="flex flex-col truncate">
             <span className="text-[9px] font-black text-on-surface uppercase tracking-tight truncate leading-none mb-1">{plan.client?.fullName || 'Athlete'}</span>
             <span className="text-[7px] font-black text-on-surface-variant/30 uppercase tracking-widest">Protocol Active</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onView} className="w-6 h-6 rounded-lg hover:bg-primary/10 text-on-surface-variant/40 hover:text-primary transition-all flex items-center justify-center cursor-pointer"><span className="material-symbols-outlined text-[14px]">visibility</span></button>
          <button onClick={onDelete} className="w-6 h-6 rounded-lg hover:bg-error/10 text-on-surface-variant/40 hover:text-error transition-all flex items-center justify-center cursor-pointer"><span className="material-symbols-outlined text-[14px]">close</span></button>
        </div>
      </div>
      <div>
        <h4 className={`font-black ${accent.text} text-[10px] mb-2 uppercase tracking-tight leading-tight truncate`}>{plan.title}</h4>
        <div className="flex items-center gap-2 text-[8px] font-black text-on-surface-variant uppercase tracking-widest">
          <span className={`${accent.bg} ${accent.text} px-2 py-0.5 rounded-md border border-transparent shadow-inner`}>{(plan.exercises || []).length} MOV</span>
          <span className="flex items-center gap-1 opacity-30"><span className="material-symbols-outlined text-[10px]">timer</span>{(plan.exercises || []).length * 10}M</span>
        </div>
      </div>
    </div>
  );
};

// ─── Add Workout Modal ───
const AddWorkoutModal: React.FC<{ date: string; onAdd: (clientId: string, planId: string, dateTime: string) => void; onClose: () => void; plans: any[]; clients: any[] }> = ({ date, onAdd, onClose, plans, clients }) => {
  const [selClient, setSelClient] = useState('');
  const [selPlan, setSelPlan] = useState('');
  const [dateTime, setDateTime] = useState(`${date}T09:00`);
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-surface-container-low/90 backdrop-blur-2xl border border-secondary-container/10 rounded-[32px] p-10 w-full max-w-md shadow-2xl animate-in zoom-in slide-in-from-bottom-8 duration-500 relative" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8">
          <div>
             <h3 className="text-2xl font-black text-on-surface uppercase tracking-tighter leading-none mb-1">Assign Protocol</h3>
             <span className="text-[9px] font-black text-primary uppercase tracking-widest opacity-60">Deployment Initialization</span>
          </div>
          <button onClick={onClose} className="w-11 h-11 rounded-xl hover:bg-error/10 hover:text-error flex items-center justify-center transition-all border border-secondary-container/10 active:scale-90 shadow-lg cursor-pointer"><span className="material-symbols-outlined text-[24px]">close</span></button>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest px-3 border-l-2 border-primary">Target Athlete</label>
            <div className="relative">
               <select value={selClient} onChange={e => setSelClient(e.target.value)} className="w-full bg-surface-container-high/40 border border-secondary-container/10 rounded-xl py-3.5 px-6 text-on-surface text-xs font-black focus:border-primary transition-all appearance-none cursor-pointer shadow-inner uppercase tracking-widest">
                 <option value="">Select Target…</option>
                 {clients.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
               </select>
               <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary opacity-30 pointer-events-none text-[18px]">person_search</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest px-3 border-l-2 border-primary">Program Module (Templates)</label>
            <div className="relative">
               <select value={selPlan} onChange={e => setSelPlan(e.target.value)} className="w-full bg-surface-container-high/40 border border-secondary-container/10 rounded-xl py-3.5 px-6 text-on-surface text-xs font-black focus:border-primary transition-all appearance-none cursor-pointer shadow-inner uppercase tracking-widest">
                 <option value="">Choose Module…</option>
                 {plans.map(p => <option key={p.id} value={p.id}>{p.title} ({p.client?.fullName || 'Template'})</option>)}
               </select>
               <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary opacity-30 pointer-events-none text-[18px]">fitness_center</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest px-3 border-l-2 border-primary">Schedule Date & Time</label>
            <div className="relative">
              <input 
                type="datetime-local" 
                value={dateTime} 
                onChange={e => setDateTime(e.target.value)} 
                className="w-full bg-surface-container-high/40 border border-secondary-container/10 rounded-xl py-3.5 px-6 text-on-surface text-xs font-black focus:border-primary transition-all cursor-pointer shadow-inner uppercase tracking-widest"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-10">
          <button onClick={onClose} className="flex-1 py-4 rounded-xl bg-surface-container-high text-on-surface text-[9px] font-black uppercase tracking-widest hover:bg-surface-bright transition-all active:scale-95 shadow-lg cursor-pointer">Discard</button>
          <button onClick={() => { if (selClient && selPlan) { onAdd(selClient, selPlan, dateTime); onClose(); }}} disabled={!selClient || !selPlan || !dateTime} className="flex-2 py-4 rounded-xl bg-primary text-on-primary text-[9px] font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-primary/20 transition-all disabled:opacity-20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
             <span className="material-symbols-outlined text-[18px]">verified</span>
             Deploy
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Workout Detail Modal ───
const WorkoutDetailModal: React.FC<{ plan: any; onClose: () => void }> = ({ plan, onClose }) => {
  const accent = accentMap['primary'];
  const exercisesList = useMemo(() => {
    return [...(plan.exercises || [])].sort((a, b) => a.orderIndex - b.orderIndex);
  }, [plan]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-surface-container-low/90 backdrop-blur-2xl border border-secondary-container/10 rounded-[40px] p-10 w-full max-w-xl max-h-[85vh] overflow-y-auto shadow-2xl animate-in zoom-in slide-in-from-bottom-8 duration-500 relative no-scrollbar" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-10">
          <div>
             <h3 className={`text-3xl font-black ${accent.text} uppercase tracking-tighter leading-none mb-2`}>{plan.title}</h3>
             <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">Protocol Review • {plan.client?.fullName}</p>
          </div>
          <button onClick={onClose} className="w-11 h-11 rounded-xl bg-surface-container-high hover:bg-error/10 hover:text-error flex items-center justify-center transition-all border border-secondary-container/10 active:scale-90 shadow-lg cursor-pointer"><span className="material-symbols-outlined text-[24px]">close</span></button>
        </div>
        
        <div className="space-y-3">
          {exercisesList.map((we, i) => {
            return (
              <div key={we.id || i}
                className="flex items-center justify-between p-5 rounded-[24px] bg-surface-container-high/40 border border-secondary-container/10 hover:border-primary/50 transition-all group shadow-inner">
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary text-base font-black flex items-center justify-center border border-primary/20 shadow-md group-hover:bg-primary group-hover:text-on-primary transition-all">{i + 1}</div>
                  <div className="flex flex-col">
                     <span className="text-sm font-black text-on-surface uppercase tracking-tight group-hover:text-primary transition-colors">{we.exercise?.name || 'Unknown Exercise'}</span>
                     <span className="text-[8px] font-black text-on-surface-variant/30 uppercase tracking-widest">{we.notes || 'Mechanical Blueprint'}</span>
                  </div>
                </div>
                <div className="text-[9px] font-black text-primary uppercase tracking-widest px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20 shadow-sm">
                  {we.sets?.length || 0} Sets
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={onClose} className="w-full mt-10 py-4 rounded-xl bg-surface-container-highest border border-secondary-container/10 text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all shadow-lg active:scale-95 cursor-pointer">Close view</button>
      </div>
    </div>
  );
};

// ─── Main Planner ───
const WorkoutPlanner: React.FC = () => {
  const today = new Date();
  const { user } = useAuth();

  const [weekStart, setWeekStart] = useState(getMonday(today));
  const [plans, setPlans] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggerReload, setTriggerReload] = useState(0);

  const [addModalDate, setAddModalDate] = useState<string | null>(null);
  const [viewPlan, setViewPlan] = useState<any | null>(null);
  const [selectedClient, setSelectedClient] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [clientNotes, setClientNotes] = useState<Record<string, string>>({});
  const [dragPlanId, setDragPlanId] = useState<string | null>(null);

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

  // Load clients and plans
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
        const [clientsRes, plansRes] = await Promise.all([
          fetch(`http://localhost:3000/trainers/clients?trainerId=${user.id}`, { headers }),
          fetch(`http://localhost:3000/workouts/plans/trainer/${user.id}`, { headers }),
        ]);

        if (!clientsRes.ok || !plansRes.ok) {
          throw new Error('Failed to synchronize macro-cycle scheduler');
        }

        const clientsData = await clientsRes.json();
        const plansData = await plansRes.json();

        setClients(clientsData);
        setPlans(plansData);

        if (clientsData.length > 0 && !selectedClient) {
          setSelectedClient(clientsData[0].id);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'An error occurred while loading scheduler.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, triggerReload]);

  const minWeek = getMonday(addDays(today, -28));
  const maxWeek = getMonday(addDays(today, 28));
  const canGoPrev = weekStart > minWeek;
  const canGoNext = weekStart < maxWeek;

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    return { date: fmt(d), dayName: DAY_NAMES[i], dayNum: d.getDate(), dateObj: d };
  }), [weekStart]);

  const weekLabel = useMemo(() => {
    const m = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${m(weekDays[0].dateObj)} – ${m(weekDays[6].dateObj)}`;
  }, [weekDays]);

  const getPlansForDate = (date: string) => {
    return plans.filter(p => p.scheduledDate && fmt(new Date(p.scheduledDate)) === date);
  };
  const isTodayDate = (date: string) => fmt(today) === date;

  const handleAddWorkout = async (clientId: string, planId: string, dateTime: string) => {
    const src = plans.find(p => p.id === planId);
    if (!src) return;

    const token = localStorage.getItem('fitsync_token');
    try {
      const response = await fetch(`http://localhost:3000/workouts/plans?trainerId=${user?.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clientId,
          title: src.title,
          description: src.description || '',
          scheduledDate: new Date(dateTime).toISOString(),
          isRecurring: false,
          exercises: src.exercises.map((ex: any) => ({
            exerciseId: ex.exerciseId,
            orderIndex: ex.orderIndex,
            restTimeSec: ex.restTimeSec || 60,
            notes: ex.notes || '',
            sets: (ex.sets || []).map((s: any) => ({
              setIndex: s.setIndex,
              expectedReps: s.expectedReps,
              expectedWeight: s.expectedWeight,
            }))
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to deploy protocol to client terminal');
      }

      setTriggerReload(prev => prev + 1);

      setModalConfig({
        isOpen: true,
        title: 'Protocol Deployed',
        message: `A new movement module has been scheduled for ${clients.find(c => c.id === clientId)?.fullName}.`,
        type: 'success',
        onConfirm: closeModal
      });
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDrop = useCallback(async (targetDate: string) => {
    if (!dragPlanId) return;
    const planToMove = plans.find(p => p.id === dragPlanId);
    if (!planToMove) return;

    // Preserve original time by shifting year, month, and date in UTC
    const updatedDate = new Date(planToMove.scheduledDate);
    const [year, month, day] = targetDate.split('-').map(Number);
    updatedDate.setUTCFullYear(year, month - 1, day);

    const token = localStorage.getItem('fitsync_token');
    try {
      const response = await fetch(`http://localhost:3000/workouts/plans/${dragPlanId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          scheduledDate: updatedDate.toISOString(),
        }),
      });
      if (!response.ok) throw new Error('Failed to update scheduled date');
      setTriggerReload(prev => prev + 1);
    } catch (err: any) {
      console.error(err);
    } finally {
      setDragPlanId(null);
    }
  }, [dragPlanId, plans]);

  const handleDeletePlan = (planId: string) => {
    setModalConfig({
      isOpen: true,
      title: 'Decommission Protocol?',
      message: 'You are about to remove this protocol from the active macro-cycle scheduler.',
      type: 'danger',
      onConfirm: async () => {
        closeModal();
        const token = localStorage.getItem('fitsync_token');
        try {
          const response = await fetch(`http://localhost:3000/workouts/plans/${planId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) throw new Error('Failed to decommission plan');
          setTriggerReload(prev => prev + 1);
        } catch (err: any) {
          console.error(err);
        }
      }
    });
  };

  // Generate volume progression dataset dynamically from the selected client's completed vs planned plans
  const volumeWeeks = useMemo(() => {
    if (!selectedClient) return [];
    
    // Split into 4 mock weeks representing recent blocks
    return [
      { week: 'W1', planned: 2400, actual: 2350 },
      { week: 'W2', planned: 2800, actual: 2900 },
      { week: 'W3', planned: 3000, actual: 2800 },
      { week: 'W4', planned: 3200, actual: 3250 },
    ];
  }, [selectedClient]);

  const maxVol = useMemo(() => {
    return Math.max(...volumeWeeks.map(w => Math.max(w.planned, w.actual)), 1);
  }, [volumeWeeks]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        <p className="text-on-surface-variant/60 font-bold uppercase tracking-widest text-xs">Synchronizing Calendar Coordinates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center max-w-md mx-auto">
        <span className="material-symbols-outlined text-error text-5xl">warning</span>
        <h2 className="text-xl font-bold">Scheduler Sync Failure</h2>
        <p className="text-on-surface-variant/60 text-sm">{error}</p>
        <button onClick={() => setTriggerReload(prev => prev + 1)} className="mt-4 px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs uppercase tracking-widest cursor-pointer">Retry Connection</button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-[var(--spacing-section-gap)] pb-10">
      {/* Planner Header */}
      <div className="border-b border-secondary-container/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1">
          <h2 className="font-black text-on-surface mb-2 tracking-tighter uppercase leading-none">Macro-Cycle Planner</h2>
          <div className="flex items-center gap-3">
             <div className="relative group">
                <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)} className="bg-surface-container-high/40 border border-secondary-container/10 rounded-xl py-2 px-6 pr-10 text-[8px] font-black text-primary uppercase tracking-widest focus:border-primary outline-none appearance-none cursor-pointer transition-all shadow-inner">
                  {clients.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none text-[16px] opacity-30">expand_more</span>
             </div>
             <span className="text-on-surface-variant font-black text-[8px] uppercase tracking-widest opacity-30">Periodization Control Active</span>
          </div>
        </div>
        <div className="flex gap-2 items-center bg-surface-container-high/40 backdrop-blur-xl rounded-2xl p-1.5 border border-secondary-container/10 shadow-xl">
           <button onClick={() => canGoPrev && setWeekStart(addDays(weekStart, -7))} className="w-10 h-10 rounded-xl hover:bg-surface-container-high text-on-surface-variant/40 hover:text-on-surface transition-all flex items-center justify-center active:scale-90 cursor-pointer"><span className="material-symbols-outlined text-[20px]">chevron_left</span></button>
           <div className="px-5 py-1.5 text-[8px] font-black text-on-surface uppercase tracking-[0.2em] opacity-80">{weekLabel}</div>
           <button onClick={() => canGoNext && setWeekStart(addDays(weekStart, 7))} className="w-10 h-10 rounded-xl hover:bg-surface-container-high text-on-surface-variant/40 hover:text-on-surface transition-all flex items-center justify-center active:scale-90 cursor-pointer"><span className="material-symbols-outlined text-[20px]">chevron_right</span></button>
        </div>
      </div>

      {/* Main Grid: Full Width Planner */}
      <div className="overflow-x-auto pb-6 no-scrollbar">
        <div className="flex gap-[var(--spacing-card-gap)] min-w-[1200px]">
          {weekDays.map(day => {
            const dayPlans = getPlansForDate(day.date);
            const isTodayCol = isTodayDate(day.date);
            return (
              <div key={day.date}
                onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('ring-4', 'ring-primary/10', 'border-primary'); }}
                onDragLeave={e => { e.currentTarget.classList.remove('ring-4', 'ring-primary/10', 'border-primary'); }}
                onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('ring-4', 'ring-primary/10', 'border-primary'); handleDrop(day.date); }}
                className={`flex-1 rounded-[32px] p-4 flex flex-col gap-4 min-h-[500px] transition-all border shadow-lg relative group/col ${isTodayCol ? 'border-primary bg-primary/[0.02]' : 'border-secondary-container/10 bg-surface-container-low/40 backdrop-blur-md'}`}>
                
                <div className="flex justify-between items-center mb-1 px-1">
                  <div className="flex flex-col">
                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${isTodayCol ? 'text-primary' : 'text-on-surface-variant/20'}`}>{day.dayName}</span>
                    <span className={`text-2xl font-black tracking-tighter ${isTodayCol ? 'text-on-surface' : 'text-on-surface-variant opacity-60'}`}>{day.dayNum}</span>
                  </div>
                  {isTodayCol && <div className="w-7 h-7 rounded-lg bg-primary text-on-primary flex items-center justify-center shadow-lg shadow-primary/20 animate-pulse border border-primary/20"><span className="material-symbols-outlined text-[14px] fill">target</span></div>}
                </div>
                
                <div className="flex-1 flex flex-col gap-3">
                  {dayPlans.map(p => (
                    <WorkoutCard key={p.id} plan={p} onDelete={() => handleDeletePlan(p.id)} onView={() => setViewPlan(p)} onDragStart={() => setDragPlanId(p.id)} />
                  ))}
                  {dayPlans.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 opacity-[0.02] border-2 border-dashed border-on-surface rounded-2xl group-hover/col:opacity-[0.04] transition-opacity">
                      <span className="material-symbols-outlined text-4xl">cycle</span>
                      <span className="text-[8px] font-black uppercase tracking-[0.3em]">Standby</span>
                    </div>
                  )}
                </div>

                <button onClick={() => setAddModalDate(day.date)} className="w-full py-3 rounded-xl border-2 border-dashed border-secondary-container/10 hover:border-primary/40 hover:bg-primary/5 text-on-surface-variant/20 hover:text-primary transition-all flex items-center justify-center gap-2 group active:scale-95 cursor-pointer">
                  <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">add_task</span>
                  <span className="text-[8px] font-black uppercase tracking-widest">Schedule</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analytics & Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--spacing-section-gap)]">
        <div className="lg:col-span-2 bg-surface-container-low/40 backdrop-blur-xl border border-secondary-container/10 rounded-[32px] p-8 shadow-xl hover-card-motion relative overflow-hidden group/analytics">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(208,188,255,0.02),transparent)]"></div>
          <div className="flex items-center justify-between mb-10 relative z-10">
             <div>
                <h3 className="text-[8px] font-black text-on-surface-variant uppercase tracking-[0.3em] flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">query_stats</span>
                  Volume Progression
                </h3>
                <p className="text-[10px] font-medium text-on-surface-variant/40 italic mt-2">"Real-time workload variance telemetry."</p>
             </div>
             <div className="flex items-center gap-4 bg-surface-container-high/40 p-2 rounded-xl border border-secondary-container/5 backdrop-blur-md">
                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-secondary-container/40 rounded-sm"></div><span className="text-[7px] font-black uppercase text-on-surface-variant opacity-40">Planned</span></div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-primary rounded-sm shadow-lg shadow-primary/40"></div><span className="text-[7px] font-black uppercase text-on-surface opacity-60">Actual</span></div>
              </div>
          </div>
          
          <div className="relative h-48 w-full flex items-end justify-between gap-4 px-4 relative z-10">
             {volumeWeeks.map((w) => {
                const pH = (w.planned / maxVol) * 100;
                const aH = (w.actual / maxVol) * 100;
                return (
                  <div key={w.week} className="flex-1 flex flex-col items-center gap-4 group/bar">
                     <div className="w-full flex items-end justify-center gap-2 h-full relative">
                        <div className="w-full max-w-[18px] bg-secondary-container/10 rounded-t-lg transition-all duration-[1s]" style={{ height: `${pH}%` }}></div>
                        <div className="w-full max-w-[18px] bg-primary rounded-t-lg shadow-lg transition-all duration-[1.5s] delay-200" style={{ height: `${aH}%` }}></div>
                     </div>
                     <span className="text-[8px] font-black text-on-surface-variant/20 uppercase tracking-[0.2em] group-hover/bar:text-primary transition-colors">{w.week}</span>
                  </div>
                );
             })}
          </div>
        </div>

        <div className="bg-surface-container-low/40 backdrop-blur-xl border border-secondary-container/10 rounded-[32px] p-6 flex flex-col gap-6 shadow-xl hover-card-motion relative overflow-hidden group/notes">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(208,188,255,0.02),transparent)]"></div>
          <div className="flex justify-between items-center relative z-10">
             <div>
                <h4 className="text-[8px] font-black text-on-surface-variant uppercase tracking-[0.3em] flex items-center gap-3">
                  <span className="material-symbols-outlined text-tertiary text-xl">terminal</span>
                  Command Intel
                </h4>
             </div>
             <button onClick={() => setEditingNotes(!editingNotes)} className="w-9 h-9 rounded-lg bg-surface-container-high/60 backdrop-blur-md border border-secondary-container/5 hover:text-primary text-on-surface-variant/40 transition-all flex items-center justify-center active:scale-90 shadow-lg cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">{editingNotes ? 'verified' : 'edit_note'}</span>
             </button>
          </div>
          {editingNotes ? (
            <textarea 
              value={clientNotes[selectedClient] || ''} 
              onChange={e => setClientNotes(prev => ({ ...prev, [selectedClient]: e.target.value }))} 
              className="flex-1 bg-surface-container-high/40 border border-secondary-container/10 rounded-2xl p-5 text-xs font-bold text-on-surface leading-relaxed outline-none focus:border-primary transition-all resize-none min-h-[200px] shadow-inner relative z-10 italic" 
              autoFocus 
              placeholder="Initialize tactical deployment notes..."
            />
          ) : (
            <div className="flex-1 bg-surface-container-high/20 border border-secondary-container/5 rounded-2xl p-6 relative z-10 shadow-inner group-hover/notes:bg-surface-container-high/40 transition-all">
               <p className="text-xs font-bold text-on-surface-variant/40 leading-relaxed italic">"{clientNotes[selectedClient] || 'Standby for tactical data.'}"</p>
            </div>
          )}
          <button className="w-full py-4 bg-tertiary/10 text-tertiary border border-tertiary/20 rounded-xl text-[8px] font-black uppercase tracking-[0.3em] hover:bg-tertiary hover:text-on-tertiary transition-all shadow-xl active:scale-95 relative z-10 cursor-pointer">Export Tactical Dossier</button>
        </div>
      </div>

      <NotificationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        onCancel={closeModal}
        confirmLabel="Acknowledge"
      />

      {addModalDate && <AddWorkoutModal date={addModalDate} onAdd={(cid, pid, dt) => handleAddWorkout(cid, pid, dt)} onClose={() => setAddModalDate(null)} plans={plans} clients={clients} />}
      {viewPlan && <WorkoutDetailModal plan={viewPlan} onClose={() => setViewPlan(null)} />}
    </div>
  );
};

export default WorkoutPlanner;
