import React, { useState } from 'react';
import type { WorkoutTemplate, WeeklyPlan, ID } from '../types';
import { ChevronDownIcon, EditIcon, PlusIcon, TrashIcon } from './icons';
import { DAYS_OF_WEEK, PLAN_LEVELS } from '../constants';

type LevelFilter = typeof PLAN_LEVELS[number] | 'הכל';

interface WeeklyPlanEditorProps {
    weeklyPlans: WeeklyPlan[];
    workoutTemplates: WorkoutTemplate[];
    onCreatePlan: () => void;
    onEditPlan: (plan: WeeklyPlan) => void;
    onDeletePlan: (planId: ID) => void;
    onUpdateSchedule: (planId: ID, day: string, templateId: ID | null) => void;
}

const levelColorMap: { [key: string]: string } = {
    'מתחיל': 'bg-green-900 text-green-300',
    'בינוני': 'bg-yellow-900 text-yellow-300',
    'מתקדם': 'bg-red-900 text-red-300',
};

const WeeklyPlanEditor: React.FC<WeeklyPlanEditorProps> = (props) => {
    const { 
        weeklyPlans, 
        workoutTemplates, 
        onCreatePlan,
        onEditPlan,
        onDeletePlan,
        onUpdateSchedule,
    } = props;

    const [expandedPlanId, setExpandedPlanId] = useState<ID | null>(null);
    const [activeLevel, setActiveLevel] = useState<LevelFilter>('הכל');

    const handleToggleExpand = (planId: ID) => {
        setExpandedPlanId(prev => prev === planId ? null : planId);
    };

    const filteredPlans = weeklyPlans.filter(plan => {
        return activeLevel === 'הכל' || plan.level === activeLevel;
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white">עורך תוכניות שבועיות</h2>
                    <p className="text-gray-400">בנה ונהל את תוכניות האימונים השבועיות שלך.</p>
                </div>
                <button
                    onClick={onCreatePlan}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>תוכנית חדשה</span>
                </button>
            </div>

            <div className="my-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="font-semibold text-gray-300 ml-4">סינון לפי רמה:</span>
                    <button onClick={() => setActiveLevel('הכל')} className={`px-4 py-2 rounded-md font-semibold text-sm transition-all duration-300 ${activeLevel === 'הכל' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}>הכל</button>
                    {PLAN_LEVELS.map(level => <button key={level} onClick={() => setActiveLevel(level)} className={`px-4 py-2 rounded-md font-semibold text-sm transition-all duration-300 ${activeLevel === level ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}>{level}</button>)}
                </div>
            </div>
            
            <div className="space-y-4">
                {filteredPlans.map(plan => (
                    <div key={plan.id} className="bg-slate-800 rounded-lg border border-slate-700">
                        <div className="p-4">
                            <div className="flex justify-between items-center">
                                 <button onClick={() => handleToggleExpand(plan.id)} className="flex items-center gap-2 text-right">
                                    <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${expandedPlanId === plan.id ? 'rotate-180' : ''}`} />
                                    <h3 className="text-xl font-bold text-cyan-400">{plan.name}</h3>
                                </button>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => onEditPlan(plan)} className="p-2 text-cyan-400 hover:bg-slate-700 rounded-full"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => onDeletePlan(plan.id)} className="p-2 text-red-400 hover:bg-slate-700 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                            <div className="pr-7 mt-2">
                                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${levelColorMap[plan.level]}`}>{plan.level}</span>
                            </div>
                        </div>

                        {expandedPlanId === plan.id && (
                            <div className="p-4 border-t border-slate-700 space-y-3">
                                <p className="text-gray-400 mb-2">שבץ תבניות אימון לכל יום:</p>
                                {DAYS_OF_WEEK.map(day => (
                                    <div key={day} className="flex justify-between items-center bg-slate-700/50 p-3 rounded">
                                        <span className="font-semibold">{day}</span>
                                        <select
                                            value={plan.schedule[day] || ''}
                                            onChange={(e) => onUpdateSchedule(plan.id, day, e.target.value || null)}
                                            className="bg-slate-700 border border-slate-600 text-white text-md rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2"
                                            aria-label={`בחר אימון ליום ${day}`}
                                        >
                                            <option value="">-- מנוחה --</option>
                                            {workoutTemplates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
export default WeeklyPlanEditor;