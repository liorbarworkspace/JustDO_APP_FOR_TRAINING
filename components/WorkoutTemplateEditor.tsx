import React, { useState, useMemo } from 'react';
import type { Exercise, WorkoutTemplate, ID, PlannedExercise } from '../types';
import { ChevronDownIcon, EditIcon, PlusIcon, TrashIcon, ClockIcon, ChevronUpIcon } from './icons';
import { WORKOUT_LEVELS, EXERCISE_LEVELS } from '../constants';

// --- Duration Calculation Logic ---
const SECONDS_PER_REP = 3;

const parseReps = (reps?: string): number => {
    if (!reps) return 0;
    const repsAsString = String(reps);
    if (repsAsString.includes('-')) {
        const parts = repsAsString.split('-').map(s => parseInt(s.trim(), 10));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            return (parts[0] + parts[1]) / 2;
        }
    }
    const singleRep = parseInt(repsAsString, 10);
    return isNaN(singleRep) ? 0 : singleRep;
};

const parseRest = (rest?: string): number => {
    if (!rest) return 0;
    const match = rest.match(/(\d+)/);
    if (match) {
        return parseInt(match[0], 10);
    }
    return 0;
};

const calculateWorkoutDuration = (template: WorkoutTemplate | null): string => {
    if (!template || !Array.isArray(template.exercises) || template.exercises.length === 0) {
        return '';
    }

    let totalSeconds = 0;

    for (const exercise of template.exercises) {
        const sets = exercise.sets || 1;
        const activityTimePerSet = exercise.duration || (parseReps(exercise.reps) * SECONDS_PER_REP);
        const restTime = parseRest(exercise.rest);

        if (sets > 0 && activityTimePerSet > 0) {
            const timeForThisExercise = (sets * activityTimePerSet) + (Math.max(0, sets - 1) * restTime);
            totalSeconds += timeForThisExercise;
        }
    }

    if (totalSeconds === 0) {
        return '';
    }

    const totalMinutes = Math.round(totalSeconds / 60);

    if (totalMinutes < 1) {
        return '';
    }

    return `~${totalMinutes} דק'`;
};
// --- End Duration Calculation Logic ---

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


type LevelFilter = typeof WORKOUT_LEVELS[number] | 'הכל';
type TagFilter = string | 'הכל';

interface WorkoutTemplateEditorProps {
    workoutTemplates: WorkoutTemplate[];
    exerciseLibrary: Exercise[];
    allCategories: readonly string[];
    onAddExercisesToTemplate: (templateId: ID, exercises: Exercise[]) => void;
    onRemoveExerciseFromTemplate: (templateId: ID, planInstanceId: ID) => void;
    onEditPlannedExercise: (templateId: ID, exercise: PlannedExercise) => void;
    onReorderExerciseInTemplate: (templateId: ID, planInstanceId: ID, direction: 'up' | 'down') => void;
    onCreateTemplate: () => void;
    onEditTemplate: (template: WorkoutTemplate) => void;
    onDeleteTemplate: (templateId: ID) => void;
}

const levelColorMap: { [key: string]: string } = {
    'מתחיל': 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300',
    'בינוני': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-300',
    'מתקדם': 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300',
    'כל הרמות': 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
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
  'מנוחה': 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
  'default': 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
};

const getCategoryColor = (category: string) => {
    return categoryColorMap[category] || categoryColorMap['default'];
};

