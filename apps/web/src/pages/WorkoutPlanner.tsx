import React, { useState, useMemo, useCallback, useRef } from 'react';
import usersData from '../data/users.json';
import workoutPlansData from '../data/workoutPlans.json';
import exercisesData from '../data/exercises.json';
import mockData from '../data/mockData.json';

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
      className="rounded-xl p-3 flex flex-col gap-3 border border-outline-variant/30 transition-all cursor-grab active:cursor-grabbing hover:border-primary/50 hover:-translate-y-0.5"
      style={{ background: 'linear-gradient(145deg, #2b3544, #1F2937)', boxShadow: '0 4px 6px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-8 h-8 rounded-full overflow-hidden ${accent.border} border shrink-0`}><img alt={client.fullName} className="w-full h-full object-cover" src={client.avatar} /></div>
          <span className="text-xs font-bold text-on-surface truncate">{client.fullName}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onView} className="p-0.5 rounded hover:bg-surface-container-highest transition-colors"><span className="material-symbols-outlined text-on-surface-variant text-[16px]">visibility</span></button>
          <button onClick={onDelete} className="p-0.5 rounded hover:bg-error/10 transition-colors"><span className="material-symbols-outlined text-error/60 hover:text-error text-[16px]">close</span></button>
        </div>
      </div>
      <div>
        <h4 className={`font-bold ${accent.text} text-sm mb-1`}>{plan.title}</h4>
        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          <span className={`${accent.bg} ${accent.text} px-2 py-0.5 rounded`}>{plan.exercises.length} Exercises</span>
          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span>{plan.exercises.length * 12}m</span>
        </div>
      </div>
    </div>
  );
};

// ─── Add Workout Modal ───
const AddWorkoutModal: React.FC<{ date: string; onAdd: (clientId: string, planId: string) => void; onClose: () => void; plans: typeof workoutPlansData }> = ({ date, onAdd, onClose, plans }) => {
  const [selClient, setSelClient] = useState('');
  const [selPlan, setSelPlan] = useState('');
  const dateLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const filteredPlans = selClient ? plans.filter(p => p.clientId === selClient) : plans;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={onClose}>
      <div className="rounded-[20px] p-8 w-full max-w-md mx-4 flex flex-col gap-6 border border-outline-variant/20" onClick={e => e.stopPropagation()} style={{ background: 'linear-gradient(145deg, #1a2535, #16202e)' }}>
        <div className="flex justify-between items-center"><h3 className="text-xl font-bold">Add Workout</h3><button onClick={onClose} className="p-1 rounded-full hover:bg-surface-container-highest"><span className="material-symbols-outlined">close</span></button></div>
        <p className="text-sm text-on-surface-variant">Scheduling for <span className="text-primary font-bold">{dateLabel}</span></p>
        <div className="flex flex-col gap-2"><label className="text-sm font-semibold text-on-surface-variant">Client</label>
          <select value={selClient} onChange={e => { setSelClient(e.target.value); setSelPlan(''); }} className="bg-surface border border-outline-variant/30 rounded-xl py-3 px-4 text-on-surface text-sm outline-none focus:border-primary">
            <option value="">Select client…</option>{clients.filter(c => c.status === 'active').map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
          </select></div>
        <div className="flex flex-col gap-2"><label className="text-sm font-semibold text-on-surface-variant">Workout Plan</label>
          <select value={selPlan} onChange={e => setSelPlan(e.target.value)} className="bg-surface border border-outline-variant/30 rounded-xl py-3 px-4 text-on-surface text-sm outline-none focus:border-primary">
            <option value="">Select plan…</option>{filteredPlans.map(p => <option key={p.id} value={p.id}>{p.title} ({p.exercises.length} ex.)</option>)}
          </select></div>
        <div className="flex gap-3 mt-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-sm font-bold hover:bg-surface-container-highest">Cancel</button>
          <button onClick={() => { if (selClient && selPlan) { onAdd(selClient, selPlan); onClose(); }}} disabled={!selClient || !selPlan} className="flex-1 py-3 rounded-xl bg-primary text-on-primary text-sm font-bold hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed">Schedule</button>
        </div>
      </div>
    </div>
  );
};

