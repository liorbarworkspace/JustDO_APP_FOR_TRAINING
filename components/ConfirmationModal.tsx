import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    item: {
        type: 'exercise' | 'template' | 'plan' | 'bulk-exercise' | 'new-category' | 'all-data-import';
        id?: string;
        ids?: string[];
        data?: any;
    };
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, item }) => {
    if (!isOpen) return null;

    let title = "אישור מחיקה";
    let message = "האם אתה בטוח?";
    let confirmText = "אישור ומחיקה";
    let confirmColor = "bg-red-600 hover:bg-red-700";

    switch (item.type) {
        case 'exercise':
            title = "אישור מחיקת תרגיל";
            message = "האם אתה בטוח שברצונך למחוק תרגיל זה מהספרייה? הוא יוסר גם מכל תבניות האימון.";
            break;
        case 'template':
            title = "אישור מחיקת תבנית";
            message = "האם אתה בטוח שברצונך למחוק תבנית זו? היא תוסר מכל שבועות האימונים.";
            break;
        case 'plan':
            title = "אישור מחיקת תוכנית שבועית";
            message = "האם אתה בטוח שברצונך למחוק תוכנית שבועית זו? לא ניתן יהיה לבחור אותה יותר בדף הראשי.";
            break;
        case 'bulk-exercise':
            title = "אישור מחיקה מרובה";
            message = `האם אתה בטוח שברצונך למחוק את ${item.ids?.length || 0} התרגילים שנבחרו? הם יוסרו גם מכל תבניות האימון.`;
            break;
        // FIX: Add a case to handle the new category confirmation.
        case 'new-category':
            title = "אישור יצירת קטגוריה חדשה";
            message = `האם אתה בטוח שברצונך ליצור את הקטגוריה החדשה "${item.data.categoryName}"?`;
            confirmText = "כן, צור קטגוריה";
            confirmColor = "bg-green-600 hover:bg-green-700";
            break;
        case 'all-data-import':
            title = "אישור ייבוא נתונים";
            message = "אזהרה: פעולה זו תחליף את כל הנתונים הנוכחיים באפליקציה (תרגילים, תבניות, תוכניות) בנתונים מהקובץ. האם להמשיך?";
            confirmText = "כן, יבא והחלף";
            confirmColor = "bg-amber-600 hover:bg-amber-700";
            break;
    }


    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 md:p-8 max-w-md w-full text-right border border-red-400 dark:border-red-500" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">{title}</h2>
                <p className="text-slate-600 dark:text-gray-300 mb-8">{message}</p>
                
                <div className="flex justify-end space-x-4 space-x-reverse">
                    <button
                        onClick={onClose}
                        className="bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                    >
                        ביטול
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`${confirmColor} text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;