const AddExercisePanel: React.FC<{
    exerciseLibrary: Exercise[];
    allCategories: readonly string[];
    onAddSelected: (exercises: Exercise[]) => void;
    onClose: () => void;
}> = ({ exerciseLibrary, allCategories, onAddSelected, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterLevel, setFilterLevel] = useState<string>('הכל');
    const [filterCategory, setFilterCategory] = useState<string>('הכל');
    const [selectedIds, setSelectedIds] = useState<Set<ID>>(new Set());

    const filteredExercises = useMemo(() => {
        return exerciseLibrary.filter(ex => {
            const searchMatch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
            const levelMatch = filterLevel === 'הכל' || ex.level === filterLevel;
            const categoryMatch = filterCategory === 'הכל' || ex.category === filterCategory;
            return searchMatch && levelMatch && categoryMatch;
        });
    }, [exerciseLibrary, searchQuery, filterLevel, filterCategory]);
    
    const handleToggleSelect = (id: ID) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleAddClick = () => {
        const selectedExercises = exerciseLibrary.filter(ex => selectedIds.has(ex.id));
        onAddSelected(selectedExercises);
        onClose();
    };

    return (
        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold mb-3 text-slate-800 dark:text-gray-200">בחר תרגילים להוספה:</h4>
            <div className="space-y-3 mb-3">
                <input
                    type="text"
                    placeholder="חיפוש לפי שם..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-slate-700 p-2 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-amber-500 focus:border-amber-500"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                    <select
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value)}
                        className="w-full sm:w-1/2 bg-white dark:bg-slate-700 p-2 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-amber-500 focus:border-amber-500"
                    >
                        <option value="הכל">כל הרמות</option>
                        {EXERCISE_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
                    </select>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full sm:w-1/2 bg-white dark:bg-slate-700 p-2 rounded-md border border-slate-300 dark:border-slate-600 focus:ring-amber-500 focus:border-amber-500"
                    >
                        <option value="הכל">כל הקטגוריות</option>
                        {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                {filteredExercises.length > 0 ? (
                    filteredExercises.map(ex => (
                        <div 
                            key={ex.id}
                            className="flex items-center gap-3 p-2 bg-slate-200 dark:bg-slate-700 rounded"
                        >
                            <input
                                type="checkbox"
                                id={`ex-select-${ex.id}`}
                                checked={selectedIds.has(ex.id)}
                                onChange={() => handleToggleSelect(ex.id)}
                                className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500"
                            />
                            <label htmlFor={`ex-select-${ex.id}`} className="w-full text-right flex justify-between items-center cursor-pointer">
                                <span>{ex.name}</span>
                                <span className="text-xs text-slate-500 dark:text-gray-400">{ex.category}</span>
                            </label>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-slate-500 dark:text-gray-400 py-4">לא נמצאו תרגילים התואמים לסינון.</p>
                )}
            </div>
             <div className="mt-4 flex justify-end gap-2">
                <button onClick={onClose} className="bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">סגור</button>
                <button 
                    onClick={handleAddClick} 
                    disabled={selectedIds.size === 0}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    הוסף {selectedIds.size > 0 ? `(${selectedIds.size})` : ''} תרגילים נבחרים
                </button>
            </div>
        </div>
    );
};


const WorkoutTemplateEditor: React.FC<WorkoutTemplateEditorProps> = (props) => {
    const { 
        workoutTemplates, 
        exerciseLibrary, 
        allCategories,
        onAddExercisesToTemplate, 
        onRemoveExerciseFromTemplate,
        onEditPlannedExercise,
        onReorderExerciseInTemplate,
        onCreateTemplate,
        onEditTemplate,
        onDeleteTemplate
    } = props;

    const [expandedTemplateId, setExpandedTemplateId] = useState<ID | null>(null);
    const [addingToTemplateId, setAddingToTemplateId] = useState<ID | null>(null);
    const [activeLevel, setActiveLevel] = useState<LevelFilter>('הכל');
    const [activeTag, setActiveTag] = useState<TagFilter>('הכל');
    
    const availableTags = useMemo(() => ['מנוחה', ...allCategories].filter((v, i, a) => a.indexOf(v) === i), [allCategories]);

    const handleToggleExpand = (templateId: ID) => {
        setExpandedTemplateId(prev => prev === templateId ? null : templateId);
    };

    const handleAddExerciseClick = (templateId: ID) => {
        setAddingToTemplateId(prev => prev === templateId ? null : templateId);
    };

    const filteredTemplates = workoutTemplates.filter(template => {
        const levelMatch = activeLevel === 'הכל' || template.level === activeLevel;
        const tagMatch = activeTag === 'הכל' || (Array.isArray(template.tags) && template.tags.includes(activeTag));
        return levelMatch && tagMatch;
    });

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight font-rubik">עורך תבניות אימון</h2>
                    <p className="text-slate-500 dark:text-gray-400 mt-2 text-lg">בנה ונהל את תבניות האימון הניתנות לשימוש חוזר.</p>
                </div>
                <button
                    onClick={onCreateTemplate}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>תבנית חדשה</span>
                </button>
            </div>

            <div className="my-8 p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-gray-300 ml-4">סינון לפי רמה:</span>
                    <button onClick={() => setActiveLevel('הכל')} className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${activeLevel === 'הכל' ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>{`הכל`}</button>
                    {WORKOUT_LEVELS.map(level => <button key={level} onClick={() => setActiveLevel(level)} className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${activeLevel === level ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>{level}</button>)}
                </div>
                 <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-gray-300 ml-4">סינון לפי תגית:</span>
                    <button onClick={() => setActiveTag('הכל')} className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${activeTag === 'הכל' ? 'bg-violet-500 text-white shadow-lg' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>{`הכל`}</button>
                    {availableTags.map(tag => <button key={tag} onClick={() => setActiveTag(tag)} className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${activeTag === tag ? 'bg-violet-500 text-white shadow-lg' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>{tag}</button>)}
                </div>
            </div>
            
            <div className="space-y-4">
                {filteredTemplates.map(template => {
                    const durationText = calculateWorkoutDuration(template);
                    return (
                    <div key={template.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="p-4">
                            <div className="flex justify-between items-center">
                                <button onClick={() => handleToggleExpand(template.id)} className="flex items-center gap-2 text-right">
                                    <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${expandedTemplateId === template.id ? 'rotate-180' : ''}`} />
                                    <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400">{template.title}</h3>
                                </button>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => onEditTemplate(template)} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => onDeleteTemplate(template.id)} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-3 pr-7">
                                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${levelColorMap[template.level]}`}>{template.level}</span>
                                {Array.isArray(template.tags) && template.tags.map(tag => (
                                     <span key={tag} className={`${getCategoryColor(tag)} text-xs font-semibold px-2.5 py-0.5 rounded-full`}>{tag}</span>
                                ))}
                                {durationText ? (
                                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-gray-300 px-2 py-1 rounded-full">
                                        <ClockIcon className="w-4 h-4" />
                                        <span className="text-xs font-semibold">{durationText}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-gray-300 px-2 py-1 rounded-full">
                                         <span className="text-xs font-semibold">{`${Array.isArray(template.exercises) ? template.exercises.length : 0} תרגילים`}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {expandedTemplateId === template.id && (
                            <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                                {Array.isArray(template.exercises) && template.exercises.length > 0 ? (
                                    template.exercises.map((ex, index) => {
                                        const setsRepsString = [
                                            ex.sets ? `${ex.sets} סטים` : '',
                                            ex.reps ? `x ${ex.reps}` : '',
                                            formatDurationDisplay(ex.duration),
                                        ].filter(Boolean).join(' ');

                                        return (
                                            <div key={ex.planInstanceId} className="flex justify-between items-center bg-slate-100 dark:bg-slate-700/50 p-3 rounded">
                                                <div>
                                                    <span className="font-semibold text-slate-800 dark:text-gray-200">{ex.name}</span>
                                                    <span className="text-sm text-slate-500 dark:text-gray-400 mr-2">{setsRepsString}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => onEditPlannedExercise(template.id, ex)} className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400"><EditIcon className="w-5 h-5"/></button>
                                                    <button onClick={() => onRemoveExerciseFromTemplate(template.id, ex.planInstanceId)} className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"><TrashIcon className="w-5 h-5"/></button>
                                                    <div className="border-r border-slate-300 dark:border-slate-600 h-6 mx-2"></div>
                                                    <button 
                                                        onClick={() => onReorderExerciseInTemplate(template.id, ex.planInstanceId, 'up')}
                                                        disabled={index === 0}
                                                        aria-label="הזז למעלה"
                                                        className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 disabled:opacity-30 disabled:cursor-not-allowed"
                                                    >
                                                        <ChevronUpIcon className="w-5 h-5"/>
                                                    </button>
                                                    <button 
                                                        onClick={() => onReorderExerciseInTemplate(template.id, ex.planInstanceId, 'down')}
                                                        disabled={index === template.exercises.length - 1}
                                                        aria-label="הזז למטה"
                                                        className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 disabled:opacity-30 disabled:cursor-not-allowed"
                                                    >
                                                        <ChevronDownIcon className="w-5 h-5"/>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-gray-500 text-center">תבנית זו ריקה.</p>
                                )}
                                <button 
                                    onClick={() => handleAddExerciseClick(template.id)}
                                    className="w-full mt-2 bg-violet-600/10 dark:bg-violet-600/20 hover:bg-violet-600/20 dark:hover:bg-violet-600/30 text-violet-800 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
                                >
                                    <PlusIcon className="w-5 h-5"/>
                                    הוסף תרגיל
                                </button>
                                
                                {addingToTemplateId === template.id && (
                                   <AddExercisePanel 
                                     exerciseLibrary={exerciseLibrary}
                                     allCategories={allCategories}
                                     onAddSelected={(exercises) => {
                                         onAddExercisesToTemplate(template.id, exercises);
                                     }}
                                     onClose={() => setAddingToTemplateId(null)}
                                   />
                                )}
                            </div>
                        )}
                    </div>
                )})}
            </div>
        </div>
    );
};

export default WorkoutTemplateEditor;
