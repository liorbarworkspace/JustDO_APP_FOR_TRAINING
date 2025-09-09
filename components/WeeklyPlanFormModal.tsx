import React, { useState, useEffect } from 'react';
import type { WeeklyPlan } from '../types';
import { PLAN_LEVELS } from '../constants';

interface FormData {
    name: string;
    level: typeof PLAN_LEVELS[number];
}
interface WeeklyPlanFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: FormData) => void;
    initialData?: WeeklyPlan | null;
}

const WeeklyPlanFormModal: React.FC<WeeklyPlanFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState<FormData>({ name: '', level: 'מתחיל' });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: initialData?.name || '',
                level: initialData?.level || 'מתחיל',
            });
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const isEditMode = !!initialData;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name.trim()) {
            onSave(formData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg shadow-2xl p-6 md:p-8 max-w-md w-full text-right border border-cyan-500" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-cyan-400">{isEditMode ? 'עריכת תוכנית' : 'יצירת תוכנית שבועית חדשה'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-300">שם התוכנית</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                            placeholder="לדוגמה: שבוע 5 - דגש כוח"
                        />
                    </div>
                     <div>
                        <label htmlFor="level" className="block mb-2 text-sm font-medium text-gray-300">רמה</label>
                        <select
                            id="level"
                            name="level"
                            value={formData.level}
                            onChange={handleChange}
                            className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                        >
                            {PLAN_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-4 space-x-reverse pt-4">
                        <button type="button" onClick={onClose} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                            ביטול
                        </button>
                        <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                            {isEditMode ? 'שמור שינויים' : 'צור תוכנית'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WeeklyPlanFormModal;