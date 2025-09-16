import React, { useState, useEffect } from 'react';
import type { CompletionLogEntry, PlannedExercise } from '../types';

interface EditCompletionLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (date: string, updatedEntry: CompletionLogEntry) => void;
    logEntryData: { date: string, entry: CompletionLogEntry };
}

export const EditCompletionLogModal: React.FC<EditCompletionLogModalProps> = ({ isOpen, onClose, onSave, logEntryData }) => {
    const { date, entry } = logEntryData;
    const [editedCompletedExercises, setEditedCompletedExercises] = useState<{ [planInstanceId: string]: PlannedExercise }>(entry.completedExercises);

    useEffect(() => {
        if (isOpen) {
            setEditedCompletedExercises(entry.completedExercises);
        }
    }, [isOpen, entry.completedExercises]);

    if (!isOpen) return null;

    const handleToggleExercise = (exercise: PlannedExercise, isCompleted: boolean) => {
        setEditedCompletedExercises(prev => {
            const newState = { ...prev };
            if (isCompleted) {
                newState[exercise.planInstanceId] = exercise;
            } else {
                delete newState[exercise.planInstanceId];
            }
            return newState;
        });
    };

    const handleExerciseDetailChange = (planInstanceId: string, field: 'sets' | 'reps' | 'duration', value: string | number) => {
        setEditedCompletedExercises(prev => {
            if (!prev[planInstanceId]) return prev; 
            
            const updatedExercise = { ...prev[planInstanceId] };
            
            if (field === 'sets' || field === 'duration') {
                const numValue = Number(value);
                updatedExercise[field] = isNaN(numValue) || numValue === 0 ? undefined : numValue;
            } else {
                 updatedExercise[field] = value === '' ? undefined : String(value);
            }

            return {
                ...prev,
                [planInstanceId]: updatedExercise,
            };
        });
    };
    
    const handleSave = () => {
        const updatedEntry: CompletionLogEntry = {
            ...entry,
            completedExercises: editedCompletedExercises,
        };
        onSave(date, updatedEntry);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 md:p-8 max-w-2xl w-full text-right border border-amber-300 dark:border-amber-500 flex flex-col" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-2 text-amber-600 dark:text-amber-400 font-rubik">עריכת אימון שהושלם</h2>
                <p className="text-slate-500 dark:text-gray-400 mb-6">
                    {entry.workoutTemplate.title} - {new Date(date).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                
                <div className="space-y-3 flex-grow overflow-y-auto pr-2">
                    {entry.workoutTemplate.exercises.map(exercise => {
                        const isCompleted = !!editedCompletedExercises[exercise.planInstanceId];
                        const loggedExercise = editedCompletedExercises[exercise.planInstanceId] || exercise;
                        const durationInSeconds = loggedExercise.duration || 0;
                        const currentMinutes = Math.floor(durationInSeconds / 60);
                        const currentSeconds = durationInSeconds % 60;

                        return (
                            <div key={exercise.planInstanceId} className={`p-3 rounded-lg border-2 transition-all ${isCompleted ? 'bg-green-50/50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-slate-100 dark:bg-slate-700/50 border-transparent'}`}>
                                <div className="flex items-center justify-between">
                                    <label htmlFor={`check-${exercise.planInstanceId}`} className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            id={`check-${exercise.planInstanceId}`}
                                            checked={isCompleted}
                                            onChange={(e) => handleToggleExercise(exercise, e.target.checked)}
                                            className="w-5 h-5 text-amber-600 bg-slate-200 border-slate-400 rounded focus:ring-amber-500"
                                        />
                                        <span className={`font-semibold ${isCompleted ? 'text-slate-800 dark:text-gray-200' : 'text-slate-500 dark:text-gray-400'}`}>{exercise.name}</span>
                                    </label>
                                </div>
                                {isCompleted && (
                                    <div className="grid grid-cols-3 gap-2 mt-3 pr-8">
                                        <div>
                                            <label className="text-xs text-slate-500 dark:text-gray-400">סטים</label>
                                            <input type="number" value={loggedExercise.sets || ''} onChange={(e) => handleExerciseDetailChange(exercise.planInstanceId, 'sets', e.target.value)}
                                                className="w-full bg-white dark:bg-slate-700 p-1.5 rounded-md border border-slate-300 dark:border-slate-600 text-sm" />
                                        </div>
                                         <div>
                                            <label className="text-xs text-slate-500 dark:text-gray-400">חזרות</label>
                                            <input type="text" value={loggedExercise.reps || ''} onChange={(e) => handleExerciseDetailChange(exercise.planInstanceId, 'reps', e.target.value)}
                                                className="w-full bg-white dark:bg-slate-700 p-1.5 rounded-md border border-slate-300 dark:border-slate-600 text-sm" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 dark:text-gray-400">זמן</label>
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={currentMinutes}
                                                    onChange={(e) => {
                                                        const newMinutes = Number(e.target.value) || 0;
                                                        handleExerciseDetailChange(exercise.planInstanceId, 'duration', (newMinutes * 60) + currentSeconds);
                                                    }}
                                                    className="w-full bg-white dark:bg-slate-700 p-1.5 rounded-md border border-slate-300 dark:border-slate-600 text-sm"
                                                    placeholder="דק'"
                                                />
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="59"
                                                    value={currentSeconds}
                                                    onChange={(e) => {
                                                        const newSeconds = Number(e.target.value) || 0;
                                                        handleExerciseDetailChange(exercise.planInstanceId, 'duration', (currentMinutes * 60) + newSeconds);
                                                    }}
                                                    className="w-full bg-white dark:bg-slate-700 p-1.5 rounded-md border border-slate-300 dark:border-slate-600 text-sm"
                                                    placeholder="שנ'"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-end space-x-4 space-x-reverse pt-6 mt-4 border-t border-slate-200 dark:border-slate-700">
                    <button type="button" onClick={onClose} className="bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">ביטול</button>
                    <button type="button" onClick={handleSave} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">שמור שינויים</button>
                </div>
            </div>
        </div>
    );
};

interface InWorkoutEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedExercise: PlannedExercise) => void;
    exerciseData: PlannedExercise;
}

const parseRestTime = (restString: string): number => {
  if (!restString) return 60;
  const match = restString.match(/(\d+)/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return 60;
};


export const InWorkoutEditModal: React.FC<InWorkoutEditModalProps> = ({ isOpen, onClose, onSave, exerciseData }) => {
    const [editedExercise, setEditedExercise] = useState<PlannedExercise>(exerciseData);
    const [minutes, setMinutes] = useState<string>('');
    const [seconds, setSeconds] = useState<string>('');


    useEffect(() => {
        if (isOpen) {
            setEditedExercise(exerciseData);
            const d = exerciseData?.duration || 0;
            setMinutes(d > 0 ? String(Math.floor(d / 60)) : '');
            setSeconds(d > 0 ? String(d % 60) : '');
        }
    }, [isOpen, exerciseData]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setEditedExercise(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : value
        }));
    };
    
    const handleRestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const numValue = e.target.value;
        setEditedExercise(prev => ({
            ...prev,
            rest: `${numValue} שניות`
        }));
    };

    const handleSave = () => {
        const totalDuration = (Number(minutes || 0) * 60) + Number(seconds || 0);
        onSave({ ...editedExercise, duration: totalDuration > 0 ? totalDuration : undefined });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 md:p-8 max-w-md w-full text-right border border-amber-300 dark:border-amber-500" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-2 text-amber-600 dark:text-amber-400 font-rubik">עריכת ביצוע</h2>
                <p className="text-slate-500 dark:text-gray-400 mb-6">עדכן את הביצועים שלך עבור: <span className="font-semibold text-slate-800 dark:text-white">{exerciseData.name}</span></p>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="sets" className="block mb-2 text-sm font-medium text-slate-700 dark:text-gray-300">סטים</label>
                        <input type="number" id="sets" name="sets" value={editedExercise.sets || ''} onChange={handleChange} className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5" />
                    </div>
                    <div>
                        <label htmlFor="reps" className="block mb-2 text-sm font-medium text-slate-700 dark:text-gray-300">חזרות</label>
                        <input type="text" id="reps" name="reps" value={editedExercise.reps || ''} onChange={handleChange} className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5" />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-gray-300">משך</label>
                        <div className="flex items-center gap-2">
                           <input
                                type="number"
                                min="0"
                                value={minutes}
                                onChange={(e) => setMinutes(e.target.value)}
                                placeholder="דקות"
                                className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5"
                            />
                             <span className="text-slate-500 dark:text-gray-400 font-bold">:</span>
                            <input
                                type="number"
                                min="0"
                                max="59"
                                value={seconds}
                                onChange={(e) => setSeconds(e.target.value)}
                                placeholder="שניות"
                                className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="rest" className="block mb-2 text-sm font-medium text-slate-700 dark:text-gray-300">מנוחה (בשניות)</label>
                        <input type="number" id="rest" name="rest" value={parseRestTime(editedExercise.rest)} onChange={handleRestChange} className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5" />
                    </div>
                </div>

                <div className="flex justify-end space-x-4 space-x-reverse mt-8">
                    <button onClick={onClose} className="bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">ביטול</button>
                    <button onClick={handleSave} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">שמור שינויים</button>
                </div>
            </div>
        </div>
    );
};

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type: 'success' | 'error';
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, title, message, type }) => {
    if (!isOpen) return null;
    
    const isError = type === 'error';
    const borderColor = isError ? 'border-red-400 dark:border-red-500' : 'border-green-400 dark:border-green-500';
    const titleColor = isError ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';
    const buttonColor = isError ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 md:p-8 max-w-md w-full text-right border ${borderColor}`} onClick={e => e.stopPropagation()}>
                <h2 className={`text-2xl font-bold mb-4 ${titleColor}`}>{title}</h2>
                <p className="text-slate-600 dark:text-gray-300 mb-8 whitespace-pre-wrap">{message}</p>
                <div className="flex justify-end">
                    <button onClick={onClose} className={`${buttonColor} text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300`}>
                        הבנתי
                    </button>
                </div>
            </div>
        </div>
    );
};


interface OnboardingGuideProps {
    steps: { title: string; content: string; targetId?: string }[];
    step: number;
    onNext: () => void;
    onFinish: () => void;
}

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ steps, step, onNext, onFinish }) => {
    const [position, setPosition] = useState<{ top: number, left: number } | null>(null);
    const currentStep = steps[step - 1];

    useEffect(() => {
        const calculatePosition = () => {
            if (currentStep && currentStep.targetId) {
                const targetElement = document.getElementById(currentStep.targetId);
                if (targetElement) {
                    const rect = targetElement.getBoundingClientRect();
                    setPosition({
                        top: rect.bottom + 10,
                        left: rect.left + rect.width / 2,
                    });
                     targetElement.classList.add('onboarding-highlight');
                }
            } else {
                setPosition(null); // Center it if no target
            }
        };

        // Clear previous highlights before calculating new one
        document.querySelectorAll('.onboarding-highlight').forEach(el => el.classList.remove('onboarding-highlight'));
        
        // Timeout to allow tab switch to render before calculating position
        const timerId = setTimeout(calculatePosition, 50);

        return () => {
            clearTimeout(timerId);
            document.querySelectorAll('.onboarding-highlight').forEach(el => el.classList.remove('onboarding-highlight'));
        };

    }, [step, currentStep]);


    if (!currentStep) return null;
    
    const popoverContent = (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 max-w-sm w-full text-right border border-amber-300 dark:border-amber-500 relative">
             {position && (
                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-white dark:border-b-slate-800" style={{ marginBottom: '-1px' }}></div>
             )}
            <h2 className="text-xl font-bold mb-4 text-amber-600 dark:text-amber-400 font-rubik">{currentStep.title}</h2>
            <p className="text-slate-600 dark:text-gray-300 mb-6 leading-relaxed">{currentStep.content}</p>
             <div className="flex justify-between items-center">
                <button onClick={onFinish} className="text-sm text-slate-500 hover:underline">
                    דלג על הסיור
                </button>
                <button onClick={onNext} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300">
                    {step === steps.length ? 'סיום' : 'הבא'}
                </button>
            </div>
        </div>
    );

    return (
         <div className="fixed inset-0 bg-black/60 z-[100]">
            <style>{`
                .onboarding-highlight {
                    outline: 2px solid #f59e0b; /* amber-500 */
                    border-radius: 0.5rem;
                    box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.3);
                    position: relative;
                    z-index: 101;
                    transition: all 0.3s ease-in-out;
                }
            `}</style>
             {position ? (
                <div 
                    className="fixed -translate-x-1/2 transition-all duration-300 z-[102]"
                    style={{ top: `${position.top}px`, left: `${position.left}px`}}
                >
                    {popoverContent}
                </div>
            ) : (
                <div className="flex h-full justify-center items-center p-4">
                    {popoverContent}
                </div>
            )}
        </div>
    );
};
