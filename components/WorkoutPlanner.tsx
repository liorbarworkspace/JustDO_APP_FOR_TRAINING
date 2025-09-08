import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, EditIcon, TrashIcon } from './icons';
import type { CompletionLog, PlannedExercise, WorkoutTemplate, WeeklyPlan, ID, CompletionLogEntry } from '../types';
import { DAYS_OF_WEEK } from '../constants';

// Sub-component for a single exercise in the plan
const PlannedExerciseItem: React.FC<{
    exercise: PlannedExercise;
    isCompleted: boolean;
    onToggle: () => void;
    onEdit: () => void;
    onRemove: () => void;
}> = ({ exercise, isCompleted, onToggle, onEdit, onRemove }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const setsRepsString = [
        exercise.sets ? `${exercise.sets} סטים` : '',
        exercise.reps ? `x ${exercise.reps}` : '',
        exercise.duration ? `${exercise.duration} שניות` : '',
    ].filter(Boolean).join(' ');

    return (
        <div className={`p-3 rounded-lg transition-all duration-300 ${isCompleted ? 'bg-green-500/10' : 'bg-slate-700/50'}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={onToggle}
                        className="form-checkbox h-5 w-5 rounded bg-slate-600 border-slate-500 text-cyan-500 focus:ring-cyan-600"
                    />
                    <div>
                        <p className="font-semibold text-gray-100">{exercise.name}</p>
                        <p className="text-sm text-gray-400">{setsRepsString}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onEdit} className="p-1.5 text-cyan-400 hover:text-white hover:bg-slate-600 rounded-full transition-colors"><EditIcon className="w-4 h-4"/></button>
                    <button onClick={onRemove} className="p-1.5 text-red-400 hover:text-white hover:bg-slate-600 rounded-full transition-colors"><TrashIcon className="w-4 h-4"/></button>
                </div>
            </div>
             <button onClick={() => setIsExpanded(!isExpanded)} className="w-full text-right flex justify-between items-center p-2 mt-2 rounded-md hover:bg-slate-700/60 focus:outline-none text-xs text-gray-400">
                <span className="font-semibold">פרטים</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
             {isExpanded && (
                <div className="mt-2 space-y-2 text-gray-300 border-t border-slate-600 pt-2 text-sm">
                    <div>
                        <h4 className="font-semibold text-cyan-500">תיאור:</h4>
                        <p className="leading-relaxed">{exercise.description}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-red-400">בטיחות:</h4>
                        <p className="leading-relaxed">{exercise.safetyNotes}</p>
                    </div>
                </div>
            )}
        </div>
    );
};


const DailyWorkoutItem: React.FC<{
    day: string;
    date: Date;
    workout: WorkoutTemplate | null;
    workoutTemplates: WorkoutTemplate[];
    weeklyPlanName: string;
    weeklyPlanId: ID;
    logEntry: CompletionLogEntry | undefined;
    onUpdateCompletion: (date: string, logEntry: CompletionLogEntry) => void;
    onRemoveCompletion: (date: string) => void;
    onEditExercise: (workoutId: string, exercise: PlannedExercise) => void;
    onRemoveExercise: (workoutId: string, planInstanceId: string) => void;
    onUpdateSchedule: (planId: ID, day: string, templateId: ID | null) => void;
}> = (props) => {
    const { day, date, workout, workoutTemplates, weeklyPlanName, weeklyPlanId, logEntry, onUpdateCompletion, onRemoveCompletion, onEditExercise, onRemoveExercise, onUpdateSchedule } = props;
    const [isExpanded, setIsExpanded] = useState(false);
    const dateStr = date.toISOString().split('T')[0];
    
    const completedExercises = logEntry?.completedExercises ?? {};

    const handleToggleExercise = (exercise: PlannedExercise) => {
        if (!workout) return;
        const newCompleted = { ...(completedExercises) };
        if (newCompleted[exercise.planInstanceId]) {
            delete newCompleted[exercise.planInstanceId];
        } else {
            newCompleted[exercise.planInstanceId] = exercise;
        }

        onUpdateCompletion(dateStr, {
            weeklyPlanName,
            dayOfWeek: day,
            workoutTemplate: workout, // Snapshot
            completedExercises: newCompleted
        });
    };
    
    const handleMasterButton = () => {
        const isAnythingCompleted = workout && workout.exercises.some(ex => completedExercises[ex.planInstanceId]);

        if (isAnythingCompleted) {
            onRemoveCompletion(dateStr);
        } else if (workout && workout.exercises.length > 0) {
            const allCompleted = workout.exercises.reduce((acc, ex) => {
                acc[ex.planInstanceId] = ex;
                return acc;
            }, {} as { [planInstanceId: string]: PlannedExercise });
            onUpdateCompletion(dateStr, { weeklyPlanName, dayOfWeek: day, workoutTemplate: workout, completedExercises: allCompleted });
        }
    };
    
    const isDayCompleted = workout ? workout.exercises.length > 0 && workout.exercises.every(ex => !!completedExercises[ex.planInstanceId]) : false;
    const buttonText = isDayCompleted ? "בטל השלמה" : "סמן הכל כהושלם";
    const buttonClass = isDayCompleted 
        ? "bg-amber-600 hover:bg-amber-700 focus:ring-amber-400" 
        : "bg-green-600 hover:bg-green-700 focus:ring-green-400";


    return (
        <div className={`rounded-lg border transition-all duration-300 ${isDayCompleted ? 'bg-green-900/30 border-green-700' : 'bg-slate-800/50 border-slate-700'}`}>
            <div className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-gray-200">יום {day}</h3>
                        <p className="text-sm text-gray-400">{date.toLocaleDateString('he-IL', { day: 'numeric', month: 'long' })}</p>
                    </div>
                     <select
                        value={workout?.id || ''}
                        onChange={(e) => onUpdateSchedule(weeklyPlanId, day, e.target.value || null)}
                        className="bg-slate-700 border border-slate-600 text-white text-md rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2"
                        aria-label={`בחר אימון ליום ${day}`}
                    >
                        <option value="">-- מנוחה --</option>
                        {workoutTemplates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                    </select>
                </div>
                 <button onClick={() => setIsExpanded(!isExpanded)} className="w-full text-right flex justify-between items-center mt-3 focus:outline-none">
                    <p className={`text-md ${workout ? 'text-cyan-400' : 'text-gray-500'}`}>{workout ? workout.title : 'אין אימון משובץ'}</p>
                    <div className="flex items-center gap-4">
                        {isDayCompleted && <span className="text-sm font-bold text-green-400">הושלם!</span>}
                        <ChevronDownIcon className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                </button>
            </div>
            
            {isExpanded && workout && (
                <div className="p-4 border-t border-slate-700">
                    {workout.exercises.length > 0 ? (
                        <>
                            <div className="mb-6">
                                <button
                                    onClick={handleMasterButton}
                                    className={`w-full text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-75 ${buttonClass}`}
                                >
                                    {buttonText}
                                </button>
                            </div>
                            <div className="space-y-3">
                                {workout.exercises.map(ex => (
                                    <PlannedExerciseItem
                                        key={ex.planInstanceId}
                                        exercise={ex}
                                        isCompleted={!!completedExercises[ex.planInstanceId]}
                                        onToggle={() => handleToggleExercise(ex)}
                                        onEdit={() => onEditExercise(workout.id, ex)}
                                        onRemove={() => onRemoveExercise(workout.id, ex.planInstanceId)}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="text-center text-gray-500">תבנית אימון זו ריקה. ניתן להוסיף תרגילים בספריית התרגילים.</p>
                    )}
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
    onUpdateCompletion: (date: string, logEntry: CompletionLogEntry) => void;
    onRemoveCompletion: (date: string) => void;
    onEditExercise: (workoutId: string, exercise: PlannedExercise) => void;
    onRemoveExercise: (workoutId: string, planInstanceId: string) => void;
    onUpdateSchedule: (planId: ID, day: string, templateId: ID | null) => void;
}> = (props) => {
    const { weeklyPlans, workoutTemplates, activeWeeklyPlanId, onSetActiveWeeklyPlanId, completionLog, ...rest } = props;
    const [weekDates, setWeekDates] = useState<Date[]>([]);

    useEffect(() => {
        const today = new Date();
        const dayOfWeek = today.getDay(); // Sunday - 0, ...
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - dayOfWeek); // Set to last Sunday

        const dates = Array.from({ length: 7 }).map((_, i) => {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            return date;
        });
        setWeekDates(dates);
    }, []);
    
    const activePlan = weeklyPlans.find(p => p.id === activeWeeklyPlanId);
    if (!activePlan) return <div className="text-center p-8">תוכנית לא נמצאה</div>;

    const templateMap = new Map(workoutTemplates.map(t => [t.id, t]));
    
    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-6 text-right">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white">תוכנית אימונים שבועית</h2>
                    <p className="text-gray-400">היום: {new Date().toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div>
                     <label htmlFor="week-select" className="block mb-2 text-sm font-medium text-gray-300">בחר תוכנית שבועית:</label>
                    <select
                        id="week-select"
                        value={activeWeeklyPlanId}
                        onChange={(e) => onSetActiveWeeklyPlanId(e.target.value)}
                        className="bg-slate-700 border border-slate-600 text-white text-lg rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full md:w-auto p-2.5"
                    >
                        {weeklyPlans.map(plan => (
                            <option key={plan.id} value={plan.id}>{plan.name}</option>
                        ))}
                    </select>
                </div>
            </div>
             <p className="text-gray-400 mb-8">שבץ תבניות אימון לכל יום, עקוב אחר התוכנית וסמן תרגילים שהושלמו.</p>
            
            <div className="space-y-4">
                {DAYS_OF_WEEK.map((day, index) => {
                    const date = weekDates[index];
                    if(!date) return null; // Should not happen
                    
                    const dateStr = date.toISOString().split('T')[0];
                    const workoutId = activePlan.schedule[day];
                    const workout = workoutId ? templateMap.get(workoutId) ?? null : null;
                    
                    return (
                        <DailyWorkoutItem
                            key={day}
                            day={day}
                            date={date}
                            workout={workout}
                            workoutTemplates={workoutTemplates}
                            weeklyPlanName={activePlan.name}
                            weeklyPlanId={activePlan.id}
                            logEntry={completionLog[dateStr]}
                            {...rest}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default WorkoutPlanner;