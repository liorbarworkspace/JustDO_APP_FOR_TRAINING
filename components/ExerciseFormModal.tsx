import React, { useState, useEffect } from 'react';
import type { Exercise } from '../types';
import { EXERCISE_LEVELS } from '../constants';

interface ExerciseFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (exercise: Exercise) => void;
    initialData?: Exercise | null;
    allCategories: readonly string[];
}

const emptyExercise: Omit<Exercise, 'id'> = {
    name: '',
    equipment: '',
    description: '',
    sets: undefined,
    reps: '',
    duration: undefined,
    rest: '',
    safetyNotes: '',
    category: 'כוח',
    level: 'מתחיל',
    muscleGroups: [],
};

const ExerciseFormModal: React.FC<ExerciseFormModalProps> = ({ isOpen, onClose, onSave, initialData, allCategories }) => {
    const [exercise, setExercise] = useState<Exercise | Omit<Exercise, 'id'>>(() => initialData || emptyExercise);

    useEffect(() => {
        setExercise(initialData || emptyExercise);
    }, [initialData, isOpen]);

    if (!isOpen) return null;
    
    const isEditMode = !!initialData;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (name === 'muscleGroups') {
            setExercise(prev => ({ ...prev, muscleGroups: value.split(',').map(s => s.trim()) }));
            return;
        }

        const isNumber = type === 'number';
        setExercise(prev => ({
            ...prev,
            [name]: isNumber ? (value === '' ? undefined : Number(value)) : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(exercise as Exercise);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 md:p-8 max-w-2xl w-full text-right border border-amber-300 dark:border-amber-500" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-amber-600 dark:text-amber-400">{isEditMode ? 'עריכת תרגיל' : 'הוספת תרגיל חדש'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                     <div>
                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-slate-700 dark:text-gray-300">שם התרגיל</label>
                        <input type="text" name="name" value={exercise.name} onChange={handleChange} required className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="category" className="block mb-2 text-sm font-medium text-slate-700 dark:text-gray-300">קטגוריה</label>
                            {/* FIX: Change to an input with a datalist to allow adding new categories. */}
                            <input 
                                list="categories-datalist"
                                name="category" 
                                id="category"
                                value={exercise.category} 
                                onChange={handleChange} 
                                required
                                className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5" 
                            />
                            <datalist id="categories-datalist">
                                {allCategories.map(c => <option key={c} value={c} />)}
                            </datalist>
                        </div>
                        <div>
                           <label htmlFor="level" className="block mb-2 text-sm font-medium text-slate-700 dark:text-gray-300">רמה</label>
                            <select name="level" value={exercise.level} onChange={handleChange} className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5">
                                {EXERCISE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="muscleGroups" className="block mb-2 text-sm font-medium text-slate-700 dark:text-gray-300">קבוצות שרירים (מופרד בפסיק)</label>
                        <input 
                            type="text" 
                            name="muscleGroups" 
                            value={exercise.muscleGroups.join(', ')} 
                            onChange={handleChange} 
                            placeholder="לדוגמה: חזה, כתפיים, תלת ראשי"
                            className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5" 
                        />
                    </div>

                     <div>
                        <label htmlFor="equipment" className="block mb-2 text-sm font-medium text-slate-700 dark:text-gray-300">ציוד נדרש</label>
                        <input type="text" name="equipment" value={exercise.equipment} onChange={handleChange} required className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5" />
                    </div>

                     <div>
                        <label htmlFor="description" className="block mb-2 text-sm font-medium text-slate-700 dark:text-gray-300">תיאור</label>
                        <textarea name="description" value={exercise.description} onChange={handleChange} rows={3} required className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5"></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                           <label htmlFor="sets" className="block mb-2 text-sm font-medium text-slate-700 dark:text-gray-300">סטים</label>
                           <input type="number" name="sets" value={exercise.sets || ''} onChange={handleChange} className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5" />
                        </div>
                         <div>
                           <label htmlFor="reps" className="block mb-2 text-sm font-medium text-slate-700 dark:text-gray-300">חזרות</label>
                           <input type="text" name="reps" value={exercise.reps || ''} onChange={handleChange} className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5" />
                        </div>
                         <div>
                           <label htmlFor="duration" className="block mb-2 text-sm font-medium text-slate-700 dark:text-gray-300">משך (שניות)</label>
                           <input type="number" name="duration" value={exercise.duration || ''} onChange={handleChange} className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="rest" className="block mb-2 text-sm font-medium text-slate-700 dark:text-gray-300">מנוחה</label>
                        <input type="text" name="rest" value={exercise.rest} onChange={handleChange} required className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5" />
                    </div>
                    <div>
                        <label htmlFor="safetyNotes" className="block mb-2 text-sm font-medium text-slate-700 dark:text-gray-300">דגשי בטיחות</label>
                        <textarea name="safetyNotes" value={exercise.safetyNotes} onChange={handleChange} rows={2} required className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5"></textarea>
                    </div>

                    <div className="flex justify-end space-x-4 space-x-reverse pt-4">
                        <button type="button" onClick={onClose} className="bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">ביטול</button>
                        <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">{isEditMode ? 'שמור שינויים' : 'הוסף תרגיל'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExerciseFormModal;
