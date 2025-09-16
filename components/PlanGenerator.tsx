import React, { useState, useMemo, useEffect } from 'react';
import type { Exercise, WorkoutTemplate, WeeklyPlan, PlannedExercise } from '../types';
import { PLAN_LEVELS, DAYS_OF_WEEK } from '../constants';
import { SparklesIcon, ChevronDownIcon } from './icons';

interface PlanGeneratorProps {
    exerciseLibrary: Exercise[];
    existingTemplates: WorkoutTemplate[];
    allCategories: readonly string[];
    onSavePlan: (data: { newTemplates: WorkoutTemplate[], newPlan: WeeklyPlan }) => void;
}

type Goal = 'general_fitness' | 'strength' | 'basketball' | 'endurance' | 'core_strength' | 'mobility_flexibility' | 'rehab_relaxation';
type Level = typeof PLAN_LEVELS[number];
type Duration = 'any' | 'short' | 'medium' | 'long';

// --- Duration Calculation Logic ---
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

const calculateExerciseDurationSeconds = (exercise: Exercise): number => {
    const sets = exercise.sets || 1;
    const activityTimePerSet = exercise.duration || (parseReps(exercise.reps) * SECONDS_PER_REP);
    const restTime = parseRest(exercise.rest);

    if (sets > 0 && activityTimePerSet > 0) {
        return (sets * activityTimePerSet) + (Math.max(0, sets - 1) * restTime);
    }
    return 0;
};
// --- End Duration Calculation Logic ---


