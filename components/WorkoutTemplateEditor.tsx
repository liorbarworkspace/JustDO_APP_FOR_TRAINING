import React, { useState } from 'react';
import type { Exercise, WorkoutTemplate, ID } from '../types';
import { ChevronDownIcon, EditIcon, PlusIcon, TrashIcon } from './icons';
import { WORKOUT_LEVELS, WORKOUT_TAGS } from '../constants';

type LevelFilter = typeof WORKOUT_LEVELS[number] | 'הכל';
type TagFilter = typeof WORKOUT_TAGS[number] | 'הכל';

interface WorkoutTemplateEditorProps {
    workoutTemplates: WorkoutTemplate[];
    exerciseLibrary: Exercise[];
    onAddExerciseToTemplate: (templateId: ID, exercise: Exercise) => void;
    onRemoveExerciseFromTemplate: (templateId: ID, planInstanceId: ID) => void;
    onCreateTemplate: () => void;
    onEditTemplate: (template: WorkoutTemplate) => void;
    onDeleteTemplate: (templateId: ID) => void;
}

const levelColorMap: { [key: string]: string } = {
    'מתחיל': 'bg-green-900 text-green-300',
    'בינוני': 'bg-yellow-900 text-yellow-300',
    'מתקדם': 'bg-red-900 text-red-300',
    'כל הרמות': 'bg-blue-900 text-blue-300'
};

const WorkoutTemplateEditor: React.FC<WorkoutTemplateEditorProps> = (props) => {
    const { 
        workoutTemplates, 
        exerciseLibrary, 
        onAddExerciseToTemplate, 
        onRemoveExerciseFromTemplate,
        onCreateTemplate,
        onEditTemplate,
        onDeleteTemplate
    } = props;

    const [expandedTemplateId, setExpandedTemplateId] = useState<ID | null>(null);
    const [addingToTemplateId, setAddingToTemplateId] = useState<ID | null>(null);
    const [activeLevel, setActiveLevel] = useState<LevelFilter>('הכל');
    const [activeTag, setActiveTag] = useState<TagFilter>('הכל');

    const handleToggleExpand = (templateId: ID) => {
        setExpandedTemplateId(prev => prev === templateId ? null : templateId);
    };

    const handleAddExerciseClick = (templateId: ID) => {
        setAddingToTemplateId(templateId);
    };
    
    const handleSelectExercise = (exercise: Exercise) => {
        if (addingToTemplateId) {
            onAddExerciseToTemplate(addingToTemplateId, exercise);
        }
    };

    const filteredTemplates = workoutTemplates.filter(template => {
        const levelMatch = activeLevel === 'הכל' || template.level === activeLevel;
        const tagMatch = activeTag === 'הכל' || template.tags.includes(activeTag);
        return levelMatch && tagMatch;
    });

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white">עורך תבניות אימון</h2>
                    <p className="text-gray-400">בנה ונהל את תבניות האימון הניתנות לשימוש חוזר.</p>
                </div>
                <button
                    onClick={onCreateTemplate}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>תבנית חדשה</span>
                </button>
            </div>

            <div className="my-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700 space-y-4">
                <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="font-semibold text-gray-300 ml-4">סינון לפי רמה:</span>
                    <button onClick={() => setActiveLevel('הכל')} className={`px-4 py-2 rounded-md font-semibold text-sm transition-all duration-300 ${activeLevel === 'הכל' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}>הכל</button>
                    {WORKOUT_LEVELS.map(level => <button key={level} onClick={() => setActiveLevel(level)} className={`px-4 py-2 rounded-md font-semibold text-sm transition-all duration-300 ${activeLevel === level ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}>{level}</button>)}
                </div>
                 <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="font-semibold text-gray-300 ml-4">סינון לפי תגית:</span>
                    <button onClick={() => setActiveTag('הכל')} className={`px-4 py-2 rounded-md font-semibold text-sm transition-all duration-300 ${activeTag === 'הכל' ? 'bg-sky-600 text-white shadow-lg' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}>הכל</button>
                    {WORKOUT_TAGS.map(tag => <button key={tag} onClick={() => setActiveTag(tag)} className={`px-4 py-2 rounded-md font-semibold text-sm transition-all duration-300 ${activeTag === tag ? 'bg-sky-600 text-white shadow-lg' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}>{tag}</button>)}
                </div>
            </div>
            
            <div className="space-y-4">
                {filteredTemplates.map(template => (
                    <div key={template.id} className="bg-slate-800 rounded-lg border border-slate-700">
                        <div className="p-4">
                            <div className="flex justify-between items-center">
                                <button onClick={() => handleToggleExpand(template.id)} className="flex items-center gap-2 text-right">
                                    <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${expandedTemplateId === template.id ? 'rotate-180' : ''}`} />
                                    <h3 className="text-xl font-bold text-cyan-400">{template.title}</h3>
                                </button>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => onEditTemplate(template)} className="p-2 text-cyan-400 hover:bg-slate-700 rounded-full"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => onDeleteTemplate(template.id)} className="p-2 text-red-400 hover:bg-slate-700 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-3 pr-7">
                                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${levelColorMap[template.level]}`}>{template.level}</span>
                                {template.tags.map(tag => (
                                     <span key={tag} className="bg-sky-900 text-sky-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">{tag}</span>
                                ))}
                                 <span className="text-sm bg-slate-700 text-gray-300 px-2 py-1 rounded">
                                    {template.exercises.length} תרגילים
                                </span>
                            </div>
                        </div>

                        {expandedTemplateId === template.id && (
                            <div className="p-4 border-t border-slate-700 space-y-3">
                                {template.exercises.map(ex => (
                                    <div key={ex.planInstanceId} className="flex justify-between items-center bg-slate-700/50 p-3 rounded">
                                        <span>{ex.name}</span>
                                        <button onClick={() => onRemoveExerciseFromTemplate(template.id, ex.planInstanceId)} className="text-red-400 hover:text-red-300">
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                ))}
                                {template.exercises.length === 0 && <p className="text-gray-500 text-center">תבנית זו ריקה.</p>}
                                <button 
                                    onClick={() => handleAddExerciseClick(template.id)}
                                    className="w-full mt-2 bg-teal-600/50 hover:bg-teal-600/70 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
                                >
                                    <PlusIcon className="w-5 h-5"/>
                                    הוסף תרגיל
                                </button>
                                
                                {addingToTemplateId === template.id && (
                                    <div className="mt-4 p-4 bg-slate-900/50 rounded-lg max-h-60 overflow-y-auto">
                                        <h4 className="font-bold mb-2">בחר תרגיל להוספה:</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {exerciseLibrary.map(ex => (
                                                <button 
                                                    key={ex.id}
                                                    onClick={() => {
                                                        handleSelectExercise(ex)
                                                        setAddingToTemplateId(null); // Close after selection
                                                    }}
                                                    className="w-full text-right p-2 bg-slate-700 hover:bg-slate-600 rounded"
                                                >
                                                    {ex.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WorkoutTemplateEditor;