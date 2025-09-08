import React, { useState } from 'react';
import { EXERCISE_CATEGORIES, EXERCISE_LEVELS } from '../constants';
import ExerciseCard from './ExerciseCard';
import WorkoutTemplateEditor from './WorkoutTemplateEditor';
import type { Exercise, WorkoutTemplate, ID } from '../types';
import { PlusIcon } from './icons';

type Category = typeof EXERCISE_CATEGORIES[number] | 'הכל';
type Level = typeof EXERCISE_LEVELS[number] | 'הכל';
type LibraryTab = 'exercises' | 'templates';

interface ExerciseLibraryProps {
    exerciseLibrary: Exercise[];
    workoutTemplates: WorkoutTemplate[];
    onAddExerciseToPlan: (exercise: Exercise) => void;
    // Exercise handlers
    onAddNewExercise: () => void;
    onEditExercise: (exercise: Exercise) => void;
    onDeleteExercise: (exerciseId: string) => void;
    onDuplicateExercise: (exercise: Exercise) => void;
    // Template handlers
    onAddExerciseToTemplate: (templateId: ID, exercise: Exercise) => void;
    onRemoveExerciseFromTemplate: (templateId: ID, planInstanceId: ID) => void;
    onCreateTemplate: (title: string) => void;
    onUpdateTemplateTitle: (templateId: ID, newTitle: string) => void;
    onDeleteTemplate: (templateId: ID) => void;
}

const ExerciseLibrary: React.FC<ExerciseLibraryProps> = (props) => {
    const { 
        exerciseLibrary, 
        workoutTemplates,
        onAddExerciseToPlan,
        onAddNewExercise,
        onEditExercise,
        onDeleteExercise,
        onDuplicateExercise,
        ...templateHandlers
    } = props;
    
    const [activeTab, setActiveTab] = useState<LibraryTab>('exercises');
    const [activeCategory, setActiveCategory] = useState<Category>('הכל');
    const [activeLevel, setActiveLevel] = useState<Level>('הכל');

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
                    </nav>
                </div>
            </div>

            {activeTab === 'exercises' && (
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-white">ספריית תרגילים</h2>
                            <p className="text-gray-400">נהל את אוסף התרגילים שלך והוסף אותם לתבניות אימון.</p>
                        </div>
                        <button
                            onClick={onAddNewExercise}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span>תרגיל חדש</span>
                        </button>
                    </div>

                    <div className="my-8 space-y-4">
                        <div className="flex flex-wrap justify-center gap-2">
                            <span className="font-semibold self-center mr-4">קטגוריה:</span>
                            <button onClick={() => setActiveCategory('הכל')} className={`px-4 py-2 rounded-md font-semibold text-sm transition-all duration-300 ${activeCategory === 'הכל' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}>הכל</button>
                            {EXERCISE_CATEGORIES.map(cat => <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-md font-semibold text-sm transition-all duration-300 ${activeCategory === cat ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}>{cat}</button>)}
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
        </div>
    );
};

export default ExerciseLibrary;