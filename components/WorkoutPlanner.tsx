import React, { useState } from 'react';
import { ChevronDownIcon, EditIcon, TrashIcon } from './icons';
import type { DailyPlan, CompletionLog, PlannedExercise } from '../types';

interface WorkoutPlannerProps {
    workoutPlan: DailyPlan[];
    completionLog: CompletionLog;
    onUpdateCompletion: (date: string, workoutDay: string, completedExercises: { [planInstanceId: string]: PlannedExercise }) => void;
    onRemoveCompletion: (date: string) => void;
    onEditExercise: (day: string, exercise: PlannedExercise) => void;
    onRemoveExercise: (day: string, planInstanceId: string) => void;
}

const PlannedExerciseItem: React.FC<{
    exercise: PlannedExercise;
    isChecked: boolean;
    onCheckChange: (isChecked: boolean) => void;
    onEdit: () => void;
    onRemove: () => void;
}> = ({ exercise, isChecked, onCheckChange, onEdit, onRemove }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const setsRepsString = [
        exercise.sets ? `${exercise.sets} סטים` : '',
        exercise.reps ? `x ${exercise.reps}` : '',
        exercise.duration ? `${exercise.duration} שניות` : '',
    ].filter(Boolean).join(' ');

    return (
        <div className={`p-3 rounded-lg transition-colors duration-200 ${isChecked ? 'bg-green-900/50 border-green-700' : 'bg-slate-700/50 border-slate-600'} border`}>
            <div className="flex items-center">
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => onCheckChange(e.target.checked)}
                    className="h-6 w-6 rounded bg-slate-600 border-slate-500 text-cyan-500 focus:ring-cyan-600 cursor-pointer"
                />
                <div className="mr-4 flex-grow">
                    <span className="text-lg text-gray-100 font-semibold">{exercise.name}</span>
                    <p className="text-sm text-gray-400">{setsRepsString}</p>
                </div>
                <div className="flex items-center gap-2">
                     <button onClick={onEdit} className="p-2 text-gray-400 hover:text-cyan-400 rounded-full hover:bg-slate-600 transition-colors">
                        <EditIcon className="w-5 h-5" />
                    </button>
                    <button onClick={onRemove} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-slate-600 transition-colors">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
             <div className="mt-2">
                <button onClick={() => setIsExpanded(!isExpanded)} className="w-full text-right flex justify-between items-center p-2 rounded-md hover:bg-slate-700 text-sm text-gray-400">
                    <span>פרטים</span>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                {isExpanded && (
                    <div className="mt-2 space-y-2 text-gray-300 border-t border-slate-600 pt-2 px-2">
                        <p className="text-sm"><strong className="text-cyan-500">תיאור:</strong> {exercise.description}</p>
                        <p className="text-sm"><strong className="text-red-400">בטיחות:</strong> {exercise.safetyNotes}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const WorkoutPlanner: React.FC<WorkoutPlannerProps> = ({ workoutPlan, completionLog, onUpdateCompletion, onRemoveCompletion, onEditExercise, onRemoveExercise }) => {
    const [selectedDay, setSelectedDay] = useState<string>(workoutPlan[0].day);
    const today = new Date().toISOString().split('T')[0];

    const currentDayPlan = workoutPlan.find(plan => plan.day === selectedDay);
    const todayLog = completionLog[today];
    
    const allExercisesForDay = currentDayPlan?.activities.flatMap(a => a.exercises) || [];

    const handleCheckChange = (exercise: PlannedExercise, isChecked: boolean) => {
        if (!currentDayPlan) return;
        
        const currentCompleted = todayLog?.completedExercises || {};
        const newCompleted = { ...currentCompleted };

        if (isChecked) {
            newCompleted[exercise.planInstanceId] = exercise; // Save a snapshot
        } else {
            delete newCompleted[exercise.planInstanceId];
        }
        
        if (Object.keys(newCompleted).length === 0 && todayLog) {
            onRemoveCompletion(today);
        } else {
            onUpdateCompletion(today, currentDayPlan.day, newCompleted);
        }
    };
    
    const handleMasterButton = () => {
        if (!currentDayPlan) return;
        if (todayLog && todayLog.workoutDay === currentDayPlan.day) {
            onRemoveCompletion(today);
        } else {
            const allCompleted = allExercisesForDay.reduce((acc, ex) => {
                acc[ex.planInstanceId] = ex;
                return acc;
            }, {} as { [planInstanceId: string]: PlannedExercise });
            onUpdateCompletion(today, currentDayPlan.day, allCompleted);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-6 text-right">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">תוכנית חודש 1: בניית יסודות</h2>
            <p className="text-gray-400 mb-8">כל אימון עובד על כל הגוף (Full Body). הקפידו על 48 שעות מנוחה בין אימונים.</p>
            
            <div className="flex flex-wrap justify-center gap-2 mb-8">
                {workoutPlan.map(plan => (
                    <button
                        key={plan.day}
                        onClick={() => setSelectedDay(plan.day)}
                        className={`px-4 py-2 rounded-md font-semibold transition-all duration-300 ${
                            selectedDay === plan.day
                                ? 'bg-cyan-600 text-white shadow-lg'
                                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                        }`}
                    >
                        {plan.day}
                    </button>
                ))}
            </div>

            {currentDayPlan && (
                <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-cyan-400">{currentDayPlan.type}</h3>
                        <p className="text-gray-300">{currentDayPlan.duration}</p>
                    </div>

                     <div className="mb-8">
                        {(() => {
                            if (currentDayPlan.type.includes('מנוחה') || allExercisesForDay.length === 0) {
                                return <p className="text-center text-lg font-semibold text-gray-500">יום מנוחה - תנו לגוף להתאושש.</p>
                            }
                            
                            const isTodayPlanCompleted = todayLog && todayLog.workoutDay === currentDayPlan.day;
                            const isAnotherPlanCompleted = todayLog && todayLog.workoutDay !== currentDayPlan.day;
                            const buttonText = isTodayPlanCompleted ? "בטל השלמת אימון" : "סמן הכל כהושלם";
                            const buttonClass = isTodayPlanCompleted 
                                ? "bg-amber-600 hover:bg-amber-700 focus:ring-amber-400" 
                                : "bg-green-600 hover:bg-green-700 focus:ring-green-400";

                            return (
                                <button
                                    onClick={handleMasterButton}
                                    disabled={isAnotherPlanCompleted}
                                    className={`w-full text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-75 disabled:bg-slate-600 disabled:text-gray-400 disabled:cursor-not-allowed ${buttonClass}`}
                                >
                                    {isAnotherPlanCompleted ? `אימון ליום ${todayLog.workoutDay} כבר הושלם היום` : buttonText}
                                </button>
                            );
                        })()}
                    </div>

                    <div className="space-y-6">
                        {currentDayPlan.activities.map((activity, index) => (
                            <div key={index} className="border-t border-slate-700 pt-4">
                                <div className="flex justify-between items-baseline">
                                    <h4 className="text-xl font-semibold text-white">{activity.title}</h4>
                                    {activity.duration && <span className="text-sm text-gray-400">{activity.duration}</span>}
                                </div>
                                <p className="text-gray-400 mt-1">{activity.details}</p>
                                
                                {activity.exercises && activity.exercises.length > 0 && (
                                    <div className="space-y-4 mt-4">
                                        {activity.exercises.map(exercise => {
                                            const isChecked = todayLog?.workoutDay === currentDayPlan.day && !!todayLog?.completedExercises[exercise.planInstanceId];
                                            return (
                                                <PlannedExerciseItem
                                                    key={exercise.planInstanceId}
                                                    exercise={exercise}
                                                    isChecked={isChecked}
                                                    onCheckChange={(checked) => handleCheckChange(exercise, checked)}
                                                    onEdit={() => onEditExercise(currentDayPlan.day, exercise)}
                                                    onRemove={() => onRemoveExercise(currentDayPlan.day, exercise.planInstanceId)}
                                                />
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkoutPlanner;