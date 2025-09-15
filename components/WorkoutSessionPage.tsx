import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { WeeklyPlan, WorkoutTemplate, ID, PlannedExercise, CompletionLogEntry } from '../types';
import { DAYS_OF_WEEK } from '../constants';
import { PlayIcon, PauseIcon, SkipBackIcon, SkipForwardIcon, ChevronDownIcon, EditIcon } from './icons';

const FINISH_SOUND_MP3 = 'https://codesandbox.io/s/z2j6x9/static/sounds/finish.mp3';
const TICKING_SOUND_MP3 = 'https://codesandbox.io/s/z2j6x9/static/sounds/ticking.mp3';


type SessionState = 'exercise' | 'rest' | 'finished' | 'idle';

const parseRestTime = (restString: string): number => {
  if (!restString) return 60;
  const match = restString.match(/(\d+)/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return 60;
};

const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const WorkoutSessionPage: React.FC<{
    weeklyPlans: WeeklyPlan[];
    workoutTemplates: WorkoutTemplate[];
    activeWeeklyPlanId: ID;
    onUpdateCompletion: (date: string, logEntry: CompletionLogEntry) => void;
    onOpenFeedbackModal: (date: string) => void;
    onOpenInWorkoutEditModal: (exercise: PlannedExercise, onSave: (updatedExercise: PlannedExercise) => void) => void;
}> = ({ weeklyPlans, workoutTemplates, activeWeeklyPlanId, onUpdateCompletion, onOpenFeedbackModal, onOpenInWorkoutEditModal }) => {

    const tickingSoundRef = useRef<HTMLAudioElement | null>(null);
    const finishSoundRef = useRef<HTMLAudioElement | null>(null);
    
    const [completedInstanceIds, setCompletedInstanceIds] = useState<Set<string>>(new Set());
    const [isAutoFlowActive, setIsAutoFlowActive] = useState(false);

    const todaysWorkoutInfo = useMemo(() => {
        const today = new Date();
        const dayIndex = today.getDay();
        const todayHebrew = DAYS_OF_WEEK[dayIndex];
        const dateStr = today.toISOString().split('T')[0];

        const activePlan = weeklyPlans.find(p => p.id === activeWeeklyPlanId);
        if (!activePlan) return null;

        const workoutId = activePlan.schedule[todayHebrew];
        if (!workoutId) return null;
        
        const workoutTemplate = workoutTemplates.find(t => t.id === workoutId) || null;
        if (!workoutTemplate) return null;

        return {
            workout: workoutTemplate,
            plan: activePlan,
            day: todayHebrew,
            date: dateStr,
        };
    }, [weeklyPlans, workoutTemplates, activeWeeklyPlanId]);
    
    const todaysWorkout = todaysWorkoutInfo?.workout;
    
    const [liveTodaysWorkout, setLiveTodaysWorkout] = useState<WorkoutTemplate | null>(todaysWorkout || null);
    const [performedExercisesLog, setPerformedExercisesLog] = useState<{ [planInstanceId: string]: PlannedExercise }>({});


    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [currentSet, setCurrentSet] = useState(1);
    const [timer, setTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [sessionState, setSessionState] = useState<SessionState>('idle');
    const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    
    const currentExercise = useMemo(() => {
        if (!liveTodaysWorkout || liveTodaysWorkout.exercises.length === 0) return null;
        return liveTodaysWorkout.exercises[currentExerciseIndex];
    }, [liveTodaysWorkout, currentExerciseIndex]);

    const nextExercise = useMemo(() => {
        if (!liveTodaysWorkout || currentExerciseIndex >= liveTodaysWorkout.exercises.length - 1) return null;
        return liveTodaysWorkout.exercises[currentExerciseIndex + 1];
    }, [liveTodaysWorkout, currentExerciseIndex]);
    
    useEffect(() => {
        setLiveTodaysWorkout(todaysWorkout || null);
        setCurrentExerciseIndex(0);
        setCurrentSet(1);
        setTimer(0);
        setIsTimerRunning(false);
        setSessionState('idle');
        setPerformedExercisesLog({});
        setCompletedInstanceIds(new Set());
    }, [todaysWorkout]);
    
     useEffect(() => {
        try {
            tickingSoundRef.current = new Audio(TICKING_SOUND_MP3);
            tickingSoundRef.current.loop = true;
            finishSoundRef.current = new Audio(FINISH_SOUND_MP3);
        } catch (e) {
            console.error("Failed to create Audio elements.", e);
        }

        return () => {
            tickingSoundRef.current?.pause();
            finishSoundRef.current?.pause();
        };
    }, []);

    useEffect(() => {
        if (currentExercise) {
            setIsTimerRunning(false);
            setCurrentSet(1);
            setTimer(currentExercise.duration || 0);
            setSessionState('exercise');
            setIsDetailsExpanded(false);
            tickingSoundRef.current?.pause();
            setCountdown(null);
            
            if (!performedExercisesLog[currentExercise.planInstanceId]) {
                setPerformedExercisesLog(prev => ({ ...prev, [currentExercise.planInstanceId]: currentExercise }));
            }
        }
    }, [currentExercise]);
    
    useEffect(() => {
        if (sessionState === 'finished') return;
        if (isAutoFlowActive && currentExercise && (currentExercise.duration || 0) > 0 && sessionState === 'exercise' && !isTimerRunning && countdown === null) {
            startCountdownSequence();
        }
    }, [currentExercise, isAutoFlowActive, sessionState, isTimerRunning, countdown]);

    useEffect(() => {
        if (sessionState === 'finished' || countdown === null) return;
        if (countdown > 0) {
            const timerId = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timerId);
        } else if (countdown === 0) {
            setCountdown(null);
            setIsTimerRunning(true);
        }
    }, [countdown, sessionState]);


    useEffect(() => {
        let interval: number | undefined;
        if(sessionState === 'finished') {
            tickingSoundRef.current?.pause();
            setIsTimerRunning(false);
            return;
        }

        if (isTimerRunning && timer > 0) {
            tickingSoundRef.current?.play().catch(e => console.error("Error playing sound:", e));
            interval = window.setInterval(() => setTimer(prev => prev - 1), 1000);
        } else if (isTimerRunning && timer <= 0) {
            setIsTimerRunning(false);
            tickingSoundRef.current?.pause();
            if(tickingSoundRef.current) tickingSoundRef.current.currentTime = 0;
            finishSoundRef.current?.play().catch(e => console.error("Error playing sound:", e));

            if (isAutoFlowActive) {
                handleAutoFlowTransition();
            }
        } else if (!isTimerRunning) {
             tickingSoundRef.current?.pause();
        }
        
        return () => {
            if(interval) window.clearInterval(interval);
        };
    }, [isTimerRunning, timer, isAutoFlowActive, sessionState]);
    
    const handleAutoFlowTransition = () => {
        if (!currentExercise || sessionState === 'finished') return;
        const loggedExercise = performedExercisesLog[currentExercise.planInstanceId] || currentExercise;
        const totalSets = loggedExercise.sets || 1;
        const isTimed = (loggedExercise.duration || 0) > 0;
        
        if (sessionState === 'exercise') {
            if (currentSet < totalSets) {
                startRestPeriod(true); // true for auto
            } else {
                handleNextExercise(true); // true for auto
            }
        } else if (sessionState === 'rest') {
            if (currentSet < totalSets) {
                setCurrentSet(s => s + 1);
                setSessionState('exercise');
                if (isTimed) {
                    setTimer(loggedExercise.duration || 0);
                    startCountdownSequence();
                } else {
                    setIsAutoFlowActive(false); // Stop auto-flow for rep-based exercises and wait for user
                }
            } else {
                handleNextExercise(true);
            }
        }
    };

    const startRestPeriod = (isAuto = false) => {
        if (!currentExercise) return;
        setIsAutoFlowActive(isAuto);
        setSessionState('rest');
        const exerciseInLog = performedExercisesLog[currentExercise.planInstanceId];
        const restDuration = parseRestTime(exerciseInLog?.rest || currentExercise.rest || '');
        setTimer(restDuration);
        startCountdownSequence();
    };
    
    const startCountdownSequence = () => {
        if(sessionState === 'finished') return;
        setIsTimerRunning(false);
        setCountdown(3);
    };

    const toggleExerciseCompletion = () => {
        if (!currentExercise) return;
        const instanceId = currentExercise.planInstanceId;
        setCompletedInstanceIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(instanceId)) newSet.delete(instanceId);
            else newSet.add(instanceId);
            return newSet;
        });
    };
    
    // For editing the plan on the fly
    const handleUpdateLiveExercise = (updatedExercise: PlannedExercise) => {
        if (!liveTodaysWorkout) return;

        setLiveTodaysWorkout(prevWorkout => {
            if (!prevWorkout) return null;
            const newExercises = prevWorkout.exercises.map(ex => 
                ex.planInstanceId === updatedExercise.planInstanceId ? updatedExercise : ex
            );
            return { ...prevWorkout, exercises: newExercises };
        });

        // Update the log with the new plan as the default
        setPerformedExercisesLog(prevLog => ({
            ...prevLog,
            [updatedExercise.planInstanceId]: updatedExercise,
        }));
        
        if (sessionState === 'rest') {
            const newRest = parseRestTime(updatedExercise.rest);
            if (timer > newRest) setTimer(newRest);
        }
    };

    // For editing just the performance log
    const handleUpdatePerformanceLog = (updatedExercise: PlannedExercise) => {
        setPerformedExercisesLog(prevLog => ({
            ...prevLog,
            [updatedExercise.planInstanceId]: updatedExercise,
        }));
    };

    const handleSkip = () => {
        setIsAutoFlowActive(false);
        if (sessionState === 'rest') {
            setTimer(0); 
            const totalSets = performedExercisesLog[currentExercise!.planInstanceId]?.sets || currentExercise!.sets || 1;
            if (currentSet < totalSets) {
                setCurrentSet(s => s + 1);
                setSessionState('exercise');
                setTimer(currentExercise?.duration || 0);
            } else {
                handleNextExercise(false);
            }
        } else {
            handleNextExercise(false);
        }
    };
    
    const handleNextExercise = (isAuto: boolean) => {
        if (!liveTodaysWorkout || !currentExercise) return;
        
        setCompletedInstanceIds(prev => new Set(prev).add(currentExercise.planInstanceId));
        setIsAutoFlowActive(isAuto);

        if (currentExerciseIndex < liveTodaysWorkout.exercises.length - 1) {
            setCurrentExerciseIndex(prev => prev + 1);
        } else {
            setSessionState('finished');
            if (todaysWorkoutInfo) {
                const finalCompletedExercises: { [planInstanceId: string]: PlannedExercise } = {};
                const finalIdSet = new Set(completedInstanceIds).add(currentExercise.planInstanceId);
                
                finalIdSet.forEach(id => {
                    finalCompletedExercises[id] = performedExercisesLog[id] || liveTodaysWorkout.exercises.find(ex => ex.planInstanceId === id)!;
                });

                const finalLogEntry: CompletionLogEntry = {
                    weeklyPlanName: todaysWorkoutInfo.plan.name,
                    dayOfWeek: todaysWorkoutInfo.day,
                    workoutTemplate: liveTodaysWorkout,
                    completedExercises: finalCompletedExercises
                };
                onUpdateCompletion(todaysWorkoutInfo.date, finalLogEntry);
                onOpenFeedbackModal(todaysWorkoutInfo.date);
            }
        }
    };
    
    const handlePrevExercise = () => {
        setIsAutoFlowActive(false);
        if (currentExerciseIndex > 0) {
            setCurrentExerciseIndex(prev => prev - 1);
        }
    };

    const handlePlayPause = () => {
        if (sessionState === 'exercise' && currentExercise?.duration) {
             if (isTimerRunning) {
                setIsTimerRunning(false);
                setIsAutoFlowActive(false);
            } else {
                setIsAutoFlowActive(true);
                startCountdownSequence();
            }
        }
    };

    const handleSetCompleted = () => {
        if (sessionState !== 'exercise' || !currentExercise) return;
        
        const totalSets = performedExercisesLog[currentExercise.planInstanceId]?.sets || currentExercise.sets || 1;
        finishSoundRef.current?.play().catch(e => console.error("Error playing sound:", e));

        if (currentSet < totalSets) {
            startRestPeriod(true); // Auto-transition to rest, then next set
        } else {
            handleNextExercise(true); // Auto-transition to next exercise
        }
    };
    
    if (!todaysWorkout || !liveTodaysWorkout || liveTodaysWorkout.exercises.length === 0) {
        return (
            <div className="text-center py-20 px-4 w-full max-w-4xl mx-auto">
                <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white font-rubik">יום מנוחה!</h2>
                <p className="text-slate-500 dark:text-gray-400 mt-2 text-lg">אין אימון מתוכנן להיום. נצל את הזמן להתאוששות.</p>
            </div>
        );
    }

    if (!currentExercise) return null;
    
    const loggedExercise = performedExercisesLog[currentExercise.planInstanceId] || currentExercise;
    const totalSets = loggedExercise.sets || 1;
    const isTimedExercise = (loggedExercise.duration || 0) > 0;
    const isCurrentExerciseCompleted = completedInstanceIds.has(currentExercise.planInstanceId);
    
    const setsRepsString = [
        totalSets ? `${totalSets} סטים` : '',
        loggedExercise.reps ? `x ${loggedExercise.reps}` : '',
        isTimedExercise ? `${loggedExercise.duration} שניות` : '',
    ].filter(Boolean).join(' ');

    const getStatusText = () => {
        if (sessionState === 'rest') return 'מנוחה';
        if (sessionState === 'finished') return 'התרגיל הסתיים!';
        return `סט ${currentSet} מתוך ${totalSets}`;
    }

    return (
        <div className="w-full max-w-screen-lg mx-auto p-4 md:p-6 text-right flex flex-col items-center relative">
            {countdown !== null && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                    <div className="text-center">
                         <p className="text-2xl text-white mb-4">התכונן...</p>
                        <span className="text-9xl font-bold text-white" style={{ animation: 'ping-once 1s cubic-bezier(0, 0, 0.2, 1)' }}>{countdown > 0 ? countdown : 'Go!'}</span>
                    </div>
                </div>
            )}
             <div className="w-full max-w-2xl mb-4">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400 font-rubik">התקדמות</span>
                    <span className="text-sm font-bold text-slate-500 dark:text-gray-400">{currentExerciseIndex + 1} / {liveTodaysWorkout.exercises.length}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${((currentExerciseIndex + 1) / liveTodaysWorkout.exercises.length) * 100}%` }}></div>
                </div>
            </div>

            <div className="w-full max-w-2xl bg-white dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 text-center shadow-lg">
                <div className="flex items-start justify-center gap-3">
                    <h3 className="text-5xl md:text-6xl font-extrabold text-slate-800 dark:text-gray-200 mb-4 leading-tight font-rubik">{currentExercise.name}</h3>
                     <div className="flex items-center gap-2 mb-4 pt-3">
                        <button 
                            onClick={toggleExerciseCompletion}
                            className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-200 ${isCurrentExerciseCompleted ? 'bg-green-500 border-green-600' : 'bg-slate-200 dark:bg-slate-600 border-slate-400'}`}
                        >
                            {isCurrentExerciseCompleted && (
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            )}
                        </button>
                        {isCurrentExerciseCompleted && (
                            <button
                                onClick={() => {
                                    const exerciseToLog = performedExercisesLog[currentExercise.planInstanceId] || currentExercise;
                                    onOpenInWorkoutEditModal(exerciseToLog, handleUpdatePerformanceLog);
                                }}
                                className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                                aria-label="ערוך תיעוד ביצוע"
                            >
                                <EditIcon className="w-6 h-6"/>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex justify-center items-center gap-2 mb-6">
                    <p className="text-3xl md:text-4xl font-semibold text-slate-800 dark:text-white">{setsRepsString}</p>
                    <button
                        onClick={() => {
                            if (currentExercise) {
                                setIsAutoFlowActive(false);
                                onOpenInWorkoutEditModal(currentExercise, handleUpdateLiveExercise);
                            }
                        }}
                        className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                        aria-label="ערוך תרגיל"
                    >
                        <EditIcon className="w-6 h-6"/>
                    </button>
                </div>
                
                 <div className={`text-3xl md:text-4xl font-bold mb-6 py-2 px-6 inline-block rounded-md transition-colors duration-300 ${sessionState === 'rest' ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300' : 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300'}`}>
                    {getStatusText()}
                </div>
                
                {(isTimedExercise || sessionState === 'rest') && (
                    <div className="my-8">
                        <p className="text-7xl sm:text-8xl lg:text-9xl font-mono font-bold text-slate-900 dark:text-white tracking-widest">{formatTime(timer)}</p>
                    </div>
                )}
                
                <div className="flex justify-center items-center gap-6 my-8">
                    <button onClick={handlePrevExercise} disabled={currentExerciseIndex === 0} className="p-4 bg-slate-200 dark:bg-slate-700 rounded-full text-slate-800 dark:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                        <SkipForwardIcon className="w-8 h-8"/>
                    </button>
                     
                    {isTimedExercise ? (
                         <button onClick={handlePlayPause} disabled={sessionState !== 'exercise'} className="p-6 bg-amber-500 rounded-full text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-600 transition-colors shadow-lg">
                            {isTimerRunning ? <PauseIcon className="w-10 h-10"/> : <PlayIcon className="w-10 h-10"/>}
                        </button>
                    ) : (
                        <button onClick={handleSetCompleted} disabled={sessionState !== 'exercise'} className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-4 px-8 rounded-lg transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed text-xl shadow-lg">
                           השלמתי סט
                        </button>
                    )}

                    <button onClick={handleSkip} className="p-4 bg-slate-200 dark:bg-slate-700 rounded-full text-slate-800 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                        <SkipBackIcon className="w-8 h-8"/>
                    </button>
                </div>
                
                <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
                    <button onClick={() => setIsDetailsExpanded(!isDetailsExpanded)} className="w-full text-right flex justify-between items-center p-2 rounded-md hover:bg-slate-100/50 dark:hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-amber-500">
                        <span className="font-semibold text-xl text-slate-800 dark:text-gray-200">פרטים נוספים על התרגיל</span>
                        <ChevronDownIcon className={`w-6 h-6 transition-transform duration-300 ${isDetailsExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {isDetailsExpanded && (
                         <div className="mt-4 space-y-4 text-slate-600 dark:text-gray-300 text-right text-lg">
                            <div>
                                <h4 className="font-semibold text-amber-700 dark:text-amber-500 text-xl">תיאור הביצוע:</h4>
                                <p className="leading-relaxed">{currentExercise.description}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-red-600 dark:text-red-400 text-xl">דגשי בטיחות:</h4>
                                <p className="leading-relaxed">{currentExercise.safetyNotes}</p>
                            </div>
                        </div>
                    )}
                </div>
                {nextExercise && (
                    <div className="mt-6 bg-violet-50 dark:bg-slate-900/50 p-3 rounded-lg border border-violet-200 dark:border-slate-700">
                        <p className="text-violet-800 dark:text-violet-300">
                            <span className="font-bold">התרגיל הבא:</span> {nextExercise.name}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkoutSessionPage;