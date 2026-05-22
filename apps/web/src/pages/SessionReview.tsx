import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationModal from '../components/NotificationModal';

type WorkoutSessionDetail = {
  id: string;
  workoutPlanId: string;
  completedAt: string;
  clientNotes: string;
  clientStruggles: string;
  clientRating: number;
  trainerRating: number | null;
  trainerFeedback: string | null;
  workoutPlan: {
    id: string;
    title: string;
    client: {
      id: string;
      fullName: string;
      email: string;
    };
    createdBy: {
      id: string;
      fullName: string;
      email: string;
    };
  };
  loggedSets: any[];
};

const SessionReview: React.FC = () => {
  const { user } = useAuth();
  
  const [allSessions, setAllSessions] = useState<WorkoutSessionDetail[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [trainerFeedback, setTrainerFeedback] = useState("");
  const [trainerRating, setTrainerRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggerReload, setTriggerReload] = useState(0);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [clientFilter, setClientFilter] = useState("All");
  const [coachFilter, setCoachFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

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

  // Load completed sessions awaiting feedback
  useEffect(() => {
    if (!user) return;

    const fetchSessions = async () => {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('fitsync_token');
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      try {
        const response = await fetch(`http://localhost:3000/workouts/sessions/trainer/${user.id}`, { headers });
        if (!response.ok) {
          throw new Error('Failed to load completed sessions from backend');
        }
        const data = await response.json();
        setAllSessions(data);
      } catch (err: any) {
        console.error('Error fetching sessions:', err);
        setError(err.message || 'An error occurred while loading performance reviews');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [user, triggerReload]);

  const pendingSessions = useMemo(() => {
    return allSessions.filter(s => s.completedAt && (s.trainerFeedback === null || s.trainerRating === null));
  }, [allSessions]);

  // Unique clients for dropdown
  const uniqueClients = useMemo(() => {
    const clientsMap = new Map<string, string>();
    pendingSessions.forEach(s => {
      const client = s.workoutPlan?.client;
      if (client) {
        clientsMap.set(client.id, client.fullName);
      }
    });
    return Array.from(clientsMap.entries()).map(([id, name]) => ({ id, name }));
  }, [pendingSessions]);

  // Unique coaches for dropdown
  const uniqueCoaches = useMemo(() => {
    const coachesMap = new Map<string, string>();
    pendingSessions.forEach(s => {
      const coach = s.workoutPlan?.createdBy;
      if (coach) {
        coachesMap.set(coach.id, coach.fullName);
      }
    });
    return Array.from(coachesMap.entries()).map(([id, name]) => ({ id, name }));
  }, [pendingSessions]);

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return pendingSessions.filter(session => {
      const clientName = session.workoutPlan?.client?.fullName || "";
      const coachName = session.workoutPlan?.createdBy?.fullName || "";
      
      const matchesSearch = 
        clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        coachName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesClient = clientFilter === "All" || session.workoutPlan?.client?.id === clientFilter;
      const matchesCoach = coachFilter === "All" || session.workoutPlan?.createdBy?.id === coachFilter;

      let matchesDate = true;
      if (dateFilter) {
        const completedDateStr = new Date(session.completedAt).toISOString().split('T')[0];
        matchesDate = completedDateStr === dateFilter;
      }

      return matchesSearch && matchesClient && matchesCoach && matchesDate;
    });
  }, [pendingSessions, searchQuery, clientFilter, coachFilter, dateFilter]);

  const activeSession = useMemo(() => {
    return pendingSessions.find(s => s.id === activeSessionId) || null;
  }, [pendingSessions, activeSessionId]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredSessions.length / pageSize);

  const paginatedSessions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredSessions.slice(startIndex, startIndex + pageSize);
  }, [filteredSessions, currentPage, pageSize]);

  // Reset page number on search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, clientFilter, coachFilter, dateFilter]);

  // Group logged sets by exercise
  const groupedExercises = useMemo(() => {
    if (!activeSession) return [];
    
    const groups: { [key: string]: { exerciseName: string; sets: any[] } } = {};
    activeSession.loggedSets?.forEach((set: any) => {
      const exId = set.workoutExercise?.exercise?.id || 'unknown';
      const exName = set.workoutExercise?.exercise?.name || 'Unknown Exercise';
      
      if (!groups[exId]) {
        groups[exId] = {
          exerciseName: exName,
          sets: [],
        };
      }
      
      groups[exId].sets.push({
        setIndex: set.setIndex,
        actualReps: set.reps,
        actualWeight: set.weight,
        targetReps: set.workoutExercise?.targetReps ?? 0,
        targetWeight: set.workoutExercise?.targetWeight ?? 0,
      });
    });
    
    return Object.values(groups);
  }, [activeSession]);

  const handleReviewSubmit = async () => {
    if (!activeSessionId) return;
    setIsSubmitting(true);
    
    const token = localStorage.getItem('fitsync_token');
    try {
      const response = await fetch(`http://localhost:3000/workouts/sessions/${activeSessionId}/feedback`, {
        method: 'Patch',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          trainerFeedback,
          trainerRating,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to transmit feedback and rating');
      }

      setTrainerFeedback("");
      setTrainerRating(0);
      setActiveSessionId(null);
      setTriggerReload(prev => prev + 1);
      
      setModalConfig({
        isOpen: true,
        title: 'Review Published',
        message: 'Performance review has been successfully synchronized and transmitted to the athlete.',
        type: 'success',
        onConfirm: closeModal
      });
    } catch (err: any) {
      console.error(err);
      setModalConfig({
        isOpen: true,
        title: 'Transmission Failed',
        message: err.message || 'An error occurred while publishing the workout review.',
        type: 'danger',
        onConfirm: closeModal
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        <p className="text-on-surface-variant/60 font-bold uppercase tracking-widest text-xs">Loading workout reviews queue...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center max-w-md mx-auto">
        <span className="material-symbols-outlined text-error text-5xl">warning</span>
        <h2 className="text-xl font-bold">Registry Sync Failure</h2>
        <p className="text-on-surface-variant/60 text-sm">{error}</p>
        <button onClick={() => setTriggerReload(prev => prev + 1)} className="mt-4 px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs uppercase tracking-widest">Retry Connection</button>
      </div>
    );
  }

  if (pendingSessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-4">
        <div className="w-40 h-40 rounded-[48px] bg-surface-container-low/40 border border-secondary-container/10 flex items-center justify-center shadow-2xl relative overflow-hidden group">
           <span className="material-symbols-outlined text-[80px] text-emerald-500/10 group-hover:text-emerald-500 transition-all duration-700">verified</span>
        </div>
        <div className="text-center">
          <h2 className="font-black text-on-surface mb-2 uppercase tracking-tighter leading-none">Queue Clear</h2>
          <blockquote className="text-on-surface-variant/40 font-medium italic">"All workout performance reviews have been completed."</blockquote>
        </div>
        <button onClick={() => setTriggerReload(prev => prev + 1)} className="px-10 py-4 bg-primary text-on-primary rounded-xl font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-primary/20 active:scale-95 transition-all text-[10px] cursor-pointer">Sync Registry</button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-[var(--spacing-section-gap)] pb-10">
      {/* Page Header */}
      <div className="border-b border-secondary-container/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <h2 className="font-black text-on-surface mb-1 tracking-tighter uppercase leading-none">Workout Reviews</h2>
           <blockquote className="text-on-surface-variant font-medium italic opacity-60">"Analyze movement data and publish expert tactical feedback."</blockquote>
        </div>
        <div className="bg-surface-container-high/40 backdrop-blur-xl px-4 py-2 rounded-2xl border border-secondary-container/10 flex items-center gap-3 shadow-xl">
           <div className="flex flex-col items-end">
              <span className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">Awaiting</span>
              <span className="text-base font-black text-on-surface tracking-tight">{pendingSessions.length} WORKOUTS</span>
           </div>
           <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <span className="material-symbols-outlined text-[18px]">pending_actions</span>
           </div>
        </div>
      </div>

      {/* Audit Table Interface */}
      <div className="glass-card !p-0">
        {/* Filters and Search Header */}
        <div className="px-6 py-4 border-b border-secondary-container/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-high/20">
          <div className="relative max-w-md w-full">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/30 text-[18px]">search</span>
            <input
              type="text"
              className="w-full bg-surface-container-low/60 border border-secondary-container/10 rounded-xl py-2.5 pl-11 pr-4 text-[12px] font-bold text-on-surface focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all shadow-inner uppercase tracking-tight"
              placeholder="Search by client or coach..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            {/* Client Filter */}
            <div className="relative">
              <select 
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="bg-surface-container-high/40 border border-secondary-container/5 text-on-surface text-[9px] font-black uppercase tracking-widest px-8 py-2.5 rounded-xl hover:bg-surface-container-high transition-all focus:outline-none appearance-none cursor-pointer pr-10 shadow-sm"
              >
                <option value="All">All Clients</option>
                {uniqueClients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary opacity-30 pointer-events-none text-[16px]">expand_more</span>
            </div>

            {/* Coach Filter */}
            {user?.role === 'ADMIN' && (
              <div className="relative">
                <select 
                  value={coachFilter}
                  onChange={(e) => setCoachFilter(e.target.value)}
                  className="bg-surface-container-high/40 border border-secondary-container/5 text-on-surface text-[9px] font-black uppercase tracking-widest px-8 py-2.5 rounded-xl hover:bg-surface-container-high transition-all focus:outline-none appearance-none cursor-pointer pr-10 shadow-sm"
                >
                  <option value="All">All Coaches</option>
                  {uniqueCoaches.map(co => (
                    <option key={co.id} value={co.id}>{co.name}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary opacity-30 pointer-events-none text-[16px]">expand_more</span>
              </div>
            )}

            {/* Date Filter */}
            <div className="relative">
              <input 
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-surface-container-high/40 border border-secondary-container/10 text-on-surface text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-surface-container-high transition-all focus:outline-none cursor-pointer shadow-sm text-center"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-surface-container-high/20 border-b border-secondary-container/5">
                <th className="px-6 py-4 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Athlete</th>
                <th className="px-6 py-4 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Workout</th>
                <th className="px-6 py-4 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Coach</th>
                <th className="px-6 py-4 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em] text-center">Date</th>
                <th className="px-6 py-4 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em] text-center">Client Rating</th>
                <th className="px-6 py-4 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em] text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-container/5">
              {paginatedSessions.map((session) => {
                const sClient = session.workoutPlan?.client;
                const isSelected = activeSessionId === session.id;
                
                return (
                  <tr 
                    key={session.id} 
                    className={`hover:bg-primary/[0.02] transition-all group cursor-pointer ${isSelected ? 'bg-primary/[0.04]' : ''}`} 
                    onClick={() => { setActiveSessionId(isSelected ? null : session.id); }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl border border-secondary-container/10 overflow-hidden shadow-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                           {sClient?.fullName.charAt(0)}
                        </div>
                        <div>
                           <span className="text-sm font-black text-on-surface block leading-none mb-1 uppercase tracking-tight group-hover:text-primary transition-colors">{sClient?.fullName}</span>
                           <span className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest">SUB_ID: {sClient?.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary shadow-lg animate-pulse"></div>
                          <span className="text-[11px] font-black text-on-surface uppercase tracking-tight leading-none truncate max-w-[150px]">{session.workoutPlan?.title}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-black text-on-surface uppercase tracking-tight leading-none">
                        {session.workoutPlan?.createdBy?.fullName || 'N/A'}
                      </span>
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
                          setActiveSessionId(isSelected ? null : session.id);
                        }}
                        className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 cursor-pointer ${
                          isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container-high/40 border border-secondary-container/5 text-on-surface hover:text-primary transition-all'
                        }`}
                      >
                        {isSelected ? 'Seal Review' : 'Review'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredSessions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-10">
                      <span className="material-symbols-outlined text-[48px]">pending_actions</span>
                      <p className="text-sm font-black uppercase tracking-[0.3em]">No Workout Sessions Found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-8 py-5 border-t border-secondary-container/5 flex items-center justify-between bg-surface-container-high/10">
            <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant/30 hover:bg-primary/10 hover:text-primary disabled:opacity-20 transition-all border border-secondary-container/10 disabled:cursor-not-allowed bg-surface-container-low shadow-md cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant/30 hover:bg-primary/10 hover:text-primary disabled:opacity-20 transition-all border border-secondary-container/10 disabled:cursor-not-allowed bg-surface-container-low shadow-md cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Session Inspection Block */}
      {activeSession && (
        <div className="glass-card p-6 space-y-8 animate-in fade-in duration-500 relative overflow-hidden mt-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(208,188,255,0.01),transparent)]"></div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-secondary-container/10 relative z-10">
            <div>
              <span className="text-[8px] font-black text-primary uppercase tracking-[0.3em] mb-1 block">Reviewing Performance Session</span>
              <h3 className="text-xl font-black text-on-surface uppercase tracking-tight">
                {activeSession.workoutPlan?.client?.fullName} &mdash; {activeSession.workoutPlan?.title}
              </h3>
            </div>
            <button 
              onClick={() => setActiveSessionId(null)}
              className="text-[9px] font-black text-on-surface-variant/60 hover:text-error uppercase tracking-widest flex items-center gap-1 cursor-pointer bg-surface-container-high/40 border border-secondary-container/5 px-4 py-2 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
              Cancel Review
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 relative z-10">
            {groupedExercises.map((actualEx: any, exIdx: number) => {
              return (
                <div key={exIdx} className="bg-surface-container-low/40 border border-secondary-container/5 rounded-3xl overflow-hidden shadow-xl group/ex hover:border-primary/20 transition-all">
                  <div className="bg-surface-container-high/20 px-6 py-3 border-b border-secondary-container/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shadow-lg">
                          <span className="material-symbols-outlined text-[18px]">terminal</span>
                       </div>
                       <div>
                          <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] mb-0.5 block">Objective</span>
                          <h5 className="text-base font-black text-on-surface uppercase tracking-tight">{actualEx.exerciseName}</h5>
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
                        {actualEx.sets.map((set: any, sIdx: number) => {
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
                   Athlete Log Notes
                </h4>
                <div className="space-y-6">
                  <div className="relative pl-4 border-l-2 border-primary/20">
                    <span className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1 block">Athlete Overview</span>
                    <p className="text-sm italic text-on-surface-variant/80 leading-relaxed font-bold">"{activeSession.clientNotes || 'No notes provided by athlete'}"</p>
                  </div>
                  <div className="relative pl-4 border-l-2 border-error/20">
                    <span className="text-[8px] font-black text-error uppercase tracking-widest mb-1 block opacity-60">Inhibitors / Struggles</span>
                    <p className="text-sm italic text-on-surface-variant/80 leading-relaxed font-bold">"{activeSession.clientStruggles || 'No struggles flagged'}"</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-surface-container-low/60 border border-primary/10 p-6 rounded-[32px] shadow-2xl relative group/input">
                <div className="absolute -top-3 -left-2 bg-primary text-on-primary px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">Coach Review Node</div>
                <textarea 
                  className="w-full bg-surface-container-high/40 border border-secondary-container/10 rounded-2xl p-4 text-sm font-bold text-on-surface focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/10 min-h-[140px] shadow-inner italic"
                  placeholder="Analyze biomechanical delta. Publish tactical corrections..."
                  value={trainerFeedback}
                  onChange={(e) => setTrainerFeedback(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-surface-container-low/40 border border-secondary-container/10 p-6 rounded-[32px] flex flex-col justify-between shadow-xl relative overflow-hidden group/rating">
              <div className="text-center relative z-10">
                <h4 className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em] mb-4">Compliance Rating</h4>
                <div className="relative inline-block mb-4 group/number">
                   <span className="text-6xl font-black text-on-surface leading-none relative z-10 tracking-tighter transition-all group-hover/number:scale-105 block">{trainerRating || '0'}</span>
                   <span className="text-xs text-primary/40 font-black absolute -top-1 -right-4 z-10">IDX</span>
                </div>
                <div className="flex gap-2 justify-center mb-6">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star} 
                      onClick={() => setTrainerRating(star)}
                      className={`material-symbols-outlined text-[28px] transition-all duration-300 hover:scale-125 cursor-pointer ${star <= trainerRating ? 'text-primary fill drop-shadow-md' : 'text-on-surface-variant/5'}`}
                    >
                      grade
                    </button>
                  ))}
                </div>
                <p className="text-[8px] font-black text-on-surface-variant/20 uppercase tracking-widest italic px-4 leading-relaxed">Establish compliance rating.</p>
              </div>
              
              <div className="space-y-3 pt-6 border-t border-secondary-container/5 relative z-10">
                <button 
                  onClick={handleReviewSubmit}
                  disabled={isSubmitting || !trainerFeedback.trim() || trainerRating === 0}
                  className="w-full py-4 bg-primary text-on-primary text-[9px] font-black uppercase tracking-[0.3em] rounded-xl hover:brightness-110 shadow-xl shadow-primary/20 transition-all disabled:opacity-10 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">sync</span>
                  {isSubmitting ? 'Syncing...' : 'Publish Review'}
                </button>
                <button 
                  onClick={() => setActiveSessionId(null)}
                  className="w-full py-4 bg-surface-container-high/40 border border-secondary-container/5 text-on-surface-variant/60 text-[9px] font-black uppercase tracking-[0.3em] rounded-xl hover:text-primary transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                   Close Detail
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
