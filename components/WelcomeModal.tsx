import React from 'react';
import { SAFETY_DISCLAIMER } from '../constants';

interface WelcomeModalProps {
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-6 md:p-8 max-w-2xl w-full text-right border border-amber-300 dark:border-amber-500">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-amber-600 dark:text-amber-400">{SAFETY_DISCLAIMER.title}</h2>
        <div className="space-y-4 text-slate-600 dark:text-gray-300">
          {SAFETY_DISCLAIMER.content.map((paragraph, index) => (
            <p key={index} className="leading-relaxed">{paragraph}</p>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-8 w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-75"
        >
          הבנתי, בואו נתחיל!
        </button>
      </div>
    </div>
  );
};

export default WelcomeModal;
