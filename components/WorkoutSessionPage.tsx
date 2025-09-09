

import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { WeeklyPlan, WorkoutTemplate, ID, PlannedExercise } from '../types';
import { DAYS_OF_WEEK } from '../constants';
import { PlayIcon, PauseIcon, SkipBackIcon, SkipForwardIcon, ChevronDownIcon } from './icons';

// Use local MP3 files for sounds.
// The user should create a 'sounds' folder in the root directory and place these files inside.
const FINISH_SOUND_MP3 = '/sounds/finish.mp3';
const TICKING_SOUND_MP3 = '/sounds/ticking.mp3';
const RELAXING_SOUND_MP3 = '/sounds/relaxing.mp3'; // Added relaxing sound

type SessionState = 'exercise' | 'rest' | 'finished' | 'idle';

// A helper function to parse time from a string like "60-90 שניות"
const parseRestTime = (restString: string): number => {
  if (!restString) return 60; // Default rest
  const match = restString.match(/(\d+)/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return 60; // Default if no number found
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
}> = ({ weeklyPlans, workoutTemplates, activeWeeklyPlanId }) => {

    const tickingSoundRef = useRef<HTMLAudioElement | null>(null);
    const relaxingSoundRef = useRef<HTMLAudioElement | null>(null);
    const finishSoundRef = useRef<HTMLAudioElement | null>(null);

    const todaysWorkout = useMemo(() => {
        const today = new Date();
        const dayIndex = today.getDay(); // Sunday - 0
        const todayHebrew = DAYS_OF_WEEK[dayIndex];

        const activePlan = weeklyPlans.find(p => p.id === activeWeeklyPlanId);
        if (!activePlan) return null;

        const workoutId = activePlan.schedule[todayHebrew];
        if (!workoutId) return null;

        return workoutTemplates.find(t => t.id === workoutId) || null;
    }, [weeklyPlans, workoutTemplates, activeWeeklyPlanId]);

    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [currentSet, setCurrentSet] = useState(1);
    const [timer, setTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [sessionState, setSessionState] = useState<SessionState>('idle');
    const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
    
    const currentExercise = useMemo(() => {
        if (!todaysWorkout || todaysWorkout.exercises.length === 0) return null;
        return todaysWorkout.exercises[currentExerciseIndex];
    }, [todaysWorkout, currentExerciseIndex]);
    
     useEffect(() => {
        // Initialize audio elements. They are created once and reused.
        try {
            tickingSoundRef.current = new Audio(TICKING_SOUND_MP3);
            tickingSoundRef.current.loop = true;
            relaxingSoundRef.current = new Audio(RELAXING_SOUND_MP3);
            relaxingSoundRef.current.loop = true;
            finishSoundRef.current = new Audio(FINISH_SOUND_MP3);
        } catch (e) {
            console.error("Failed to create Audio elements. Ensure sound files exist.", e);
        }

        return () => { // Cleanup on component unmount
            tickingSoundRef.current?.pause();
            relaxingSoundRef.current?.pause();
            finishSoundRef.current?.pause();
        };
    }, []);

    // Effect to setup the state for the current exercise
    useEffect(() => {
        if (currentExercise) {
            setIsTimerRunning(false);
            setCurrentSet(1);
            setTimer(currentExercise.duration || 0);
            setSessionState('exercise');
            setIsDetailsExpanded(false);
            tickingSoundRef.current?.pause();
            relaxingSoundRef.current?.pause();
        }
    }, [currentExercise]);
    
    // The main timer logic effect
    useEffect(() => {
        let interval: number | undefined;

        if (isTimerRunning && timer > 0) {
            if (sessionState === 'exercise') {
                relaxingSoundRef.current?.pause();
                tickingSoundRef.current?.play().catch(e => console.error("Error playing ticking sound:", e));
            } else if (sessionState === 'rest') {
                tickingSoundRef.current?.pause();
                relaxingSoundRef.current?.play().catch(e => console.error("Error playing relaxing sound:", e));
            }
            
            interval = window.setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        } else if (isTimerRunning && timer === 0) {
            setIsTimerRunning(false);
            tickingSoundRef.current?.pause();
            relaxingSoundRef.current?.pause();
            if(tickingSoundRef.current) tickingSoundRef.current.currentTime = 0;
            if(relaxingSoundRef.current) relaxingSoundRef.current.currentTime = 0;
            
            finishSoundRef.current?.play().catch(e => console.error("Error playing finish sound:", e));

            const totalSets = currentExercise?.sets || 1;
            
            // --- State Transition Logic ---
            if (sessionState === 'exercise') {
                if (currentSet < totalSets) {
                    // Go to rest
                    setSessionState('rest');
                    const restDuration = parseRestTime(currentExercise?.rest || '');
                    setTimer(restDuration);
                    setIsTimerRunning(true); // Auto-start rest timer
                } else {
                    // Last set of exercise finished
                    setSessionState('finished');
                }
            } else if (sessionState === 'rest') {
                // Rest is over, prepare for the next set
                setCurrentSet(s => s + 1);
                setSessionState('exercise');
                setTimer(currentExercise?.duration || 0);
                // Don't auto-start the next set, let the user do it
            }
        } else if (!isTimerRunning) {
             tickingSoundRef.current?.pause();
             relaxingSoundRef.current?.pause();
        }
        
        return () => { // Cleanup
            if(interval) window.clearInterval(interval);
        };
    }, [isTimerRunning, timer, sessionState, currentExercise, currentSet]);

    const handleNextExercise = () => {
        if (!todaysWorkout) return;
        if (currentExerciseIndex < todaysWorkout.exercises.length - 1) {
            setCurrentExerciseIndex(prev => prev + 1);
        }
    };
    
    const handlePrevExercise = () => {
        if (currentExerciseIndex > 0) {
            setCurrentExerciseIndex(prev => prev + 1);
        }
    };

    const handlePlayPause = () => {
        // Can only play/pause during the 'exercise' state if it's a timed exercise
        if (sessionState === 'exercise' && currentExercise?.duration) {
            setIsTimerRunning(prev => !prev);
        }
    };

    const handleSetCompleted = () => {
         // This is for rep-based exercises
        if (sessionState !== 'exercise' || !currentExercise) return;
        
        const totalSets = currentExercise.sets || 1;
        finishSoundRef.current?.play().catch(e => console.error("Error playing finish sound:", e));

        if (currentSet < totalSets) {
            // Start rest timer
            setSessionState('rest');
            const restDuration = parseRestTime(currentExercise.rest);
            setTimer(restDuration);
            setIsTimerRunning(true);
        } else {
            // Finished all sets for this rep-based exercise
            setSessionState('finished');
        }
    };
    
    if (!todaysWorkout || todaysWorkout.exercises.length === 0) {
        return (
            <div className="text-center py-20 px-4 w-full max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-white">יום מנוחה!</h2>
                <p className="text-gray-400 mt-2">אין אימון מתוכנן להיום. נצל את הזמן להתאוששות.</p>
            </div>
        );
    }

    if (!currentExercise) return null;
    
    const totalSets = currentExercise.sets || 1;
    const isTimedExercise = (currentExercise.duration || 0) > 0;
    
    const setsRepsString = [
        currentExercise.sets ? `${totalSets} סטים` : '',
        currentExercise.reps ? `x ${currentExercise.reps}` : '',
        isTimedExercise ? `${currentExercise.duration} שניות` : '',
    ].filter(Boolean).join(' ');

    const getStatusText = () => {
        if(sessionState === 'rest') return 'מנוחה';
        if(sessionState === 'finished') return 'התרגIL הסתיים!';
        return `סט ${currentSet} מתוך ${totalSets}`;
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-6 text-right flex flex-col items-center">
            <div className="text-center mb-8">
                <p className="text-gray-400">אימון להיום</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white">{todaysWorkout.title}</h2>
            </div>
            
            <div className="w-full max-w-lg bg-slate-800/50 rounded-lg p-6 border border-slate-700 text-center">
                <p className="text-lg text-gray-400 mb-2">תרגיל {currentExerciseIndex + 1} מתוך {todaysWorkout.exercises.length}</p>
                <h3 className="text-4xl font-bold text-cyan-400 mb-4">{currentExercise.name}</h3>
                <p className="text-xl font-semibold text-white mb-6">{setsRepsString}</p>
                
                 <div className={`text-xl font-bold mb-6 py-2 px-4 inline-block rounded-md ${sessionState === 'rest' ? 'bg-amber-500/20 text-amber-300' : 'bg-green-500/20 text-green-300'}`}>
                    {getStatusText()}
                </div>
                
                {(isTimedExercise || sessionState === 'rest') && (
                    <div className="my-8">
                        <p className="text-[7rem] font-mono font-bold text-white tracking-widest">{formatTime(timer)}</p>
                    </div>
                )}
                
                <div className="flex justify-center items-center gap-6 my-8">
                    <button onClick={handlePrevExercise} disabled={currentExerciseIndex === 0} className="p-4 bg-slate-700 rounded-full text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors">
                        <SkipBackIcon className="w-8 h-8"/>
                    </button>
                     
                    {isTimedExercise ? (
                         <button onClick={handlePlayPause} disabled={sessionState !== 'exercise'} className="p-6 bg-cyan-600 rounded-full text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cyan-500 transition-colors">
                            {isTimerRunning ? <PauseIcon className="w-10 h-10"/> : <PlayIcon className="w-10 h-10"/>}
                        </button>
                    ) : (
                        <button onClick={handleSetCompleted} disabled={sessionState !== 'exercise'} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 px-8 rounded-lg transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed">
                           השלמתי סט
                        </button>
                    )}

                    <button onClick={handleNextExercise} disabled={currentExerciseIndex >= todaysWorkout.exercises.length - 1} className="p-4 bg-slate-700 rounded-full text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors">
                        <SkipForwardIcon className="w-8 h-8"/>
                    </button>
                </div>
                
                <div className="mt-8 border-t border-slate-700 pt-6">
                    <button onClick={() => setIsDetailsExpanded(!isDetailsExpanded)} className="w-full text-right flex justify-between items-center p-2 rounded-md hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                        <span className="font-semibold text-lg">פרטים נוספים על התרגיל</span>
                        <ChevronDownIcon className={`w-6 h-6 transition-transform duration-300 ${isDetailsExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {isDetailsExpanded && (
                         <div className="mt-4 space-y-4 text-gray-300 text-right">
                            <div>
                                <h4 className="font-semibold text-cyan-500 text-lg">תיאור הביצוע:</h4>
                                <p className="leading-relaxed">{currentExercise.description}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-red-400 text-lg">דגשי בטיחות:</h4>
                                <p className="leading-relaxed">{currentExercise.safetyNotes}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkoutSessionPage;
