import React, { useState, useMemo, useCallback, useRef } from 'react';
import usersData from '../data/users.json';
import workoutPlansData from '../data/workoutPlans.json';
import exercisesData from '../data/exercises.json';
import mockData from '../data/mockData.json';
import NotificationModal from '../components/NotificationModal';

type Accent = 'primary' | 'tertiary' | 'error';
const clients = usersData.filter((u) => u.role === 'USER');
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
const WorkoutCard: React.FC<{ plan: typeof workoutPlansData[0]; onDelete: () => void; onView: () => void; onDragStart: (e: React.DragEvent) => void }> = ({ plan, onDelete, onView, onDragStart }) => {
  const client = clients.find(c => c.id === plan.clientId);
  if (!client) return null;
  const accent = accentMap[(plan.accentColor || 'primary') as Accent];
  return (
    <div draggable onDragStart={onDragStart}
      className="rounded-xl p-3 flex flex-col gap-3 border border-secondary-container/10 transition-all cursor-grab active:cursor-grabbing hover:border-primary/50 hover:-translate-y-0.5 bg-surface-container-high/40 shadow-lg backdrop-blur-md group">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2.5 min-w-0">
          <img alt="" className="w-8 h-8 rounded-lg object-cover border border-secondary-container/10 shadow-md group-hover:scale-105 transition-transform" src={client.avatar || ''} />
          <div className="flex flex-col truncate">
             <span className="text-[9px] font-black text-on-surface uppercase tracking-tight truncate leading-none mb-1">{client.fullName}</span>
             <span className="text-[7px] font-black text-on-surface-variant/30 uppercase tracking-widest">Protocol Active</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onView} className="w-6 h-6 rounded-lg hover:bg-primary/10 text-on-surface-variant/40 hover:text-primary transition-all flex items-center justify-center"><span className="material-symbols-outlined text-[14px]">visibility</span></button>
          <button onClick={onDelete} className="w-6 h-6 rounded-lg hover:bg-error/10 text-on-surface-variant/40 hover:text-error transition-all flex items-center justify-center"><span className="material-symbols-outlined text-[14px]">close</span></button>
        </div>
      </div>
      <div>
        <h4 className={`font-black ${accent.text} text-[10px] mb-2 uppercase tracking-tight leading-tight truncate`}>{plan.title}</h4>
        <div className="flex items-center gap-2 text-[8px] font-black text-on-surface-variant uppercase tracking-widest">
          <span className={`${accent.bg} ${accent.text} px-2 py-0.5 rounded-md border border-transparent shadow-inner`}>{plan.exercises.length} MOV</span>
          <span className="flex items-center gap-1 opacity-30"><span className="material-symbols-outlined text-[10px]">timer</span>{plan.exercises.length * 12}M</span>
        </div>
      </div>
    </div>
  );
};

