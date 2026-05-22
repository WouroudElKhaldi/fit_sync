import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';

const AlertDetailModal: React.FC<{ alert: any; onDismiss: () => void; onClose: () => void }> = ({ alert, onDismiss, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={onClose}>
      <div className="rounded-[20px] p-8 w-full max-w-md mx-4 flex flex-col gap-6 border border-outline-variant/20 theme-popup-bg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <img src={alert.avatar} alt={alert.clientName} className="w-12 h-12 rounded-full object-cover border-2 border-error/30" />
            <div>
              <h3 className="text-lg font-bold text-on-surface">{alert.clientName}</h3>
              <p className="text-sm text-error font-medium">{alert.message}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-container-highest text-on-surface"><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="bg-surface-container-high/40 rounded-xl p-4 text-sm text-on-surface-variant">
          <p className="mb-2"><span className="font-bold text-on-surface">Type:</span> Session Complete - Pending Review</p>
          <p><span className="font-bold text-on-surface">Reported:</span> {new Date(alert.createdAt).toLocaleString()}</p>
          <p className="mt-2"><span className="font-bold text-on-surface">Client Notes:</span> {alert.notes}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-outline-variant/30 text-sm font-bold hover:bg-surface-container-highest text-on-surface">Close</button>
          <button onClick={() => { onDismiss(); onClose(); }} className="flex-1 py-3 rounded-xl bg-error text-on-error text-sm font-bold hover:brightness-110">Dismiss Alert</button>
        </div>
      </div>
    </div>
  );
};

