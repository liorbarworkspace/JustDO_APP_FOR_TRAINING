import React, { useState } from 'react';
import { EXERCISE_LIBRARY, EXERCISE_CATEGORIES } from '../constants';
import ExerciseCard from './ExerciseCard';
import type { Exercise } from '../types';

type Category = typeof EXERCISE_CATEGORIES[number] | 'הכל';

interface ExerciseLibraryProps {
    onAddExercise: (exercise: Exercise) => void;
}

const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ onAddExercise }) => {
  const [activeCategory, setActiveCategory] = useState<Category>('הכל');

  const filteredExercises = activeCategory === 'הכל'
    ? EXERCISE_LIBRARY
    : EXERCISE_LIBRARY.filter(ex => ex.category === activeCategory);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 text-right">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">ספריית תרגילים</h2>
        <p className="text-gray-400 mb-8">כל התרגילים הנדרשים לתוכנית האימונים שלך. לחץ על 'פרטים נוספים' למידע מלא.</p>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
                onClick={() => setActiveCategory('הכל')}
                className={`px-4 py-2 rounded-md font-semibold transition-all duration-300 ${
                    activeCategory === 'הכל' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
            >
                הכל
            </button>
            {EXERCISE_CATEGORIES.map(cat => (
                 <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-md font-semibold transition-all duration-300 ${
                        activeCategory === cat ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredExercises.map(exercise => (
                <ExerciseCard key={exercise.id} exercise={exercise} onAddToPlan={onAddExercise} showAddButton={true} />
            ))}
        </div>
    </div>
  );
};

export default ExerciseLibrary;