// ─── Add Workout Modal ───
const AddWorkoutModal: React.FC<{ date: string; onAdd: (clientId: string, planId: string) => void; onClose: () => void; plans: typeof workoutPlansData }> = ({ date, onAdd, onClose, plans }) => {
  const [selClient, setSelClient] = useState('');
  const [selPlan, setSelPlan] = useState('');
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-surface-container-low/90 backdrop-blur-2xl border border-secondary-container/10 rounded-[32px] p-10 w-full max-w-md shadow-2xl animate-in zoom-in slide-in-from-bottom-8 duration-500 relative" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8">
          <div>
             <h3 className="text-2xl font-black text-on-surface uppercase tracking-tighter leading-none mb-1">Assign Protocol</h3>
             <span className="text-[9px] font-black text-primary uppercase tracking-widest opacity-60">Deployment Initialization</span>
          </div>
          <button onClick={onClose} className="w-11 h-11 rounded-xl hover:bg-error/10 hover:text-error flex items-center justify-center transition-all border border-secondary-container/10 active:scale-90 shadow-lg"><span className="material-symbols-outlined text-[24px]">close</span></button>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest px-3 border-l-2 border-primary">Target Athlete</label>
            <div className="relative">
               <select value={selClient} onChange={e => setSelClient(e.target.value)} className="w-full bg-surface-container-high/40 border border-secondary-container/10 rounded-xl py-3.5 px-6 text-on-surface text-xs font-black focus:border-primary transition-all appearance-none cursor-pointer shadow-inner uppercase tracking-widest">
                 <option value="">Select Target…</option>
                 {clients.filter(c => c.status === 'active').map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
               </select>
               <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary opacity-30 pointer-events-none text-[18px]">person_search</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest px-3 border-l-2 border-primary">Program Module</label>
            <div className="relative">
               <select value={selPlan} onChange={e => setSelPlan(e.target.value)} className="w-full bg-surface-container-high/40 border border-secondary-container/10 rounded-xl py-3.5 px-6 text-on-surface text-xs font-black focus:border-primary transition-all appearance-none cursor-pointer shadow-inner uppercase tracking-widest">
                 <option value="">Choose Module…</option>
                 {plans.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
               </select>
               <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary opacity-30 pointer-events-none text-[18px]">fitness_center</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-10">
          <button onClick={onClose} className="flex-1 py-4 rounded-xl bg-surface-container-high text-on-surface text-[9px] font-black uppercase tracking-widest hover:bg-surface-bright transition-all active:scale-95 shadow-lg">Discard</button>
          <button onClick={() => { if (selClient && selPlan) { onAdd(selClient, selPlan); onClose(); }}} disabled={!selClient || !selPlan} className="flex-2 py-4 rounded-xl bg-primary text-on-primary text-[9px] font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-primary/20 transition-all disabled:opacity-20 active:scale-95 flex items-center justify-center gap-2">
             <span className="material-symbols-outlined text-[18px]">verified</span>
             Deploy
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Workout Detail Modal ───
const WorkoutDetailModal: React.FC<{ plan: typeof workoutPlansData[0]; onClose: () => void; onReorder: (planId: string, exercises: typeof workoutPlansData[0]['exercises']) => void }> = ({ plan, onClose, onReorder }) => {
  const [exList, setExList] = useState([...plan.exercises].sort((a, b) => a.orderIndex - b.orderIndex));
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);
  const client = clients.find(c => c.id === plan.clientId);
  const accent = accentMap[(plan.accentColor || 'primary') as Accent];

  const handleDragStart = (idx: number) => { dragItem.current = idx; };
  const handleDragEnter = (idx: number) => { dragOver.current = idx; };
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOver.current === null) return;
    const copy = [...exList];
    const [moved] = copy.splice(dragItem.current, 1);
    copy.splice(dragOver.current, 0, moved);
    const reordered = copy.map((ex, i) => ({ ...ex, orderIndex: i }));
    setExList(reordered);
    onReorder(plan.id, reordered);
    dragItem.current = null; dragOver.current = null;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div className="bg-surface-container-low/90 backdrop-blur-2xl border border-secondary-container/10 rounded-[40px] p-10 w-full max-w-xl max-h-[85vh] overflow-y-auto shadow-2xl animate-in zoom-in slide-in-from-bottom-8 duration-500 relative no-scrollbar" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-10">
          <div>
             <h3 className={`text-3xl font-black ${accent.text} uppercase tracking-tighter leading-none mb-2`}>{plan.title}</h3>
             <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">Protocol Review • {client?.fullName}</p>
          </div>
          <button onClick={onClose} className="w-11 h-11 rounded-xl bg-surface-container-high hover:bg-error/10 hover:text-error flex items-center justify-center transition-all border border-secondary-container/10 active:scale-90 shadow-lg"><span className="material-symbols-outlined text-[24px]">close</span></button>
        </div>
        
        <div className="space-y-3">
          {exList.map((we, i) => {
            const ex = exercisesData.find(e => e.id === we.exerciseId);
            return (
              <div key={we.id} draggable onDragStart={() => handleDragStart(i)} onDragEnter={() => handleDragEnter(i)} onDragEnd={handleDragEnd} onDragOver={e => e.preventDefault()}
                className="flex items-center justify-between p-5 rounded-[24px] bg-surface-container-high/40 border border-secondary-container/10 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all group shadow-inner">
                <div className="flex items-center gap-5">
                  <span className="material-symbols-outlined text-on-surface-variant/10 text-[20px] group-hover:text-primary transition-all group-hover:scale-110">drag_indicator</span>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary text-base font-black flex items-center justify-center border border-primary/20 shadow-md group-hover:bg-primary group-hover:text-on-primary transition-all">{i + 1}</div>
                  <div className="flex flex-col">
                     <span className="text-sm font-black text-on-surface uppercase tracking-tight group-hover:text-primary transition-colors">{ex?.name}</span>
                     <span className="text-[8px] font-black text-on-surface-variant/30 uppercase tracking-widest">Mechanical Blueprint</span>
                  </div>
                </div>
                <div className="text-[9px] font-black text-primary uppercase tracking-widest px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20 shadow-sm">
                  {we.sets[0]?.expectedWeight}KG
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={onClose} className="w-full mt-10 py-4 rounded-xl bg-surface-container-highest border border-secondary-container/10 text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all shadow-lg active:scale-95">Purge Viewport</button>
      </div>
    </div>
  );
};

// ─── Main Planner ───
const WorkoutPlanner: React.FC = () => {
  const today = new Date();
  const [weekStart, setWeekStart] = useState(getMonday(today));
  const [plans, setPlans] = useState(workoutPlansData.map(p => ({ ...p })));
  const [addModalDate, setAddModalDate] = useState<string | null>(null);
  const [viewPlan, setViewPlan] = useState<typeof plans[0] | null>(null);
  const [selectedClient, setSelectedClient] = useState(clients[0]?.id || '');
  const [editingNotes, setEditingNotes] = useState(false);
  const [clientNotes, setClientNotes] = useState<Record<string, string>>(
    Object.fromEntries(Object.entries(mockData.clientVolumeData).map(([k, v]) => [k, v.notes]))
  );
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

  const getPlansForDate = (date: string) => plans.filter(p => p.scheduledDate?.startsWith(date));
  const isTodayDate = (date: string) => fmt(today) === date;

  const handleAddWorkout = (date: string, clientId: string, planId: string) => {
    const src = workoutPlansData.find(p => p.id === planId);
    if (!src) return;
    const newPlan = { ...src, id: `wp-new-${Date.now()}`, clientId, scheduledDate: `${date}T09:00:00Z` };
    setPlans(prev => [...prev, newPlan]);
    
    setModalConfig({
      isOpen: true,
      title: 'Protocol Deployed',
      message: `A new movement module has been scheduled for ${clients.find(c => c.id === clientId)?.fullName}.`,
      type: 'success',
      onConfirm: closeModal
    });
  };

  const handleDrop = useCallback((targetDate: string) => {
    if (!dragPlanId) return;
    setPlans(prev => prev.map(p => p.id === dragPlanId ? { ...p, scheduledDate: `${targetDate}T09:00:00Z` } : p));
    setDragPlanId(null);
  }, [dragPlanId]);

  const volData = (mockData.clientVolumeData as Record<string, { weeks: { week: string; planned: number; actual: number }[]; notes: string }>)[selectedClient];
  const volumeWeeks = volData?.weeks || [];
  const maxVol = Math.max(...volumeWeeks.map(w => Math.max(w.planned, w.actual)), 1);

  return (
    <div className="w-full space-y-(--spacing-section-gap) pb-10">
      {/* Planner Header */}
      <div className="border-b border-secondary-container/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1">
          <h2 className="text-3xl font-black text-on-surface mb-2 tracking-tighter uppercase leading-none">Macro-Cycle Planner</h2>
          <div className="flex items-center gap-3">
             <div className="relative group">
                <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)} className="bg-surface-container-high/40 border border-secondary-container/10 rounded-xl py-2 px-6 pr-10 text-[8px] font-black text-primary uppercase tracking-widest focus:border-primary outline-none appearance-none cursor-pointer transition-all shadow-inner">
                  {clients.filter(c => c.status === 'active').map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none text-[16px] opacity-30">expand_more</span>
             </div>
             <span className="text-on-surface-variant font-black text-[8px] uppercase tracking-widest opacity-30">Periodization Control Active</span>
          </div>
        </div>
        <div className="flex gap-2 items-center bg-surface-container-high/40 backdrop-blur-xl rounded-2xl p-1.5 border border-secondary-container/10 shadow-xl">
          <button onClick={() => canGoPrev && setWeekStart(addDays(weekStart, -7))} className="w-10 h-10 rounded-xl hover:bg-surface-container-high text-on-surface-variant/40 hover:text-on-surface transition-all flex items-center justify-center active:scale-90"><span className="material-symbols-outlined text-[20px]">chevron_left</span></button>
          <div className="px-5 py-1.5 text-[8px] font-black text-on-surface uppercase tracking-[0.2em] opacity-80">{weekLabel}</div>
          <button onClick={() => canGoNext && setWeekStart(addDays(weekStart, 7))} className="w-10 h-10 rounded-xl hover:bg-surface-container-high text-on-surface-variant/40 hover:text-on-surface transition-all flex items-center justify-center active:scale-90"><span className="material-symbols-outlined text-[20px]">chevron_right</span></button>
        </div>
      </div>

      {/* Main Grid: Full Width Planner */}
      <div className="overflow-x-auto pb-6 no-scrollbar">
        <div className="flex gap-(--spacing-card-gap) min-w-[1200px]">
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
                    <WorkoutCard key={p.id} plan={p} onDelete={() => setPlans(prev => prev.filter(x => x.id !== p.id))} onView={() => setViewPlan(p)} onDragStart={() => setDragPlanId(p.id)} />
                  ))}
                  {dayPlans.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 opacity-[0.02] border-2 border-dashed border-on-surface rounded-2xl group-hover/col:opacity-[0.04] transition-opacity">
                      <span className="material-symbols-outlined text-4xl">cycle</span>
                      <span className="text-[8px] font-black uppercase tracking-[0.3em]">Standby</span>
                    </div>
                  )}
                </div>

                <button onClick={() => setAddModalDate(day.date)} className="w-full py-3 rounded-xl border-2 border-dashed border-secondary-container/10 hover:border-primary/40 hover:bg-primary/5 text-on-surface-variant/20 hover:text-primary transition-all flex items-center justify-center gap-2 group active:scale-95">
                  <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">add_task</span>
                  <span className="text-[8px] font-black uppercase tracking-widest">Schedule</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analytics & Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-(--spacing-section-gap)">
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
             {volumeWeeks.map((w, i) => {
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
             <button onClick={() => setEditingNotes(!editingNotes)} className="w-9 h-9 rounded-lg bg-surface-container-high/60 backdrop-blur-md border border-secondary-container/5 hover:text-primary text-on-surface-variant/40 transition-all flex items-center justify-center active:scale-90 shadow-lg">
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
          <button className="w-full py-4 bg-tertiary/10 text-tertiary border border-tertiary/20 rounded-xl text-[8px] font-black uppercase tracking-[0.3em] hover:bg-tertiary hover:text-on-tertiary transition-all shadow-xl active:scale-95 relative z-10">Export Tactical Dossier</button>
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

      {addModalDate && <AddWorkoutModal date={addModalDate} onAdd={(cid, pid) => handleAddWorkout(addModalDate, cid, pid)} onClose={() => setAddModalDate(null)} plans={plans} />}
      {viewPlan && <WorkoutDetailModal plan={viewPlan} onClose={() => setViewPlan(null)} onReorder={(pid, exs) => setPlans(prev => prev.map(p => p.id === pid ? { ...p, exercises: exs } : p))} />}
    </div>
  );
};

export default WorkoutPlanner;
