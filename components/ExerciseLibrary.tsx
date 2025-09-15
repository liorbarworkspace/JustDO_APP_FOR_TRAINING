import React, { useState, useRef, useMemo } from 'react';
import { EXERCISE_LEVELS } from '../constants';
import ExerciseCard from './ExerciseCard';
import WorkoutTemplateEditor from './WorkoutTemplateEditor';
import WeeklyPlanEditor from './WeeklyPlanEditor';
import PlanGenerator from './PlanGenerator';
import type { Exercise, WorkoutTemplate, ID, WeeklyPlan, PlannedExercise } from '../types';
import { PlusIcon, UploadCloudIcon, DownloadIcon } from './icons';

type Level = typeof EXERCISE_LEVELS[number] | 'הכל';
type LibraryTab = 'exercises' | 'templates' | 'plans' | 'generator';

interface ExerciseLibraryProps {
    exerciseLibrary: Exercise[];
    workoutTemplates: WorkoutTemplate[];
    weeklyPlans: WeeklyPlan[];
    allCategories: readonly string[];
    onAddExerciseToPlan: (exercise: Exercise) => void;
    onAddNewExercise: () => void;
    onEditExercise: (exercise: Exercise) => void;
    onDeleteExercise: (exerciseId: string) => void;
    onDuplicateExercise: (exercise: Exercise) => void;
    onImportExercises: (file: File) => void;
    onExportExercises: () => void;
    onAddExercisesToTemplate: (templateId: ID, exercises: Exercise[]) => void;
    onRemoveExerciseFromTemplate: (templateId: ID, planInstanceId: ID) => void;
    onEditPlannedExercise: (templateId: ID, exercise: PlannedExercise) => void;
    onCreateTemplate: () => void;
    onEditTemplate: (template: WorkoutTemplate) => void;
    onDeleteTemplate: (templateId: ID) => void;
    onCreateWeeklyPlan: () => void;
    onEditWeeklyPlan: (plan: WeeklyPlan) => void;
    onDeleteWeeklyPlan: (planId: ID) => void;
    onUpdateWeeklyPlanSchedule: (planId: ID, day: string, templateId: ID | null) => void;
    onSaveGeneratedPlan: (data: { newTemplates: WorkoutTemplate[], newPlan: WeeklyPlan }) => void;
    onConfirmBulkDelete: (exerciseIds: ID[]) => void;
}

