import React, { useState } from 'react';
import type { Exercise } from '../types';
import { DumbbellIcon, BodyweightIcon, RingsIcon, JumpRopeIcon, BasketballIcon, ChevronDownIcon, PlusIcon } from './icons';

interface ExerciseCardProps {
  exercise: Exercise;
  onAddToPlan?: (exercise: Exercise) => void;
  showAddButton?: boolean;
}

const equipmentIconMap: { [key: string]: React.ReactNode } = {
  "משקולות": <DumbbellIcon className="w-5 h-5 inline-block ml-2" />,
  "משקל גוף": <BodyweightIcon className="w-5 h-5 inline-block ml-2" />,
  "טבעות": <RingsIcon className="w-5 h-5 inline-block ml-2" />,
  "דלגית": <JumpRopeIcon className="w-5 h-5 inline-block ml-2" />,
  "כדורסל": <BasketballIcon className="w-5 h-5 inline-block ml-2" />,
  "ספסל/כיסא": <BodyweightIcon className="w-5 h-5 inline-block ml-2" />,
  "מזרון": <BodyweightIcon className="w-5 h-5 inline-block ml-2" />,
};

const getEquipmentIcon = (equipmentString: string) => {
  for (const key in equipmentIconMap) {
    if (equipmentString.includes(key)) {
      return equipmentIconMap[key];
    }
  }
  return <BodyweightIcon className="w-5 h-5 inline-block ml-2" />;
};


const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onAddToPlan, showAddButton = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const setsRepsString = [
    exercise.sets ? `${exercise.sets} סטים` : '',
    exercise.reps ? `x ${exercise.reps}` : '',
    exercise.duration ? `${exercise.duration} שניות` : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg border border-slate-700 transition-all duration-300 hover:shadow-cyan-500/20 hover:border-slate-600 flex flex-col">
      <img className="w-full h-48 object-cover" src={exercise.imageUrl} alt={exercise.name} />
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-cyan-400">{exercise.name}</h3>
            <span className="bg-cyan-900 text-cyan-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">{exercise.category}</span>
        </div>
        <div className="flex items-center text-sm text-gray-400 mb-4">
          {getEquipmentIcon(exercise.equipment)}
          <span>{exercise.equipment}</span>
        </div>

        <div className="flex justify-between items-center text-center mb-4 gap-2">
            <div className="bg-slate-700 p-2 rounded-md flex-1">
                <p className="text-xs text-gray-400">סטים/זמן</p>
                <p className="font-semibold text-white">{setsRepsString || 'לפי תוכנית'}</p>
            </div>
            {exercise.rest && (
                <div className="bg-slate-700 p-2 rounded-md flex-1">
                    <p className="text-xs text-gray-400">מנוחה</p>
                    <p className="font-semibold text-white">{exercise.rest}</p>
                </div>
            )}
        </div>
        
        <div className="mt-auto">
            <button onClick={() => setIsExpanded(!isExpanded)} className="w-full text-right flex justify-between items-center p-2 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                <span className="font-semibold">פרטים נוספים</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            {isExpanded && (
                <div className="mt-4 space-y-3 text-gray-300 border-t border-slate-700 pt-3">
                    <div>
                        <h4 className="font-semibold text-cyan-500">תיאור הביצוע:</h4>
                        <p className="text-sm leading-relaxed">{exercise.description}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-red-400">דגשי בטיחות:</h4>
                        <p className="text-sm leading-relaxed">{exercise.safetyNotes}</p>
                    </div>
                </div>
            )}

            {showAddButton && onAddToPlan && (
                <button 
                    onClick={() => onAddToPlan(exercise)}
                    className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    הוסף לתוכנית
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;