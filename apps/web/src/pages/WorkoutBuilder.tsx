import React, { useState } from 'react';
import exercisesData from '../data/exercises.json';
import NotificationModal from '../components/NotificationModal';

type Exercise = {
  id: string;
  name: string;
  description: string;
  steps: string[];
  equipmentId: string;
  image?: string;
};

type WorkoutExerciseSet = {
  id: string;
  type: 'Warmup' | 'Working' | 'Failure';
  weight: string;
  reps: string;
  rest: string;
};

type WorkoutExercise = {
  id: string;
  exerciseId: string;
  name: string;
  sets: WorkoutExerciseSet[];
  notes: string;
};

const WorkoutBuilder: React.FC = () => {
  const [templateName, setTemplateName] = useState("Hypertrophy Push Day");
  const [description, setDescription] = useState("Focus on chest, shoulders, and triceps volume.");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isSaving, setIsSaving] = useState(false);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);

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

  const categories = ["All", "Barbell", "Dumbbell", "Cable", "Machine"];
  const filteredLibrary = (exercisesData as Exercise[]).filter(ex => 
    (selectedCategory === "All" || ex.name.toLowerCase().includes(selectedCategory.toLowerCase())) &&
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  const addExerciseToWorkout = (ex: Exercise) => {
    const newEx: WorkoutExercise = {
      id: `we-${Date.now()}`,
      exerciseId: ex.id,
      name: ex.name,
      sets: [{ id: `s-${Date.now()}`, type: 'Working', weight: '', reps: '10', rest: '60s' }],
      notes: ''
    };
    setWorkoutExercises([...workoutExercises, newEx]);
  };

  const copyExercise = (workoutEx: WorkoutExercise) => {
    const copiedEx: WorkoutExercise = {
      ...workoutEx,
      id: `we-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      sets: workoutEx.sets.map(s => ({ ...s, id: `s-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` }))
    };
    setWorkoutExercises([...workoutExercises, copiedEx]);
  };

  const removeExercise = (id: string) => {
    setModalConfig({
      isOpen: true,
      title: 'Remove Block?',
      message: 'This exercise block and all its set parameters will be purged from the current blueprint.',
      type: 'danger',
      onConfirm: () => {
        setWorkoutExercises(prev => prev.filter(ex => ex.id !== id));
        closeModal();
      }
    });
  };

  const addSet = (workoutExId: string) => {
    setWorkoutExercises(workoutExercises.map(ex => {
      if (ex.id === workoutExId) {
        return {
          ...ex,
          sets: [...ex.sets, { id: `s-${Date.now()}`, type: 'Working', weight: '', reps: '10', rest: '60s' }]
        };
      }
      return ex;
    }));
  };

  const removeSet = (workoutExId: string, setId: string) => {
    setWorkoutExercises(workoutExercises.map(ex => {
      if (ex.id === workoutExId) {
        return { ...ex, sets: ex.sets.filter(s => s.id !== setId) };
      }
      return ex;
    }));
  };

  const handleSaveTemplate = (isGlobal: boolean) => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setModalConfig({
        isOpen: true,
        title: 'Registry Updated',
        message: `Protocol has been successfully ${isGlobal ? 'published to the global movement library' : 'saved to your private blueprints'}.`,
        type: 'success',
        onConfirm: closeModal
      });
    }, 800);
  };

  return (
    <div className="w-full flex flex-col lg:flex-row h-[calc(100vh-140px)] overflow-hidden rounded-[var(--radius-xl)] border border-secondary-container/10 bg-background shadow-2xl relative">
      {/* Left Sidebar: Exercise Library */}
      <aside className="w-full lg:w-60 bg-surface-container-low/40 border-r border-secondary-container/10 flex flex-col shrink-0 overflow-hidden z-20 backdrop-blur-xl">
        <div className="p-4 border-b border-secondary-container/10 bg-surface-container-high/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-on-surface uppercase tracking-tight leading-none">Library</h2>
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shadow-lg">
               <span className="material-symbols-outlined text-primary text-[16px]">database</span>
            </div>
          </div>
          <div className="relative mb-3">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-[14px]">hub</span>
            <input
              type="text"
              className="w-full bg-surface-container-low/60 border border-secondary-container/20 rounded-lg py-2 pl-9 pr-3 text-[10px] font-bold text-on-surface focus:border-primary/40 focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-on-surface-variant/20 shadow-inner uppercase tracking-tight"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap shadow-sm cursor-pointer ${
                  selectedCategory === cat 
                    ? 'bg-primary text-on-primary border-primary shadow-lg' 
                    : 'bg-surface-container-high/40 text-on-surface-variant/40 border-secondary-container/10 hover:text-on-surface transition-all'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
          {filteredLibrary.map(ex => (
            <div
              key={ex.id}
              onClick={() => addExerciseToWorkout(ex)}
              className="bg-surface-container-high/20 border border-secondary-container/10 p-2.5 rounded-xl flex items-center gap-3 cursor-pointer hover:border-primary/40 hover:bg-surface-container-high/40 transition-all group shadow-sm"
            >
              <div className="h-9 w-9 rounded-lg bg-surface-container-high/60 flex items-center justify-center border border-secondary-container/10 group-hover:border-primary/20 transition-all shadow-md overflow-hidden">
                <span className="material-symbols-outlined text-primary/20 group-hover:text-primary transition-all text-[18px]">fitness_center</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[10px] font-black text-on-surface uppercase tracking-tight truncate leading-none mb-1">{ex.name}</h3>
                <span className="text-[7px] font-black text-on-surface-variant/40 uppercase tracking-widest leading-none block">Protocol</span>
              </div>
              <div className="w-5 h-5 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-inner">
                <span className="material-symbols-outlined text-primary text-[12px] font-black">add</span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Center: Template Canvas */}
      <section className="flex-1 bg-surface-container-low/40 overflow-y-auto p-6 no-scrollbar relative z-10">
        <div className="max-w-(--max-width-content) mx-auto space-y-(--spacing-section-gap) pb-10">
          {/* Canvas Header */}
          <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 border-b border-secondary-container/10 pb-6 relative">
            <div className="flex-1 relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-xl">
                   <span className="material-symbols-outlined text-primary text-[18px] fill">design_services</span>
                </div>
                <div>
                   <span className="bg-primary/20 text-primary text-[7px] px-2 py-0.5 rounded-full font-black uppercase tracking-[0.2em] border border-primary/30">Blueprint</span>
                </div>
              </div>
              <input
                className="w-full bg-transparent border-none focus:ring-0 text-2xl font-black text-on-surface py-1 outline-none uppercase tracking-tighter placeholder:opacity-5 h-auto leading-none mb-1"
                type="text"
                value={templateName}
                placeholder="UNTITLED"
                onChange={(e) => setTemplateName(e.target.value)}
              />
              <div className="flex items-start gap-4 text-on-surface-variant/40 group/desc">
                 <textarea
                  className="flex-1 bg-transparent border-none focus:ring-0 text-[10px] font-medium resize-none h-auto py-1 italic outline-none leading-relaxed placeholder:text-on-surface-variant/10 transition-all"
                  placeholder="Append objectives..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-row xl:flex-col gap-2 shrink-0 relative z-10">
              <button 
                onClick={() => handleSaveTemplate(false)}
                className="px-5 py-2.5 bg-surface-container-high/40 backdrop-blur-md border border-secondary-container/10 text-[8px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-surface-container-highest transition-all active:scale-95 shadow-lg group flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:rotate-12 transition-transform">inventory_2</span>
                Draft
              </button>
              <button 
                onClick={() => handleSaveTemplate(true)}
                disabled={isSaving}
                className="px-5 py-2.5 bg-primary text-on-primary text-[8px] font-black uppercase tracking-[0.2em] rounded-xl hover:brightness-110 disabled:opacity-50 transition-all shadow-xl shadow-primary/30 active:scale-95 group flex items-center gap-2 cursor-pointer"
              >
                <span className={`material-symbols-outlined text-[16px] ${isSaving ? 'animate-spin' : 'group-hover:-translate-y-0.5'} transition-transform`}>{isSaving ? 'sync' : 'rocket_launch'}</span>
                {isSaving ? 'Syncing...' : 'Deploy'}
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="space-y-(--spacing-card-gap)">
            {workoutExercises.map((workoutEx, idx) => (
              <div key={workoutEx.id} className="glass-card !p-0 overflow-hidden shadow-xl hover-card-motion group relative">
                {/* Block Header */}
                <div className="bg-surface-container-high/40 px-5 py-3 flex items-center justify-between border-b border-secondary-container/10 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-[10px] border border-primary/20 shadow-xl group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                      {idx + 1}
                    </div>
                    <div className="h-5 w-px bg-secondary-container/20"></div>
                    <div>
                       <span className="text-[7px] font-black text-primary uppercase tracking-[0.2em] mb-0.5 block leading-none">Module</span>
                       <h3 className="text-xs font-black text-on-surface uppercase tracking-tight leading-none group-hover:text-primary transition-colors">
                        {workoutEx.name}
                       </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => copyExercise(workoutEx)}
                      className="w-7 h-7 bg-surface-container-high/60 rounded-lg text-on-surface-variant/40 hover:text-primary transition-all flex items-center justify-center shadow-lg hover:-translate-y-0.5 border border-secondary-container/5 cursor-pointer"
                      title="Clone"
                    >
                      <span className="material-symbols-outlined text-[16px]">content_copy</span>
                    </button>
                    <button 
                      onClick={() => removeExercise(workoutEx.id)}
                      className="w-7 h-7 bg-surface-container-high/60 rounded-lg text-on-surface-variant/40 hover:text-error transition-all flex items-center justify-center shadow-lg hover:-translate-y-0.5 border border-secondary-container/5 cursor-pointer"
                      title="Remove"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                    </button>
                  </div>
                </div>
                {/* Block Body */}
                <div className="p-5 space-y-3 relative z-10">
                  <div className="grid grid-cols-[32px_1fr_70px_70px_70px_28px] gap-3 text-[7px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 px-3">
                    <div className="text-center">Idx</div>
                    <div>Intensity</div>
                    <div className="text-center">Load</div>
                    <div className="text-center">Volume</div>
                    <div className="text-center">Recovery</div>
                    <div></div>
                  </div>
                  
                  <div className="space-y-1.5">
                    {workoutEx.sets.map((set, sIdx) => (
                      <div key={set.id} className="grid grid-cols-[32px_1fr_70px_70px_70px_28px] gap-3 items-center bg-surface-container-high/20 px-3 py-1.5 rounded-xl border border-secondary-container/5 hover:border-primary/20 hover:bg-primary/[0.02] transition-all group/set shadow-sm">
                        <div className="text-center text-[10px] font-black text-on-surface-variant/10">#{sIdx + 1}</div>
                        <div className="relative">
                           <select className="w-full bg-surface-container-low/40 border border-secondary-container/10 rounded-lg px-2 py-1.5 text-[9px] font-black uppercase tracking-tight text-on-surface focus:border-primary/40 focus:ring-4 focus:ring-primary/5 outline-none cursor-pointer appearance-none shadow-sm">
                              <option>Working</option>
                              <option>Warmup</option>
                              <option>Failure</option>
                           </select>
                        </div>
                        <input className="bg-surface-container-low/40 border border-secondary-container/10 rounded-lg px-2 py-1.5 text-[9px] font-black text-on-surface focus:border-primary/40 outline-none text-center shadow-sm" placeholder="KG" defaultValue={set.weight} />
                        <input className="bg-surface-container-low/40 border border-secondary-container/10 rounded-lg px-2 py-1.5 text-[9px] font-black text-on-surface focus:border-primary/40 outline-none text-center shadow-sm" placeholder="REPS" defaultValue={set.reps} />
                        <input className="bg-surface-container-low/40 border border-secondary-container/10 rounded-lg px-2 py-1.5 text-[9px] font-black text-on-surface focus:border-primary/40 outline-none text-center shadow-sm" placeholder="REST" defaultValue={set.rest} />
                        <button 
                          onClick={() => removeSet(workoutEx.id, set.id)}
                          className="w-6 h-6 rounded-lg text-on-surface-variant/10 hover:text-error hover:bg-error/10 transition-all flex items-center justify-center opacity-0 group-hover/set:opacity-100 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2.5 items-center">
                    <button 
                      onClick={() => addSet(workoutEx.id)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 text-primary text-[7px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-primary hover:text-on-primary transition-all border border-primary/10 shadow-lg active:scale-95 group cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px] group-hover:rotate-90 transition-transform duration-500">add_circle</span>
                      Append
                    </button>
                    <div className="flex-1 bg-surface-container-high/20 rounded-lg border border-secondary-container/5 p-0.5 flex items-center px-3 shadow-inner">
                       <span className="material-symbols-outlined text-primary/20 mr-2 text-[14px]">terminal</span>
                       <input
                        className="flex-1 bg-transparent border-none text-[9px] font-bold text-on-surface italic placeholder:text-on-surface-variant/10 focus:ring-0 py-1 outline-none"
                        placeholder="Tactical cues..."
                        type="text"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {workoutExercises.length === 0 && (
              <div className="h-80 border-2 border-dashed border-secondary-container/10 rounded-[40px] flex flex-col items-center justify-center text-on-surface-variant gap-6 bg-surface-container-low/10 relative overflow-hidden group">
                <div className="w-24 h-24 rounded-[32px] bg-surface-container-high/40 flex items-center justify-center shadow-xl relative z-10 border border-secondary-container/10 group-hover:scale-105 transition-transform duration-500">
                  <span className="material-symbols-outlined text-[48px] text-primary/10 group-hover:text-primary/20 transition-colors">architecture</span>
                </div>
                <div className="text-center relative z-10">
                   <h4 className="text-xl font-black uppercase tracking-[0.3em] mb-2 text-on-surface opacity-10">Standby</h4>
                   <p className="text-xs font-medium italic text-on-surface-variant/40">Select movement modules to initialize blueprint.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Global Notification System */}
      <NotificationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        onCancel={closeModal}
        confirmLabel={modalConfig.type === 'danger' ? 'Purge' : 'Authorize'}
        cancelLabel="Abort"
      />
    </div>
  );
};

export default WorkoutBuilder;
