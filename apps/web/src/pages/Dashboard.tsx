import React, { useState, useMemo } from 'react';
import usersData from '../data/users.json';
import workoutPlansData from '../data/workoutPlans.json';
import exercisesData from '../data/exercises.json';
import mockData from '../data/mockData.json';
import StatCard from '../components/StatCard';

const clients = usersData.filter(u => u.role === 'USER');

const AlertDetailModal: React.FC<{ alert: typeof mockData.alerts[0]; onDismiss: () => void; onClose: () => void }> = ({ alert, onDismiss, onClose }) => {
  const client = clients.find(c => c.id === alert.clientId);
  if (!client) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={onClose}>
      <div className="rounded-[20px] p-8 w-full max-w-md mx-4 flex flex-col gap-6 border border-outline-variant/20" onClick={e => e.stopPropagation()} style={{ background: 'linear-gradient(145deg, #1a2535, #16202e)' }}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3"><img src={client.avatar} alt={client.fullName} className="w-12 h-12 rounded-full object-cover border-2 border-error/30" /><div><h3 className="text-lg font-bold">{client.fullName}</h3><p className="text-sm text-error font-medium">{alert.message}</p></div></div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-container-highest"><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="bg-surface-container-high/40 rounded-xl p-4 text-sm text-on-surface-variant">
          <p className="mb-2"><span className="font-bold text-on-surface">Type:</span> {alert.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
          <p><span className="font-bold text-on-surface">Reported:</span> {new Date(alert.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex gap-3"><button onClick={onClose} className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-sm font-bold hover:bg-surface-container-highest">Close</button><button onClick={() => { onDismiss(); onClose(); }} className="flex-1 py-3 rounded-xl bg-error text-on-error text-sm font-bold hover:brightness-110">Dismiss Alert</button></div>
      </div>
    </div>
  );
};

const WorkoutFeedModal: React.FC<{ workout: typeof mockData.recentWorkouts[0]; onClose: () => void }> = ({ workout, onClose }) => {
  const client = clients.find(c => c.id === workout.clientId);
  const plan = workoutPlansData.find(p => p.id === workout.workoutPlanId);
  if (!client || !plan) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={onClose}>
      <div className="rounded-[20px] p-8 w-full max-w-lg mx-4 flex flex-col gap-6 max-h-[85vh] overflow-y-auto border border-outline-variant/20" onClick={e => e.stopPropagation()} style={{ background: 'linear-gradient(145deg, #1a2535, #16202e)' }}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3"><img src={client.avatar} alt={client.fullName} className="w-12 h-12 rounded-xl object-cover" /><div><h3 className="font-bold">{client.fullName}</h3><p className="text-primary font-bold text-lg">{plan.title}</p></div></div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-container-highest"><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="flex gap-4 flex-wrap">{workout.tags.map(tag => <span key={tag} className="px-3 py-1 bg-surface-container-highest rounded-full text-xs font-bold text-on-surface-variant uppercase tracking-widest">{tag}</span>)}</div>
        <p className="text-sm text-on-surface-variant leading-relaxed">{workout.notes}</p>
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Exercises</h4>
          {plan.exercises.sort((a,b) => a.orderIndex - b.orderIndex).map((we, i) => {
            const ex = exercisesData.find(e => e.id === we.exerciseId);
            if (!ex) return null;
            return (<div key={we.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-high/40 border border-outline-variant/10">
              <div className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i+1}</span><span className="text-sm font-semibold">{ex.name}</span></div>
              <div className="flex items-center gap-3 text-xs text-on-surface-variant"><span>{we.sets.length} sets</span><span className="text-primary font-bold">{we.sets[0]?.expectedWeight}kg</span></div>
            </div>);
          })}
        </div>
        <p className="text-xs text-on-surface-variant/50">Completed: {new Date(workout.completedAt).toLocaleString()}</p>
        <button onClick={onClose} className="w-full py-3 rounded-xl border border-outline-variant/30 text-sm font-bold hover:bg-surface-container-highest">Close</button>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [alerts, setAlerts] = useState(mockData.alerts);
  const [selectedAlert, setSelectedAlert] = useState<typeof mockData.alerts[0] | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<typeof mockData.recentWorkouts[0] | null>(null);
  const [feedFilter, setFeedFilter] = useState('all');
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month'>('week');
  const { stats } = mockData;

  const filteredWorkouts = useMemo(() => {
    if (feedFilter === 'all') return mockData.recentWorkouts;
    return mockData.recentWorkouts.filter(w => w.tags.some(t => t.toLowerCase().includes(feedFilter.toLowerCase())));
  }, [feedFilter]);

  const visibleAlerts = showAllAlerts ? alerts : alerts.slice(0, 2);
  const statCards = [
    { label: 'Active Clients', value: stats.activeClients, trend: `+${stats.weeklyClientGrowth} this week`, icon: 'group', color: '#d0bcff', route: '/clients' },
    { label: 'Pending Requests', value: stats.pendingRequests, trend: 'Requires attention', icon: 'person_add', color: '#ffb869', route: '/clients' },
    { label: 'Workouts Completed', value: stats.workoutsCompletedToday, trend: 'Today', icon: 'task_alt', color: '#d0bcff', route: '/planner' },
    { label: 'Average Rating', value: stats.averageRating, trend: `Across ${stats.totalReviews} reviews`, icon: 'star', color: '#ffb869', route: '/profile' },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div><h1 className="text-4xl font-extrabold tracking-tight mb-2">Dashboard Overview</h1><p className="text-lg text-on-surface-variant/60">Here is what's happening with your clients today.</p></div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{statCards.map(stat => <StatCard key={stat.label} {...stat} />)}</section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <section className="lg:col-span-2 glass-card p-8 pb-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Client Engagement Over Time</h2>
            <div className="flex gap-2">
              <button onClick={() => setChartPeriod('week')} className={`px-3 py-1 rounded-lg text-xs font-bold ${chartPeriod === 'week' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}>Week</button>
              <button onClick={() => setChartPeriod('month')} className={`px-3 py-1 rounded-lg text-xs font-bold ${chartPeriod === 'month' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}>Month</button>
            </div>
          </div>
          <div className="relative h-60">
            <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="none">
              {chartPeriod === 'week' ? <path d="M0,180 C100,160 100,140 150,140 C225,140 225,80 300,80 C375,80 375,50 450,50 C525,50 525,20 600,20" fill="none" stroke="#d0bcff" strokeWidth="5" strokeLinecap="round" /> : <path d="M0,160 C50,170 80,150 120,130 C160,110 200,120 240,100 C280,80 320,90 360,70 C400,50 440,60 480,40 C520,20 560,30 600,10" fill="none" stroke="#d0bcff" strokeWidth="5" strokeLinecap="round" />}
              <path d={chartPeriod === 'week' ? "M0,180 C100,160 100,140 150,140 C225,140 225,80 300,80 C375,80 375,50 450,50 C525,50 525,20 600,20 L600,200 L0,200 Z" : "M0,160 C50,170 80,150 120,130 C160,110 200,120 240,100 C280,80 320,90 360,70 C400,50 440,60 480,40 C520,20 560,30 600,10 L600,200 L0,200 Z"} fill="url(#chart-gradient)" opacity="0.2" />
              <defs><linearGradient id="chart-gradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#d0bcff" /><stop offset="100%" stopColor="#091421" stopOpacity="0" /></linearGradient></defs>
            </svg>
            <div className="flex justify-between px-2 mt-4 text-xs font-semibold text-on-surface-variant/40 uppercase tracking-widest">
              {chartPeriod === 'week' ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <span key={d}>{d}</span>) : ['Week 1','Week 2','Week 3','Week 4'].map(d => <span key={d}>{d}</span>)}
            </div>
          </div>
        </section>

        {/* Alerts */}
        <section className="glass-card p-8 flex flex-col">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-outline-variant/20"><span className="material-symbols-outlined text-error">error</span><h2 className="text-xl font-bold">Needs Attention</h2>{alerts.length > 0 && <span className="ml-auto text-xs font-bold bg-error/10 text-error px-2 py-0.5 rounded-full">{alerts.length}</span>}</div>
          <div className="flex flex-col gap-3 flex-1">
            {visibleAlerts.length === 0 && <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant/40 gap-2"><span className="material-symbols-outlined text-4xl">check_circle</span><span className="text-sm font-semibold">All clear!</span></div>}
            {visibleAlerts.map(alert => { const client = clients.find(c => c.id === alert.clientId); if (!client) return null; return (
              <div key={alert.id} onClick={() => setSelectedAlert(alert)} className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 hover:border-primary/40 cursor-pointer group">
                <img src={client.avatar} alt={client.fullName} className="w-11 h-11 rounded-full object-cover border-2 border-transparent group-hover:border-primary/40" />
                <div className="flex flex-col flex-1 min-w-0"><span className="font-bold text-sm">{client.fullName}</span><span className="text-xs text-error font-medium truncate">{alert.message}</span></div>
                <span className="material-symbols-outlined text-on-surface-variant/30 group-hover:text-on-surface">chevron_right</span>
              </div>); })}
          </div>
          {alerts.length > 2 && <button onClick={() => setShowAllAlerts(!showAllAlerts)} className="mt-4 text-primary font-bold text-sm hover:bg-primary/5 p-3 rounded-xl w-full text-center uppercase tracking-widest">{showAllAlerts ? 'Show Less' : `View All Alerts (${alerts.length})`}</button>}
        </section>
      </div>

      {/* Recent Workouts */}
      <section className="glass-card p-8">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h2 className="text-2xl font-bold">Recent Workouts Feed</h2>
          <div className="flex gap-2">{['all','Legs','Push','Pull','Upper Body'].map(f => <button key={f} onClick={() => setFeedFilter(f)} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${feedFilter === f ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-surface-container border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-highest'}`}>{f === 'all' ? 'All' : f}</button>)}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{filteredWorkouts.map(workout => {
          const client = clients.find(c => c.id === workout.clientId);
          const plan = workoutPlansData.find(p => p.id === workout.workoutPlanId);
          if (!client || !plan) return null;
          const timeDiff = Date.now() - new Date(workout.completedAt).getTime();
          const hoursAgo = Math.floor(timeDiff / 3600000);
          const timeLabel = hoursAgo < 1 ? 'Just now' : hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo / 24)}d ago`;
          return (
            <div key={workout.id} onClick={() => setSelectedWorkout(workout)} className="flex items-center gap-5 p-5 rounded-[20px] bg-surface-container-low border border-outline-variant/20 hover:border-primary/40 cursor-pointer group">
              <img src={client.avatar} alt={client.fullName} className="w-14 h-14 rounded-[14px] object-cover shrink-0" />
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1"><span className="font-bold text-sm">{client.fullName}</span><span className="text-[10px] text-on-surface-variant/40 uppercase font-bold tracking-widest shrink-0">{timeLabel}</span></div>
                <h3 className="text-primary font-bold mb-1">{plan.title}</h3>
                <p className="text-xs text-on-surface-variant/60 line-clamp-1 mb-2">{workout.notes}</p>
                <div className="flex gap-2">{workout.tags.map(tag => <span key={tag} className="px-2 py-0.5 bg-surface-container-highest rounded-md text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest">{tag}</span>)}</div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant/30 group-hover:text-on-surface shrink-0">chevron_right</span>
            </div>
          );
        })}</div>
        {filteredWorkouts.length === 0 && <div className="flex items-center justify-center py-12 text-on-surface-variant/40"><span className="text-sm font-semibold">No workouts match this filter.</span></div>}
      </section>

      {selectedAlert && <AlertDetailModal alert={selectedAlert} onDismiss={() => setAlerts(prev => prev.filter(a => a.id !== selectedAlert.id))} onClose={() => setSelectedAlert(null)} />}
      {selectedWorkout && <WorkoutFeedModal workout={selectedWorkout} onClose={() => setSelectedWorkout(null)} />}
    </div>
  );
};

export default Dashboard;
