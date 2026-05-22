import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TrainerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, updateUserLocal } = useAuth();
  
  const targetId = id || user?.id;
  
  const [trainerData, setTrainerData] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [clientFilter, setClientFilter] = useState<'active' | 'past'>('active');
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic Data Lists
  const [completedSessions, setCompletedSessions] = useState<any[]>([]);
  const [scheduledPlans, setScheduledPlans] = useState<any[]>([]);

  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    role: '',
    bio: '',
    education: '',
    certifications: '',
    specialties: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchProfileAndClients = async () => {
    if (!targetId) return;
    setIsLoading(true);
    const token = localStorage.getItem('fitsync_token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [profileRes, clientsRes, sessionsRes, plansRes] = await Promise.all([
        fetch(`http://localhost:3000/users/${targetId}`, { headers }),
        fetch(`http://localhost:3000/trainers/clients?trainerId=${targetId}`, { headers }),
        fetch(`http://localhost:3000/workouts/sessions/trainer/${targetId}`, { headers }),
        fetch(`http://localhost:3000/workouts/plans/trainer/${targetId}`, { headers })
      ]);

      if (profileRes.ok) {
        const pData = await profileRes.json();
        setTrainerData(pData);
      }
      if (clientsRes.ok) {
        setClients(await clientsRes.json());
      }
      if (sessionsRes.ok) {
        const sData = await sessionsRes.json();
        // Completed sessions have completedAt field filled
        setCompletedSessions(sData.filter((s: any) => s.completedAt));
      }
      if (plansRes.ok) {
        setScheduledPlans(await plansRes.json());
      }
    } catch (err) {
      console.error('Failed to sync profile data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndClients();
  }, [targetId]);

  const activeUser = trainerData || user;
  const isTrainer = activeUser?.role === 'TRAINER';
  const trainerProfile = activeUser?.trainerProfile || {};
  const rating = trainerProfile.rating || '5.0';
  const bio = trainerProfile.bio || activeUser?.bio || 'Smashing physical milestones and building peak health.';
  const education = trainerProfile.education || 'Elite Athletic Program – FitSync Systems';
  const certifications = trainerProfile.certifications || ['FITSYNC-ATHLETE'];
  const specialties = trainerProfile.specialties || ['Strength', 'Conditioning'];

  const educationParts = education.split(' – ');
  const educationDegree = educationParts[0] || 'B.S. Sports Science';
  const educationSchool = educationParts[1] || 'University of Performance Athletics';

  // Active vs Past clients logic
  const displayedClients = clients.filter(c => {
    const isPast = c.status === 'past';
    return clientFilter === 'active' ? !isPast : isPast;
  });

  const handleStartEditing = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setEditForm({
      fullName: activeUser?.fullName || '',
      email: activeUser?.email || '',
      username: activeUser?.username || '',
      password: '',
      role: activeUser?.role || 'TRAINER',
      bio: activeUser?.bio || trainerProfile?.bio || '',
      education: trainerProfile?.education || '',
      certifications: certifications.join(', '),
      specialties: specialties.join(', '),
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
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
      trainerProfile: {
        education: editForm.education,
        certifications: editForm.certifications.split(',').map(s => s.trim()).filter(Boolean),
        specialties: editForm.specialties.split(',').map(s => s.trim()).filter(Boolean),
        bio: editForm.bio,
      }
    };

    if (editForm.password.trim()) {
      payload.password = editForm.password;
    }

    if (user.role === 'ADMIN') {
      payload.role = editForm.role;
    }

    try {
      const response = await fetch(`http://localhost:3000/users/${targetId}?callerId=${user.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile information');
      }

      setTrainerData(data);
      if (user.id === targetId) {
        updateUserLocal(data);
      }

      setSuccessMsg('Profile settings successfully updated.');
      setIsEditing(false);
      fetchProfileAndClients();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during updating.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!window.confirm('Are you sure you want to delete this workout blueprint?')) return;
    const token = localStorage.getItem('fitsync_token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const response = await fetch(`http://localhost:3000/workouts/plans/${planId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to delete workout plan');
      }
      setScheduledPlans(prev => prev.filter(p => p.id !== planId));
    } catch (err: any) {
      alert(err.message || 'Error deleting plan');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        <p className="text-on-surface-variant/60 font-bold uppercase tracking-widest text-xs">Loading Portfolio Intelligence...</p>
      </div>
    );
  }

  const canEdit = user?.id === targetId || user?.role === 'ADMIN';

  return (
    <div className="w-full space-y-[var(--spacing-section-gap)]">
      {/* Top Section: Professional Profile */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-[var(--spacing-section-gap)]">
        {/* Profile Identity Card */}
        <div className="lg:col-span-4 glass-card flex flex-col items-center text-center">
          <div className="relative mb-4">
             <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary object-cover text-3xl font-black text-primary shadow-xl">
               {activeUser?.fullName?.charAt(0) || 'T'}
             </div>
             <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-3 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
               <span className="material-symbols-outlined text-[14px] fill">workspace_premium</span>
               <span className="text-[10px] font-black uppercase tracking-widest">Elite Trainer</span>
             </div>
          </div>
          <h2 className="font-black text-on-surface mb-1 uppercase tracking-tight">
            {activeUser?.fullName}
          </h2>
          <p className="text-xs font-medium text-on-surface-variant mb-6 uppercase tracking-widest opacity-60">
            {activeUser?.username} • {activeUser?.role}
          </p>
          <div className="w-full grid grid-cols-2 gap-3 pt-6 border-t border-secondary-container/10">
            <div className="text-center">
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1 opacity-40">Rating</p>
              <div className="flex items-center justify-center gap-1">
                <span className="text-lg font-black text-primary">{rating}</span>
                <span className="material-symbols-outlined text-tertiary text-[18px] fill">star</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1 opacity-40">Clients</p>
              <p className="text-lg font-black text-on-surface">{clients.length}</p>
            </div>
          </div>

          {canEdit && !isEditing && (
            <button
              onClick={handleStartEditing}
              className="mt-6 w-full py-2 bg-primary text-on-primary font-bold rounded-xl text-xs uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Edit Profile Info
            </button>
          )}
        </div>

        {/* Bio & Credentials Bento / Edit Form */}
        <div className="lg:col-span-8">
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="glass-card p-8 space-y-6">
              <h3 className="text-lg font-bold text-on-surface uppercase tracking-tight border-b border-outline-variant/10 pb-3">Edit Profile Settings</h3>
              
              {errorMsg && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-xs text-error flex items-center gap-2">
                  <span className="material-symbols-outlined">error</span> {errorMsg}
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
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Education / Degree</label>
                  <input
                    type="text"
                    value={editForm.education}
                    onChange={e => setEditForm({ ...editForm, education: e.target.value })}
                    placeholder="e.g. B.S. Sports Science - University"
                    className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface outline-none focus:border-primary/60 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Certifications (comma-separated)</label>
                  <input
                    type="text"
                    value={editForm.certifications}
                    onChange={e => setEditForm({ ...editForm, certifications: e.target.value })}
                    placeholder="FITSYNC, CSCS, NASM"
                    className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface outline-none focus:border-primary/60 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Specialties (comma-separated)</label>
                <input
                  type="text"
                  value={editForm.specialties}
                  onChange={e => setEditForm({ ...editForm, specialties: e.target.value })}
                  placeholder="Strength, Mobility, Powerlifting"
                  className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-2.5 text-on-surface outline-none focus:border-primary/60 text-sm"
                />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-section-gap)] h-full">
              {/* Education */}
              <div className="glass-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                    <span className="material-symbols-outlined text-primary text-[18px]">school</span>
                  </div>
                  <h3 className="text-sm font-black text-on-surface uppercase tracking-tight">Education</h3>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-on-surface uppercase tracking-tight">
                    {educationDegree}
                  </p>
                  {educationSchool && (
                    <p className="text-[11px] font-medium text-on-surface-variant opacity-60">
                      {educationSchool}
                    </p>
                  )}
                </div>
              </div>

              {/* Certifications */}
              <div className="glass-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-tertiary/10 flex items-center justify-center border border-tertiary/20">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">military_tech</span>
                  </div>
                  <h3 className="text-sm font-black text-on-surface uppercase tracking-tight">Certifications</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {certifications.map((cert: string) => (
                    <span
                      key={cert}
                      className="bg-surface-container-high px-3 py-1 rounded-lg text-[10px] font-black text-on-surface-variant border border-secondary-container/10 uppercase tracking-widest"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="md:col-span-2 glass-card hover:scale-[1.005]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center border border-secondary/20">
                    <span className="material-symbols-outlined text-secondary text-[18px]">history_edu</span>
                  </div>
                  <h3 className="text-sm font-black text-on-surface uppercase tracking-tight">Experience & Bio</h3>
                </div>
                <div className="flex items-center gap-10">
                  <div className="shrink-0">
                    <span className="text-4xl font-black text-on-surface tracking-tighter">8+</span>
                    <span className="text-xs font-black text-primary ml-2 uppercase tracking-widest">Years</span>
                  </div>
                  <blockquote className="font-medium text-on-surface-variant italic border-l-2 border-secondary-container/20 pl-10 leading-relaxed text-on-surface">
                    "{bio}"
                  </blockquote>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {successMsg && (
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-sm text-primary flex items-center gap-2">
          <span className="material-symbols-outlined">check_circle</span> {successMsg}
        </div>
      )}

      {isTrainer && targetId === user?.id && (
        <section className="bg-primary/5 border border-primary/10 rounded-xl p-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-primary mb-1">Trainer Tools</h3>
            <p className="text-sm text-on-surface-variant">Access your public marketplace discoverability settings and custom portfolio builder.</p>
          </div>
          <button 
            onClick={() => navigate('/portfolio')}
            className="px-6 py-2 bg-primary text-on-primary rounded-lg font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20 cursor-pointer"
          >
            Edit Portfolio
          </button>
        </section>
      )}

      {/* Client Management Table Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2 h-8 bg-primary rounded-full"></span>
            <h2 className="text-[24px] leading-[32px] font-semibold text-on-surface font-['Plus_Jakarta_Sans']">
              Client Management
            </h2>
          </div>
          <div className="flex bg-surface-container-low rounded-lg p-1 border border-secondary-container/10">
            <button
              onClick={() => setClientFilter('active')}
              className={`px-6 py-1 rounded-md text-[14px] leading-[20px] font-semibold transition-colors font-['Plus_Jakarta_Sans'] cursor-pointer ${
                clientFilter === 'active' 
                  ? "bg-primary text-on-primary" 
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setClientFilter('past')}
              className={`px-6 py-1 rounded-md text-[14px] leading-[20px] font-semibold transition-colors font-['Plus_Jakarta_Sans'] cursor-pointer ${
                clientFilter === 'past' 
                  ? "bg-primary text-on-primary" 
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Past
            </button>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl border border-secondary-container/10 overflow-hidden shadow-lg shadow-black/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high border-b border-secondary-container/10">
                <th className="p-6 text-[14px] leading-[20px] font-semibold text-outline font-['Plus_Jakarta_Sans']">
                  Client Name
                </th>
                <th className="p-6 text-[14px] leading-[20px] font-semibold text-outline font-['Plus_Jakarta_Sans']">
                  Work Email
                </th>
                <th className="p-6 text-[14px] leading-[20px] font-semibold text-outline font-['Plus_Jakarta_Sans']">
                  Registration Date
                </th>
                <th className="p-6 text-[14px] leading-[20px] font-semibold text-outline text-right font-['Plus_Jakarta_Sans']">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-container/10">
              {displayedClients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-on-surface-variant">
                    No clients found in this category.
                  </td>
                </tr>
              ) : displayedClients.map(client => (
                <tr key={client.id} className="hover:bg-surface-container transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs">
                        {client.fullName?.substring(0,2).toUpperCase()}
                      </div>
                      <span className="text-[16px] leading-[24px] text-on-surface font-['Plus_Jakarta_Sans'] font-semibold">
                        {client.fullName}
                      </span>
                    </div>
                  </td>
                  <td className="p-6 text-on-surface-variant text-[16px] leading-[24px] font-['Plus_Jakarta_Sans']">
                    {client.email}
                  </td>
                  <td className="p-6 text-on-surface-variant text-[16px] leading-[24px] font-['Plus_Jakarta_Sans']">
                    {new Date(client.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-6 text-right">
                    <button
                      onClick={() => navigate(`/trainee/${client.id}`)}
                      className="bg-surface-container-high px-6 py-1 rounded-md border border-secondary-container/10 text-primary text-[14px] leading-[20px] font-semibold hover:bg-primary hover:text-on-primary transition-all font-['Plus_Jakarta_Sans'] cursor-pointer"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Personal & Performance Data Section */}
      {isTrainer && (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-2 h-8 bg-primary rounded-full"></span>
            <h2 className="text-[24px] leading-[32px] font-semibold text-on-surface font-['Plus_Jakarta_Sans']">
              Personal &amp; Performance Data
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <div className="bg-surface-container-low rounded-xl border border-secondary-container/10 overflow-hidden shadow-lg shadow-black/20">
                <div className="bg-surface-container-high px-6 py-3 border-b border-secondary-container/10">
                  <h3 className="text-[14px] leading-[20px] font-semibold text-on-surface font-['Plus_Jakarta_Sans']">
                    Contact Information
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-6">
                    <span className="material-symbols-outlined text-outline">mail</span>
                    <div>
                      <p className="text-[12px] leading-[16px] font-medium text-outline font-['Plus_Jakarta_Sans']">Work Email</p>
                      <p className="text-[16px] leading-[24px] text-on-surface font-['Plus_Jakarta_Sans']">{activeUser?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="material-symbols-outlined text-outline">phone</span>
                    <div>
                      <p className="text-[12px] leading-[16px] font-medium text-outline font-['Plus_Jakarta_Sans']">Mobile</p>
                      <p className="text-[16px] leading-[24px] text-on-surface font-['Plus_Jakarta_Sans']">+1 (555) 234-8901</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Volume load graph */}
            <div className="lg:col-span-2 bg-surface-container-low rounded-xl border border-secondary-container/10 flex flex-col shadow-lg shadow-black/20">
              <div className="bg-surface-container-high px-6 py-3 border-b border-secondary-container/10 flex justify-between items-center">
                <h3 className="text-[14px] leading-[20px] font-semibold text-on-surface font-['Plus_Jakarta_Sans']">Active Client Volume Flow</h3>
                <div className="flex gap-3">
                  <span className="flex items-center gap-1 text-[12px] leading-[16px] font-medium text-on-surface-variant"><span className="w-2 h-2 rounded-full bg-primary"></span> Volume Load</span>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-end relative overflow-hidden">
                <div className="h-64 w-full relative">
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="purpleFillProfile" x1="0%" x2="0%" y1="0%" y2="100%">
                        <stop offset="0%" stopColor="#d0bcff" stopOpacity="0.3"></stop>
                        <stop offset="100%" stopColor="#d0bcff" stopOpacity="0"></stop>
                      </linearGradient>
                    </defs>
                    <path d="M0,70 C10,65 20,75 30,60 C40,45 50,55 60,35 C70,15 85,25 100,20 V100 H0 Z" fill="url(#purpleFillProfile)"></path>
                    <path d="M0,70 C10,65 20,75 30,60 C40,45 50,55 60,35 C70,15 85,25 100,20" fill="none" stroke="#d0bcff" strokeWidth="2"></path>
                    <circle cx="0" cy="70" fill="#d0bcff" r="1.5"></circle>
                    <circle cx="30" cy="60" fill="#d0bcff" r="1.5"></circle>
                    <circle cx="60" cy="35" fill="#d0bcff" r="1.5"></circle>
                    <circle cx="100" cy="20" fill="#d0bcff" r="1.5"></circle>
                  </svg>
                </div>
                <div className="flex justify-between mt-3 px-3 border-t border-secondary-container/10 pt-1">
                  {['Jan','Feb','Mar','Apr','May','Jun','Jul'].map(m => (
                    <span key={m} className="text-[12px] leading-[16px] font-medium text-outline">{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Completed & Scheduled Sections */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
        {/* Completed Workouts */}
        <div className="bg-surface-container-low rounded-md border border-secondary-container/10 flex flex-col shadow-lg shadow-black/20 overflow-hidden">
          <div className="bg-surface-container-high px-6 py-3 border-b border-secondary-container/10 flex justify-between items-center">
            <h3 className="text-[14px] leading-[20px] font-semibold text-on-surface font-['Plus_Jakarta_Sans']">Completed Workouts</h3>
          </div>
          <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
            {completedSessions.length === 0 ? (
              <div className="text-center py-6 text-xs text-on-surface-variant/40">No completed workout logs found.</div>
            ) : (
              completedSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 bg-surface-container rounded-lg border border-secondary-container/10 hover:border-primary/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/session-review?sessionId=${session.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">task_alt</span>
                    </div>
                    <div>
                      <p className="text-[14px] leading-[20px] font-semibold text-on-surface font-['Plus_Jakarta_Sans']">
                        {session.workoutPlan?.title}
                      </p>
                      <p className="text-[12px] leading-[16px] font-medium text-on-surface-variant font-['Plus_Jakarta_Sans']">
                        Client: {session.workoutPlan?.client?.fullName} • {new Date(session.completedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline">chevron_right</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Scheduled Sessions (Upcoming Plans) */}
        <div className="bg-surface-container-low rounded-md border border-secondary-container/10 flex flex-col shadow-lg shadow-black/20 overflow-hidden">
          <div className="bg-surface-container-high px-6 py-3 border-b border-secondary-container/10 flex justify-between items-center">
            <h3 className="text-[14px] leading-[20px] font-semibold text-on-surface font-['Plus_Jakarta_Sans']">Workout Blueprints</h3>
            <button
              className="flex items-center gap-1 text-primary text-[14px] leading-[20px] font-semibold hover:underline cursor-pointer"
              onClick={() => navigate('/workout-builder')}
            >
              <span className="material-symbols-outlined text-[18px]">add</span> Schedule New
            </button>
          </div>
          <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
            {scheduledPlans.length === 0 ? (
              <div className="text-center py-6 text-xs text-on-surface-variant/40">No workout plans scheduled yet.</div>
            ) : (
              scheduledPlans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-3 bg-surface-container rounded-lg border border-secondary-container/10">
                  <div className="flex flex-col">
                    <p className="text-[14px] leading-[20px] font-semibold text-on-surface font-['Plus_Jakarta_Sans']">{plan.title}</p>
                    <p className="text-[12px] leading-[16px] font-medium text-primary font-['Plus_Jakarta_Sans']">
                      For: {plan.client?.fullName || 'Template'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/workout-builder?planId=${plan.id}`)}
                      className="p-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="p-1 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                      title="Delete blueprint"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TrainerProfile;