// ─── Workout Detail Modal (exercise reorder) ───
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
    console.log(`[API Mock] PATCH /api/workout-plans/${plan.id}/exercises/reorder`, reordered.map(e => ({ id: e.id, orderIndex: e.orderIndex })));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={onClose}>
      <div className="rounded-[20px] p-8 w-full max-w-lg mx-4 flex flex-col gap-5 max-h-[85vh] overflow-y-auto border border-outline-variant/20" onClick={e => e.stopPropagation()} style={{ background: 'linear-gradient(145deg, #1a2535, #16202e)' }}>
        <div className="flex justify-between items-start">
          <div><h3 className={`text-xl font-bold ${accent.text}`}>{plan.title}</h3><p className="text-sm text-on-surface-variant mt-1">{client?.fullName} • {plan.description}</p></div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-container-highest"><span className="material-symbols-outlined">close</span></button>
        </div>
        <p className="text-xs text-on-surface-variant/50 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">drag_indicator</span> Drag exercises to reorder</p>
        <div className="flex flex-col gap-2">
          {exList.map((we, i) => {
            const ex = exercisesData.find(e => e.id === we.exerciseId);
            if (!ex) return null;
            return (
              <div key={we.id} draggable onDragStart={() => handleDragStart(i)} onDragEnter={() => handleDragEnter(i)} onDragEnd={handleDragEnd} onDragOver={e => e.preventDefault()}
                className="flex items-center justify-between p-3 rounded-xl bg-surface-container-high/40 border border-outline-variant/10 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-all">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant/30 text-[16px]">drag_indicator</span>
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <div><span className="text-sm font-semibold">{ex.name}</span>{we.notes && <p className="text-[10px] text-on-surface-variant/50">{we.notes}</p>}</div>
                </div>
                <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                  <span>{we.sets.length} sets</span>
                  <span className="text-primary font-bold">{we.sets[0]?.expectedWeight}kg</span>
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={onClose} className="w-full py-3 rounded-xl border border-outline-variant/30 text-sm font-bold hover:bg-surface-container-highest mt-2">Close</button>
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
  const isToday = (date: string) => fmt(today) === date;
  const isThisWeek = fmt(weekStart) === fmt(getMonday(today));

  const handleAddWorkout = (date: string, _clientId: string, planId: string) => {
    const src = workoutPlansData.find(p => p.id === planId);
    if (!src) return;
    const newPlan = { ...src, id: `wp-new-${Date.now()}`, scheduledDate: `${date}T09:00:00Z` };
    setPlans(prev => [...prev, newPlan]);
    console.log(`[API Mock] POST /api/workout-plans`, { ...newPlan, scheduledDate: date });
  };

  const handleDeleteWorkout = (planId: string) => {
    setPlans(prev => prev.filter(p => p.id !== planId));
    console.log(`[API Mock] DELETE /api/workout-plans/${planId}`);
  };

  // Drag-drop between days
  const handleDrop = useCallback((targetDate: string) => {
    if (!dragPlanId) return;
    setPlans(prev => prev.map(p => p.id === dragPlanId ? { ...p, scheduledDate: `${targetDate}T09:00:00Z` } : p));
    console.log(`[API Mock] PATCH /api/workout-plans/${dragPlanId}`, { scheduledDate: targetDate });
    setDragPlanId(null);
  }, [dragPlanId]);

  const handleReorderExercises = (planId: string, exercises: typeof plans[0]['exercises']) => {
    setPlans(prev => prev.map(p => p.id === planId ? { ...p, exercises } : p));
  };

  // Per-client volume
  const volData = (mockData.clientVolumeData as Record<string, { weeks: { week: string; planned: number; actual: number }[]; notes: string }>)[selectedClient];
  const volumeWeeks = volData?.weeks || [];
  const maxVol = Math.max(...volumeWeeks.map(w => Math.max(w.planned, w.actual)), 1);

  return (
    <div className="flex flex-col xl:flex-row gap-8 h-full">
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-xl font-bold">Weekly Planner</h2>
          <div className="flex gap-2 items-center">
            <button onClick={() => canGoPrev && setWeekStart(addDays(weekStart, -7))} disabled={!canGoPrev} className="p-2 rounded-lg hover:bg-surface-container-highest text-on-surface-variant disabled:opacity-20 disabled:cursor-not-allowed"><span className="material-symbols-outlined">chevron_left</span></button>
            <button onClick={() => setWeekStart(getMonday(today))} className={`text-sm font-semibold px-4 py-1.5 rounded-full transition-all ${isThisWeek ? 'bg-primary/10 text-primary' : 'bg-surface-container-highest text-on-surface-variant hover:text-on-surface'}`}>{weekLabel}</button>
            <button onClick={() => canGoNext && setWeekStart(addDays(weekStart, 7))} disabled={!canGoNext} className="p-2 rounded-lg hover:bg-surface-container-highest text-on-surface-variant disabled:opacity-20 disabled:cursor-not-allowed"><span className="material-symbols-outlined">chevron_right</span></button>
            {!isThisWeek && <button onClick={() => setWeekStart(getMonday(today))} className="ml-2 text-xs font-bold text-primary hover:underline">Today</button>}
          </div>
        </div>

        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-[1100px] h-full">
            {weekDays.map(day => {
              const dayPlans = getPlansForDate(day.date);
              const isTodayCol = isToday(day.date);
              return (
                <div key={day.date}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-primary/50'); }}
                  onDragLeave={e => e.currentTarget.classList.remove('border-primary/50')}
                  onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('border-primary/50'); handleDrop(day.date); }}
                  className={`flex-1 rounded-[20px] p-3 flex flex-col gap-3 min-h-[400px] transition-colors border ${isTodayCol ? 'border-t-2 border-primary bg-primary/[0.04]' : 'border-transparent bg-surface-container-high/40'}`}
                  style={isTodayCol ? { boxShadow: 'inset 0 20px 40px -20px rgba(208,188,255,0.1)' } : undefined}>
                  <div className="flex justify-between items-center mb-1 px-1">
                    <span className={`text-sm font-semibold ${isTodayCol ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>{day.dayName} {day.dayNum}</span>
                    {isTodayCol && <span className="material-symbols-outlined text-primary text-sm">fitness_center</span>}
                  </div>
                  {dayPlans.map(p => (
                    <WorkoutCard key={p.id} plan={p} onDelete={() => handleDeleteWorkout(p.id)} onView={() => setViewPlan(p)} onDragStart={() => setDragPlanId(p.id)} />
                  ))}
                  {dayPlans.length === 0 && <div className="flex-1 flex items-center justify-center text-on-surface-variant/30 text-sm border-2 border-dashed border-outline-variant/20 rounded-xl">Rest Day</div>}
                  <button onClick={() => setAddModalDate(day.date)} className="flex items-center justify-center gap-1 border-2 border-dashed border-outline-variant/20 rounded-xl py-3 hover:border-primary/50 transition-colors group">
                    <span className="material-symbols-outlined text-on-surface-variant/30 group-hover:text-primary/60">add</span>
                    <span className="text-xs text-on-surface-variant/30 group-hover:text-primary/60 font-semibold">Add</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <aside className="w-full xl:w-80 flex flex-col gap-6 shrink-0">
        {/* Client selector */}
        <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)} className="bg-surface border border-outline-variant/30 rounded-xl py-2.5 px-4 text-on-surface text-sm outline-none focus:border-primary">
          {clients.filter(c => c.status === 'active').map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
        </select>

        {/* Volume Progression */}
        <div className="glass-card rounded-[20px] p-6">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-1"><span className="material-symbols-outlined text-primary">bar_chart</span>Volume Progression</h3>
          <p className="text-sm text-on-surface-variant mb-6">Planned vs Actual (KG/week)</p>
          {volumeWeeks.length > 0 ? (
            <>
              <div className="relative h-48 w-full flex items-end justify-between gap-2 pb-6 border-b border-outline-variant/20">
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-on-surface-variant/50 -ml-1 pb-6"><span>{(maxVol/1000).toFixed(0)}k</span><span>{(maxVol/2000).toFixed(0)}k</span><span>0</span></div>
                {volumeWeeks.map((w, i) => {
                  const pH = (w.planned / maxVol) * 100, aH = (w.actual / maxVol) * 100;
                  const isCur = i === volumeWeeks.length - 1;
                  return (<div key={w.week} className="flex-1 flex flex-col justify-end items-center relative z-10 ml-6 first:ml-6">
                    <div className="w-full flex justify-center gap-1 items-end h-[140px]">
                      <div className="w-1/2 bg-ivory/[0.07] rounded-t-sm" style={{ height: `${pH}%` }} title={`Planned: ${w.planned}`}></div>
                      <div className={`w-1/2 rounded-t-sm ${isCur ? 'bg-primary/40 border border-dashed border-primary' : 'bg-primary'}`} style={{ height: `${aH}%` }} title={`Actual: ${w.actual}`}></div>
                    </div>
                    <span className={`absolute -bottom-6 text-xs ${i === 2 ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>{w.week}</span>
                  </div>);
                })}
              </div>
              <div className="flex justify-center gap-6 mt-8"><div className="flex items-center gap-2"><div className="w-3 h-3 bg-ivory/[0.07] rounded-sm border border-outline-variant/30"></div><span className="text-xs text-on-surface-variant">Planned</span></div><div className="flex items-center gap-2"><div className="w-3 h-3 bg-primary rounded-sm"></div><span className="text-xs text-on-surface-variant">Actual</span></div></div>
            </>
          ) : <p className="text-sm text-on-surface-variant/40 text-center py-8">No volume data for this client.</p>}
        </div>

        {/* Coach Notes */}
        <div className="glass-card rounded-[20px] p-6">
          <div className="flex justify-between items-center mb-3"><h4 className="text-sm font-bold">Coach Notes</h4>
            <button onClick={() => { if (editingNotes) console.log(`[API Mock] PATCH /api/clients/${selectedClient}/notes`, { notes: clientNotes[selectedClient] }); setEditingNotes(!editingNotes); }} className="p-1 rounded hover:bg-surface-container-highest"><span className="material-symbols-outlined text-[18px] text-on-surface-variant">{editingNotes ? 'check' : 'edit'}</span></button>
          </div>
          {editingNotes ? (
            <textarea value={clientNotes[selectedClient] || ''} onChange={e => setClientNotes(prev => ({ ...prev, [selectedClient]: e.target.value }))} className="w-full bg-surface border border-outline-variant/30 rounded-xl p-3 text-sm text-on-surface leading-relaxed outline-none focus:border-primary resize-none h-32" autoFocus />
          ) : (
            <p className="text-sm text-on-surface-variant leading-relaxed">{clientNotes[selectedClient] || 'No notes for this client yet.'}</p>
          )}
        </div>
      </aside>

      {addModalDate && <AddWorkoutModal date={addModalDate} onAdd={(cid, pid) => handleAddWorkout(addModalDate, cid, pid)} onClose={() => setAddModalDate(null)} plans={plans} />}
      {viewPlan && <WorkoutDetailModal plan={viewPlan} onClose={() => setViewPlan(null)} onReorder={handleReorderExercises} />}
    </div>
  );
};

export default WorkoutPlanner;
