import React, { useState, useEffect } from 'react';
import WelcomeModal from './components/WelcomeModal';
import WorkoutPlanner from './components/WorkoutPlanner';
import ExerciseLibrary from './components/ExerciseLibrary';
import ProgressTracker from './components/ProgressTracker';
import AddExerciseModal from './components/AddExerciseModal';
import EditPlannedExerciseModal from './components/EditPlannedExerciseModal';
import { PRINCIPLES, PAIN_MANAGEMENT, FUTURE_PLAN, CONCLUSION, INITIAL_MONTH_1_PLAN } from './constants';
import type { ContentSection, DailyPlan, CompletionLog, Exercise, PlannedExercise } from './types';

type Tab = 'plan' | 'progress' | 'library' | 'info';

const InfoSection: React.FC<{ title: string; sections: ContentSection[] }> = ({ title, sections }) => (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 text-right space-y-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">{title}</h2>
        {sections.map(section => (
            <div key={section.title} className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 className="text-xl font-bold text-cyan-400 mb-3">{section.title}</h3>
                <div className="space-y-3 text-gray-300 leading-relaxed">
                    {section.content.map((p, i) => <p key={i}>{p}</p>)}
                </div>
            </div>
        ))}
    </div>
);


function App() {
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<Tab>('plan');
  
  const [workoutPlan, setWorkoutPlan] = useState<DailyPlan[]>(() => {
    try {
      const savedPlan = localStorage.getItem('workoutPlan');
      return savedPlan ? JSON.parse(savedPlan) : INITIAL_MONTH_1_PLAN;
    } catch (e) { return INITIAL_MONTH_1_PLAN; }
  });

  const [completionLog, setCompletionLog] = useState<CompletionLog>(() => {
    try {
      const savedLog = localStorage.getItem('workoutCompletionLog');
      return savedLog ? JSON.parse(savedLog) : {};
    } catch (e) { return {}; }
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [exerciseToAdd, setExerciseToAdd] = useState<Exercise | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<{day: string, exercise: PlannedExercise} | null>(null);

  useEffect(() => {
    localStorage.setItem('workoutPlan', JSON.stringify(workoutPlan));
  }, [workoutPlan]);

  useEffect(() => {
    localStorage.setItem('workoutCompletionLog', JSON.stringify(completionLog));
  }, [completionLog]);

  const handleUpdateCompletion = (date: string, workoutDay: string, completedExercises: { [planInstanceId: string]: PlannedExercise }) => {
    setCompletionLog(prev => ({ ...prev, [date]: { workoutDay, completedExercises } }));
  };

  const handleRemoveCompletion = (date: string) => {
    setCompletionLog(prev => {
        const newLog = { ...prev };
        delete newLog[date];
        return newLog;
    });
  };

  const handleOpenAddModal = (exercise: Exercise) => {
    setExerciseToAdd(exercise);
    setIsAddModalOpen(true);
  };

  const handleAddExerciseToPlan = (day: string) => {
    if (!exerciseToAdd) return;
    const newPlannedExercise: PlannedExercise = {
        ...exerciseToAdd,
        planInstanceId: crypto.randomUUID(),
    };

    setWorkoutPlan(prevPlan => {
        return prevPlan.map(dailyPlan => {
            if (dailyPlan.day === day) {
                const newActivities = [...dailyPlan.activities];
                let targetActivity = newActivities.find(a => a.title !== 'חימום' && a.title !== 'שחרור ומתיחות' && a.title !== 'התאוששות');
                if(!targetActivity) {
                    newActivities.push({ title: 'תרגילים נוספים', details: '', exercises: [] });
                    targetActivity = newActivities[newActivities.length - 1];
                }
                targetActivity.exercises.push(newPlannedExercise);
                return { ...dailyPlan, activities: newActivities };
            }
            return dailyPlan;
        });
    });
    setIsAddModalOpen(false);
    setExerciseToAdd(null);
  };

  const handleOpenEditModal = (day: string, exercise: PlannedExercise) => {
    setExerciseToEdit({ day, exercise });
    setIsEditModalOpen(true);
  };

  const handleUpdatePlannedExercise = (day: string, updatedExercise: PlannedExercise) => {
    setWorkoutPlan(prevPlan => prevPlan.map(d => {
        if (d.day === day) {
            return {
                ...d,
                activities: d.activities.map(a => ({
                    ...a,
                    exercises: a.exercises.map(e => e.planInstanceId === updatedExercise.planInstanceId ? updatedExercise : e)
                }))
            };
        }
        return d;
    }));
    setIsEditModalOpen(false);
    setExerciseToEdit(null);
  };

  const handleRemoveExerciseFromPlan = (day: string, planInstanceId: string) => {
     setWorkoutPlan(prevPlan => prevPlan.map(d => {
        if (d.day === day) {
            return {
                ...d,
                activities: d.activities.map(a => ({
                    ...a,
                    exercises: a.exercises.filter(e => e.planInstanceId !== planInstanceId)
                }))
            };
        }
        return d;
    }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'plan':
        return <WorkoutPlanner 
            workoutPlan={workoutPlan} 
            completionLog={completionLog}
            onUpdateCompletion={handleUpdateCompletion}
            onRemoveCompletion={handleRemoveCompletion}
            onEditExercise={handleOpenEditModal}
            onRemoveExercise={handleRemoveExerciseFromPlan}
        />;
      case 'progress':
        return <ProgressTracker 
            completionLog={completionLog}
            workoutPlan={workoutPlan}
            onRemoveCompletion={handleRemoveCompletion}
        />;
      case 'library':
        return <ExerciseLibrary onAddExercise={handleOpenAddModal} />;
      case 'info':
        return (
          <>
            <InfoSection title="פרק א' - עקרונות יסוד" sections={PRINCIPLES} />
            <InfoSection title="פרק ב' - התאמה אישית" sections={PAIN_MANAGEMENT} />
            <InfoSection title="המשך התוכנית: חודשים 2-3" sections={FUTURE_PLAN} />
            <div className="w-full max-w-4xl mx-auto p-4 md:p-6 text-right">
                <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                    <h3 className="text-xl font-bold text-cyan-400 mb-3">{CONCLUSION.title}</h3>
                    <div className="space-y-3 text-gray-300 leading-relaxed">
                        {CONCLUSION.content.map((p, i) => <p key={i}>{p}</p>)}
                    </div>
                </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const TabButton: React.FC<{tabName: Tab, label: string}> = ({tabName, label}) => (
    <button
        onClick={() => setActiveTab(tabName)}
        className={`px-3 py-2 md:px-5 md:py-3 text-sm md:text-base font-medium rounded-md transition-colors duration-200 ${
            activeTab === tabName
                ? 'bg-cyan-600 text-white'
                : 'text-gray-300 hover:bg-slate-700 hover:text-white'
        }`}
    >
        {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200">
      {showWelcomeModal && <WelcomeModal onClose={() => setShowWelcomeModal(false)} />}
      
      {isAddModalOpen && exerciseToAdd && (
        <AddExerciseModal
            exercise={exerciseToAdd}
            workoutPlan={workoutPlan}
            onClose={() => setIsAddModalOpen(false)}
            onConfirm={handleAddExerciseToPlan}
        />
      )}

      {isEditModalOpen && exerciseToEdit && (
        <EditPlannedExerciseModal
            day={exerciseToEdit.day}
            exercise={exerciseToEdit.exercise}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleUpdatePlannedExercise}
        />
      )}
      
      <header className="bg-slate-800/80 backdrop-blur-sm sticky top-0 z-40 shadow-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
                <div className="flex-shrink-0">
                    <h1 className="text-xl md:text-2xl font-bold text-white">תוכנית אימונים אישית</h1>
                </div>
                <div className="flex items-center space-x-2 md:space-x-4">
                    <TabButton tabName="plan" label="תוכנית אימונים" />
                    <TabButton tabName="progress" label="מעקב התקדמות" />
                    <TabButton tabName="library" label="ספריית תרגילים" />
                    <TabButton tabName="info" label="עקרונות ומידע" />
                </div>
            </div>
        </nav>
      </header>

      <main className="py-10">
        {renderContent()}
      </main>

      <footer className="bg-slate-800 text-center py-4 mt-10">
        <p className="text-sm text-gray-500">נבנה עבורך כדי שתגיע ליעדים שלך. בהצלחה!</p>
      </footer>
    </div>
  );
}

export default App;