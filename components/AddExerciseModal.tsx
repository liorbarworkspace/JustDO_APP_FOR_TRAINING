import React, { useState } from 'react';
import type { Exercise, WorkoutTemplate, ID } from '../types';

interface AddExerciseModalProps {
  exercise: Exercise;
  workoutTemplates: WorkoutTemplate[];
  onClose: () => void;
  onConfirm: (workoutId: ID) => void;
}

const AddExerciseModal: React.FC<AddExerciseModalProps> = ({ exercise, workoutTemplates, onClose, onConfirm }) => {
  const availableTemplates = workoutTemplates.filter(p => p.exercises.length > 0);
  const [selectedTemplateId, setSelectedTemplateId] = useState<ID>(availableTemplates[0]?.id || '');

  const handleConfirm = () => {
    if (selectedTemplateId) {
        onConfirm(selectedTemplateId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 md:p-8 max-w-md w-full text-right border border-amber-300 dark:border-amber-500" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-2 text-amber-600 dark:text-amber-400">הוספת תרגיל לתוכנית</h2>
        <p className="text-slate-500 dark:text-gray-400 mb-6">בחר לאיזו תבנית אימון להוסיף את התרגיל: <span className="font-semibold text-slate-800 dark:text-white">{exercise.name}</span></p>

        <div className="mb-6">
            <label htmlFor="template-select" className="block mb-2 text-sm font-medium text-slate-700 dark:text-gray-300">בחר תבנית אימון:</label>
            <select
                id="template-select"
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5"
            >
                {availableTemplates.map(template => (
                    <option key={template.id} value={template.id}>{template.title}</option>
                ))}
            </select>
        </div>

        <div className="flex justify-end space-x-4 space-x-reverse">
            <button
                onClick={onClose}
                className="bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
            >
                ביטול
            </button>
            <button
                onClick={handleConfirm}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                disabled={!selectedTemplateId}
            >
                אישור והוספה
            </button>
        </div>
      </div>
    </div>
  );
};

export default AddExerciseModal;