const WorkoutFeedModal: React.FC<{ workout: any; onClose: () => void }> = ({ workout, onClose }) => {
  const client = workout.workoutPlan?.client;
  const plan = workout.workoutPlan;
  if (!client || !plan) return null;

  // Group sets by exercise
  const exerciseGroups = workout.loggedSets ? (() => {
    const groups: { [key: string]: { exerciseName: string; sets: any[] } } = {};
    workout.loggedSets.forEach((set: any) => {
      const we = set.workoutExercise;
      const ex = we?.exercise;
      if (!ex) return;
      if (!groups[we.id]) {
        groups[we.id] = {
          exerciseName: ex.name,
          sets: [],
        };
      }
      groups[we.id].sets.push(set);
    });
    return Object.values(groups);
  })() : [];

  const tags = workout.totalVolume ? [`${Math.round(workout.totalVolume)} kg`, 'Completed'] : ['Completed'];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={onClose}>
      <div className="rounded-[20px] p-8 w-full max-w-lg mx-4 flex flex-col gap-6 max-h-[85vh] overflow-y-auto border border-outline-variant/20 theme-popup-bg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
              {client.fullName.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold">{client.fullName}</h3>
              <p className="text-primary font-bold text-lg">{plan.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-container-highest"><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="flex gap-4 flex-wrap">
          {tags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-surface-container-highest rounded-full text-xs font-bold text-on-surface-variant uppercase tracking-widest">{tag}</span>
          ))}
        </div>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          {workout.clientNotes || 'No notes left by client.'}
        </p>
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Exercises Logged</h4>
          {exerciseGroups.map((group: any, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-high/40 border border-outline-variant/10">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <span className="text-sm font-semibold">{group.exerciseName}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                <span>{group.sets.length} sets</span>
                <span className="text-primary font-bold">
                  {group.sets[0]?.actualWeight ?? group.sets[0]?.expectedWeight}kg
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-on-surface-variant/50">Completed: {new Date(workout.completedAt).toLocaleString()}</p>
        <button onClick={onClose} className="w-full py-3 rounded-xl border border-outline-variant/30 text-sm font-bold hover:bg-surface-container-highest">Close</button>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [trainerProfile, setTrainerProfile] = useState<any>(null);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const [pendingConnections, setPendingConnections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<any | null>(null);
  const [feedFilter, setFeedFilter] = useState('all');
  const [feedPage, setFeedPage] = useState(1);
  const feedPageSize = 4;
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month'>('week');

  useEffect(() => {
    setFeedPage(1);
  }, [feedFilter]);

  const handleInvitationResponse = async (membershipId: string, status: 'ACCEPTED' | 'REJECTED') => {
    if (!user) return;
    const token = localStorage.getItem('fitsync_token');
    try {
      const res = await fetch(`http://localhost:3000/messages/invitations/${membershipId}/respond`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.id, status }),
      });

      if (res.ok) {
        setPendingInvitations(prev => prev.filter(inv => inv.id !== membershipId));
      }
    } catch (err) {
      console.error('Error responding to invitation:', err);
    }
  };

  const handleConnectionResponse = async (connectionId: string, status: 'ACCEPTED' | 'REJECTED') => {
    if (!user) return;
    const token = localStorage.getItem('fitsync_token');
    try {
      const res = await fetch(`http://localhost:3000/messages/connections/${connectionId}/respond`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.id, status }),
      });

      if (res.ok) {
        setPendingConnections(prev => prev.filter(conn => conn.id !== connectionId));
      }
    } catch (err) {
      console.error('Error responding to connection:', err);
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('fitsync_token');
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      try {
        const [statsRes, analyticsRes, sessionsRes, profileRes, invitationsRes, connectionsRes] = await Promise.all([
          fetch(`http://localhost:3000/trainers/${user.id}/dashboard-stats`, { headers }),
          fetch(`http://localhost:3000/trainers/${user.id}/analytics`, { headers }),
          fetch(`http://localhost:3000/workouts/sessions/trainer/${user.id}`, { headers }),
          fetch(`http://localhost:3000/trainer-profiles/${user.id}`, { headers }),
          fetch(`http://localhost:3000/messages/invitations/${user.id}`, { headers }),
          fetch(`http://localhost:3000/messages/connections/pending/${user.id}`, { headers }),
        ]);

        if (!statsRes.ok || !analyticsRes.ok || !sessionsRes.ok || !profileRes.ok) {
          throw new Error('Failed to synchronize trainer data from the server');
        }

        const statsData = await statsRes.json();
        const analyticsData = await analyticsRes.json();
        const sessionsData = await sessionsRes.json();
        const profileData = await profileRes.json();
        const invitationsData = invitationsRes.ok ? await invitationsRes.json() : [];
        const connectionsData = connectionsRes.ok ? await connectionsRes.json() : [];

        setStats(statsData);
        setAnalytics(analyticsData);
        setRecentSessions(sessionsData);
        setTrainerProfile(profileData);
        setPendingInvitations(invitationsData);
        setPendingConnections(connectionsData);
      } catch (err: any) {
        console.error('Error fetching dashboard details:', err);
        setError(err.message || 'An error occurred while loading dashboard telemetry');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Compute alerts dynamically (sessions completed but missing feedback/rating)
  const alerts = useMemo(() => {
    if (!recentSessions) return [];
    return recentSessions
      .filter((session) => session.completedAt && (!session.trainerFeedback || !session.trainerRating))
      .map((session) => ({
        id: session.id,
        clientId: session.workoutPlan.client.id,
        clientName: session.workoutPlan.client.fullName,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${session.workoutPlan.client.id}`,
        message: `Completed "${session.workoutPlan.title}" - Needs Feedback`,
        createdAt: session.completedAt,
        notes: session.clientNotes || 'No notes left by client.',
        session,
      }));
  }, [recentSessions]);

  const visibleAlerts = useMemo(() => {
    const active = alerts.filter(a => !dismissedAlertIds.includes(a.id));
    return showAllAlerts ? active : active.slice(0, 2);
  }, [alerts, dismissedAlertIds, showAllAlerts]);

  // Filter workouts feed
  const filteredWorkouts = useMemo(() => {
    const completed = recentSessions.filter(s => s.completedAt);
    if (feedFilter === 'all') return completed;
    return completed.filter(w => 
      w.workoutPlan?.title?.toLowerCase().includes(feedFilter.toLowerCase())
    );
  }, [recentSessions, feedFilter]);

  const paginatedWorkouts = useMemo(() => {
    const start = (feedPage - 1) * feedPageSize;
    return filteredWorkouts.slice(start, start + feedPageSize);
  }, [filteredWorkouts, feedPage]);

  // Dynamic SVG Line chart path calculation
  const chartPath = useMemo(() => {
    const points = analytics?.volumeTimeline || [];
    if (points.length === 0) {
      return "M40,150 L560,150";
    }
    const width = 600;
    const height = 200;
    const padding = 40;
    const maxVal = Math.max(...points.map((p: any) => p.volume), 100);
    
    const mapped = points.map((p: any, idx: number) => {
      const x = (idx / Math.max(points.length - 1, 1)) * (width - padding * 2) + padding;
      const y = height - ((p.volume / maxVal) * (height - padding * 2) + padding);
      return { x, y };
    });

    let d = `M${mapped[0].x},${mapped[0].y}`;
    for (let i = 1; i < mapped.length; i++) {
      const prev = mapped[i - 1];
      const curr = mapped[i];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      const cpY2 = curr.y;
      d += ` C${cpX1},${cpY1} ${cpX2},${cpY2} ${curr.x},${curr.y}`;
    }
    return d;
  }, [analytics]);

  const chartFillPath = useMemo(() => {
    const points = analytics?.volumeTimeline || [];
    if (points.length === 0) return "";
    const path = chartPath;
    const width = 600;
    const padding = 40;
    const firstX = (0 / Math.max(points.length - 1, 1)) * (width - padding * 2) + padding;
    const lastX = ((points.length - 1) / Math.max(points.length - 1, 1)) * (width - padding * 2) + padding;
    return `${path} L${lastX},180 L${firstX},180 Z`;
  }, [analytics, chartPath]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        <p className="text-on-surface-variant/60 font-bold uppercase tracking-widest text-xs">Loading telemetry...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center max-w-md mx-auto">
        <span className="material-symbols-outlined text-error text-5xl">warning</span>
        <h2 className="text-xl font-bold">Data Synchronization Failure</h2>
        <p className="text-on-surface-variant/60 text-sm">{error}</p>
        <button onClick={() => navigate(0)} className="mt-4 px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs uppercase tracking-widest">Retry Connection</button>
      </div>
    );
  }

  const statCards = [
    { label: 'Active Clients', value: stats?.totalClients ?? 0, trend: `Active Roster`, icon: 'group', color: '#d0bcff', route: '/clients' },
    { label: 'Pending Reviews', value: stats?.pendingFeedbackCount ?? 0, trend: 'Feedback required', icon: 'rate_review', color: '#ffb869', route: '/session-review' },
    { label: 'Workouts Scheduled', value: stats?.workoutsThisWeek ?? 0, trend: 'This Week', icon: 'task_alt', color: '#d0bcff', route: '/planner' },
    { label: 'Average Rating', value: trainerProfile?.rating ? trainerProfile.rating.toFixed(1) : '0.0', trend: `Across ${trainerProfile?.reviewCount ?? 0} reviews`, icon: 'star', color: '#ffb869', route: '/profile' },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-extrabold tracking-tight mb-2">Dashboard Overview</h1>
        <blockquote className="text-on-surface-variant/60">Here is what's happening with your clients today.</blockquote>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map(stat => <StatCard key={stat.label} {...stat} />)}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <section className="lg:col-span-2 glass-card p-8 pb-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-bold">Client Engagement Over Time</h2>
            <div className="flex gap-2">
              <button onClick={() => setChartPeriod('week')} className={`px-3 py-1 rounded-lg text-xs font-bold ${chartPeriod === 'week' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}>Week</button>
              <button onClick={() => setChartPeriod('month')} className={`px-3 py-1 rounded-lg text-xs font-bold ${chartPeriod === 'month' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}>Month</button>
            </div>
          </div>
          <div className="relative h-60">
            <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="none">
              <path d={chartPath} fill="none" stroke="#d0bcff" strokeWidth="5" strokeLinecap="round" />
              {chartFillPath && <path d={chartFillPath} fill="url(#chart-gradient)" opacity="0.2" />}
              <defs>
                <linearGradient id="chart-gradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#d0bcff" />
                  <stop offset="100%" stopColor="#091421" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex justify-between px-2 mt-4 text-xs font-semibold text-on-surface-variant/40 uppercase tracking-widest">
              {chartPeriod === 'week' ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <span key={d}>{d}</span>) : ['Week 1','Week 2','Week 3','Week 4'].map(d => <span key={d}>{d}</span>)}
            </div>
          </div>
        </section>

        {/* Alerts */}
        <section className="glass-card p-8 flex flex-col">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-error">error</span>
            <h2 className="font-bold">Needs Attention</h2>
            {(alerts.length - dismissedAlertIds.length + pendingInvitations.length + pendingConnections.length) > 0 && (
              <span className="ml-auto text-xs font-bold bg-error/10 text-error px-2 py-0.5 rounded-full">
                {alerts.length - dismissedAlertIds.length + pendingInvitations.length + pendingConnections.length}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3 flex-1">
            {visibleAlerts.length === 0 && pendingInvitations.length === 0 && pendingConnections.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant/40 gap-2">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
                <span className="text-sm font-semibold">All clear!</span>
              </div>
            )}

            {/* Pending Connections */}
            {pendingConnections.map(conn => (
              <div key={conn.id} className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 hover:border-primary/40 group animate-in fade-in slide-in-from-bottom-2">
                <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                  <span className="material-symbols-outlined">person_add</span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-bold text-sm truncate">{conn.requester?.fullName}</span>
                  <span className="text-[10px] text-primary font-semibold truncate">Connection Request ({conn.requester?.role})</span>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleConnectionResponse(conn.id, 'ACCEPTED'); }}
                    className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center shadow-lg cursor-pointer"
                    title="Accept Request"
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleConnectionResponse(conn.id, 'REJECTED'); }}
                    className="w-8 h-8 rounded-lg bg-error/20 text-error hover:bg-error hover:text-white transition-all flex items-center justify-center shadow-lg cursor-pointer"
                    title="Decline Request"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Pending Group Invitations */}
            {pendingInvitations.map(invite => (
              <div key={invite.id} className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 hover:border-primary/40 group">
                <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                  <span className="material-symbols-outlined">groups</span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-bold text-sm truncate">{invite.group?.name}</span>
                  <span className="text-[10px] text-primary font-semibold truncate">Group Invite from {invite.group?.createdBy?.fullName}</span>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleInvitationResponse(invite.id, 'ACCEPTED'); }}
                    className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center shadow-lg cursor-pointer"
                    title="Accept"
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleInvitationResponse(invite.id, 'REJECTED'); }}
                    className="w-8 h-8 rounded-lg bg-error/20 text-error hover:bg-error hover:text-white transition-all flex items-center justify-center shadow-lg cursor-pointer"
                    title="Decline"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Completed Workout Session Alerts */}
            {visibleAlerts.map(alert => (
              <div key={alert.id} onClick={() => setSelectedAlert(alert)} className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 hover:border-primary/40 cursor-pointer group">
                <img src={alert.avatar} alt={alert.clientName} className="w-11 h-11 rounded-full object-cover border-2 border-transparent group-hover:border-primary/40" />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-bold text-sm">{alert.clientName}</span>
                  <span className="text-xs text-error font-medium truncate">{alert.message}</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant/30 group-hover:text-on-surface">chevron_right</span>
              </div>
            ))}
          </div>
          {alerts.length - dismissedAlertIds.length > 2 && (
            <button onClick={() => setShowAllAlerts(!showAllAlerts)} className="mt-4 text-primary font-bold text-sm hover:bg-primary/5 p-3 rounded-xl w-full text-center uppercase tracking-widest">
              {showAllAlerts ? 'Show Less' : `View All Alerts (${alerts.length - dismissedAlertIds.length})`}
            </button>
          )}
        </section>
      </div>

      {/* Recent Workouts */}
      <section className="glass-card p-8">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h2 className="font-bold">Recent Workouts Feed</h2>
          <div className="flex gap-2">
            {['all', 'Legs', 'Push', 'Pull', 'Upper Body'].map(f => (
              <button key={f} onClick={() => setFeedFilter(f)} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${feedFilter === f ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-surface-container border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-highest'}`}>
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paginatedWorkouts.map(session => {
            const client = session.workoutPlan?.client;
            const plan = session.workoutPlan;
            if (!client || !plan) return null;
            const timeDiff = Date.now() - new Date(session.completedAt).getTime();
            const hoursAgo = Math.floor(timeDiff / 3600000);
            const timeLabel = hoursAgo < 1 ? 'Just now' : hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo / 24)}d ago`;
            const tags = session.totalVolume ? [`${Math.round(session.totalVolume)} kg`, 'Completed'] : ['Completed'];
            return (
              <div key={session.id} onClick={() => setSelectedWorkout(session)} className="flex items-center gap-5 p-5 rounded-[20px] bg-surface-container-low border border-outline-variant/20 hover:border-primary/40 cursor-pointer group">
                <div className="w-14 h-14 rounded-[14px] bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0">
                  {client.fullName.charAt(0)}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-on-surface">{client.fullName}</span>
                    <span className="text-[10px] text-on-surface-variant/40 uppercase font-bold tracking-widest shrink-0">{timeLabel}</span>
                  </div>
                  <h3 className="text-primary font-bold mb-1">{plan.title}</h3>
                  <p className="text-xs text-on-surface-variant/60 line-clamp-1 mb-2">{session.clientNotes || 'No client notes.'}</p>
                  <div className="flex gap-2">
                    {tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-surface-container-highest rounded-md text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest">{tag}</span>
                    ))}
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant/30 group-hover:text-on-surface shrink-0">chevron_right</span>
              </div>
            );
          })}
        </div>
        
        {filteredWorkouts.length > feedPageSize && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-outline-variant/10">
            <span className="text-xs text-on-surface-variant/60">
              Showing {Math.min(filteredWorkouts.length, (feedPage - 1) * feedPageSize + 1)}-{Math.min(filteredWorkouts.length, feedPage * feedPageSize)} of {filteredWorkouts.length} completed workouts
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setFeedPage(p => Math.max(1, p - 1))}
                disabled={feedPage === 1}
                className="px-3 py-1.5 rounded-xl border border-outline-variant/20 text-xs font-bold bg-surface-container text-on-surface hover:bg-surface-container-highest disabled:opacity-40 disabled:hover:bg-surface-container"
              >
                Previous
              </button>
              <button
                onClick={() => setFeedPage(p => Math.min(Math.ceil(filteredWorkouts.length / feedPageSize), p + 1))}
                disabled={feedPage >= Math.ceil(filteredWorkouts.length / feedPageSize)}
                className="px-3 py-1.5 rounded-xl border border-outline-variant/20 text-xs font-bold bg-surface-container text-on-surface hover:bg-surface-container-highest disabled:opacity-40 disabled:hover:bg-surface-container"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {filteredWorkouts.length === 0 && (
          <div className="flex items-center justify-center py-12 text-on-surface-variant/40">
            <span className="text-sm font-semibold">No workouts match this filter.</span>
          </div>
        )}
      </section>

      {selectedAlert && (
        <AlertDetailModal
          alert={selectedAlert}
          onDismiss={() => setDismissedAlertIds(prev => [...prev, selectedAlert.id])}
          onClose={() => setSelectedAlert(null)}
        />
      )}
      {selectedWorkout && <WorkoutFeedModal workout={selectedWorkout} onClose={() => setSelectedWorkout(null)} />}
    </div>
  );
};

export default Dashboard;
