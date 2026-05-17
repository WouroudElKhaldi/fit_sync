import React, { useState } from "react";
import equipmentData from "../data/equipment.json";
import NotificationModal from "../components/NotificationModal";

type Equipment = {
  id: string;
  name: string;
  description?: string;
  image?: string;
  status: "Available" | "Maintenance" | "In Use";
  category: string;
};

const EquipmentManagement: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>(
    (equipmentData as any[]).map((eq) => ({
      ...eq,
      description:
        eq.description ||
        "Professional grade facility asset optimized for high-performance training.",
      status: eq.status || "Available",
      category: eq.category || "Strength",
      image:
        eq.image ||
        "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80",
    })),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingEquipment, setViewingEquipment] = useState<Equipment | null>(
    null,
  );
  const [formData, setFormData] = useState<Partial<Equipment>>({
    name: "",
    description: "",
    category: "Strength",
    status: "Available",
  });

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "info" | "danger" | "warning" | "success";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: () => {},
  });

  const closeModal = () =>
    setModalConfig((prev) => ({ ...prev, isOpen: false }));

  const filteredEquipment = equipment.filter(
    (eq) =>
      eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSave = () => {
    if (editingId) {
      setEquipment((prev) =>
        prev.map((eq) =>
          eq.id === editingId ? ({ ...eq, ...formData } as Equipment) : eq,
        ),
      );
    } else {
      const newEq: Equipment = {
        id: `eq-${Date.now()}`,
        name: formData.name || "New Equipment",
        description: formData.description || "Facility asset description...",
        category: formData.category || "Strength",
        status: formData.status || "Available",
        image:
          "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80",
      };
      setEquipment([newEq, ...equipment]);
    }
    setShowAddPanel(false);
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      category: "Strength",
      status: "Available",
    });

    setModalConfig({
      isOpen: true,
      title: editingId ? "Registry Synchronized" : "Asset Registered",
      message:
        "The facility inventory has been updated and synchronized with the local management node.",
      type: "success",
      onConfirm: closeModal,
    });
  };

  const handleEdit = (eq: Equipment) => {
    setFormData(eq);
    setEditingId(eq.id);
    setShowAddPanel(true);
  };

  const handleDelete = (id: string) => {
    setModalConfig({
      isOpen: true,
      title: "Decommission Asset?",
      message:
        "This will permanently remove the equipment record from the facility database. This action cannot be reversed without manual re-entry.",
      type: "danger",
      onConfirm: () => {
        setEquipment((prev) => prev.filter((eq) => eq.id !== id));
        closeModal();
      },
    });
  };

  return (
    <div className="w-full space-y-[var(--spacing-section-gap)] pb-10 relative">
      {/* Header Section */}
      <div className="border-b border-secondary-container/20 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-on-surface mb-1 tracking-tighter uppercase leading-none">
            Facility Inventory
          </h2>
          <p className="text-xs text-on-surface-variant font-medium italic opacity-60">
            "Manage and monitor your premium facility hardware assets."
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              name: "",
              description: "",
              category: "Strength",
              status: "Available",
            });
            setShowAddPanel(true);
          }}
          className="bg-primary text-on-primary h-12 px-8 rounded-xl font-black uppercase tracking-widest flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-2xl shadow-primary/30 text-[10px]"
        >
          <span className="material-symbols-outlined text-[20px]">add_box</span>
          Register Asset
        </button>
      </div>

      {/* Main Table View */}
      <section className="glass-card !p-0 overflow-hidden shadow-2xl relative">
        <div className="p-6 border-b border-secondary-container/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-high/40 backdrop-blur-md">
          <div className="relative max-w-md w-full">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-[18px]">
              search
            </span>
            <input
              type="text"
              className="w-full bg-surface-container-low border border-secondary-container/20 rounded-xl pl-12 pr-4 py-2.5 text-[11px] font-bold text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-inner uppercase tracking-tight"
              placeholder="Filter inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="px-4 py-2 bg-primary/10 rounded-xl border border-primary/20 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span className="text-[8px] font-black text-primary uppercase tracking-widest">
                {equipment.length} Hardware Modules
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-surface-container-highest/10 border-b border-secondary-container/10">
                <th className="px-6 py-4 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em]">
                  Asset Dossier
                </th>
                <th className="px-6 py-4 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em]">
                  Classification
                </th>
                <th className="px-6 py-4 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em] text-center">
                  Operational
                </th>
                <th className="px-6 py-4 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em] text-right">
                  Operations
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-container/5">
              {filteredEquipment.map((eq) => (
                <tr
                  key={eq.id}
                  className="hover:bg-primary/[0.02] transition-all group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-surface-container-high overflow-hidden border border-secondary-container/10 group-hover:border-primary/40 transition-all shadow-xl group-hover:scale-105 duration-500 shrink-0">
                        <img
                          src={eq.image}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                          alt=""
                        />
                      </div>
                      <div>
                        <span className="text-sm font-black text-on-surface block group-hover:text-primary transition-colors uppercase tracking-tight leading-none mb-1">
                          {eq.name}
                        </span>
                        <span className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest">
                          FAC-{eq.id.toUpperCase().slice(0, 8)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-secondary-container/20 text-on-surface-variant text-[8px] font-black uppercase tracking-widest rounded-lg border border-secondary-container/10 shadow-sm">
                      {eq.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            eq.status === "Available"
                              ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                              : eq.status === "Maintenance"
                                ? "bg-error shadow-[0_0_8px_rgba(255,180,171,0.4)]"
                                : "bg-amber-500 shadow-[0_0_8px_rgba(255,184,105,0.4)]"
                          }`}
                        ></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-on-surface">
                          {eq.status}
                        </span>
                      </div>
                      <div className="w-16 h-1 bg-surface-container-highest rounded-full overflow-hidden">
                        <div
                          className={`h-full ${eq.status === "Available" ? "bg-emerald-500 w-full" : eq.status === "Maintenance" ? "bg-error w-1/4" : "bg-amber-500 w-2/3"}`}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setViewingEquipment(eq)}
                        className="w-9 h-9 rounded-xl bg-surface-container-high border border-secondary-container/10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-all shadow-lg active:scale-90"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          visibility
                        </span>
                      </button>
                      <button
                        onClick={() => handleEdit(eq)}
                        className="w-9 h-9 rounded-xl bg-surface-container-high border border-secondary-container/10 flex items-center justify-center text-on-surface-variant hover:text-amber-400 transition-all shadow-lg active:scale-90"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          edit_square
                        </span>
                      </button>
                      <button
                        onClick={() => handleDelete(eq.id)}
                        className="w-9 h-9 rounded-xl bg-surface-container-high border border-secondary-container/10 flex items-center justify-center text-on-surface-variant hover:text-error transition-all shadow-lg active:scale-90"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          delete_sweep
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Asset Viewer Modal */}
      {viewingEquipment && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-xl z-100 flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setViewingEquipment(null)}
        >
          <div
            className="bg-surface-container-low border border-secondary-container/20 rounded-[32px] p-8 w-full max-w-2xl shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in zoom-in slide-in-from-bottom-8 duration-500 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-black text-on-surface uppercase tracking-tighter leading-none mb-1">
                  {viewingEquipment.name}
                </h3>
                <p className="text-[8px] font-black text-primary uppercase tracking-widest">
                  {viewingEquipment.category} System Spec • FAC-
                  {viewingEquipment.id.slice(0, 8)}
                </p>
              </div>
              <button
                onClick={() => setViewingEquipment(null)}
                className="w-10 h-10 rounded-xl bg-surface-container-high hover:bg-error/10 hover:text-error flex items-center justify-center transition-all shadow-2xl active:scale-90 border border-secondary-container/10"
              >
                <span className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative group/image">
                <img
                  src={viewingEquipment.image}
                  className="w-full h-64 object-cover rounded-2xl border border-secondary-container/10 shadow-2xl transition-transform duration-700 group-hover/image:scale-105"
                  alt=""
                />
                <div className="absolute top-3 right-3 px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-white text-[8px] font-black uppercase tracking-widest shadow-xl border border-white/10">
                  Live Telemetry
                </div>
              </div>

              <div className="space-y-6 flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="bg-surface-container-high/40 p-6 rounded-2xl border border-secondary-container/5 shadow-inner">
                    <h4 className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest mb-3 flex items-center gap-2 opacity-60">
                      <span className="material-symbols-outlined text-[16px]">
                        terminal
                      </span>
                      Intelligence Summary
                    </h4>
                    <p className="text-on-surface text-[11px] font-medium leading-relaxed italic">
                      "{viewingEquipment.description}"
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface-container-high/40 p-4 rounded-xl border border-secondary-container/5 shadow-md">
                      <h4 className="text-[7px] font-black text-on-surface-variant uppercase tracking-widest mb-1 opacity-40">
                        System Status
                      </h4>
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${viewingEquipment.status === "Available" ? "bg-emerald-500" : "bg-amber-500"}`}
                        ></div>
                        <span className="text-xs font-black text-on-surface uppercase tracking-tighter">
                          {viewingEquipment.status}
                        </span>
                      </div>
                    </div>
                    <div className="bg-surface-container-high/40 p-4 rounded-xl border border-secondary-container/5 shadow-md">
                      <h4 className="text-[7px] font-black text-on-surface-variant uppercase tracking-widest mb-1 opacity-40">
                        Neural Sync
                      </h4>
                      <span className="text-xs font-black text-on-surface uppercase tracking-tighter">
                        Verified
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setViewingEquipment(null)}
                  className="w-full py-3.5 bg-surface-container-highest border border-secondary-container/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all shadow-xl active:scale-95"
                >
                  Purge Dossier Access
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {
        /* Slide-over Asset Registrar */
        <>
          <aside
            className={`fixed right-0 top-0 h-full w-full sm:w-[450px] bg-surface-container-low border-l border-secondary-container/20 z-110 flex flex-col p-8 transition-transform duration-700 shadow-[0_0_100px_rgba(0,0,0,0.5)] backdrop-blur-xl bg-opacity-95 ${showAddPanel ? "translate-x-0" : "translate-x-full"}`}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-on-surface uppercase tracking-tighter leading-none mb-1">
                  {editingId ? "Modify Asset" : "Register Asset"}
                </h2>
                <span className="text-[8px] font-black text-primary uppercase tracking-widest leading-none block">
                  Inventory Management Protocol
                </span>
              </div>
              <button
                onClick={() => setShowAddPanel(false)}
                className="w-10 h-10 rounded-xl hover:bg-error/10 hover:text-error text-on-surface-variant transition-all flex items-center justify-center border border-secondary-container/10 shadow-lg active:scale-90"
              >
                <span className="material-symbols-outlined text-[24px]">
                  close
                </span>
              </button>
            </div>

            <div className="flex-1 space-y-8 pr-2 no-scrollbar overflow-y-auto">
              <div className="space-y-3">
                <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest px-3 border-l-2 border-primary">
                  Nomenclature
                </label>
                <input
                  className="w-full bg-surface-container-high/60 border border-secondary-container/20 rounded-xl py-3 px-6 text-on-surface font-black text-base focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none shadow-inner uppercase tracking-tight"
                  placeholder="ROGUE_POWER_RACK"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest px-3 border-l-2 border-primary">
                  Classification
                </label>
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full bg-surface-container-high/60 border border-secondary-container/20 rounded-xl py-3 px-6 text-on-surface font-black text-xs focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all cursor-pointer appearance-none shadow-inner uppercase tracking-widest"
                  >
                    <option value="Strength">Strength Pattern</option>
                    <option value="Cardio">Cardiovascular</option>
                    <option value="Mobility">Mobility & Flex</option>
                    <option value="Storage">Storage Solution</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary opacity-40 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest px-3 border-l-2 border-primary">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full bg-surface-container-high/60 border border-secondary-container/20 rounded-xl py-3 px-6 text-on-surface font-black text-xs focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all cursor-pointer appearance-none shadow-inner uppercase tracking-widest"
                  >
                    <option value="Available">Available (Active)</option>
                    <option value="In Use">Occupied (Session Active)</option>
                    <option value="Maintenance">Decommissioned (Repair)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary opacity-40 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest px-3 border-l-2 border-primary">
                  Intelligence Summary
                </label>
                <textarea
                  className="w-full bg-surface-container-high/60 border border-secondary-container/20 rounded-[24px] py-4 px-6 text-on-surface font-bold text-xs focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none h-40 leading-relaxed shadow-inner italic"
                  placeholder="Asset specifications..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="pt-8 flex gap-4 border-t border-secondary-container/20 mt-8 bg-surface-container-low">
              <button
                onClick={() => setShowAddPanel(false)}
                className="flex-1 py-4 bg-surface-container-high text-on-surface text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-surface-bright transition-all shadow-lg active:scale-95"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                className="flex-[2] py-4 bg-primary text-on-primary text-[9px] font-black uppercase tracking-widest rounded-xl hover:brightness-110 shadow-2xl shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">
                  verified
                </span>
                Sync Registry
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
            confirmLabel={
              modalConfig.type === "danger" ? "Decommission" : "Confirm"
            }
          />
        </>
      }
    </div>
  );
};

export default EquipmentManagement;
