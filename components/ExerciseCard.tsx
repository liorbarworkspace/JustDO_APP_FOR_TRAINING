import React, { useState } from 'react';
import type { Exercise, ID } from '../types';
import { DumbbellIcon, BodyweightIcon, RingsIcon, JumpRopeIcon, BasketballIcon, ChevronDownIcon, PlusIcon, EditIcon, TrashIcon, DuplicateIcon } from './icons';

interface ExerciseCardProps {
  exercise: Exercise;
  onAddToPlan?: (exercise: Exercise) => void;
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exerciseId: string) => void;
  onDuplicate?: (exercise: Exercise) => void;
  showAddButton?: boolean;
  showAdminControls?: boolean;
  showSelection?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (exerciseId: ID) => void;
}

const equipmentIconMap: { [key: string]: React.ReactNode } = {
  "משקולות": <DumbbellIcon className="w-5 h-5 inline-block ml-2" />,
  "משקל גוף": <BodyweightIcon className="w-5 h-5 inline-block ml-2" />,
  "טבעות": <RingsIcon className="w-5 h-5 inline-block ml-2" />,
  "דלגית": <JumpRopeIcon className="w-5 h-5 inline-block ml-2" />,
  "כדורסל": <BasketballIcon className="w-5 h-5 inline-block ml-2" />,
  "ספסל/כיאור": <BodyweightIcon className="w-5 h-5 inline-block ml-2" />,
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

const levelColorMap = {
    'מתחיל': 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300',
    'בינוני': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-300',
    'מתקדם': 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300',
};

const categoryColorMap: { [key: string]: string } = {
  'כוח': 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300',
  'ליבה': 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
  'אירובי': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-300',
  'קליסטניקס': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300',
  'כדורסל': 'bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-300',
  'חימום': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-300',
  'גמישות': 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300',
  'שיקום': 'bg-lime-100 text-lime-800 dark:bg-lime-900/60 dark:text-lime-300',
  'הרפיה': 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/60 dark:text-fuchsia-300',
  'default': 'bg-slate-100 text-slate-800 dark:bg-slate-900/60 dark:text-slate-300',
};

const getCategoryColor = (category: string) => {
    return categoryColorMap[category] || categoryColorMap['default'];
};

const formatDurationDisplay = (seconds: number | undefined | null): string => {
  if (!seconds || seconds <= 0) {
    return '';
  }
  if (seconds < 60) {
    return `${seconds} שניות`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) {
    return `${minutes} דקות`;
  }
  return `${minutes} דקות ו-${remainingSeconds} שניות`;
};


const ExerciseCard: React.FC<ExerciseCardProps> = ({ 
    exercise, 
    onAddToPlan, 
    onEdit, 
    onDelete, 
    onDuplicate, 
    showAddButton = false, 
    showAdminControls = false,
    showSelection = false,
    isSelected = false,
    onToggleSelect
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const setsRepsString = [
    exercise.sets ? `${exercise.sets} סטים` : '',
    exercise.reps ? `x ${exercise.reps}` : '',
    formatDurationDisplay(exercise.duration),
  ].filter(Boolean).join(' ');
  
  const selectionClasses = isSelected ? 'ring-2 ring-amber-500 border-amber-400' : 'border-slate-200 dark:border-slate-700';

  return (
    <div className={`relative bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-md border transition-all duration-300 hover:shadow-amber-500/20 hover:border-slate-300 dark:hover:border-slate-600 flex flex-col hover:shadow-lg ${selectionClasses}`}>
      
      <div className="p-4 flex flex-col flex-grow">
        
        <div className="relative flex justify-between items-start gap-4 mb-2">
            {showSelection && (
                <div className="absolute top-0 right-0 z-10">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect?.(exercise.id)}
                    onClick={(e) => e.stopPropagation()} 
                    className="w-5 h-5 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 dark:focus:ring-amber-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                </div>
            )}
            <div className="flex-grow pr-8">
                <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400">{exercise.name}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`${getCategoryColor(exercise.category)} text-xs font-semibold px-2.5 py-0.5 rounded-full`}>{exercise.category}</span>
                    <span className={`${levelColorMap[exercise.level]} text-xs font-semibold px-2.5 py-0.5 rounded-full`}>{exercise.level}</span>
                </div>
            </div>
            
            {showAdminControls && (
              <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                <button onClick={() => onEdit?.(exercise)} className="p-2 bg-slate-100 dark:bg-slate-900/70 rounded-full text-slate-500 dark:text-slate-400 hover:text-white hover:bg-amber-500 transition-colors"><EditIcon className="w-5 h-5"/></button>
                <button onClick={() => onDuplicate?.(exercise)} className="p-2 bg-slate-100 dark:bg-slate-900/70 rounded-full text-slate-500 dark:text-slate-400 hover:text-white hover:bg-violet-500 transition-colors"><DuplicateIcon className="w-5 h-5"/></button>
                <button onClick={() => onDelete?.(exercise.id)} className="p-2 bg-slate-100 dark:bg-slate-900/70 rounded-full text-slate-500 dark:text-slate-400 hover:text-white hover:bg-red-600 transition-colors"><TrashIcon className="w-5 h-5"/></button>
              </div>
            )}
        </div>
        
        <div className="flex flex-wrap gap-1 my-3">
            {Array.isArray(exercise.muscleGroups) && exercise.muscleGroups.map(group => (
                <span key={group} className="bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-gray-300 text-xs font-medium px-2 py-0.5 rounded">
                    {group}
                </span>
            ))}
        </div>
        
        <div className="flex items-center text-sm text-slate-500 dark:text-gray-400 my-2">
          {getEquipmentIcon(exercise.equipment)}
          <span>{exercise.equipment}</span>
        </div>

        <div className="flex justify-between items-center text-center mb-4 gap-2">
            <div className="bg-slate-100 dark:bg-slate-700/50 p-2 rounded-md flex-1">
                <p className="text-xs text-slate-500 dark:text-gray-400">סטים/זמן</p>
                <p className="font-semibold text-slate-900 dark:text-white">{setsRepsString || 'לפי תוכנית'}</p>
            </div>
            {exercise.rest && (
                <div className="bg-slate-100 dark:bg-slate-700/50 p-2 rounded-md flex-1">
                    <p className="text-xs text-slate-500 dark:text-gray-400">מנוחה</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{exercise.rest}</p>
                </div>
            )}
        </div>
        
        <div className="mt-auto">
            <button onClick={() => setIsExpanded(!isExpanded)} className="w-full text-right flex justify-between items-center p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500">
                <span className="font-semibold">פרטים נוספים</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            {isExpanded && (
                <div className="mt-4 space-y-3 text-slate-600 dark:text-gray-300 border-t border-slate-200 dark:border-slate-700 pt-3">
                    <div>
                        <h4 className="font-semibold text-amber-700 dark:text-amber-500">תיאור הביצוע:</h4>
                        <p className="text-sm leading-relaxed">{exercise.description}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-red-600 dark:text-red-400">דגשי בטיחות:</h4>
                        <p className="text-sm leading-relaxed">{exercise.safetyNotes}</p>
                    </div>
                </div>
            )}

            {showAddButton && onAddToPlan && (
                <button 
                    onClick={() => onAddToPlan(exercise)}
                    className="w-full mt-4 bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
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
