import React, { useState } from 'react';
import { EXERCISE_CATEGORIES, EXERCISE_LEVELS } from '../constants';
import ExerciseCard from './ExerciseCard';
import type { Exercise } from '../types';
import { PlusIcon } from './icons';

type Category = typeof EXERCISE_CATEGORIES[number] | 'הכל';
type Level = typeof EXERCISE_LEVELS[number] | 'הכל';


interface ExerciseLibraryProps {
    exerciseLibrary: Exercise[];
    onAddExerciseToPlan: (exercise: Exercise) => void;
    onAddNewExercise: () => void;
    onEditExercise: (exercise: Exercise) => void;
    onDeleteExercise: (exerciseId: string) => void;
    onDuplicateExercise: (exercise: Exercise) => void;
}

const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ 
    exerciseLibrary, 
    onAddExerciseToPlan,
    onAddNewExercise,
    onEditExercise,
    onDeleteExercise,
    onDuplicateExercise,
}) => {
  const [activeCategory, setActiveCategory] = useState<Category>('הכל');
  const [activeLevel, setActiveLevel] = useState<Level>('הכל');


  const filteredExercises = exerciseLibrary.filter(ex => {
    const categoryMatch = activeCategory === 'הכל' || ex.category === activeCategory;
    const levelMatch = activeLevel === 'הכל' || ex.level === activeLevel;
    return categoryMatch && levelMatch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 text-right">
        <div className="flex justify-between items-center mb-2">
            <div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white">ספריית תרגילים</h2>
                <p className="text-gray-400">נהל את אוסף התרגילים שלך והוסף אותם לתוכנית האימונים.</p>
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
                    onAddToPlan={onAddExerciseToPlan} 
                    showAddButton={true}
                    showAdminControls={true}
                    onEdit={onEditExercise}
                    onDelete={onDeleteExercise}
                    onDuplicate={onDuplicateExercise}
                />
            ))}
        </div>
    </div>
  );
};

export default ExerciseLibrary;