import React, { useState, useMemo } from 'react';
import usersData from '../data/users.json';
import workoutPlansData from '../data/workoutPlans.json';
import exercisesData from '../data/exercises.json';
import NotificationModal from '../components/NotificationModal';

type SessionReviewData = {
  id: string;
  clientId: string;
  workoutPlanId: string;
  completedAt: string;
  actualSets: {
    exerciseId: string;
    sets: {
      setIndex: number;
      actualReps: number;
      actualWeight: number;
      targetReps: number;
      targetWeight: number;
    }[];
  }[];
  clientNotes: string;
  clientStruggles: string;
  clientRating: number;
  trainerRating: number;
  trainerFeedback: string;
  isReviewed: boolean;
};

const initialSessions: SessionReviewData[] = [
  {
    id: 'rev-1',
    clientId: 'u-client-1',
    workoutPlanId: 'wp-1',
    completedAt: '2026-05-14T18:00:00Z',
    actualSets: [
      {
        exerciseId: 'ex-1',
        sets: [
          { setIndex: 0, actualReps: 10, actualWeight: 80, targetReps: 10, targetWeight: 75 },
          { setIndex: 1, actualReps: 8, actualWeight: 80, targetReps: 10, targetWeight: 75 },
          { setIndex: 2, actualReps: 8, actualWeight: 80, targetReps: 10, targetWeight: 75 },
          { setIndex: 3, actualReps: 6, actualWeight: 85, targetReps: 10, targetWeight: 75 }
        ]
      },
      {
        exerciseId: 'ex-2',
        sets: [
          { setIndex: 0, actualReps: 12, actualWeight: 40, targetReps: 12, targetWeight: 40 },
          { setIndex: 1, actualReps: 10, actualWeight: 40, targetReps: 12, targetWeight: 40 },
          { setIndex: 2, actualReps: 10, actualWeight: 40, targetReps: 12, targetWeight: 40 }
        ]
      }
    ],
    clientNotes: "Energy levels much higher than last session. Nutrition timing changes seem to be working.",
    clientStruggles: "Felt slight fatigue in front delts during OHP. Decided to drop weight to maintain strict form.",
    clientRating: 4,
    trainerRating: 0,
    trainerFeedback: "",
    isReviewed: false
  },
  {
    id: 'rev-2',
    clientId: 'u-client-2',
    workoutPlanId: 'wp-2',
    completedAt: '2026-05-14T16:30:00Z',
    actualSets: [
      {
        exerciseId: 'ex-3',
        sets: [
          { setIndex: 0, actualReps: 15, actualWeight: 60, targetReps: 15, targetWeight: 60 },
          { setIndex: 1, actualReps: 15, actualWeight: 60, targetReps: 15, targetWeight: 60 }
        ]
      }
    ],
    clientNotes: "Smooth session, felt great.",
    clientStruggles: "None.",
    clientRating: 5,
    trainerRating: 0,
    trainerFeedback: "",
    isReviewed: false
  }
];

