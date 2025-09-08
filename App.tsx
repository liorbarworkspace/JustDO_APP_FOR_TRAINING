import React, { useState, useEffect } from 'react';
import WelcomeModal from './components/WelcomeModal';
import WorkoutPlanner from './components/WorkoutPlanner';
import ExerciseLibrary from './components/ExerciseLibrary';
import ProgressTracker from './components/ProgressTracker';
import AddExerciseModal from './components/AddExerciseModal';
import EditPlannedExerciseModal from './components/EditPlannedExerciseModal';
import ExerciseFormModal from './components/ExerciseFormModal';
import ConfirmationModal from './components/ConfirmationModal';
import { PRINCIPLES, PAIN_MANAGEMENT, FUTURE_PLAN, CONCLUSION, INITIAL_WORKOUT_TEMPLATES, INITIAL_EXERCISE_LIBRARY } from './constants';
import type { ContentSection, WorkoutTemplate, CompletionLog, Exercise, PlannedExercise, ID } from './types';

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
  
  const [exerciseLibrary, setExerciseLibrary] = useState<Exercise[]>(() => {
    try {
      const saved = localStorage.getItem('exerciseLibrary');
      return saved ? JSON.parse(saved) : INITIAL_EXERCISE_LIBRARY;
    } catch { return INITIAL_EXERCISE_LIBRARY; }
  });

  const [workoutPlan, setWorkoutPlan] = useState<WorkoutTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('workoutPlan');
      return saved ? JSON.parse(saved) : INITIAL_WORKOUT_TEMPLATES;
    } catch { return INITIAL_WORKOUT_TEMPLATES; }
  });

  const [completionLog, setCompletionLog] = useState<CompletionLog>(() => {
    try {
      const saved = localStorage.getItem('workoutCompletionLog');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [exerciseToAdd, setExerciseToAdd] = useState<Exercise | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<{workoutId: ID, exercise: PlannedExercise} | null>(null);
  const [isExerciseFormModalOpen, setIsExerciseFormModalOpen] = useState(false);
  const [exerciseToEditInLibrary, setExerciseToEditInLibrary] = useState<Exercise | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [exerciseIdToDelete, setExerciseIdToDelete] = useState<ID | null>(null);

  useEffect(() => {
    localStorage.setItem('exerciseLibrary', JSON.stringify(exerciseLibrary));
  }, [exerciseLibrary]);

  useEffect(() => {
    localStorage.setItem('workoutPlan', JSON.stringify(workoutPlan));
  }, [workoutPlan]);

  useEffect(() => {
    localStorage.setItem('workoutCompletionLog', JSON.stringify(completionLog));
  }, [completionLog]);

  // --- Completion Log Handlers ---
  const handleUpdateCompletion = (date: string, workoutTitle: string, completedExercises: { [planInstanceId: string]: PlannedExercise }) => {
    setCompletionLog(prev => ({ ...prev, [date]: { workoutTitle, completedExercises } }));
  };

  const handleRemoveCompletion = (date: string) => {
    setCompletionLog(prev => {
        const newLog = { ...prev };
        delete newLog[date];
        return newLog;
    });
  };

  // --- Workout Plan Handlers ---
  const handleOpenAddModal = (exercise: Exercise) => {
    setExerciseToAdd(exercise);
    setIsAddModalOpen(true);
  };

  const handleAddExerciseToPlan = (workoutId: ID) => {
    if (!exerciseToAdd) return;
    const newPlannedExercise: PlannedExercise = {
        ...exerciseToAdd,
        planInstanceId: crypto.randomUUID(),
    };

    setWorkoutPlan(prev => prev.map(workout => 
        workout.id === workoutId 
        ? { ...workout, exercises: [...workout.exercises, newPlannedExercise] } 
        : workout
    ));
    setIsAddModalOpen(false);
    setExerciseToAdd(null);
  };

  const handleOpenEditModal = (workoutId: ID, exercise: PlannedExercise) => {
    setExerciseToEdit({ workoutId, exercise });
    setIsEditModalOpen(true);
  };

  const handleUpdatePlannedExercise = (workoutId: ID, updatedExercise: PlannedExercise) => {
    setWorkoutPlan(prev => prev.map(w => {
        if (w.id === workoutId) {
            return { ...w, exercises: w.exercises.map(e => e.planInstanceId === updatedExercise.planInstanceId ? updatedExercise : e) };
        }
        return w;
    }));
    setIsEditModalOpen(false);
    setExerciseToEdit(null);
  };

  const handleRemoveExerciseFromPlan = (workoutId: ID, planInstanceId: string) => {
     setWorkoutPlan(prev => prev.map(w => {
        if (w.id === workoutId) {
            return { ...w, exercises: w.exercises.filter(e => e.planInstanceId !== planInstanceId) };
        }
        return w;
    }));
  };

  // --- Exercise Library Handlers ---
  const handleOpenExerciseForm = (exercise: Exercise | null) => {
    setExerciseToEditInLibrary(exercise);
    setIsExerciseFormModalOpen(true);
  };

  const handleSaveExerciseToLibrary = (exercise: Exercise) => {
    if(exerciseToEditInLibrary) { // Edit mode
        setExerciseLibrary(prev => prev.map(e => e.id === exercise.id ? exercise : e));
    } else { // Add mode
        setExerciseLibrary(prev => [...prev, { ...exercise, id: crypto.randomUUID() }]);
    }
    setIsExerciseFormModalOpen(false);
    setExerciseToEditInLibrary(null);
  };

  const handleConfirmDelete = (exerciseId: ID) => {
    setExerciseIdToDelete(exerciseId);
    setIsConfirmModalOpen(true);
  };

  const handleDeleteExerciseFromLibrary = () => {
    if (!exerciseIdToDelete) return;
    setExerciseLibrary(prev => prev.filter(e => e.id !== exerciseIdToDelete));
    setIsConfirmModalOpen(false);
    setExerciseIdToDelete(null);
  };

  const handleDuplicateExercise = (exercise: Exercise) => {
    const newExercise = { ...exercise, name: `${exercise.name} (עותק)`, id: crypto.randomUUID() };
    setExerciseLibrary(prev => [...prev, newExercise]);
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
            onRemoveCompletion={handleRemoveCompletion}
        />;
      case 'library':
        return <ExerciseLibrary 
            exerciseLibrary={exerciseLibrary}
            onAddExerciseToPlan={handleOpenAddModal}
            onAddNewExercise={() => handleOpenExerciseForm(null)}
            onEditExercise={(ex) => handleOpenExerciseForm(ex)}
            onDeleteExercise={handleConfirmDelete}
            onDuplicateExercise={handleDuplicateExercise}
        />;
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
            workoutTemplates={workoutPlan}
            onClose={() => setIsAddModalOpen(false)}
            onConfirm={handleAddExerciseToPlan}
        />
      )}

      {isEditModalOpen && exerciseToEdit && (
        <EditPlannedExerciseModal
            workoutId={exerciseToEdit.workoutId}
            exercise={exerciseToEdit.exercise}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleUpdatePlannedExercise}
        />
      )}

      {isExerciseFormModalOpen && (
        <ExerciseFormModal
            isOpen={isExerciseFormModalOpen}
            onClose={() => {
                setIsExerciseFormModalOpen(false);
                setExerciseToEditInLibrary(null);
            }}
            onSave={handleSaveExerciseToLibrary}
            initialData={exerciseToEditInLibrary}
        />
      )}

      {isConfirmModalOpen && (
        <ConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            onConfirm={handleDeleteExerciseFromLibrary}
            title="אישור מחיקת תרגיל"
            message="האם אתה בטוח שברצונך למחוק תרגיל זה מהספרייה? פעולה זו הינה סופית."
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