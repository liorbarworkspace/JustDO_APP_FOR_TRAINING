import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg shadow-2xl p-6 md:p-8 max-w-md w-full text-right border border-red-500" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4 text-red-400">{title}</h2>
                <p className="text-gray-300 mb-8">{message}</p>
                
                <div className="flex justify-end space-x-4 space-x-reverse">
                    <button
                        onClick={onClose}
                        className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                    >
                        ביטול
                    </button>
                    <button
                        onClick={onConfirm}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                    >
                        אישור ומחיקה
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;