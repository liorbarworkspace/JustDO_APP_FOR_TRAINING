import React from 'react';
import { ClipboardCheckIcon, TrashIcon } from './icons';
import type { DailyPlan, CompletionLog } from '../types';

interface ProgressTrackerProps {
  completionLog: CompletionLog;
  workoutPlan: DailyPlan[];
  onRemoveCompletion: (date: string) => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ completionLog, workoutPlan, onRemoveCompletion }) => {
  const completedEntries = Object.entries(completionLog)
    .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime());
    
  const planMap = new Map<string, DailyPlan>(workoutPlan.map(p => [p.day, p]));

  if (completedEntries.length === 0) {
    return (
      <div className="text-center py-20 px-4 w-full max-w-4xl mx-auto">
        <ClipboardCheckIcon className="w-16 h-16 mx-auto text-cyan-500 mb-4" />
        <h2 className="text-2xl font-bold text-white">אין עדיין אימונים שהושלמו</h2>
        <p className="text-gray-400 mt-2">ההתקדמות שלך תופיע כאן לאחר שתסמן אימון כ'הושלם'.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 text-right">
      <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">היסטוריית אימונים</h2>
      <p className="text-gray-400 mb-8">כל הכבוד על ההתמדה! כאן תוכל לראות את האימונים שהשלמת.</p>
      
      <div className="space-y-6">
        {completedEntries.map(([date, logEntry]) => {
          const plan = planMap.get(logEntry.workoutDay);
          if (!plan) return null;
          
          const completedExercises = Object.values(logEntry.completedExercises);
          const allExercisesInPlan = plan.activities.flatMap(a => a.exercises);
          const progress = allExercisesInPlan.length > 0 ? (completedExercises.length / allExercisesInPlan.length) * 100 : 0;

          return (
            <div key={date} className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 transition-all duration-300 hover:border-slate-600 hover:shadow-lg">
              <div className="flex justify-between items-start border-b border-slate-700 pb-3 mb-4">
                  <div>
                    <p className="text-lg font-bold text-cyan-400">
                        {new Date(date).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <p className="text-gray-300">{plan.type} ({logEntry.workoutDay})</p>
                  </div>
                  <button onClick={() => onRemoveCompletion(date)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <TrashIcon className="w-6 h-6" />
                  </button>
              </div>

              <div className="mb-4">
                  <div className="flex justify-between mb-1">
                      <span className="text-base font-medium text-cyan-400">התקדמות באימון</span>
                      <span className="text-sm font-medium text-cyan-400">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2.5">
                      <div className="bg-cyan-600 h-2.5 rounded-full" style={{width: `${progress}%`}}></div>
                  </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">תרגילים שהושלמו:</h4>
                <ul className="list-none text-gray-400 mt-1 space-y-1">
                  {completedExercises.length > 0 ? completedExercises.map(ex => {
                    const setsRepsString = [
                        ex.sets ? `${ex.sets} סטים` : '',
                        ex.reps ? `x ${ex.reps}` : '',
                        ex.duration ? `${ex.duration} שניות` : '',
                    ].filter(Boolean).join(' ');
                    return (
                        <li key={ex.planInstanceId} className="flex items-center">
                            <svg className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            {ex.name}
                            <span className="text-xs text-gray-500 mr-2">({setsRepsString})</span>
                        </li>
                    )}
                  ) : (
                    <li className="text-gray-500">לא סומנו תרגילים</li>
                  )}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTracker;