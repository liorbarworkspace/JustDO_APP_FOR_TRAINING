import React, { useState, useMemo, useEffect } from 'react';
import type { Exercise, WorkoutTemplate, WeeklyPlan, PlannedExercise } from '../types';
import { PLAN_LEVELS, DAYS_OF_WEEK } from '../constants';
import { SparklesIcon } from './icons';

interface PlanGeneratorProps {
    exerciseLibrary: Exercise[];
    existingTemplates: WorkoutTemplate[];
    onSavePlan: (data: { newTemplates: WorkoutTemplate[], newPlan: WeeklyPlan }) => void;
}

type Goal = 'general_fitness' | 'strength' | 'basketball' | 'endurance' | 'core_strength' | 'mobility_flexibility' | 'rehab_relaxation';
type Level = typeof PLAN_LEVELS[number];

const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const PlanGenerator: React.FC<PlanGeneratorProps> = ({ exerciseLibrary, existingTemplates, onSavePlan }) => {
    const [step, setStep] = useState(1);
    
    const [mainGoals, setMainGoals] = useState<Goal[]>(['general_fitness']);
    const [level, setLevel] = useState<Level>('מתחיל');
    const [workoutDays, setWorkoutDays] = useState<string[]>(['ראשון', 'שלישי', 'חמישי']);
    const [equipment, setEquipment] = useState<string[]>(['משקל גוף']);
    const [weightDetails, setWeightDetails] = useState('');

    const [generatedResult, setGeneratedResult] = useState<{ newTemplates: WorkoutTemplate[], newPlan: WeeklyPlan } | null>(null);
    const [generationError, setGenerationError] = useState<string | null>(null);

    useEffect(() => {
        setGenerationError(null);
    }, [mainGoals, level, workoutDays, equipment]);

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

        const goalRecipes: Record<Goal, Exercise['category'][]> = {
            general_fitness: ['כוח', 'ליבה', 'אירובי'],
            strength: ['כוח', 'קליסטניקס'],
            basketball: ['כדורסל', 'אירובי', 'ליבה', 'קליסטניקס'],
            endurance: ['אירובי', 'אירובי'],
            core_strength: ['ליבה', 'ליבה'],
            mobility_flexibility: ['גמישות', 'הרפיה'],
            rehab_relaxation: ['שיקום', 'הרפיה', 'גמישות'],
        };
        const preferredCategories = new Set(mainGoals.flatMap(goal => goalRecipes[goal]));

        let exercisePool = shuffleArray(availableExercises);
        const newTemplates: WorkoutTemplate[] = [];
        const mainExercisesPerWorkout = 4;
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

            const warmup = pickFromPool(['חימום']);
            if (warmup) templateExercises.push({ ...warmup, planInstanceId: crypto.randomUUID() });

            for (let j = 0; j < mainExercisesPerWorkout; j++) {
                let picked = pickFromPool(Array.from(preferredCategories));
                if (!picked) {
                    const fallbackCategories = [...new Set(exercisePool.map(e => e.category))].filter(c => !['חימום', 'גמישות', 'הרפיה'].includes(c));
                    picked = pickFromPool(fallbackCategories);
                }
                if (picked) {
                    templateExercises.push({ ...picked, planInstanceId: crypto.randomUUID() });
                }
            }
            
            const cooldown = pickFromPool(['גמישות', 'הרפיה']);
            if (cooldown) templateExercises.push({ ...cooldown, planInstanceId: crypto.randomUUID() });

            if (templateExercises.length < 3) {
                 setGenerationError("לא ניתן היה ליצור אימון מלא מהתרגילים הזמינים. נסה לבחור ציוד נוסף או להוסיף תרגילים לספרייה.");
                 return;
            }

            const template: WorkoutTemplate = {
                id: crypto.randomUUID(),
                title: `אימון משולב ${String.fromCharCode(1488 + i)} (אוטומטי)`,
                type: "אימון משולב",
                duration: "~45 דק'",
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

    const goalOptions: { key: Goal, label: string }[] = [
        { key: 'general_fitness', label: 'כושר כללי' },
        { key: 'strength', label: 'בניית כוח' },
        { key: 'endurance', label: 'שיפור סיבולת' },
        { key: 'core_strength', label: 'חיזוק ליבה ויציבות' },
        { key: 'mobility_flexibility', label: 'גמישות ותנועה' },
        { key: 'basketball', label: 'יכולות כדורסל' },
        { key: 'rehab_relaxation', label: 'שיקום והרפיה' },
    ];
    
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