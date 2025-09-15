

import React, { useState, useMemo, useEffect } from 'react';
import type { Exercise, WorkoutTemplate, WeeklyPlan, PlannedExercise } from '../types';
import { PLAN_LEVELS, DAYS_OF_WEEK } from '../constants';
import { SparklesIcon } from './icons';

interface PlanGeneratorProps {
    exerciseLibrary: Exercise[];
    existingTemplates: WorkoutTemplate[];
    onSavePlan: (data: { newTemplates: WorkoutTemplate[], newPlan: WeeklyPlan }) => void;
}

const baseEquipmentKeywords = ['משקולות', 'מזרון', 'ספסל', 'כיסא', 'טבעות', 'דלגית', 'כדורסל', 'משקל גוף'];

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

    // Clear error message when user changes settings
    useEffect(() => {
        setGenerationError(null);
    }, [mainGoals, level, workoutDays, equipment]);

    const availableEquipment = useMemo(() => {
        const equipmentSet = new Set<string>();
        exerciseLibrary.forEach(ex => {
            baseEquipmentKeywords.forEach(keyword => {
                if (ex.equipment.includes(keyword)) {
                    equipmentSet.add(keyword);
                }
            });
        });
        return Array.from(equipmentSet);
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
                // Prevent removing the last selected goal
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

    const generatePlanLogic = () => {
        let errorOccurred = false;
        setGenerationError(null);

        // 1. Validation: Check if exercises for the selected level exist
        const exercisesForLevel = exerciseLibrary.filter(ex => ex.level === level);
        if (exercisesForLevel.length === 0) {
            setGenerationError(`לא נמצאו תרגילים בספרייה עבור רמת "${level}". אנא הוסף תרגילים מתאימים או בחר רמה אחרת.`);
            return;
        }

        // 2. Filter exercises based on user criteria
        const filteredByEquipment = exercisesForLevel.filter(ex => {
            if (equipment.includes('משקל גוף') && ex.equipment.includes('משקל גוף')) return true;
            return equipment.some(eq => ex.equipment.includes(eq));
        });

        const groupedExercises = new Map<string, Exercise[]>();
        filteredByEquipment.forEach(ex => {
            if (!groupedExercises.has(ex.category)) {
                groupedExercises.set(ex.category, []);
            }
            groupedExercises.get(ex.category)!.push(ex);
        });

        // Helper to pick exercises. Allows reusing exercises in different templates.
        const pickExercises = (category: Exercise['category'], count: number): PlannedExercise[] => {
            if (errorOccurred) return [];
            const available = shuffleArray(groupedExercises.get(category) || []);
            const selected = available.slice(0, count);
            
            if (selected.length < count && !['חימום', 'גמישות', 'הרפיה'].includes(category)) {
                 setGenerationError(`אין מספיק תרגילים בקטגוריית "${category}" עבור הדרישות שלך. נסה להוסיף עוד תרגילים לספרייה.`);
                 errorOccurred = true;
            }
            return selected.map(ex => ({...ex, planInstanceId: crypto.randomUUID()}));
        };

        const goalRecipes: Record<Goal, Exercise['category'][]> = {
            general_fitness: ['כוח', 'כוח', 'ליבה', 'אירובי'],
            strength: ['כוח', 'כוח', 'כוח', 'כוח', 'ליבה'],
            basketball: ['כדורסל', 'כוח', 'כוח', 'אירובי'],
            endurance: ['אירובי', 'אירובי', 'כוח', 'כוח'],
            core_strength: ['ליבה', 'ליבה', 'ליבה', 'כוח'],
            mobility_flexibility: ['גמישות', 'גמישות', 'גמישות', 'גמישות'],
            rehab_relaxation: ['שיקום', 'שיקום', 'הרפיה', 'הרפיה'],
        };
        
        const mainExercisesPerWorkout = 4;
        const categoryPool: Exercise['category'][] = mainGoals.flatMap(goal => goalRecipes[goal]);
        
        const combinedGoalLabels = goalOptions.filter(opt => mainGoals.includes(opt.key)).map(opt => opt.label).join(' ו');
        const planName = `תוכנית משולבת: ${combinedGoalLabels} - ${level}`;

        const newTemplates: WorkoutTemplate[] = [];
        const numTemplatesToCreate = Math.min(workoutDays.length, 2);

        for (let i = 0; i < numTemplatesToCreate; i++) {
            if (errorOccurred) break;
            const templateExercises: PlannedExercise[] = [];
            templateExercises.push(...pickExercises('חימום', 1));

            const categoriesForThisTemplate = shuffleArray(categoryPool).slice(0, mainExercisesPerWorkout);
            categoriesForThisTemplate.forEach(cat => {
                templateExercises.push(...pickExercises(cat, 1));
            });
            
            templateExercises.push(...pickExercises('גמישות', 1));
            
            if (errorOccurred) break;

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

        if (errorOccurred) return;
        
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
                <h2 className="text-3xl md:text-4xl font-extrabold text-white">התוכנית שלך מוכנה!</h2>
                <p className="text-gray-400 mb-6">זוהי התוכנית השבועית שהאשף יצר עבורך. תוכל לשמור אותה לספרייה או להתחיל מחדש.</p>
                <div className="bg-slate-800/50 rounded-lg p-6 border border-cyan-500">
                    <h3 className="text-2xl font-bold text-cyan-400 mb-4">{generatedResult.newPlan.name}</h3>
                    <div className="mb-6">
                        <h4 className="font-semibold text-white mb-2">תבניות אימון חדשות שנוצרו:</h4>
                        <ul className="list-disc list-inside text-gray-300">
                            {generatedResult.newTemplates.map(t => <li key={t.id}>{t.title} ({t.exercises.length} תרגילים)</li>)}
                        </ul>
                    </div>
                    <div>
                         <h4 className="font-semibold text-white mb-2">מערכת שבועית:</h4>
                         <div className="space-y-2">
                            {DAYS_OF_WEEK.map(day => {
                                const templateId = generatedResult.newPlan.schedule[day];
                                const template = generatedResult.newTemplates.find(t => t.id === templateId) || existingTemplates.find(t => t.id === templateId);
                                return (
                                    <div key={day} className="flex justify-between items-center bg-slate-700 p-2 rounded-md">
                                        <span className="font-semibold">{day}</span>
                                        <span className="text-cyan-300">{template ? template.title : 'מנוחה'}</span>
                                    </div>
                                )
                            })}
                         </div>
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={handleStartOver} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                        התחל מחדש
                    </button>
                    <button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                        שמור תוכנית לספרייה
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="text-right">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">אשף תוכניות אימון</h2>
            <p className="text-gray-400 mb-6">ענה על מספר שאלות והאשף יבנה עבורך תוכנית אימונים מותאמת אישית מהתרגילים בספרייה.</p>
            
            <div className="space-y-6 bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                 <div>
                    <label className="block mb-3 text-lg font-medium text-gray-300">1. מהן מטרות האימון שלך? (ניתן לבחור יותר מאחת)</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {goalOptions.map(opt => (
                            <button key={opt.key} onClick={() => handleGoalToggle(opt.key)} className={`p-3 rounded-lg text-center font-semibold transition-all duration-200 ${mainGoals.includes(opt.key) ? 'bg-cyan-600 text-white ring-2 ring-cyan-400' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
                 <div>
                    <label htmlFor="level" className="block mb-2 text-lg font-medium text-gray-300">2. מהי רמת הניסיון שלך?</label>
                    <select id="level" value={level} onChange={(e) => setLevel(e.target.value as Level)} className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5">
                       {PLAN_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block mb-2 text-lg font-medium text-gray-300">3. באילו ימים תרצה להתאמן?</label>
                    <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                        {DAYS_OF_WEEK.map(day => (
                             <button key={day} onClick={() => handleDayToggle(day)} className={`p-3 rounded-lg text-center font-semibold transition-all duration-200 ${workoutDays.includes(day) ? 'bg-cyan-600 text-white ring-2 ring-cyan-400' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                {day}
                            </button>
                        ))}
                    </div>
                </div>
                 <div>
                    <label className="block mb-2 text-lg font-medium text-gray-300">4. איזה ציוד זמין לך?</label>
                     <div className="p-3 rounded-lg bg-slate-700/50 border border-slate-600 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4">
                        {availableEquipment.map(item => (
                             <div key={item} className="flex items-center p-1 rounded-md">
                                <input type="checkbox" id={`eq-${item}`} checked={equipment.includes(item)} onChange={() => handleEquipmentToggle(item)} className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-600 ring-offset-gray-800 focus:ring-2" />
                                <label htmlFor={`eq-${item}`} className="mr-2 text-sm font-medium text-gray-300">{item}</label>
                                {item === 'משקולות' && equipment.includes('משקולות') && (
                                    <input
                                        type="text"
                                        value={weightDetails}
                                        onChange={(e) => setWeightDetails(e.target.value)}
                                        placeholder="ציין משקלים (לדוגמה: 2x10kg)"
                                        className="ml-2 w-full flex-1 bg-slate-600 border border-slate-500 text-white text-xs rounded p-1"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                )}
                             </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {generationError && (
                <div className="mt-4 text-center p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
                    {generationError}
                </div>
            )}

            <div className="mt-8 flex justify-center">
                 <button onClick={generatePlanLogic} disabled={workoutDays.length === 0 || equipment.length === 0} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 flex items-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
                    <SparklesIcon className="w-6 h-6" />
                    צור תוכנית אימונים
                </button>
            </div>
        </div>
    );
};

export default PlanGenerator;