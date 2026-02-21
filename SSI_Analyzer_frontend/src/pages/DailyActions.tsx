import React, { useEffect, useState } from 'react';
import { getSnapshots, toggleDailyAction, getCompletedActionsForDate, getActionLogs } from '../lib/storage';
import { SsiSnapshot, Recommendation } from '../types';
import { generateRecommendations } from '../lib/recommendations';
import { format, isSameDay, subDays } from 'date-fns';
import { CheckCircle2, Flame, CalendarCheck } from 'lucide-react';
import { cn, COMPONENT_COLORS, COMPONENT_LABELS } from '../lib/utils';
import Confetti from 'react-confetti';
import { useAuth } from '../contexts/AuthContext';

export default function DailyActions() {
  const [snapshot, setSnapshot] = useState<SsiSnapshot | null>(null);
  const [actions, setActions] = useState<{ id: string; text: string; component: string; time: string; completed: boolean }[]>([]);
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const { user } = useAuth();

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (user) {
      const data = getSnapshots(user.id);
      if (data.length > 0) {
        setSnapshot(data[0]);
      }
      const logs = getActionLogs(user.id);
      calculateStreak(logs);
    }
    
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [user]);

  useEffect(() => {
    if (snapshot && user) {
      const recs = generateRecommendations(snapshot);
      const completedToday = getCompletedActionsForDate(user.id, today);
      
      // Flatten recommendations into actionable items
      const dailyActions = recs.flatMap((rec) => 
        rec.actions.map((action, idx) => ({
          id: `${rec.id}-${idx}`, // Stable ID based on rec ID and index
          text: action,
          component: rec.component,
          time: rec.timeEstimate,
          completed: false // Will update below
        }))
      );

      // Mark completed
      const updatedActions = dailyActions.map(action => ({
        ...action,
        completed: completedToday.includes(action.id)
      }));

      setActions(updatedActions);
    }
  }, [snapshot, user]);

  const calculateStreak = (logs: { date: string; completedActions: string[] }[]) => {
    let currentStreak = 0;
    let checkDate = new Date();
    
    // Check today
    const todayStr = format(checkDate, 'yyyy-MM-dd');
    const todayLog = logs.find(l => l.date === todayStr);
    if (todayLog && todayLog.completedActions.length > 0) {
      currentStreak++;
    }

    // Check previous days
    while (true) {
      checkDate = subDays(checkDate, 1);
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      const log = logs.find(l => l.date === dateStr);
      
      if (log && log.completedActions.length > 0) {
        currentStreak++;
      } else {
        break;
      }
    }
    setStreak(currentStreak);
  };

  const handleToggle = (id: string) => {
    if (!user) return;
    toggleDailyAction(user.id, id, today);
    
    setActions(prev => {
      const newActions = prev.map(a => a.id === id ? { ...a, completed: !a.completed } : a);
      
      // Check if all completed
      const allCompleted = newActions.every(a => a.completed);
      if (allCompleted && !prev.every(a => a.completed)) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
      
      return newActions;
    });
  };

  if (!snapshot) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-[#e0e0e0]">
        <p className="text-[#00000099]">No data available. Add a snapshot first.</p>
      </div>
    );
  }

  const completedCount = actions.filter(a => a.completed).length;
  const progress = actions.length > 0 ? (completedCount / actions.length) * 100 : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} />}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#000000e6] flex items-center gap-2">
            Today's Actions
            {streak > 0 && (
              <span className="text-sm font-normal bg-[#ffebee] text-[#cc1016] px-3 py-1 rounded-full flex items-center gap-1">
                <Flame className="w-4 h-4" /> {streak} day streak
              </span>
            )}
          </h1>
          <p className="text-[#00000099] text-sm mt-1">{format(new Date(), 'EEEE, MMMM do')}</p>
        </div>
        
        <div className="bg-white px-4 py-2 rounded-lg border border-[#e0e0e0] shadow-sm flex items-center gap-3">
          <CalendarCheck className="w-5 h-5 text-[#0a66c2]" />
          <div>
            <p className="text-xs text-[#00000099] uppercase font-bold">Progress</p>
            <p className="text-sm font-bold text-[#000000e6]">{completedCount} of {actions.length} completed</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-[#e0e0e0] rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#057642] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="bg-white rounded-lg border border-[#e0e0e0] shadow-sm overflow-hidden">
        {actions.length === 0 ? (
          <div className="p-8 text-center text-[#00000099]">
            No actions for today. Great job!
          </div>
        ) : (
          <div className="divide-y divide-[#e0e0e0]">
            {actions.map((action) => (
              <div 
                key={action.id}
                className={cn(
                  "p-4 flex items-start gap-4 hover:bg-[#f9f9f9] transition-colors cursor-pointer",
                  action.completed ? "bg-[#f3f2ef]" : ""
                )}
                onClick={() => handleToggle(action.id)}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                  action.completed 
                    ? "bg-[#057642] border-[#057642]" 
                    : "border-[#00000099] hover:border-[#0a66c2]"
                )}>
                  {action.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>

                <div className="flex-1">
                  <p className={cn(
                    "text-sm font-medium text-[#000000e6] mb-1",
                    action.completed ? "line-through text-[#00000099]" : ""
                  )}>
                    {action.text}
                  </p>
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-[10px] font-bold uppercase px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: COMPONENT_COLORS[action.component as keyof typeof COMPONENT_COLORS] }}
                    >
                      {COMPONENT_LABELS[action.component as keyof typeof COMPONENT_LABELS].split(' ')[0]}
                    </span>
                    <span className="text-xs text-[#00000099]">{action.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
