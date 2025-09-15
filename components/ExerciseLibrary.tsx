


import React, { useState, useRef, useMemo } from 'react';
import { EXERCISE_CATEGORIES, EXERCISE_LEVELS } from '../constants';
import ExerciseCard from './ExerciseCard';
import WorkoutTemplateEditor from './WorkoutTemplateEditor';
import WeeklyPlanEditor from './WeeklyPlanEditor';
import PlanGenerator from './PlanGenerator';
import type { Exercise, WorkoutTemplate, ID, WeeklyPlan } from '../types';
import { PlusIcon, UploadCloudIcon, DownloadIcon } from './icons';

type Level = typeof EXERCISE_LEVELS[number] | 'הכל';
type LibraryTab = 'exercises' | 'templates' | 'plans' | 'generator';

interface ExerciseLibraryProps {
    exerciseLibrary: Exercise[];
    workoutTemplates: WorkoutTemplate[];
    weeklyPlans: WeeklyPlan[];
    onAddExerciseToPlan: (exercise: Exercise) => void;
    // Exercise handlers
    onAddNewExercise: () => void;
    onEditExercise: (exercise: Exercise) => void;
    onDeleteExercise: (exerciseId: string) => void;
    onDuplicateExercise: (exercise: Exercise) => void;
    onImportExercises: (file: File) => void;
    onExportExercises: () => void;
    // Template handlers
    onAddExerciseToTemplate: (templateId: ID, exercise: Exercise) => void;
    onRemoveExerciseFromTemplate: (templateId: ID, planInstanceId: ID) => void;
    onCreateTemplate: () => void;
    onEditTemplate: (template: WorkoutTemplate) => void;
    onDeleteTemplate: (templateId: ID) => void;
    // Plan handlers
    onCreateWeeklyPlan: () => void;
    onEditWeeklyPlan: (plan: WeeklyPlan) => void;
    onDeleteWeeklyPlan: (planId: ID) => void;
    onUpdateWeeklyPlanSchedule: (planId: ID, day: string, templateId: ID | null) => void;
    // Generator handler
    onSaveGeneratedPlan: (data: { newTemplates: WorkoutTemplate[], newPlan: WeeklyPlan }) => void;
}

