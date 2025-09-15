import React, { useState, useEffect } from 'react';
import { CheckCircle2Icon, MessageSquarePlusIcon, PlayIconFlipped, EditIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';
import type { CompletionLog, WorkoutTemplate, WeeklyPlan, ID } from '../types';
import { DAYS_OF_WEEK } from '../constants';

const categoryColorMap: { [key: string]: string } = {
  'כוח': 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300',
  'ליבה': 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
  'אירובי': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-300',
  'קליסטניקס': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300',
  'כדורסל': 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-300',
  'חימום': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-300',
  'גמישות': 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300',
  'שיקום': 'bg-lime-100 text-lime-800 dark:bg-lime-900/60 dark:text-lime-300',
  'הרפיה': 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/60 dark:text-fuchsia-300',
  'מנוחה': 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
  'default': 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300',
};

const getCategoryColor = (category: string) => {
    return categoryColorMap[category] || categoryColorMap['default'];
};


interface DailyWorkoutCardProps {
    day: string;
    date: Date;
    workout: WorkoutTemplate | null;
    isCompleted: boolean;
    isToday: boolean;
    onMarkComplete: () => void;
    onAddFeedback: () => void;
    onEdit: () => void;
}

const DailyWorkoutCard: React.FC<DailyWorkoutCardProps> = ({ day, date, workout, isCompleted, isToday, onMarkComplete, onAddFeedback, onEdit }) => {
    const cardBaseClasses = "flex flex-col rounded-xl border-2 transition-all duration-300 shadow-sm";
    const cardStateClasses = isCompleted
        ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-500/10'
        : isToday
        ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10'
        : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700';

    const headerBaseClasses = "p-3 border-b-2 flex justify-between items-center";
    const headerStateClasses = isCompleted
        ? 'border-green-300 dark:border-green-700'
        : isToday
        ? 'border-amber-500'
        : 'border-slate-200 dark:border-slate-700';

    return (
        <div className={`${cardBaseClasses} ${cardStateClasses}`}>
            {/* Header */}
            <div className={`${headerBaseClasses} ${headerStateClasses}`}>
                <div>
                    <h3 className="text-lg font-extrabold text-slate-800 dark:text-gray-200">{day}</h3>
                    <p className="text-sm text-slate-500 dark:text-gray-400">{date.toLocaleDateString('he-IL', { day: 'numeric', month: 'long' })}</p>
                </div>
                {isCompleted && (
                    <CheckCircle2Icon className="w-7 h-7 text-green-500" />
                )}
            </div>

            {/* Body */}
            <div className="p-4 flex-grow flex flex-col">
                 <h4 className={`text-xl font-bold ${workout ? (isCompleted ? 'text-green-800 dark:text-green-300' : 'text-amber-600 dark:text-amber-400') : 'text-slate-500 dark:text-gray-500'}`}>{workout ? workout.title : 'מנוחה'}</h4>
                {workout && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {workout.tags.map(tag => (
                            <span key={tag} className={`${getCategoryColor(tag)} text-xs font-semibold px-2 py-0.5 rounded-full`}>{tag}</span>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer with Actions */}
            {workout && (
                <div className="px-3 pt-3 pb-3 mt-auto border-t border-slate-200 dark:border-slate-700">
                    <div className="flex justify-center items-center gap-2">
                        {isCompleted ? (
                            <>
                                <button 
                                    onClick={onEdit}
                                    className="w-1/2 flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-gray-200 font-semibold py-2 px-3 rounded-md transition-colors text-sm"
                                >
                                    <EditIcon className="w-4 h-4" />
                                    <span>ערוך</span>
                                </button>
                                <button 
                                    onClick={onAddFeedback}
                                    className="w-1/2 flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-gray-200 font-semibold py-2 px-3 rounded-md transition-colors text-sm"
                                >
                                    <MessageSquarePlusIcon className="w-4 h-4" />
                                    <span>משוב</span>
                                </button>
                            </>
                        ) : (
                           <button 
                                onClick={onMarkComplete}
                                className="w-full flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-gray-200 font-semibold py-2 px-3 rounded-md transition-colors text-sm"
                           >
                               <CheckCircle2Icon className="w-4 h-4" />
                               <span>סמן כהושלם</span>
                           </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const WorkoutPlanner: React.FC<{
    weeklyPlans: WeeklyPlan[];
    workoutTemplates: WorkoutTemplate[];
    activeWeeklyPlanId: ID;
    onSetActiveWeeklyPlanId: (id: ID) => void;
    completionLog: CompletionLog;
    onMarkDayComplete: (date: string, workout: WorkoutTemplate) => void;
    onOpenFeedbackModal: (date: string) => void;
    onOpenEditLogModal: (date: string) => void;
    setActiveTab: (tab: 'plan' | 'progress' | 'library' | 'workout') => void;
}> = (props) => {
    const { weeklyPlans, workoutTemplates, activeWeeklyPlanId, onSetActiveWeeklyPlanId, completionLog, setActiveTab, onMarkDayComplete, onOpenFeedbackModal, onOpenEditLogModal } = props;
    const [weekOffset, setWeekOffset] = useState(0);
    const [weekDates, setWeekDates] = useState<Date[]>([]);

    useEffect(() => {
        const today = new Date();
        const dayOfWeek = today.getDay(); 
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - dayOfWeek + (weekOffset * 7)); 

        const dates = Array.from({ length: 7 }).map((_, i) => {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            return date;
        });
        setWeekDates(dates);
    }, [weekOffset]);
    
    const activePlan = weeklyPlans.find(p => p.id === activeWeeklyPlanId);
    if (!activePlan) return <div className="text-center p-8">תוכנית לא נמצאה</div>;

    const templateMap = new Map(workoutTemplates.map(t => [t.id, t]));
    
    const weekDateRange = weekDates.length > 0
        ? `${weekDates[0].toLocaleDateString('he-IL', { day: 'numeric', month: 'long' })} - ${weekDates[6].toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })}`
        : 'טוען...';

    return (
        <div className="w-full max-w-screen-xl mx-auto p-4 md:p-6 text-right">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <div>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight font-rubik">תוכנית אימונים</h2>
                    <p className="text-slate-500 dark:text-gray-400 mt-2 text-lg">{weekDateRange}</p>
                </div>
                <div>
                     <label htmlFor="week-select" className="block mb-2 text-sm font-medium text-slate-600 dark:text-gray-300">בחר תוכנית:</label>
                    <select
                        id="week-select"
                        value={activeWeeklyPlanId}
                        onChange={(e) => onSetActiveWeeklyPlanId(e.target.value)}
                        className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-lg rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full md:w-auto p-2.5"
                    >
                        {weeklyPlans.map(plan => (
                            <option key={plan.id} value={plan.id}>{plan.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="my-8 bg-violet-50 dark:bg-slate-800/50 rounded-xl p-6 border border-violet-200 dark:border-slate-700 text-center shadow-sm">
                 <button 
                    onClick={() => setActiveTab('workout')}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-5 px-10 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-500/30 focus:outline-none focus:ring-4 focus:ring-amber-500 focus:ring-opacity-50 flex items-center justify-center gap-3 text-2xl mx-auto"
                 >
                    <PlayIconFlipped className="w-8 h-8" />
                    <span className="font-rubik">התחל אימון להיום</span>
                 </button>
            </div>

            <div className="flex justify-center items-center gap-4 mb-8">
                <button onClick={() => setWeekOffset(prev => prev - 1)} className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-md transition-colors">
                    <ChevronRightIcon className="w-5 h-5" />
                    <span>שבוע קודם</span>
                </button>
                 <button onClick={() => setWeekOffset(0)} disabled={weekOffset === 0} className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    השבוע הנוכחי
                </button>
                <button onClick={() => setWeekOffset(prev => prev + 1)} className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-md transition-colors">
                    <span>שבוע הבא</span>
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {weekDates.map((date, index) => {
                    if(!date) return null;
                    
                    const day = DAYS_OF_WEEK[index];
                    const dateStr = date.toISOString().split('T')[0];
                    const isCompleted = !!completionLog[dateStr];
                    const isToday = new Date().toDateString() === date.toDateString();
                    
                    const workoutId = activePlan.schedule[day];
                    const workout = workoutId ? templateMap.get(workoutId) ?? null : null;
                    
                    return (
                        <DailyWorkoutCard
                            key={date.toISOString()}
                            day={day}
                            date={date}
                            workout={workout}
                            isCompleted={isCompleted}
                            isToday={isToday}
                            onMarkComplete={() => {
                                if (workout) {
                                    onMarkDayComplete(dateStr, workout)
                                }
                            }}
                            onAddFeedback={() => onOpenFeedbackModal(dateStr)}
                            onEdit={() => onOpenEditLogModal(dateStr)}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default WorkoutPlanner;