const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const PlanGenerator: React.FC<PlanGeneratorProps> = ({ exerciseLibrary, existingTemplates, allCategories, onSavePlan }) => {
    const [step, setStep] = useState(1);
    
    const [mainGoals, setMainGoals] = useState<Goal[]>(['general_fitness']);
    const [level, setLevel] = useState<Level>('מתחיל');
    const [workoutDays, setWorkoutDays] = useState<string[]>(['ראשון', 'שלישי', 'חמישי']);
    const [equipment, setEquipment] = useState<string[]>(['משקל גוף']);
    const [weightDetails, setWeightDetails] = useState('');
    const [desiredDuration, setDesiredDuration] = useState<Duration>('any');

    const [generatedResult, setGeneratedResult] = useState<{ newTemplates: WorkoutTemplate[], newPlan: WeeklyPlan } | null>(null);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [isMappingExpanded, setIsMappingExpanded] = useState(false);

    const goalOptions: { key: Goal, label: string }[] = [
        { key: 'general_fitness', label: 'כושר כללי' },
        { key: 'strength', label: 'בניית כוח' },
        { key: 'endurance', label: 'שיפור סיבולת' },
        { key: 'core_strength', label: 'חיזוק ליבה ויציבות' },
        { key: 'mobility_flexibility', label: 'גמישות ותנועה' },
        { key: 'basketball', label: 'יכולות כדורסל' },
        { key: 'rehab_relaxation', label: 'שיקום והרפיה' },
    ];
    
    const durationOptions: { key: Duration, label: string }[] = [
        { key: 'any', label: 'הכל' },
        { key: 'short', label: 'קצר (20-30 דק\')' },
        { key: 'medium', label: 'בינוני (30-45 דק\')' },
        { key: 'long', label: 'ארוך (45+ דק\')' },
    ];

    const [categoryMappings, setCategoryMappings] = useState<Record<Goal, Exercise['category'][]>>({
        general_fitness: ['כוח', 'ליבה', 'אירובי'],
        strength: ['כוח', 'קליסטניקס'],
        basketball: ['כדורסל', 'אירובי', 'ליבה', 'קליסטניקס'],
        endurance: ['אירובי', 'אירובי'],
        core_strength: ['ליבה', 'ליבה'],
        mobility_flexibility: ['גמישות', 'הרפיה'],
        rehab_relaxation: ['שיקום', 'הרפיה', 'גמישות'],
    });

    useEffect(() => {
        setGenerationError(null);
    }, [mainGoals, level, workoutDays, equipment, desiredDuration]);

    const availableEquipment = useMemo(() => {
        const baseTerms = ['משקולות', 'מזרון', 'ספסל', 'כיסא', 'טבעות', 'דלגית', 'כדורסל', 'משקל גוף', 'מגרש'];
        const equipmentSet = new Set<string>();

        exerciseLibrary.forEach(ex => {
            const parts = ex.equipment.split(/[,\/]/);
            parts.forEach(part => {
                const trimmedPart = part.trim();
                if (trimmedPart) {
                    let matched = false;
                    for (const term of baseTerms) {
                        if (trimmedPart.includes(term)) {
                            equipmentSet.add(term);
                            matched = true;
                        }
                    }
                    if (!matched) {
                        equipmentSet.add(trimmedPart);
                    }
                }
            });
        });

        if (exerciseLibrary.some(ex => ex.equipment.includes('משקל גוף'))) {
             equipmentSet.add('משקל גוף');
        }

        return Array.from(equipmentSet).sort((a, b) => a.localeCompare(b, 'he'));
    }, [exerciseLibrary]);

    const handleDayToggle = (day: string) => {
        setWorkoutDays(prev => 
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleGoalToggle = (goal: Goal) => {
        setMainGoals(prev => {
            const isSelected = prev.includes(goal);
            if (isSelected) {
                return prev.length > 1 ? prev.filter(g => g !== goal) : prev;
            } else {
                return [...prev, goal];
            }
        });
    };

    const handleEquipmentToggle = (item: string) => {
        setEquipment(prev =>
            prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
        );
    };
    
    const handleSelectAllEquipment = () => {
        setEquipment(availableEquipment);
    };

    const handleClearAllEquipment = () => {
        setEquipment([]);
    };

    const handleMappingChange = (goal: Goal, category: string, isChecked: boolean) => {
        setCategoryMappings(prev => {
            const currentCategories = prev[goal] || [];
            if (isChecked) {
                return { ...prev, [goal]: [...new Set([...currentCategories, category])] as Exercise['category'][] };
            } else {
                return { ...prev, [goal]: currentCategories.filter(c => c !== category) };
            }
        });
    };


    const generatePlanLogic = () => {
        setGenerationError(null);

        const availableExercises = exerciseLibrary.filter(ex => {
            const levelMatch = ex.level === level;
            const equipmentMatch = equipment.some(eq => ex.equipment.toLowerCase().includes(eq.toLowerCase()));
            return levelMatch && equipmentMatch;
        });

        if (availableExercises.length < 5) {
            setGenerationError(`לא נמצאו מספיק תרגילים בספרייה התואמים לרמה ("${level}") ולציוד שבחרת. נסה להוסיף תרגילים או לשנות את בחירתך.`);
            return;
        }
        
        const DURATION_TARGETS = {
            short: { min: 20 * 60, max: 30 * 60 },
            medium: { min: 30 * 60, max: 45 * 60 },
            long: { min: 45 * 60, max: 60 * 60 },
            any: { min: 0, max: 60 * 60 },
        };
        const maxDuration = DURATION_TARGETS[desiredDuration].max;

        const preferredCategories = new Set(mainGoals.flatMap(goal => categoryMappings[goal]));

        let exercisePool = shuffleArray(availableExercises);
        const newTemplates: WorkoutTemplate[] = [];
        const numTemplatesToCreate = Math.min(workoutDays.length, 2);
        
        const pickFromPool = (categories: Exercise['category'][]): Exercise | null => {
            const index = exercisePool.findIndex(ex => categories.includes(ex.category));
            if (index > -1) {
                return exercisePool.splice(index, 1)[0];
            }
            return null;
        }

        for (let i = 0; i < numTemplatesToCreate; i++) {
            const templateExercises: PlannedExercise[] = [];
            let currentDuration = 0;

            const warmup = pickFromPool(['חימום']);
            if (warmup) {
                templateExercises.push({ ...warmup, planInstanceId: crypto.randomUUID() });
                currentDuration += calculateExerciseDurationSeconds(warmup);
            }

            while (currentDuration < maxDuration && templateExercises.length < 10 && exercisePool.length > 0) {
                 let picked = pickFromPool(Array.from(preferredCategories));
                if (!picked) {
                    const fallbackCategories = [...new Set(exercisePool.map(e => e.category))].filter(c => !['חימום', 'גמישות', 'הרפיה'].includes(c));
                    picked = pickFromPool(fallbackCategories);
                }
                
                if (picked) {
                    const exerciseDuration = calculateExerciseDurationSeconds(picked);
                    if (currentDuration + exerciseDuration <= maxDuration * 1.1) { // Allow 10% buffer
                        templateExercises.push({ ...picked, planInstanceId: crypto.randomUUID() });
                        currentDuration += exerciseDuration;
                    } else {
                        exercisePool.push(picked); // Put it back if it's too long
                        break; 
                    }
                } else {
                    break;
                }
            }
            
            const cooldown = pickFromPool(['גמישות', 'הרפיה']);
            if (cooldown) {
                 templateExercises.push({ ...cooldown, planInstanceId: crypto.randomUUID() });
                 currentDuration += calculateExerciseDurationSeconds(cooldown);
            }

            if (templateExercises.length < 3) {
                 setGenerationError("לא ניתן היה ליצור אימון מלא מהתרגילים הזמינים. נסה לבחור ציוד נוסף או לשנות את משך האימון.");
                 return;
            }

            const template: WorkoutTemplate = {
                id: crypto.randomUUID(),
                title: `אימון משולב ${String.fromCharCode(1488 + i)} (אוטומטי)`,
                type: "אימון משולב",
                duration: `~${Math.round(currentDuration / 60)} דק'`,
                level,
                tags: [...new Set(templateExercises.map(ex => ex.category))],
                exercises: templateExercises,
            };
            newTemplates.push(template);
        }

        const combinedGoalLabels = goalOptions.filter(opt => mainGoals.includes(opt.key)).map(opt => opt.label).join(' ו');
        const planName = `תוכנית: ${combinedGoalLabels} - ${level}`;
        
        const schedule: WeeklyPlan['schedule'] = {};
        const activeRestTemplateId = existingTemplates.find(t => t.id === 'workout-active-rest')?.id || null;
        
        let trainingDayIndex = 0;
        DAYS_OF_WEEK.forEach(day => {
            if (workoutDays.includes(day)) {
                schedule[day] = newTemplates[trainingDayIndex % newTemplates.length]?.id || null;
                trainingDayIndex++;
            } else {
                schedule[day] = null;
            }
        });
        
        if (workoutDays.length <= 4) {
             const workoutDaysSet = new Set(workoutDays);
             let previousDayWasWorkout = false;
             for (const day of DAYS_OF_WEEK) {
                 if (workoutDaysSet.has(day)) {
                     previousDayWasWorkout = true;
                 } else if (schedule[day] === null && previousDayWasWorkout) {
                     schedule[day] = activeRestTemplateId;
                     previousDayWasWorkout = false;
                 }
             }
        }
        
        const newPlan: WeeklyPlan = { id: crypto.randomUUID(), name: planName, level, schedule };
        setGeneratedResult({ newTemplates, newPlan });
        setStep(2);
    };

    const handleStartOver = () => {
        setGeneratedResult(null);
        setStep(1);
    };

    const handleSave = () => {
        if (generatedResult) {
            onSavePlan(generatedResult);
        }
    }
    
    if (step === 2 && generatedResult) {
        return (
            <div className="text-right">
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight font-rubik">התוכנית שלך מוכנה!</h2>
                <p className="text-slate-500 dark:text-gray-400 mb-6 mt-2 text-lg">זוהי התוכנית השבועית שהאשף יצר עבורך. תוכל לשמור אותה לספרייה או להתחיל מחדש.</p>
                <div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 border border-amber-200 dark:border-amber-500/50 shadow-sm">
                    <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-4">{generatedResult.newPlan.name}</h3>
                    <div className="mb-6">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-2">תבניות אימון חדשות שנוצרו:</h4>
                        <ul className="list-disc list-inside text-slate-600 dark:text-gray-300">
                            {generatedResult.newTemplates.map(t => <li key={t.id}>{t.title} ({t.exercises.length} תרגילים)</li>)}
                        </ul>
                    </div>
                    <div>
                         <h4 className="font-semibold text-slate-900 dark:text-white mb-2">מערכת שבועית:</h4>
                         <div className="space-y-2">
                            {DAYS_OF_WEEK.map(day => {
                                const templateId = generatedResult.newPlan.schedule[day];
                                const template = generatedResult.newTemplates.find(t => t.id === templateId) || existingTemplates.find(t => t.id === templateId);
                                return (
                                    <div key={day} className="flex justify-between items-center bg-slate-100 dark:bg-slate-700 p-2 rounded-md">
                                        <span className="font-semibold">{day}</span>
                                        <span className="text-amber-600 dark:text-amber-300">{template ? template.title : 'מנוחה'}</span>
                                    </div>
                                )
                            })}
                         </div>
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={handleStartOver} className="bg-slate-500 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                        התחל מחדש
                    </button>
                    <button onClick={handleSave} className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                        שמור תוכנית לספרייה
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="text-right">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight font-rubik">אשף תוכניות אימון</h2>
            <p className="text-slate-500 dark:text-gray-400 mb-6 mt-2 text-lg">ענה על מספר שאלות והאשף יבנה עבורך תוכנית אימונים מותאמת אישית מהתרגילים בספרייה.</p>
            
            <div className="space-y-6 bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                 <div>
                    <label className="block mb-3 text-lg font-medium text-slate-800 dark:text-gray-300">1. מהן מטרות האימון שלך? (ניתן לבחור יותר מאחת)</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {goalOptions.map(opt => (
                            <button key={opt.key} onClick={() => handleGoalToggle(opt.key)} className={`p-3 rounded-lg text-center font-semibold transition-all duration-200 ${mainGoals.includes(opt.key) ? 'bg-amber-500 text-white ring-2 ring-amber-400' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
                 <div>
                    <label htmlFor="level" className="block mb-2 text-lg font-medium text-slate-800 dark:text-gray-300">2. מהי רמת הניסיון שלך?</label>
                    <select id="level" value={level} onChange={(e) => setLevel(e.target.value as Level)} className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5">
                       {PLAN_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block mb-2 text-lg font-medium text-slate-800 dark:text-gray-300">3. באילו ימים תרצה להתאמן?</label>
                    <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                        {DAYS_OF_WEEK.map(day => (
                             <button key={day} onClick={() => handleDayToggle(day)} className={`p-3 rounded-lg text-center font-semibold transition-all duration-200 ${workoutDays.includes(day) ? 'bg-amber-500 text-white ring-2 ring-amber-400' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                                {day}
                            </button>
                        ))}
                    </div>
                </div>
                 <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-lg font-medium text-slate-800 dark:text-gray-300">4. איזה ציוד זמין לך?</label>
                        <div className="flex gap-2">
                            <button type="button" onClick={handleSelectAllEquipment} className="text-sm font-semibold text-amber-600 dark:text-amber-400 hover:underline">בחר הכל</button>
                            <button type="button" onClick={handleClearAllEquipment} className="text-sm font-semibold text-slate-500 hover:underline">נקה הכל</button>
                        </div>
                    </div>
                     <div className="p-3 rounded-lg bg-slate-100/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4">
                        {availableEquipment.map(item => (
                             <div key={item} className="flex items-center p-1 rounded-md">
                                <input type="checkbox" id={`eq-${item}`} checked={equipment.includes(item)} onChange={() => handleEquipmentToggle(item)} className="w-4 h-4 text-amber-600 bg-slate-100 dark:bg-gray-700 border-slate-300 dark:border-gray-600 rounded focus:ring-amber-600 ring-offset-gray-50 dark:ring-offset-gray-800 focus:ring-2" />
                                <label htmlFor={`eq-${item}`} className="mr-2 text-sm font-medium text-slate-800 dark:text-gray-300">{item}</label>
                                {item === 'משקולות' && equipment.includes('משקולות') && (
                                    <input
                                        type="text"
                                        value={weightDetails}
                                        onChange={(e) => setWeightDetails(e.target.value)}
                                        placeholder="ציין משקלים (לדוגמה: 2x10kg)"
                                        className="ml-2 w-full flex-1 bg-slate-200 dark:bg-slate-600 border border-slate-300 dark:border-slate-500 text-slate-900 dark:text-white text-xs rounded p-1"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                )}
                             </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <button
                    onClick={() => setIsMappingExpanded(!isMappingExpanded)}
                    className="w-full flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-lg font-medium text-slate-800 dark:text-gray-200"
                >
                    מיפוי קטגוריות למטרות (מתקדם)
                    <ChevronDownIcon className={`w-5 h-5 transition-transform ${isMappingExpanded ? 'rotate-180' : ''}`} />
                </button>
                {isMappingExpanded && (
                    <div className="p-4 border border-t-0 border-slate-200 dark:border-slate-700 rounded-b-lg bg-white dark:bg-slate-800/50">
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-2">משך אימון רצוי</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                     {durationOptions.map(opt => (
                                        <button key={opt.key} onClick={() => setDesiredDuration(opt.key)} className={`p-3 rounded-lg text-center font-semibold transition-all duration-200 text-sm ${desiredDuration === opt.key ? 'bg-violet-500 text-white ring-2 ring-violet-400' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-gray-400 pt-4">כאן ניתן להתאים אילו קטגוריות תרגילים ישמשו לבניית אימונים עבור כל מטרה.</p>
                            {goalOptions.map(goalOpt => (
                                <div key={goalOpt.key}>
                                    <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-2">{goalOpt.label}</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                                        {allCategories.map(cat => (
                                            <div key={cat} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`map-${goalOpt.key}-${cat}`}
                                                    checked={categoryMappings[goalOpt.key]?.includes(cat as any) || false}
                                                    onChange={(e) => handleMappingChange(goalOpt.key, cat, e.target.checked)}
                                                    className="w-4 h-4 text-amber-600 bg-slate-100 dark:bg-gray-700 border-slate-300 dark:border-gray-600 rounded focus:ring-amber-600"
                                                />
                                                <label htmlFor={`map-${goalOpt.key}-${cat}`} className="mr-2 text-sm text-slate-700 dark:text-gray-300">{cat}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            {generationError && (
                <div className="mt-4 text-center p-3 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg">
                    {generationError}
                </div>
            )}

            <div className="mt-8 flex justify-center">
                 <button onClick={generatePlanLogic} disabled={workoutDays.length === 0 || equipment.length === 0} className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 flex items-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
                    <SparklesIcon className="w-6 h-6" />
                    צור תוכנית אימונים
                </button>
            </div>
        </div>
    );
};

export default PlanGenerator;