const ExerciseLibrary: React.FC<ExerciseLibraryProps> = (props) => {
    const { 
        exerciseLibrary, 
        workoutTemplates,
        weeklyPlans,
        allCategories,
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
        onEditPlannedExercise,
        onConfirmBulkDelete,
        ...templateHandlers
    } = props;
    
    const [activeTab, setActiveTab] = useState<LibraryTab>('exercises');
    const [activeCategories, setActiveCategories] = useState<string[]>([]);
    const [activeLevel, setActiveLevel] = useState<Level>('הכל');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedExerciseIds, setSelectedExerciseIds] = useState<Set<ID>>(new Set());

    const availableCategories = useMemo(() => {
        return [...allCategories].sort((a, b) => a.localeCompare(b, 'he'));
    }, [allCategories]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImportExercises(file);
            if(event.target) event.target.value = '';
        }
    };

    const handleCategoryToggle = (category: string) => {
        setActiveCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const filteredExercises = exerciseLibrary.filter(ex => {
        const categoryMatch = activeCategories.length === 0 || activeCategories.includes(ex.category);
        const levelMatch = activeLevel === 'הכל' || ex.level === activeLevel;
        return categoryMatch && levelMatch;
    });

    const handleToggleSelect = (exerciseId: ID) => {
        setSelectedExerciseIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(exerciseId)) {
                newSet.delete(exerciseId);
            } else {
                newSet.add(exerciseId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        setSelectedExerciseIds(new Set(filteredExercises.map(ex => ex.id)));
    };

    const handleClearSelection = () => {
        setSelectedExerciseIds(new Set());
    };

    const handleDeleteSelected = () => {
        if (selectedExerciseIds.size > 0) {
            onConfirmBulkDelete(Array.from(selectedExerciseIds));
            setSelectedExerciseIds(new Set());
        }
    };
    
    const TabButton: React.FC<{tabName: LibraryTab, label: string}> = ({tabName, label}) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-5 py-2 text-lg font-semibold transition-colors duration-300 border-b-4 ${
                activeTab === tabName
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-600'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="w-full max-w-screen-xl mx-auto p-4 md:p-6 text-right">
            <div className="mb-8">
                <div className="border-b border-slate-200 dark:border-slate-700">
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
                            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight font-rubik">ספריית תרגילים</h2>
                            <p className="text-slate-500 dark:text-gray-400 mt-2 text-lg">נהל את אוסף התרגילים שלך והוסף אותם לתבניות אימון.</p>
                        </div>
                         <div className="w-full md:w-auto flex flex-wrap items-center justify-start md:justify-end gap-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full sm:w-auto justify-center bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2"
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
                                className="w-full sm:w-auto justify-center bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2"
                            >
                                <PlusIcon className="w-5 h-5" />
                                <span>תרגיל חדש</span>
                            </button>
                        </div>
                    </div>

                    <div className="mb-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-slate-700 dark:text-gray-300">
                            {selectedExerciseIds.size} תרגילים נבחרו
                        </p>
                        <div className="flex items-center gap-2">
                            <button onClick={handleSelectAll} className="px-3 py-1.5 text-sm font-semibold bg-white dark:bg-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600">בחר הכל</button>
                            <button onClick={handleClearSelection} className="px-3 py-1.5 text-sm font-semibold bg-white dark:bg-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600">נקה בחירה</button>
                            <button 
                                onClick={handleDeleteSelected} 
                                disabled={selectedExerciseIds.size === 0}
                                className="px-3 py-1.5 text-sm font-semibold bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-red-300 dark:disabled:bg-red-800 disabled:cursor-not-allowed"
                            >
                                מחק בחירה
                            </button>
                        </div>
                    </div>

                    <div className="my-8 space-y-4 p-4 bg-slate-100/70 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            <span className="font-semibold self-center mr-4">קטגוריה:</span>
                            <button onClick={() => setActiveCategories([])} className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${activeCategories.length === 0 ? 'bg-amber-500 text-white shadow-lg' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>{`הכל`}</button>
                            {availableCategories.map(cat => <button key={cat} onClick={() => handleCategoryToggle(cat)} className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${activeCategories.includes(cat) ? 'bg-amber-500 text-white shadow-lg' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>{cat}</button>)}
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            <span className="font-semibold self-center mr-4">רמה:</span>
                            <button onClick={() => setActiveLevel('הכל')} className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${activeLevel === 'הכל' ? 'bg-violet-500 text-white shadow-lg' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>{`הכל`}</button>
                            {EXERCISE_LEVELS.map(level => <button key={level} onClick={() => setActiveLevel(level)} className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${activeLevel === level ? 'bg-violet-500 text-white shadow-lg' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>{level}</button>)}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredExercises.map(exercise => (
                            <ExerciseCard 
                                key={exercise.id} 
                                exercise={exercise} 
                                onAddToPlan={onAddExerciseToPlan}
                                showAddButton={true}
                                showAdminControls={true}
                                onEdit={onEditExercise}
                                onDelete={onDeleteExercise}
                                onDuplicate={onDuplicateExercise}
                                showSelection={true}
                                isSelected={selectedExerciseIds.has(exercise.id)}
                                onToggleSelect={handleToggleSelect}
                            />
                        ))}
                    </div>
                </div>
            )}
            
            {activeTab === 'templates' && (
                <WorkoutTemplateEditor 
                    workoutTemplates={workoutTemplates}
                    exerciseLibrary={exerciseLibrary}
                    allCategories={allCategories}
                    onEditPlannedExercise={onEditPlannedExercise}
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
