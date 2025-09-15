import React, { useState } from 'react';
import type { PlannedExercise, ID } from '../types';

interface EditPlannedExerciseModalProps {
    workoutId: ID;
    exercise: PlannedExercise;
    onClose: () => void;
    onSave: (workoutId: ID, updatedExercise: PlannedExercise) => void;
}

const EditPlannedExerciseModal: React.FC<EditPlannedExerciseModalProps> = ({ workoutId, exercise, onClose, onSave }) => {
    const [editedExercise, setEditedExercise] = useState<PlannedExercise>(exercise);

    const handleSave = () => {
        onSave(workoutId, editedExercise);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setEditedExercise(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : value
        }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 md:p-8 max-w-md w-full text-right border border-amber-300 dark:border-amber-500" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-2 text-amber-600 dark:text-amber-400">עריכת תרגיל</h2>
                <p className="text-slate-500 dark:text-gray-400 mb-6">שינוי פרטי התרגיל: <span className="font-semibold text-slate-800 dark:text-white">{exercise.name}</span></p>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="sets" className="block mb-2 text-sm font-medium text-slate-700 dark:text-gray-300">סטים</label>
                        <input
                            type="number"
                            id="sets"
                            name="sets"
                            value={editedExercise.sets || ''}
                            onChange={handleChange}
                            className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5"
                            placeholder="לדוגמה: 3"
                        />
                    </div>
                    <div>
                        <label htmlFor="reps" className="block mb-2 text-sm font-medium text-slate-700 dark:text-gray-300">חזרות</label>
                        <input
                            type="text"
                            id="reps"
                            name="reps"
                            value={editedExercise.reps || ''}
                            onChange={handleChange}
                            className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5"
                            placeholder="לדוגמה: 10-12"
                        />
                    </div>
                    <div>
                        <label htmlFor="duration" className="block mb-2 text-sm font-medium text-slate-700 dark:text-gray-300">משך (בשניות)</label>
                        <input
                            type="number"
                            id="duration"
                            name="duration"
                            value={editedExercise.duration || ''}
                            onChange={handleChange}
                            className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5"
                            placeholder="לדוגמה: 60"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-4 space-x-reverse mt-8">
                    <button
                        onClick={onClose}
                        className="bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                    >
                        ביטול
                    </button>
                    <button
                        onClick={handleSave}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                    >
                        שמור שינויים
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditPlannedExerciseModal;
