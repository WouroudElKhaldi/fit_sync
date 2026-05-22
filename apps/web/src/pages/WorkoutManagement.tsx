import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationModal from '../components/NotificationModal';

type WorkoutPlanDetail = {
  id: string;
  title: string;
  description: string | null;
  scheduledDate: string | null;
  clientId: string;
  client: {
    id: string;
    fullName: string;
  };
  exercises: any[];
  session: any | null;
};

const WorkoutManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [plans, setPlans] = useState<WorkoutPlanDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggerReload, setTriggerReload] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");

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

  // Load programs/plans
  useEffect(() => {
    if (!user) return;

    const fetchPlans = async () => {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('fitsync_token');
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      try {
        const response = await fetch(`http://localhost:3000/workouts/plans/trainer/${user.id}`, { headers });
        if (!response.ok) {
          throw new Error('Failed to synchronize workout database');
        }
        const data = await response.json();
        setPlans(data);
      } catch (err: any) {
        console.error('Error fetching plans:', err);
        setError(err.message || 'An error occurred while loading workouts.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, [user, triggerReload]);

  const filteredWorkouts = useMemo(() => {
    return plans.filter(plan => {
      const matchesSearch = plan.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (plan.client?.fullName && plan.client.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = filterType === "All" || plan.title.toLowerCase().includes(filterType.toLowerCase());
      return matchesSearch && matchesCategory;
    });
  }, [plans, searchQuery, filterType]);

  const totalPages = Math.ceil(filteredWorkouts.length / pageSize);

  const paginatedWorkouts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredWorkouts.slice(startIndex, startIndex + pageSize);
  }, [filteredWorkouts, currentPage, pageSize]);

  // Reset page number on search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType]);

  const stats = useMemo(() => {
    const activeWorkouts = plans.filter(p => !p.session?.completedAt).length;
    const completedWorkouts = plans.filter(p => p.session?.completedAt).length;
    return [
      { label: 'Active Pipeline', value: activeWorkouts, icon: 'fitness_center', color: 'primary' },
      { label: 'Completed Workouts', value: completedWorkouts, icon: 'trending_up', color: 'tertiary' },
      { label: 'Roster Utilization', value: `${plans.length > 0 ? Math.round((activeWorkouts / plans.length) * 100) : 0}%`, icon: 'bolt', color: 'emerald-500' },
      { label: 'Total Workouts', value: plans.length, icon: 'edit_square', color: 'error' },
    ];
  }, [plans]);

  const handleExport = () => {
    setModalConfig({
      isOpen: true,
      title: 'Initialize Data Export',
      message: 'The exercise library and workout plans are being compiled into an encrypted CSV archive.',
      type: 'info',
      onConfirm: closeModal
    });
  };

  const handleDeletePlan = (plan: WorkoutPlanDetail) => {
    setModalConfig({
      isOpen: true,
      title: 'Delete Workout?',
      message: `Are you sure you want to delete the workout "${plan.title}" for ${plan.client?.fullName || 'Athlete'}? This cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        closeModal();
        const token = localStorage.getItem('fitsync_token');
        try {
          const response = await fetch(`http://localhost:3000/workouts/plans/${plan.id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) throw new Error('Failed to delete workout');
          setTriggerReload(prev => prev + 1);
        } catch (err: any) {
          console.error(err);
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        <p className="text-on-surface-variant/60 font-bold uppercase tracking-widest text-xs">Accessing Workout Database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center max-w-md mx-auto">
        <span className="material-symbols-outlined text-error text-5xl">warning</span>
        <h2 className="text-xl font-bold">Workout Sync Failure</h2>
        <p className="text-on-surface-variant/60 text-sm">{error}</p>
        <button onClick={() => setTriggerReload(prev => prev + 1)} className="mt-4 px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs uppercase tracking-widest cursor-pointer">Retry Connection</button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-10 pb-10">
      {/* Top Header */}
      <div className="border-b border-secondary-container/10 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="font-black text-on-surface mb-2 tracking-tighter uppercase leading-none">
            Workout Architecture
          </h2>
          <blockquote className="text-on-surface-variant font-medium italic opacity-60">
            "Architect, manage, and publish your professional training ecosystem."
          </blockquote>
        </div>
        <button 
          onClick={() => navigate('/workout-builder')}
          className="bg-primary text-on-primary h-14 px-10 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-3 hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[22px]">add_circle</span>
          New Workout
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-surface-container-low/40 backdrop-blur-xl border border-secondary-container/10 p-8 rounded-[32px] shadow-xl hover-card-motion group relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(208,188,255,0.02),transparent)]"></div>
            <div className={`w-12 h-12 rounded-xl bg-surface-container-high/60 border border-secondary-container/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform shadow-lg relative z-10`}>
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
              placeholder="Search workouts..."
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
                <option value="Push">Push Pattern</option>
                <option value="Pull">Pull Pattern</option>
                <option value="Legs">Leg Patterns</option>
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary opacity-30 pointer-events-none text-[18px]">expand_more</span>
            </div>
            <button 
              onClick={handleExport}
              className="flex items-center gap-3 px-8 py-3 bg-surface-container-high/40 border border-secondary-container/5 text-on-surface-variant/60 hover:text-primary rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-surface-container-high transition-all shadow-sm active:scale-95 cursor-pointer"
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
                <th className="px-8 py-5 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Workout Title</th>
                <th className="px-8 py-5 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Subject Assigned</th>
                <th className="px-8 py-5 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Mechanical Spec</th>
                <th className="px-8 py-5 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Publish Schedule</th>
                <th className="px-8 py-5 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em] text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-container/5">
              {paginatedWorkouts.map((workout) => (
                <tr key={workout.id} className="hover:bg-primary/[0.02] transition-all group cursor-pointer" onClick={() => navigate(`/workout-builder?planId=${workout.id}`)}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-lg">
                        <span className="material-symbols-outlined text-[22px]">terminal</span>
                      </div>
                      <div>
                         <span className="text-base font-black text-on-surface block group-hover:text-primary transition-colors uppercase tracking-tight leading-none mb-1">{workout.title}</span>
                         <span className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest">{workout.description || 'No description spec'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-4 py-1 rounded-lg bg-primary/5 text-primary border border-primary/10 text-[9px] font-black uppercase tracking-widest shadow-sm">
                      {workout.client?.fullName || 'Athlete Profile'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">
                       {workout.exercises?.length ?? 0} Exercises Mod
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-on-surface-variant/60 font-black text-[11px] uppercase tracking-tight">
                       <span className="material-symbols-outlined text-[18px] opacity-30">schedule</span>
                       {workout.scheduledDate ? new Date(workout.scheduledDate).toLocaleDateString() : 'Unscheduled'}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => handleDeletePlan(workout)}
                      className="px-4 py-2 bg-surface-container-high/40 border border-error/20 hover:bg-error hover:text-white text-error text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredWorkouts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-5">
                      <span className="material-symbols-outlined text-[48px]">fitness_center</span>
                      <p className="text-lg font-black uppercase tracking-[0.5em]">No Workouts</p>
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
      </section>

      <NotificationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        onCancel={closeModal}
        confirmLabel={modalConfig.type === 'danger' ? 'Delete' : 'Authorize'}
      />
    </div>
  );
};

export default WorkoutManagement;
