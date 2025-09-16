import React from 'react';
import { ClipboardCheckIcon, TrashIcon, DownloadIcon, MessageSquarePlusIcon, SparklesIcon, EditIcon, CheckCircle2Icon, XCircleIcon, ClockIcon } from './icons';
import type { CompletionLog, WorkoutTemplate } from '../types';

interface ProgressTrackerProps {
  completionLog: CompletionLog;
  workoutTemplates: WorkoutTemplate[];
  onRemoveCompletion: (date: string) => void;
  onOpenFeedbackModal: (date: string) => void;
  onOpenEditLogModal: (date: string) => void;
  onExportHistory: () => void;
}

const SECONDS_PER_REP = 3;

const parseReps = (reps?: string): number => {
    if (!reps) return 0;
    const repsAsString = String(reps);
    if (repsAsString.includes('-')) {
        const parts = repsAsString.split('-').map(s => parseInt(s.trim(), 10));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            return (parts[0] + parts[1]) / 2;
        }
    }
    const singleRep = parseInt(repsAsString, 10);
    return isNaN(singleRep) ? 0 : singleRep;
};

const parseRest = (rest?: string): number => {
    if (!rest) return 0;
    const match = rest.match(/(\d+)/);
    if (match) {
        return parseInt(match[0], 10);
    }
    return 0;
};

const calculateWorkoutDurationSeconds = (template: WorkoutTemplate | null): number => {
    if (!template || !Array.isArray(template.exercises) || template.exercises.length === 0) {
        return 0;
    }
    let totalSeconds = 0;
    for (const exercise of template.exercises) {
        const sets = exercise.sets || 1;
        const activityTimePerSet = exercise.duration || (parseReps(exercise.reps) * SECONDS_PER_REP);
        const restTime = parseRest(exercise.rest);
        if (sets > 0 && activityTimePerSet > 0) {
            totalSeconds += (sets * activityTimePerSet) + (Math.max(0, sets - 1) * restTime);
        }
    }
    return totalSeconds;
};

const formatDurationFromSeconds = (seconds: number): string => {
    if (seconds <= 0) return 'לא חושב';
    const totalMinutes = Math.round(seconds / 60);
    return `~${totalMinutes} דקות`;
};

const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const formatDurationDisplay = (seconds: number | undefined | null): string => {
  if (!seconds || seconds <= 0) {
    return '';
  }
  if (seconds < 60) {
    return `${seconds} שניות`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) {
    return `${minutes} דקות`;
  }
  return `${minutes} דקות ו-${remainingSeconds} שניות`;
};


const feelingMap: { [key: string]: { text: string; color: string; darkColor: string } } = {
  excellent: { text: 'מצוינת', color: 'text-green-600', darkColor: 'dark:text-green-400' },
  good: { text: 'טובה', color: 'text-sky-600', darkColor: 'dark:text-sky-400' },
  ok: { text: 'בסדר', color: 'text-yellow-600', darkColor: 'dark:text-yellow-400' },
  tired: { text: 'עייפות', color: 'text-orange-600', darkColor: 'dark:text-orange-400' },
};

const difficultyMap: { [key: string]: { text: string; color: string; darkColor: string } } = {
  easy: { text: 'קל מדי', color: 'text-sky-600', darkColor: 'dark:text-sky-400' },
  just_right: { text: 'בול', color: 'text-green-600', darkColor: 'dark:text-green-400' },
  hard: { text: 'קשה מדי', color: 'text-amber-600', darkColor: 'dark:text-amber-400' },
};

const getAutomatedRecommendation = (completionLog: CompletionLog): string => {
    const completedEntries = Object.entries(completionLog)
        .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
        .slice(0, 5);

    if (completedEntries.length === 0) {
        return "התחל להתאמן כדי לקבל טיפים מותאמים אישית!";
    }

    const painEntry = completedEntries.find(([_, entry]) => entry.feedback && entry.feedback.painLevel > 1);
    if (painEntry) {
        return `שמתי לב שדיווחת על כאב (${painEntry[1].feedback?.painLocation}). חשוב להקשיב לגוף. שקול לנוח או לבצע תרגילי הרפיה ומתיחות עדינות. אם הכאב ממשיך, מומלץ להתייעץ עם איש מקצוע.`;
    }

    const hardWorkouts = completedEntries.filter(([_, entry]) => entry.feedback?.difficulty === 'hard').length;
    if (hardWorkouts >= 2 && completedEntries.length > 2) {
        return "כל הכבוד על המאמץ! נראה שהאימונים האחרונים היו מאתגרים במיוחד. זכור שמנוחה היא חלק חיוני מההתקדמות. אולי כדאי לשקול אימון קל יותר או יום מנוחה פעילה.";
    }

    if (completedEntries.length >= 3) {
        const firstDate = new Date(completedEntries[0][0]);
        const lastDate = new Date(completedEntries[completedEntries.length - 1][0]);
        const diffTime = Math.abs(firstDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 10 && completedEntries.length >= 3) {
             return "עבודה מצוינת על העקביות וההתמדה! זה המפתח האמיתי להתקדמות. המשך כך!";
        }
    }
    
    const noFeedbackEntries = completedEntries.filter(([_, entry]) => !entry.feedback).length;
    if (completedEntries.length > 1 && noFeedbackEntries > completedEntries.length / 2) {
        return "כדי שאוכל לתת טיפים מדויקים יותר, נסה למלא משוב לאחר כל אימון. זה יעזור לנו לעקוב אחר ההתקדמות ולהתאים את התוכנית במידת הצורך.";
    }

    return "אתה בדרך הנכונה! כל אימון הוא צעד נוסף לעבר המטרה שלך.";
};


