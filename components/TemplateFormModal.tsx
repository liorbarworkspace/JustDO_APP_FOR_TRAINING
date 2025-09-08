import React, { useState, useEffect } from 'react';
import type { WorkoutTemplate } from '../types';

interface TemplateFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (title: string) => void;
    initialData?: WorkoutTemplate | null;
}

const TemplateFormModal: React.FC<TemplateFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [title, setTitle] = useState('');

    useEffect(() => {
        if (isOpen) {
            setTitle(initialData?.title || '');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const isEditMode = !!initialData;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            onSave(title.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg shadow-2xl p-6 md:p-8 max-w-md w-full text-right border border-cyan-500" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-cyan-400">{isEditMode ? 'עריכת שם תבנית' : 'יצירת תבנית חדשה'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="template-title" className="block mb-2 text-sm font-medium text-gray-300">שם התבנית</label>
                        <input
                            type="text"
                            id="template-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                            placeholder="לדוגמה: אימון רגליים מתקדם"
                        />
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
