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

const ExerciseManagement: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>(exercisesData as Exercise[]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingExercise, setViewingExercise] = useState<Exercise | null>(null);
  const [newExercise, setNewExercise] = useState<Partial<Exercise>>({
    name: '',
    description: '',
    steps: [''],
  });

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

  const filteredExercises = exercises.filter(ex =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ex.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddStep = () => {
    setNewExercise({ ...newExercise, steps: [...(newExercise.steps || []), ''] });
  };

  const handleSaveExercise = () => {
    if (editingId) {
       setExercises(prev => prev.map(ex => ex.id === editingId ? { ...ex, ...newExercise } as Exercise : ex));
    } else {
      const ex: Exercise = {
        id: `ex-${Date.now()}`,
        name: newExercise.name || 'Untitled Exercise',
        description: newExercise.description || '',
        steps: newExercise.steps?.filter(s => s.trim() !== '') || [],
        equipmentId: 'eq-1',
      };
      setExercises([ex, ...exercises]);
    }
    setShowAddPanel(false);
    setEditingId(null);
    setNewExercise({ name: '', description: '', steps: [''] });

    setModalConfig({
      isOpen: true,
      title: editingId ? 'Protocol Synchronized' : 'Protocol Created',
      message: 'The movement mechanics and execution steps have been updated in the global movement library.',
      type: 'success',
      onConfirm: closeModal
    });
  };

  const handleEdit = (ex: Exercise) => {
    setNewExercise(ex);
    setEditingId(ex.id);
    setShowAddPanel(true);
  };

  const handleDelete = (id: string) => {
    setModalConfig({
      isOpen: true,
      title: 'Purge Protocol?',
      message: 'This will permanently remove this movement protocol from the library. All routines referencing this exercise may lose metadata.',
      type: 'danger',
      onConfirm: () => {
        setExercises(prev => prev.filter(ex => ex.id !== id));
        closeModal();
      }
    });
  };

  return (
    <div className="w-full space-y-[var(--spacing-section-gap)] pb-10 relative">
      {/* Page Header */}
      <div className="border-b border-secondary-container/20 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-on-surface mb-1 tracking-tighter uppercase leading-none">Kinesiology Library</h2>
          <p className="text-xs text-on-surface-variant font-medium italic opacity-60">"Standardize training movements with elite biomechanical protocols."</p>
        </div>
        <button
          onClick={() => {
            setNewExercise({ name: '', description: '', steps: [''] });
            setEditingId(null);
            setShowAddPanel(true);
          }}
          className="bg-primary text-on-primary h-12 px-8 rounded-xl font-black uppercase tracking-widest flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-2xl shadow-primary/30 text-[10px]"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Create Protocol
        </button>
      </div>

      {/* Main Table Interface */}
      <section className="glass-card !p-0 overflow-hidden shadow-2xl relative">
        <div className="p-6 border-b border-secondary-container/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-high/40 backdrop-blur-md">
          <div className="relative max-w-md w-full">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-[18px]">search</span>
            <input
              type="text"
              className="w-full bg-surface-container-low border border-secondary-container/20 rounded-xl pl-12 pr-4 py-2.5 text-[11px] font-bold text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-inner uppercase tracking-tight"
              placeholder="Filter library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
             <div className="px-4 py-2 bg-primary/10 rounded-xl border border-primary/20 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                <span className="text-[8px] font-black text-primary uppercase tracking-widest">{exercises.length} Modules</span>
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-surface-container-highest/10 border-b border-secondary-container/10">
                <th className="px-6 py-4 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Movement</th>
                <th className="px-6 py-4 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Tier</th>
                <th className="px-6 py-4 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Complexity</th>
                <th className="px-6 py-4 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em] text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-container/5">
              {filteredExercises.map((ex) => (
                <tr key={ex.id} className="hover:bg-primary/[0.02] transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-high overflow-hidden border border-secondary-container/10 group-hover:border-primary/40 transition-all shadow-xl shrink-0">
                        {ex.image ? (
                          <img src={ex.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary/40 bg-linear-to-br from-primary/5 to-transparent">
                             <span className="material-symbols-outlined text-[24px]">fitness_center</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-black text-on-surface block group-hover:text-primary transition-colors uppercase tracking-tight leading-none mb-1">{ex.name}</span>
                        <span className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest">ID: {ex.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                       <span className="px-3 py-1 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest rounded-lg border border-primary/20 shadow-sm">Tier I</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <div className="w-20 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-2/3 shadow-[0_0_8px_rgba(208,188,255,0.4)]"></div>
                       </div>
                       <span className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest">{ex.steps.length} Steps</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setViewingExercise(ex)}
                        className="w-9 h-9 rounded-xl bg-surface-container-high border border-secondary-container/10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-all shadow-lg active:scale-90"
                      >
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                      <button 
                        onClick={() => handleEdit(ex)}
                        className="w-9 h-9 rounded-xl bg-surface-container-high border border-secondary-container/10 flex items-center justify-center text-on-surface-variant hover:text-amber-400 transition-all shadow-lg active:scale-90"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit_square</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(ex.id)}
                        className="w-9 h-9 rounded-xl bg-surface-container-high border border-secondary-container/10 flex items-center justify-center text-on-surface-variant hover:text-error transition-all shadow-lg active:scale-90"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Protocol Viewer Overlay */}
      {viewingExercise && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setViewingExercise(null)}>
           <div className="bg-surface-container-low border border-secondary-container/20 rounded-[32px] p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in zoom-in slide-in-from-bottom-8 duration-500 relative no-scrollbar" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-8">
                 <div>
                    <h3 className="text-2xl font-black text-on-surface uppercase tracking-tighter leading-none mb-1">{viewingExercise.name}</h3>
                    <p className="text-[8px] font-black text-primary uppercase tracking-widest">Protocol Intel / {viewingExercise.id.slice(0, 8)}</p>
                 </div>
                 <button onClick={() => setViewingExercise(null)} className="w-10 h-10 rounded-xl bg-surface-container-high hover:bg-error/10 hover:text-error flex items-center justify-center transition-all shadow-2xl active:scale-90 border border-secondary-container/10">
                   <span className="material-symbols-outlined text-[20px]">close</span>
                 </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div>
                    {viewingExercise.image ? (
                       <img src={viewingExercise.image} className="w-full h-64 object-cover rounded-2xl border border-secondary-container/10 shadow-2xl" alt="" />
                    ) : (
                       <div className="w-full h-64 rounded-2xl bg-surface-container-high flex flex-col items-center justify-center gap-3 border border-secondary-container/10 shadow-inner">
                          <span className="material-symbols-outlined text-4xl text-primary/10">fitness_center</span>
                          <span className="text-[8px] font-black text-on-surface-variant/20 uppercase tracking-widest text-center">Media Missing</span>
                       </div>
                    )}
                    <div className="mt-6 p-6 bg-surface-container-high/40 rounded-2xl border border-secondary-container/10">
                       <h4 className="text-[8px] font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px]">info</span>
                          Mechanism
                       </h4>
                       <p className="text-on-surface text-xs leading-relaxed font-medium italic opacity-70">"{viewingExercise.description}"</p>
                    </div>
                 </div>
                 
                 <div className="space-y-6">
                    <h4 className="text-[8px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                       <span className="material-symbols-outlined text-[16px]">list_alt</span>
                       Protocol
                    </h4>
                    <div className="space-y-3">
                       {viewingExercise.steps.map((step, i) => (
                          <div key={i} className="flex gap-4 items-start p-4 bg-surface-container-high/60 rounded-xl border border-secondary-container/5 hover:border-primary/20 transition-all group/step shadow-inner">
                             <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-sm shrink-0 border border-primary/20 group-hover/step:scale-110 transition-transform">
                                {i + 1}
                             </span>
                             <p className="text-on-surface font-bold text-[11px] leading-relaxed pt-1">{step}</p>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
              <button onClick={() => setViewingExercise(null)} className="w-full mt-8 py-3.5 rounded-xl bg-surface-container-highest border border-secondary-container/10 text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all shadow-xl active:scale-95">Purge Viewport</button>
           </div>
        </div>
      )}

      {/* Editor Slide-over */}
      <aside
        className={`fixed right-0 top-0 h-full w-full sm:w-[450px] bg-surface-container-low border-l border-secondary-container/20 z-[110] flex flex-col p-8 transition-transform duration-700 shadow-[0_0_100px_rgba(0,0,0,0.5)] backdrop-blur-xl bg-opacity-95 ${
          showAddPanel ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-on-surface uppercase tracking-tighter leading-none mb-1">{editingId ? 'Edit Protocol' : 'New Protocol'}</h2>
            <span className="text-[8px] font-black text-primary uppercase tracking-widest leading-none block">Standardize movement logic</span>
          </div>
          <button onClick={() => setShowAddPanel(false)} className="w-10 h-10 rounded-xl hover:bg-error/10 hover:text-error text-on-surface-variant transition-all flex items-center justify-center border border-secondary-container/10 shadow-lg active:scale-90"><span className="material-symbols-outlined text-[24px]">close</span></button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-8 pr-2 no-scrollbar">
          <div className="w-full h-48 rounded-[24px] border-2 border-dashed border-secondary-container/20 bg-surface-container-high/40 flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group shadow-inner">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
               <span className="material-symbols-outlined text-3xl text-primary opacity-40 group-hover:opacity-100 transition-opacity">cloud_upload</span>
            </div>
            <div className="text-center">
               <span className="text-[10px] font-black uppercase tracking-widest text-on-surface block mb-0.5">Media Intel</span>
               <span className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest">H.264 / RAW Biometric</span>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest px-3 border-l-2 border-primary">Pattern</label>
              <input
                className="w-full bg-surface-container-high/60 border border-secondary-container/20 rounded-xl py-3 px-6 text-on-surface font-black text-base focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none uppercase tracking-tight shadow-inner"
                placeholder="BARBELL_BACK_SQUAT"
                value={newExercise.name}
                onChange={e => setNewExercise({ ...newExercise, name: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest px-3 border-l-2 border-primary">Mechanism</label>
              <textarea
                className="w-full bg-surface-container-high/60 border border-secondary-container/20 rounded-[24px] py-4 px-6 text-on-surface font-bold text-xs focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none min-h-[120px] leading-relaxed italic shadow-inner"
                placeholder="Analyze mechanics..."
                value={newExercise.description}
                onChange={e => setNewExercise({ ...newExercise, description: e.target.value })}
              />
            </div>
            <div className="space-y-4">
              <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest px-3 border-l-2 border-primary">Intervals</label>
              <div className="space-y-3">
                {newExercise.steps?.map((step, i) => (
                  <div key={i} className="flex gap-4 items-center group/step">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs shrink-0 border border-primary/20 shadow-md group-hover/step:bg-primary group-hover/step:text-on-primary transition-all">
                       {i + 1}
                    </div>
                    <input
                      className="flex-1 bg-transparent border-b border-secondary-container/10 focus:border-primary outline-none py-2 text-sm font-bold text-on-surface transition-all placeholder:opacity-20"
                      placeholder="Define execution..."
                      value={step}
                      onChange={e => {
                        const newSteps = [...(newExercise.steps || [])];
                        newSteps[i] = e.target.value;
                        setNewExercise({ ...newExercise, steps: newSteps });
                      }}
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddStep}
                className="w-full py-3 bg-primary/5 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                Append
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 flex gap-4 border-t border-secondary-container/20 mt-8 bg-surface-container-low">
          <button onClick={() => setShowAddPanel(false)} className="flex-1 py-4 bg-surface-container-high text-on-surface text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-surface-bright transition-all shadow-lg active:scale-95">Discard</button>
          <button onClick={handleSaveExercise} className="flex-[2] py-4 bg-primary text-on-primary text-[9px] font-black uppercase tracking-widest rounded-xl hover:brightness-110 shadow-2xl shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-2">
             <span className="material-symbols-outlined text-[18px]">verified</span>
             Commit
          </button>
        </div>
      </aside>

      <NotificationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        onCancel={closeModal}
        confirmLabel={modalConfig.type === 'danger' ? 'Purge Data' : 'Initialize'}
      />
    </div>
  );
};

export default ExerciseManagement;