const ProgressTracker: React.FC<ProgressTrackerProps> = ({ completionLog, workoutTemplates, onRemoveCompletion, onOpenFeedbackModal, onOpenEditLogModal, onExportHistory }) => {
  const completedEntries = Object.entries(completionLog)
    .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(new Date(dateA).setHours(0,0,0,0)).getTime());

  const recommendation = getAutomatedRecommendation(completionLog);

  if (completedEntries.length === 0) {
    return (
      <div className="text-center py-20 px-4 w-full max-w-4xl mx-auto">
        <ClipboardCheckIcon className="w-16 h-16 mx-auto text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-rubik">אין עדיין אימונים שהושלמו</h2>
        <p className="text-slate-500 dark:text-gray-400 mt-2">ההתקדמות שלך תופיע כאן לאחר שתסמן אימון כ'הושלם'.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen-lg mx-auto p-4 md:p-6 text-right">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight font-rubik">היסטוריית אימונים</h2>
            <p className="text-slate-500 dark:text-gray-400 mt-2 text-lg">כל הכבוד על ההתמדה! כאן תוכל לראות את האימונים שהשלמת.</p>
          </div>
           <button
              onClick={onExportHistory}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2"
          >
              <DownloadIcon className="w-5 h-5" />
              <span>ייצוא היסטוריה</span>
          </button>
      </div>

      <div className="my-8 bg-gradient-to-tr from-violet-50 to-amber-50 dark:from-slate-800 dark:to-slate-800/50 rounded-xl p-6 border border-violet-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-2xl font-bold text-amber-700 dark:text-amber-400 mb-4 flex items-center justify-end gap-2 font-rubik">
            טיפ מהמאמן האוטומטי <SparklesIcon className="w-6 h-6"/>
        </h3>
        <div className="p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg border border-amber-200 dark:border-amber-700/50">
          <p className="text-slate-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{recommendation}</p>
        </div>
      </div>
      
      <div className="space-y-6 mt-8">
        {completedEntries.map(([date, logEntry]) => {
          const hasFeedback = !!logEntry.feedback;
          const originalTemplate = workoutTemplates.find(t => t.id === logEntry.workoutTemplate.id);
          const plannedDurationSec = calculateWorkoutDurationSeconds(originalTemplate);
          const plannedDurationText = formatDurationFromSeconds(plannedDurationSec);
          const actualDurationText = logEntry.actualDurationSeconds ? formatTime(logEntry.actualDurationSeconds) : null;
          
          return (
            <div key={date} className="bg-white dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg">
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">
                  <div>
                    <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                        {new Date(date).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <p className="text-slate-800 dark:text-gray-300 font-semibold">{logEntry.weeklyPlanName} - יום {logEntry.dayOfWeek}</p>
                    <p className="text-sm text-slate-500 dark:text-gray-400">{logEntry.workoutTemplate.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                     <button onClick={() => onOpenEditLogModal(date)} className="p-2 text-gray-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full transition-colors">
                        <EditIcon className="w-6 h-6" />
                    </button>
                     <button onClick={() => onOpenFeedbackModal(date)} className={`p-2 rounded-full transition-colors ${hasFeedback ? 'text-amber-600 dark:text-amber-400 hover:text-white hover:bg-amber-600' : 'text-gray-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                        <MessageSquarePlusIcon className="w-6 h-6" />
                    </button>
                    <button onClick={() => onRemoveCompletion(date)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors">
                        <TrashIcon className="w-6 h-6" />
                    </button>
                  </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">ניתוח ביצועים:</h4>
                <ul className="list-none mt-1 space-y-2">
                 {originalTemplate && Array.isArray(originalTemplate.exercises) ? originalTemplate.exercises.map(originalEx => {
                    const performedEx = logEntry.completedExercises[originalEx.planInstanceId];
                    const wasPerformed = !!performedEx;

                    if (!wasPerformed) {
                         return (
                            <li key={originalEx.planInstanceId} className="flex items-start">
                                <XCircleIcon className="w-5 h-5 text-red-500 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-slate-500 dark:text-gray-400 line-through">{originalEx.name}</span>
                                    <span className="text-xs text-red-500 dark:text-red-400 mr-2">(דולג)</span>
                                </div>
                            </li>
                        );
                    }

                    const wasModified = originalEx.sets !== performedEx.sets || originalEx.reps !== performedEx.reps || originalEx.duration !== performedEx.duration;
                    const plannedStr = [ originalEx.sets ? `${originalEx.sets} סטים` : '', originalEx.reps ? `x ${originalEx.reps}` : '', formatDurationDisplay(originalEx.duration) ].filter(Boolean).join(' ');
                    const performedStr = [ performedEx.sets ? `${performedEx.sets} סטים` : '', performedEx.reps ? `x ${performedEx.reps}` : '', formatDurationDisplay(performedEx.duration) ].filter(Boolean).join(' ');
                    
                    if (wasModified) {
                        return (
                             <li key={originalEx.planInstanceId} className="flex items-start">
                                <CheckCircle2Icon className="w-5 h-5 text-yellow-500 dark:text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-slate-800 dark:text-gray-300">{originalEx.name}</span>
                                    <p className="text-xs text-yellow-600 dark:text-yellow-500">
                                        תוכנן: {plannedStr} | <strong>בוצע: {performedStr}</strong>
                                    </p>
                                </div>
                            </li>
                        );
                    }

                    return (
                        <li key={originalEx.planInstanceId} className="flex items-start">
                            <CheckCircle2Icon className="w-5 h-5 text-green-500 dark:text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                            <div>
                                <span className="text-slate-600 dark:text-gray-400">{originalEx.name}</span>
                                <span className="text-xs text-gray-400 dark:text-gray-500 mr-2">({performedStr})</span>
                            </div>
                        </li>
                    )

                 }) : (
                     <p className="text-slate-500 dark:text-gray-500 text-sm">לא נמצאה תבנית מקורית להשוואה.</p>
                 )}
                </ul>
              </div>

              {(plannedDurationSec > 0 || actualDurationText) && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2 justify-end">
                          <ClockIcon className="w-5 h-5" />
                          סיכום זמנים
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="bg-slate-100 dark:bg-slate-700/50 p-3 rounded-md">
                              <p className="text-slate-500 dark:text-gray-400">זמן מתוכנן</p>
                              <p className="font-bold text-slate-800 dark:text-gray-200 text-lg">{plannedDurationText}</p>
                          </div>
                          {actualDurationText && (
                              <div className="bg-slate-100 dark:bg-slate-700/50 p-3 rounded-md">
                                  <p className="text-slate-500 dark:text-gray-400">זמן בפועל</p>
                                  <p className="font-bold text-slate-800 dark:text-gray-200 text-lg">{actualDurationText}</p>
                              </div>
                          )}
                      </div>
                  </div>
              )}

              {logEntry.feedback && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">משוב על האימון:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-slate-100 dark:bg-slate-700/50 p-3 rounded-md">
                            <p className="text-slate-500 dark:text-gray-400">הרגשה כללית</p>
                            <p className={`font-bold ${feelingMap[logEntry.feedback.feeling]?.color || ''} ${feelingMap[logEntry.feedback.feeling]?.darkColor || ''}`}>{feelingMap[logEntry.feedback.feeling]?.text || '-'}</p>
                        </div>
                         <div className="bg-slate-100 dark:bg-slate-700/50 p-3 rounded-md">
                            <p className="text-slate-500 dark:text-gray-400">רמת קושי</p>
                            <p className={`font-bold ${difficultyMap[logEntry.feedback.difficulty]?.color || ''} ${difficultyMap[logEntry.feedback.difficulty]?.darkColor || ''}`}>{difficultyMap[logEntry.feedback.difficulty]?.text || '-'}</p>
                        </div>
                         <div className="bg-slate-100 dark:bg-slate-700/50 p-3 rounded-md">
                            <p className="text-slate-500 dark:text-gray-400">כאב</p>
                            <p className={`font-bold ${logEntry.feedback.painLevel > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-gray-300'}`}>
                                {logEntry.feedback.painLevel > 0 ? `רמה ${logEntry.feedback.painLevel} (${logEntry.feedback.painLocation})` : 'ללא'}
                            </p>
                        </div>
                        {logEntry.feedback.notes && (
                            <div className="md:col-span-3 bg-slate-100 dark:bg-slate-700/50 p-3 rounded-md">
                                <p className="text-slate-500 dark:text-gray-400">הערות</p>
                                <p className="text-slate-700 dark:text-gray-300 whitespace-pre-wrap">{logEntry.feedback.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTracker;
