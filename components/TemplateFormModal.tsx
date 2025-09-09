import React, { useState, useEffect } from 'react';
import type { WorkoutTemplate } from '../types';
import { WORKOUT_LEVELS, WORKOUT_TAGS } from '../constants';

type FormData = {
    title: string;
    level: typeof WORKOUT_LEVELS[number];
    tags: string[];
}
interface TemplateFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: FormData) => void;
    initialData?: WorkoutTemplate | null;
}

const TemplateFormModal: React.FC<TemplateFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState<FormData>({
        title: '',
        level: 'מתחיל',
        tags: []
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                title: initialData?.title || '',
                level: initialData?.level || 'מתחיל',
                tags: initialData?.tags || []
            });
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const isEditMode = !!initialData;

    const handleTagChange = (tag: string) => {
        setFormData(prev => {
            const newTags = prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag];
            return { ...prev, tags: newTags };
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.title.trim()) {
            onSave(formData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg shadow-2xl p-6 md:p-8 max-w-lg w-full text-right border border-cyan-500" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-cyan-400">{isEditMode ? 'עריכת תבנית' : 'יצירת תבנית חדשה'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div>
                        <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-300">שם התבנית</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                            placeholder="לדוגמה: אימון רגליים מתקדם"
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
                            {WORKOUT_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">תגיות</label>
                        <div className="bg-slate-700/50 border border-slate-600 p-3 rounded-lg grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {WORKOUT_TAGS.map(tag => (
                                <div key={tag} className="flex items-center p-1 rounded-md hover:bg-slate-600">
                                    <input
                                        type="checkbox"
                                        id={`tag-${tag}`}
                                        checked={formData.tags.includes(tag)}
                                        onChange={() => handleTagChange(tag)}
                                        className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-600 ring-offset-gray-800 focus:ring-2"
                                    />
                                    <label htmlFor={`tag-${tag}`} className="mr-2 text-sm font-medium text-gray-300">{tag}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 space-x-reverse pt-4">
                        <button type="button" onClick={onClose} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                            ביטול
                        </button>
                        <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                            {isEditMode ? 'שמור שינויים' : 'צור תבנית'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TemplateFormModal;