import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usersData from '../data/users.json';

const TrainerProfile: React.FC = () => {
  const navigate = useNavigate();
  const [clientFilter, setClientFilter] = useState<'active' | 'past'>('active');

  const trainerUser = usersData.find(u => u.role === 'TRAINER');
  const allClients = usersData.filter(u => u.role === 'USER');

  // Filter clients based on mock "status" logic or just split them for demo
  const displayedClients = allClients.filter(c => {
    if (clientFilter === 'active') return c.status !== 'past';
    return c.status === 'past';
  });

  if (!trainerUser || !trainerUser.trainerProfile) {
    return <div className="p-8">Trainer profile not found.</div>;
  }

  const { trainerProfile } = trainerUser;

  const handleActionClick = (action: string, id: string) => {
    alert(`Mock Action: ${action} on item ID: ${id}`);
  };

  const isTrainer = trainerUser?.role === 'TRAINER';

  return (
    <div className="w-full space-y-[var(--spacing-section-gap)]">
      {/* Top Section: Professional Profile */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-[var(--spacing-section-gap)]">
        {/* Profile Identity Card */}
        <div className="lg:col-span-4 glass-card flex flex-col items-center text-center">
          <div className="relative mb-4">
            <img
              alt={trainerUser.fullName}
              className="w-24 h-24 rounded-full border-2 border-primary object-cover"
              src={trainerUser.avatar}
            />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-3 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
              <span className="material-symbols-outlined text-[14px] fill">workspace_premium</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Elite Trainer</span>
            </div>
          </div>
          <h2 className="text-xl font-black text-on-surface mb-1 uppercase tracking-tight">
            {trainerUser.fullName}
          </h2>
          <p className="text-xs font-medium text-on-surface-variant mb-6 uppercase tracking-widest opacity-60">
            Senior Performance Architect
          </p>
          <div className="w-full grid grid-cols-2 gap-3 pt-6 border-t border-secondary-container/10">
            <div className="text-center">
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1 opacity-40">Rating</p>
              <div className="flex items-center justify-center gap-1">
                <span className="text-lg font-black text-primary">{trainerProfile.rating}</span>
                <span className="material-symbols-outlined text-tertiary text-[18px] fill">star</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1 opacity-40">Clients</p>
              <p className="text-lg font-black text-on-surface">150+</p>
            </div>
          </div>
        </div>

        {/* Bio & Credentials Bento */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-section-gap)]">
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
                {trainerProfile.education.split(' – ')[0] || "B.S. Sports Science"}
              </p>
              <p className="text-[11px] font-medium text-on-surface-variant opacity-60">
                {trainerProfile.education.split(' – ')[1] || "University of Performance Athletics"}
              </p>
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
              {trainerProfile.certifications.map(cert => (
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
              <h3 className="text-sm font-black text-on-surface uppercase tracking-tight">Experience</h3>
            </div>
            <div className="flex items-center gap-10">
              <div className="shrink-0">
                <span className="text-4xl font-black text-on-surface tracking-tighter">10</span>
                <span className="text-xs font-black text-primary ml-2 uppercase tracking-widest">Years</span>
              </div>
              <p className="text-sm font-medium text-on-surface-variant italic border-l-2 border-secondary-container/20 pl-10 leading-relaxed">
                "{trainerProfile.bio}"
              </p>
            </div>
          </div>
        </div>
      </section>

      {isTrainer && (
        <section className="bg-primary/5 border border-primary/10 rounded-xl p-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-primary mb-1">Trainer Tools</h3>
            <p className="text-sm text-on-surface-variant">Access your internal management dashboard and global templates.</p>
          </div>
          <button 
            onClick={() => navigate('/portfolio-editor')}
            className="px-6 py-2 bg-primary text-on-primary rounded-lg font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20"
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
              className={`px-6 py-1 rounded-md text-[14px] leading-[20px] font-semibold transition-colors font-['Plus_Jakarta_Sans'] ${
                clientFilter === 'active' 
                  ? "bg-primary text-on-primary" 
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setClientFilter('past')}
              className={`px-6 py-1 rounded-md text-[14px] leading-[20px] font-semibold transition-colors font-['Plus_Jakarta_Sans'] ${
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
                  Program Type
                </th>
                <th className="p-6 text-[14px] leading-[20px] font-semibold text-outline font-['Plus_Jakarta_Sans']">
                  Current Status
                </th>
                <th className="p-6 text-[14px] leading-[20px] font-semibold text-outline font-['Plus_Jakarta_Sans']">
                  Progress
                </th>
                <th className="p-6 text-[14px] leading-[20px] font-semibold text-outline text-right font-['Plus_Jakarta_Sans']">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-container/10">
              {displayedClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-on-surface-variant">
                    No clients found in this category.
                  </td>
                </tr>
              ) : displayedClients.map(client => (
                <tr key={client.id} className="hover:bg-surface-container transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      {client.avatar ? (
                        <img src={client.avatar} alt={client.fullName} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                          {client.fullName.substring(0,2).toUpperCase()}
                        </div>
                      )}
                      <span className="text-[16px] leading-[24px] text-on-surface font-['Plus_Jakarta_Sans']">
                        {client.fullName}
                      </span>
                    </div>
                  </td>
                  <td className="p-6 text-on-surface-variant text-[16px] leading-[24px] font-['Plus_Jakarta_Sans']">
                    {client.goal || 'General Fitness'}
                  </td>
                  <td className="p-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[12px] leading-[16px] font-medium font-['Plus_Jakarta_Sans']">
                      {client.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="w-32 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                      {/* Random progress for mock visual */}
                      <div className="h-full bg-primary" style={{ width: `${Math.random() * 50 + 20}%` }}></div>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <button
                      onClick={() => navigate('/clients')}
                      className="bg-surface-container-high px-6 py-1 rounded-md border border-secondary-container/10 text-primary text-[14px] leading-[20px] font-semibold hover:bg-primary hover:text-on-primary transition-all font-['Plus_Jakarta_Sans']"
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

      {/* Personal & Performance Data Section - Hidden if viewing as guest/client for privacy */}
      {isTrainer && (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-2 h-8 bg-primary rounded-full"></span>
            <h2 className="text-[24px] leading-[32px] font-semibold text-on-surface font-['Plus_Jakarta_Sans']">
              Personal &amp; Performance Data
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contact & Expanded Performance Stats */}
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
                      <p className="text-[16px] leading-[24px] text-on-surface font-['Plus_Jakarta_Sans']">{trainerUser.email}</p>
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

              <div className="bg-surface-container-low rounded-xl border border-secondary-container/10 p-6 shadow-lg shadow-black/20">
                <h3 className="text-[14px] leading-[20px] font-semibold text-on-surface mb-6 font-['Plus_Jakarta_Sans']">
                  Personal Metrics Variance
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center p-3 bg-surface-container rounded-lg border border-error/10">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-error text-sm">block</span>
                      <span className="text-[14px] leading-[20px] font-semibold text-on-surface-variant font-['Plus_Jakarta_Sans']">Missed Workouts</span>
                    </div>
                    <span className="text-[24px] leading-[32px] font-semibold text-error font-['Plus_Jakarta_Sans']">02</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-surface-container rounded-lg border border-error/10">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-error text-sm">error</span>
                      <span className="text-[14px] leading-[20px] font-semibold text-on-surface-variant font-['Plus_Jakarta_Sans']">Missed Exercises</span>
                    </div>
                    <span className="text-[24px] leading-[32px] font-semibold text-error font-['Plus_Jakarta_Sans']">05</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Chart */}
            <div className="lg:col-span-2 bg-surface-container-low rounded-xl border border-secondary-container/10 flex flex-col shadow-lg shadow-black/20">
              <div className="bg-surface-container-high px-6 py-3 border-b border-secondary-container/10 flex justify-between items-center">
                <h3 className="text-[14px] leading-[20px] font-semibold text-on-surface font-['Plus_Jakarta_Sans']">Weight &amp; Body Fat Variance</h3>
                <div className="flex gap-3">
                  <span className="flex items-center gap-1 text-[12px] leading-[16px] font-medium text-on-surface-variant"><span className="w-2 h-2 rounded-full bg-primary"></span> Weight</span>
                  <span className="flex items-center gap-1 text-[12px] leading-[16px] font-medium text-on-surface-variant"><span className="w-2 h-2 rounded-full bg-tertiary"></span> Body Fat %</span>
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
                    <path d="M0,85 C15,80 30,88 45,78 C60,68 80,72 100,65" fill="none" stroke="#ffb869" strokeDasharray="4" strokeWidth="2"></path>
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
        <div className="bg-surface-container-low rounded-md border border-secondary-container/10 flex flex-col shadow-lg shadow-black/20 overflow-hidden">
          <div className="bg-surface-container-high px-6 py-3 border-b border-secondary-container/10 flex justify-between items-center">
            <h3 className="text-[14px] leading-[20px] font-semibold text-on-surface font-['Plus_Jakarta_Sans']">Completed Workouts</h3>
          </div>
          <div className="p-6 space-y-3">
            {[
              { title: "High Intensity Lower Body", time: "45 mins • Yesterday" },
              { title: "Cardio & Mobility", time: "30 mins • 2 days ago" },
            ].map((workout, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-surface-container rounded-lg border border-secondary-container/10 hover:border-primary/50 cursor-pointer transition-colors" onClick={() => handleActionClick("View Workout", workout.title)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">task_alt</span>
                  </div>
                  <div>
                    <p className="text-[14px] leading-[20px] font-semibold text-on-surface font-['Plus_Jakarta_Sans']">{workout.title}</p>
                    <p className="text-[12px] leading-[16px] font-medium text-on-surface-variant font-['Plus_Jakarta_Sans']">{workout.time}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline">chevron_right</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-low rounded-md border border-secondary-container/10 flex flex-col shadow-lg shadow-black/20 overflow-hidden">
          <div className="bg-surface-container-high px-6 py-3 border-b border-secondary-container/10 flex justify-between items-center">
            <h3 className="text-[14px] leading-[20px] font-semibold text-on-surface font-['Plus_Jakarta_Sans']">Scheduled Sessions</h3>
            <button className="flex items-center gap-1 text-primary text-[14px] leading-[20px] font-semibold hover:underline" onClick={() => handleActionClick("Schedule New", "Session")}>
              <span className="material-symbols-outlined text-[18px]">add</span> Schedule New
            </button>
          </div>
          <div className="p-6 space-y-3">
            {[
              { title: "Functional Core Workshop", time: "Tomorrow, 9:00 AM" },
              { title: "Full Body Metabolic Blast", time: "Fri, 8:00 AM" },
            ].map((session, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-surface-container rounded-lg border border-secondary-container/10">
                <div className="flex flex-col">
                  <p className="text-[14px] leading-[20px] font-semibold text-on-surface font-['Plus_Jakarta_Sans']">{session.title}</p>
                  <p className="text-[12px] leading-[16px] font-medium text-primary font-['Plus_Jakarta_Sans']">{session.time}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleActionClick("Edit Session", session.title)} className="p-1 text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                  <button onClick={() => handleActionClick("Delete Session", session.title)} className="p-1 text-on-surface-variant hover:text-error transition-colors"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TrainerProfile;
