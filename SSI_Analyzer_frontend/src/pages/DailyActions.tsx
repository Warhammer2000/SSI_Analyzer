import React, { useState } from 'react';
import { format } from 'date-fns';
import { CheckCircle2, Flame, CalendarCheck, Loader2 } from 'lucide-react';
import { cn, COMPONENT_COLORS, COMPONENT_LABELS } from '../lib/utils';
import Confetti from 'react-confetti';
import { useActions, useStreak, useCompleteAction } from '../hooks/useActions';

export default function DailyActions() {
  const { data: actions = [], isLoading: loadingActions } = useActions();
  const { data: streakInfo } = useStreak();
  const completeAction = useCompleteAction();
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  React.useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggle = (id: string) => {
    const action = actions.find(a => a.id === id);
    if (!action) return;

    completeAction.mutate(id, {
      onSuccess: () => {
        // Check if all will be completed after this toggle
        const willAllBeCompleted = actions.every(a =>
          a.id === id ? !a.isCompleted : a.isCompleted
        );
        if (willAllBeCompleted && !actions.every(a => a.isCompleted)) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        }
      }
    });
  };

  if (loadingActions) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0a66c2]" />
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-[#e0e0e0]">
        <p className="text-[#00000099]">No actions available. Add a snapshot and generate analysis first.</p>
      </div>
    );
  }

  const streak = streakInfo?.currentStreak ?? 0;
  const completedCount = actions.filter(a => a.isCompleted).length;
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
        <div className="divide-y divide-[#e0e0e0]">
          {actions.map((action) => (
            <div
              key={action.id}
              className={cn(
                "p-4 flex items-start gap-4 hover:bg-[#f9f9f9] transition-colors cursor-pointer",
                action.isCompleted ? "bg-[#f3f2ef]" : ""
              )}
              onClick={() => handleToggle(action.id)}
            >
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                action.isCompleted
                  ? "bg-[#057642] border-[#057642]"
                  : "border-[#00000099] hover:border-[#0a66c2]"
              )}>
                {action.isCompleted && <CheckCircle2 className="w-4 h-4 text-white" />}
              </div>

              <div className="flex-1">
                <p className={cn(
                  "text-sm font-medium text-[#000000e6] mb-1",
                  action.isCompleted ? "line-through text-[#00000099]" : ""
                )}>
                  {action.task}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-bold uppercase px-2 py-0.5 rounded text-white"
                    style={{ backgroundColor: COMPONENT_COLORS[action.component as keyof typeof COMPONENT_COLORS] || '#666' }}
                  >
                    {(COMPONENT_LABELS[action.component as keyof typeof COMPONENT_LABELS] || action.component).split(' ')[0]}
                  </span>
                  {action.frequency && (
                    <span className="text-xs text-[#00000099]">{action.frequency}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