const ExerciseLibrary: React.FC<ExerciseLibraryProps> = (props) => {
    const { 
        exerciseLibrary, 
        workoutTemplates,
        weeklyPlans,
        onAddExerciseToPlan,
        onAddNewExercise,
        onEditExercise,
        onDeleteExercise,
        onDuplicateExercise,
        onImportExercises,
        onExportExercises,
        onCreateWeeklyPlan,
        onEditWeeklyPlan,
        onDeleteWeeklyPlan,
        onUpdateWeeklyPlanSchedule,
        onSaveGeneratedPlan,
        ...templateHandlers
    } = props;
    
    const [activeTab, setActiveTab] = useState<LibraryTab>('exercises');
    const [activeCategory, setActiveCategory] = useState<string>('הכל');
    const [activeLevel, setActiveLevel] = useState<Level>('הכל');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const availableCategories = useMemo(() => {
        const allCategories = new Set([...EXERCISE_CATEGORIES, ...exerciseLibrary.map(ex => ex.category)]);
        return Array.from(allCategories).sort((a, b) => a.localeCompare(b, 'he'));
    }, [exerciseLibrary]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImportExercises(file);
            // Reset the input value to allow re-uploading the same file
            if(event.target) event.target.value = '';
        }
    };


    const filteredExercises = exerciseLibrary.filter(ex => {
        const categoryMatch = activeCategory === 'הכל' || ex.category === activeCategory;
        const levelMatch = activeLevel === 'הכל' || ex.level === activeLevel;
        return categoryMatch && levelMatch;
    });
    
    const TabButton: React.FC<{tabName: LibraryTab, label: string}> = ({tabName, label}) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-5 py-2 text-lg font-semibold transition-colors duration-300 border-b-4 ${
                activeTab === tabName
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-gray-400 hover:text-white hover:border-slate-600'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-6 text-right">
            <div className="mb-8">
                <div className="border-b border-slate-700">
                    <nav className="-mb-px flex space-x-8 space-x-reverse" aria-label="Tabs">
                        <TabButton tabName="exercises" label="תרגילים" />
                        <TabButton tabName="templates" label="תבניות אימון" />
                        <TabButton tabName="plans" label="תוכניות שבועיות" />
                        <TabButton tabName="generator" label="אשף תוכניות" />
                    </nav>
                </div>
            </div>

            {activeTab === 'exercises' && (
                <div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-white">ספריית תרגילים</h2>
                            <p className="text-gray-400">נהל את אוסף התרגילים שלך והוסף אותם לתבניות אימון.</p>
                        </div>
                         <div className="w-full md:w-auto flex flex-wrap items-center justify-start md:justify-end gap-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full sm:w-auto justify-center bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2"
                            >
                                <UploadCloudIcon className="w-5 h-5" />
                                <span>ייבוא</span>
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept=".csv,.tsv,.txt"
                                className="hidden"
                            />
                             <button
                                onClick={onExportExercises}
                                className="w-full sm:w-auto justify-center bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2"
                            >
                                <DownloadIcon className="w-5 h-5" />
                                <span>ייצוא</span>
                            </button>
                            <button
                                onClick={onAddNewExercise}
                                className="w-full sm:w-auto justify-center bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2"
                            >
                                <PlusIcon className="w-5 h-5" />
                                <span>תרגיל חדש</span>
                            </button>
                        </div>
                    </div>

                    <div className="my-8 space-y-4">
                        <div className="flex flex-wrap justify-center gap-2">
                            <span className="font-semibold self-center mr-4">קטגוריה:</span>
                            <button onClick={() => setActiveCategory('הכל')} className={`px-4 py-2 rounded-md font-semibold text-sm transition-all duration-300 ${activeCategory === 'הכל' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}>הכל</button>
                            {availableCategories.map(cat => <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-md font-semibold text-sm transition-all duration-300 ${activeCategory === cat ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}>{cat}</button>)}
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                            <span className="font-semibold self-center mr-4">רמה:</span>
                            <button onClick={() => setActiveLevel('הכל')} className={`px-4 py-2 rounded-md font-semibold text-sm transition-all duration-300 ${activeLevel === 'הכל' ? 'bg-green-600 text-white shadow-lg' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}>הכל</button>
                            {EXERCISE_LEVELS.map(level => <button key={level} onClick={() => setActiveLevel(level)} className={`px-4 py-2 rounded-md font-semibold text-sm transition-all duration-300 ${activeLevel === level ? 'bg-green-600 text-white shadow-lg' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}>{level}</button>)}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredExercises.map(exercise => (
                            <ExerciseCard 
                                key={exercise.id} 
                                exercise={exercise} 
                                showAddButton={false} // Add to templates, not plan directly
                                showAdminControls={true}
                                onEdit={onEditExercise}
                                onDelete={onDeleteExercise}
                                onDuplicate={onDuplicateExercise}
                            />
                        ))}
                    </div>
                </div>
            )}
            
            {activeTab === 'templates' && (
                <WorkoutTemplateEditor 
                    workoutTemplates={workoutTemplates}
                    exerciseLibrary={exerciseLibrary}
                    {...templateHandlers}
                />
            )}

            {activeTab === 'plans' && (
                <WeeklyPlanEditor 
                    weeklyPlans={weeklyPlans}
                    workoutTemplates={workoutTemplates}
                    onCreatePlan={onCreateWeeklyPlan}
                    onEditPlan={onEditWeeklyPlan}
                    onDeletePlan={onDeleteWeeklyPlan}
                    onUpdateSchedule={onUpdateWeeklyPlanSchedule}
                />
            )}

            {activeTab === 'generator' && (
                <PlanGenerator
                    exerciseLibrary={exerciseLibrary}
                    existingTemplates={workoutTemplates}
                    onSavePlan={onSaveGeneratedPlan}
                />
            )}
        </div>
    );
};

export default ExerciseLibrary;
