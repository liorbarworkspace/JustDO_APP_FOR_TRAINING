

import React from 'react';
import { ClipboardCheckIcon, TrashIcon, DownloadIcon, MessageSquarePlusIcon, SparklesIcon } from './icons';
import type { CompletionLog } from '../types';

interface ProgressTrackerProps {
  completionLog: CompletionLog;
  onRemoveCompletion: (date: string) => void;
  onOpenFeedbackModal: (date: string) => void;
  onExportHistory: () => void;
}

const feelingMap: { [key: string]: { text: string; color: string } } = {
  excellent: { text: 'מצוינת', color: 'text-green-400' },
  good: { text: 'טובה', color: 'text-cyan-400' },
  ok: { text: 'בסדר', color: 'text-yellow-400' },
  tired: { text: 'עייפות', color: 'text-orange-400' },
};

const difficultyMap: { [key: string]: { text: string; color: string } } = {
  easy: { text: 'קל מדי', color: 'text-cyan-400' },
  just_right: { text: 'בול', color: 'text-green-400' },
  hard: { text: 'קשה מדי', color: 'text-yellow-400' },
};

const getAutomatedRecommendation = (completionLog: CompletionLog): string => {
    const completedEntries = Object.entries(completionLog)
        .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
        .slice(0, 5); // Analyze last 5 entries

    if (completedEntries.length === 0) {
        return "התחל להתאמן כדי לקבל טיפים מותאמים אישית!";
    }

    // Rule 1: Check for pain
    const painEntry = completedEntries.find(([_, entry]) => entry.feedback && entry.feedback.painLevel > 1);
    if (painEntry) {
        return `שמתי לב שדיווחת על כאב (${painEntry[1].feedback?.painLocation}). חשוב להקשיב לגוף. שקול לנוח או לבצע תרגילי הרפיה ומתיחות עדינות. אם הכאב ממשיך, מומלץ להתייעץ עם איש מקצוע.`;
    }

    // Rule 2: Check for difficulty
    const hardWorkouts = completedEntries.filter(([_, entry]) => entry.feedback?.difficulty === 'hard').length;
    if (hardWorkouts >= 2 && completedEntries.length > 2) {
        return "כל הכבוד על המאמץ! נראה שהאימונים האחרונים היו מאתגרים במיוחד. זכור שמנוחה היא חלק חיוני מההתקדמות. אולי כדאי לשקול אימון קל יותר או יום מנוחה פעילה.";
    }

    // Rule 3: Check for consistency
    if (completedEntries.length >= 3) {
        const firstDate = new Date(completedEntries[0][0]);
        const lastDate = new Date(completedEntries[completedEntries.length - 1][0]);
        const diffTime = Math.abs(firstDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 10 && completedEntries.length >= 3) {
             return "עבודה מצוינת על העקביות וההתמדה! זה המפתח האמיתי להתקדמות. המשך כך!";
        }
    }
    
    // Rule 4: Encourage feedback
    const noFeedbackEntries = completedEntries.filter(([_, entry]) => !entry.feedback).length;
    if (completedEntries.length > 1 && noFeedbackEntries > completedEntries.length / 2) {
        return "כדי שאוכל לתת טיפים מדויקים יותר, נסה למלא משוב לאחר כל אימון. זה יעזור לנו לעקוב אחר ההתקדמות ולהתאים את התוכנית במידת הצורך.";
    }

    // Default message
    return "אתה בדרך הנכונה! כל אימון הוא צעד נוסף לעבר המטרה שלך.";
};


const ProgressTracker: React.FC<ProgressTrackerProps> = ({ completionLog, onRemoveCompletion, onOpenFeedbackModal, onExportHistory }) => {
  const completedEntries = Object.entries(completionLog)
    .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(new Date(dateA).setHours(0,0,0,0)).getTime());

  const recommendation = getAutomatedRecommendation(completionLog);

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">היסטוריית אימונים</h2>
            <p className="text-gray-400">כל הכבוד על ההתמדה! כאן תוכל לראות את האימונים שהשלמת.</p>
          </div>
           <button
              onClick={onExportHistory}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2"
          >
              <DownloadIcon className="w-5 h-5" />
              <span>ייצוא היסטוריה</span>
          </button>
      </div>

      <div className="my-8 bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <h3 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center justify-end gap-2">
            טיפ מהמאמן האוטומטי <SparklesIcon className="w-6 h-6"/>
        </h3>
        <div className="p-4 bg-slate-900/50 rounded-lg border border-cyan-700">
          <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{recommendation}</p>
        </div>
      </div>
      
      <div className="space-y-6 mt-8">
        {completedEntries.map(([date, logEntry]) => {
          const completedExercises = Object.values(logEntry.completedExercises);
          const hasFeedback = !!logEntry.feedback;
          
          return (
            <div key={date} className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 transition-all duration-300 hover:border-slate-600 hover:shadow-lg">
              <div className="flex justify-between items-start border-b border-slate-700 pb-3 mb-4">
                  <div>
                    <p className="text-lg font-bold text-cyan-400">
                        {new Date(date).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <p className="text-gray-300 font-semibold">{logEntry.weeklyPlanName} - יום {logEntry.dayOfWeek}</p>
                    <p className="text-sm text-gray-400">{logEntry.workoutTemplate.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                     <button onClick={() => onOpenFeedbackModal(date)} className={`p-2 rounded-full transition-colors ${hasFeedback ? 'text-cyan-400 hover:text-white hover:bg-cyan-600' : 'text-gray-400 hover:text-white hover:bg-slate-600'}`}>
                        <MessageSquarePlusIcon className="w-6 h-6" />
                    </button>
                    <button onClick={() => onRemoveCompletion(date)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-900/50 rounded-full transition-colors">
                        <TrashIcon className="w-6 h-6" />
                    </button>
                  </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2">תרגילים שהושלמו ({completedExercises.length}):</h4>
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

              {logEntry.feedback && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                    <h4 className="font-semibold text-white mb-2">משוב על האימון:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-slate-700/50 p-3 rounded-md">
                            <p className="text-gray-400">הרגשה כללית</p>
                            <p className={`font-bold ${feelingMap[logEntry.feedback.feeling]?.color || ''}`}>{feelingMap[logEntry.feedback.feeling]?.text || '-'}</p>
                        </div>
                         <div className="bg-slate-700/50 p-3 rounded-md">
                            <p className="text-gray-400">רמת קושי</p>
                            <p className={`font-bold ${difficultyMap[logEntry.feedback.difficulty]?.color || ''}`}>{difficultyMap[logEntry.feedback.difficulty]?.text || '-'}</p>
                        </div>
                         <div className="bg-slate-700/50 p-3 rounded-md">
                            <p className="text-gray-400">כאב</p>
                            <p className={`font-bold ${logEntry.feedback.painLevel > 0 ? 'text-red-400' : 'text-gray-300'}`}>
                                {logEntry.feedback.painLevel > 0 ? `רמה ${logEntry.feedback.painLevel} (${logEntry.feedback.painLocation})` : 'ללא'}
                            </p>
                        </div>
                        {logEntry.feedback.notes && (
                            <div className="md:col-span-3 bg-slate-700/50 p-3 rounded-md">
                                <p className="text-gray-400">הערות</p>
                                <p className="text-gray-300 whitespace-pre-wrap">{logEntry.feedback.notes}</p>
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