const SessionReview: React.FC = () => {
  const [sessions, setSessions] = useState<SessionReviewData[]>(initialSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(initialSessions[0]?.id || null);
  const [trainerFeedback, setTrainerFeedback] = useState("");
  const [trainerRating, setTrainerRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

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

  const clients = useMemo(() => usersData.filter(u => u.role === 'USER'), []);
  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  const handleReviewSubmit = () => {
    if (!activeSessionId) return;
    setIsSubmitting(true);
    
    setTimeout(() => {
      setSessions(prev => prev.filter(s => s.id !== activeSessionId));
      setActiveSessionId(null);
      setSelectedReviewId(null);
      setTrainerFeedback("");
      setTrainerRating(0);
      setIsSubmitting(false);
      
      setModalConfig({
        isOpen: true,
        title: 'Audit Published',
        message: 'Performance review has been successfully synchronized.',
        type: 'success',
        onConfirm: closeModal
      });
    }, 1000);
  };

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-4">
        <div className="w-40 h-40 rounded-[48px] bg-surface-container-low/40 border border-secondary-container/10 flex items-center justify-center shadow-2xl relative overflow-hidden group">
           <span className="material-symbols-outlined text-[80px] text-emerald-500/10 group-hover:text-emerald-500 transition-all duration-700">verified</span>
        </div>
        <div className="text-center">
          <h2 className="text-4xl font-black text-on-surface mb-2 uppercase tracking-tighter leading-none">Queue Clear</h2>
          <p className="text-base text-on-surface-variant/40 font-medium italic">"All athletic performance audits have been completed."</p>
        </div>
        <button onClick={() => window.location.reload()} className="px-10 py-4 bg-primary text-on-primary rounded-xl font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-primary/20 active:scale-95 transition-all text-[10px]">Sync Registry</button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-[var(--spacing-section-gap)] pb-10">
      {/* Page Header */}
      <div className="border-b border-secondary-container/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <h2 className="text-3xl font-black text-on-surface mb-1 tracking-tighter uppercase leading-none">Performance Audits</h2>
           <p className="text-xs text-on-surface-variant font-medium italic opacity-60">"Analyze movement data and deploy expert tactical feedback."</p>
        </div>
        <div className="bg-surface-container-high/40 backdrop-blur-xl px-4 py-2 rounded-2xl border border-secondary-container/10 flex items-center gap-3 shadow-xl">
           <div className="flex flex-col items-end">
              <span className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">Awaiting</span>
              <span className="text-base font-black text-on-surface tracking-tight">{sessions.length} PROTOCOLS</span>
           </div>
           <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <span className="material-symbols-outlined text-[18px]">pending_actions</span>
           </div>
        </div>
      </div>

      {/* Audit Table Interface */}
      <div className="glass-card !p-0">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-surface-container-high/20 border-b border-secondary-container/5">
                <th className="px-6 py-4 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Athlete Profiling</th>
                <th className="px-6 py-4 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Protocol Marker</th>
                <th className="px-6 py-4 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em] text-center">Temporal Index</th>
                <th className="px-6 py-4 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em] text-center">Subjective RPE</th>
                <th className="px-6 py-4 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em] text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-container/5">
              {sessions.map((session) => {
                const sClient = clients.find(c => c.id === session.clientId);
                const sPlan = workoutPlansData.find(p => p.id === session.workoutPlanId);
                const isSelected = selectedReviewId === session.id;
                
                return (
                  <React.Fragment key={session.id}>
                    <tr className={`hover:bg-primary/[0.02] transition-all group cursor-pointer ${isSelected ? 'bg-primary/[0.04]' : ''}`} onClick={() => { setSelectedReviewId(isSelected ? null : session.id); setActiveSessionId(session.id); }}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl border border-secondary-container/10 overflow-hidden shadow-lg group-hover:border-primary/40 transition-all">
                             <img src={sClient?.avatar || ''} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                          </div>
                          <div>
                             <span className="text-sm font-black text-on-surface block leading-none mb-1 uppercase tracking-tight group-hover:text-primary transition-colors">{sClient?.fullName}</span>
                             <span className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest">SUB_ID: {session.clientId.slice(0, 8)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary shadow-lg animate-pulse"></div>
                            <span className="text-[11px] font-black text-on-surface uppercase tracking-tight leading-none truncate max-w-[150px]">{sPlan?.title}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-tight">
                          {new Date(session.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span key={star} className={`material-symbols-outlined text-[16px] transition-all ${star <= session.clientRating ? 'text-primary fill' : 'text-on-surface-variant/5'}`}>
                              grade
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReviewId(isSelected ? null : session.id);
                            setActiveSessionId(session.id);
                          }}
                          className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                            isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container-high/40 border border-secondary-container/5 text-on-surface hover:text-primary transition-all'
                          }`}
                        >
                          {isSelected ? 'Seal Audit' : 'Initialize'}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Audit Details */}
                    {isSelected && (
                      <tr>
                        <td colSpan={5} className="p-0 bg-surface-container-low/20 backdrop-blur-2xl border-t border-secondary-container/5">
                          <div className="p-6 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(208,188,255,0.01),transparent)]"></div>
                            <div className="grid grid-cols-1 gap-6 relative z-10">
                              {session.actualSets.map(actualEx => {
                                const exInfo = exercisesData.find(e => e.id === actualEx.exerciseId);
                                return (
                                  <div key={actualEx.exerciseId} className="bg-surface-container-low/40 border border-secondary-container/5 rounded-3xl overflow-hidden shadow-xl group/ex hover:border-primary/20 transition-all">
                                    <div className="bg-surface-container-high/20 px-6 py-3 border-b border-secondary-container/5 flex items-center justify-between">
                                      <div className="flex items-center gap-4">
                                         <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shadow-lg">
                                            <span className="material-symbols-outlined text-[18px]">terminal</span>
                                         </div>
                                         <div>
                                            <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] mb-0.5 block">Objective</span>
                                            <h5 className="text-base font-black text-on-surface uppercase tracking-tight">{exInfo?.name}</h5>
                                         </div>
                                      </div>
                                    </div>
                                    <div className="overflow-x-auto no-scrollbar">
                                      <table className="w-full text-left border-collapse">
                                        <thead>
                                          <tr className="bg-surface-container-high/10">
                                            <th className="px-8 py-3 text-[8px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em]">Interval</th>
                                            <th className="px-8 py-3 text-[8px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em]">Blueprint</th>
                                            <th className="px-8 py-3 text-[8px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em]">Execution</th>
                                            <th className="px-8 py-3 text-[8px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] text-right">Delta</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-secondary-container/5">
                                          {actualEx.sets.map((set, sIdx) => {
                                            const weightDelta = set.actualWeight - set.targetWeight;
                                            const repsDelta = set.actualReps - set.targetReps;
                                            return (
                                              <tr key={sIdx} className="hover:bg-primary/[0.02] transition-all group/row">
                                                <td className="px-8 py-3 text-sm font-black text-on-surface-variant/10 group-hover/row:text-primary/20 transition-colors">#{sIdx + 1}</td>
                                                <td className="px-8 py-3 text-[10px] font-bold text-on-surface-variant/30 uppercase italic">
                                                  {set.targetWeight}KG <span className="mx-1 opacity-20">×</span> {set.targetReps}
                                                </td>
                                                <td className="px-8 py-3 text-xs font-black text-on-surface uppercase tracking-tight">
                                                  {set.actualWeight}KG <span className="mx-1 text-primary opacity-30">×</span> {set.actualReps}
                                                </td>
                                                <td className="px-8 py-3 text-right">
                                                  <div className="flex items-center justify-end gap-2">
                                                    {weightDelta !== 0 && (
                                                      <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm ${weightDelta > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-error/10 text-error'}`}>
                                                        {weightDelta > 0 ? '+' : ''}{weightDelta}KG
                                                      </div>
                                                    )}
                                                    {repsDelta !== 0 && (
                                                      <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm ${repsDelta > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-error/10 text-error'}`}>
                                                        {repsDelta > 0 ? '+' : ''}{repsDelta} REPS
                                                      </div>
                                                    )}
                                                    {weightDelta === 0 && repsDelta === 0 && (
                                                      <div className="px-3 py-1 rounded-lg text-[8px] font-black bg-primary/10 text-primary uppercase tracking-widest shadow-inner">Synced</div>
                                                    )}
                                                  </div>
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
                              <div className="lg:col-span-2 space-y-6">
                                <div className="bg-surface-container-low/40 border border-secondary-container/10 p-6 rounded-3xl relative overflow-hidden group/feedback shadow-xl">
                                  <h4 className="text-[8px] font-black text-primary uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                     Transmission Logs
                                  </h4>
                                  <div className="space-y-6">
                                    <div className="relative pl-4 border-l-2 border-primary/20">
                                      <span className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1 block">Subject Overview</span>
                                      <p className="text-sm italic text-on-surface-variant/80 leading-relaxed font-bold">"{session.clientNotes}"</p>
                                    </div>
                                    <div className="relative pl-4 border-l-2 border-error/20">
                                      <span className="text-[8px] font-black text-error uppercase tracking-widest mb-1 block opacity-60">Inhibitors</span>
                                      <p className="text-sm italic text-on-surface-variant/80 leading-relaxed font-bold">"{session.clientStruggles}"</p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="bg-surface-container-low/60 border border-primary/10 p-6 rounded-[32px] shadow-2xl relative group/input">
                                  <div className="absolute -top-3 -left-2 bg-primary text-on-primary px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">Expert Node</div>
                                  <textarea 
                                    className="w-full bg-surface-container-high/40 border border-secondary-container/10 rounded-2xl p-4 text-sm font-bold text-on-surface focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/10 min-h-[140px] shadow-inner italic"
                                    placeholder="Analyze biomechanical delta. Deploy tactical corrections..."
                                    value={trainerFeedback}
                                    onChange={(e) => setTrainerFeedback(e.target.value)}
                                  />
                                </div>
                              </div>

                              <div className="bg-surface-container-low/40 border border-secondary-container/10 p-6 rounded-[32px] flex flex-col justify-between shadow-xl relative overflow-hidden group/rating">
                                <div className="text-center relative z-10">
                                  <h4 className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em] mb-4">Compliance</h4>
                                  <div className="relative inline-block mb-4 group/number">
                                     <span className="text-6xl font-black text-on-surface leading-none relative z-10 tracking-tighter transition-all group-hover/number:scale-105 block">{trainerRating || '0'}</span>
                                     <span className="text-xs text-primary/40 font-black absolute -top-1 -right-4 z-10">IDX</span>
                                  </div>
                                  <div className="flex gap-2 justify-center mb-6">
                                    {[1, 2, 3, 4, 5].map(star => (
                                      <button 
                                        key={star} 
                                        onClick={() => setTrainerRating(star)}
                                        className={`material-symbols-outlined text-[28px] transition-all duration-300 hover:scale-125 ${star <= trainerRating ? 'text-primary fill drop-shadow-md' : 'text-on-surface-variant/5'}`}
                                      >
                                        grade
                                      </button>
                                    ))}
                                  </div>
                                  <p className="text-[8px] font-black text-on-surface-variant/20 uppercase tracking-widest italic px-4 leading-relaxed">Establish compliance coefficient.</p>
                                </div>
                                
                                <div className="space-y-3 pt-6 border-t border-secondary-container/5 relative z-10">
                                  <button 
                                    onClick={handleReviewSubmit}
                                    disabled={isSubmitting || !trainerFeedback.trim() || trainerRating === 0}
                                    className="w-full py-4 bg-primary text-on-primary text-[9px] font-black uppercase tracking-[0.3em] rounded-xl hover:brightness-110 shadow-xl shadow-primary/20 transition-all disabled:opacity-10 active:scale-95 flex items-center justify-center gap-2"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">sync</span>
                                    {isSubmitting ? 'Syncing...' : 'Transmit Audit'}
                                  </button>
                                  <button className="w-full py-4 bg-surface-container-high/40 border border-secondary-container/5 text-on-surface-variant/60 text-[9px] font-black uppercase tracking-[0.3em] rounded-xl hover:text-primary transition-all shadow-lg active:scale-95">
                                     Cache
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
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
        confirmLabel="Acknowledge"
      />
    </div>
  );
};

export default SessionReview;
