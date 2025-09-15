import React, { useState, useEffect } from 'react';
import type { Feedback } from '../types';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (feedback: Feedback) => void;
    initialData?: Feedback | null;
}

const emptyFeedback: Feedback = {
    feeling: 'good',
    painLevel: 0,
    painLocation: '',
    difficulty: 'just_right',
    notes: '',
};

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [feedback, setFeedback] = useState<Feedback>(() => initialData || emptyFeedback);

    useEffect(() => {
        if (isOpen) {
            setFeedback(initialData || emptyFeedback);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFeedback(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };
    
    const handleFeelingChange = (feeling: Feedback['feeling']) => {
        setFeedback(prev => ({ ...prev, feeling }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(feedback);
    };

    // FIX: Define feeling options as an array of objects to iterate over.
    const feelingOptions: { key: Feedback['feeling']; label: string }[] = [
        { key: 'excellent', label: 'מצוינת' },
        { key: 'good', label: 'טובה' },
        { key: 'ok', label: 'בסדר' },
        { key: 'tired', label: 'עייפות' },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 md:p-8 max-w-2xl w-full text-right border border-amber-300 dark:border-amber-500" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-amber-600 dark:text-amber-400">משוב על האימון</h2>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    
                    <div>
                        <label className="block mb-3 text-sm font-medium text-slate-700 dark:text-gray-300">איך הייתה ההרגשה הכללית באימון?</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {/* FIX: Correctly map over the defined feelingOptions array instead of Object.keys on a string. */}
                            {feelingOptions.map((option) => (
                                <button
                                    type="button"
                                    key={option.key}
                                    onClick={() => handleFeelingChange(option.key)}
                                    className={`p-3 rounded-lg text-center font-semibold transition-all duration-200 ${feedback.feeling === option.key ? 'bg-amber-600 text-white ring-2 ring-amber-400' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="difficulty" className="block mb-2 text-sm font-medium text-slate-700 dark:text-gray-300">איך הייתה רמת הקושי?</label>
                        <select name="difficulty" value={feedback.difficulty} onChange={handleChange} className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5">
                            <option value="easy">קל מדי</option>
                            <option value="just_right">בול</option>
                            <option value="hard">קשה מדי</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="painLevel" className="block mb-2 text-sm font-medium text-slate-700 dark:text-gray-300">האם חשת כאב? (0 = ללא כאב)</label>
                        <div className="flex items-center gap-4">
                            <input type="range" min="0" max="5" name="painLevel" value={feedback.painLevel} onChange={handleChange} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500" />
                            <span className="font-bold text-lg text-red-500 dark:text-red-400 w-8 text-center">{feedback.painLevel}</span>
                        </div>
                    </div>

                    {feedback.painLevel > 0 && (
                         <div>
                            <label htmlFor="painLocation" className="block mb-2 text-sm font-medium text-slate-700 dark:text-gray-300">היכן היה הכאב?</label>
                            <input type="text" name="painLocation" value={feedback.painLocation} onChange={handleChange} className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5" placeholder="לדוגמה: ברך שמאל, גב תחתון"/>
                        </div>
                    )}
                    
                    <div>
                        <label htmlFor="notes" className="block mb-2 text-sm font-medium text-slate-700 dark:text-gray-300">הערות נוספות</label>
                        <textarea name="notes" value={feedback.notes} onChange={handleChange} rows={3} className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5" placeholder="כל דבר שחשוב לך לתעד..."></textarea>
                    </div>

                    <div className="flex justify-end space-x-4 space-x-reverse pt-4">
                        <button type="button" onClick={onClose} className="bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">ביטול</button>
                        <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">שמור משוב</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FeedbackModal;
