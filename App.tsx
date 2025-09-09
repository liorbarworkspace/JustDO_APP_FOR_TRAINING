

import React, { useState, useEffect } from 'react';
import WelcomeModal from './components/WelcomeModal';
import WorkoutPlanner from './components/WorkoutPlanner';
import ExerciseLibrary from './components/ExerciseLibrary';
import ProgressTracker from './components/ProgressTracker';
import WorkoutSessionPage from './components/WorkoutSessionPage';
import AddExerciseModal from './components/AddExerciseModal';
import EditPlannedExerciseModal from './components/EditPlannedExerciseModal';
import ExerciseFormModal from './components/ExerciseFormModal';
import ConfirmationModal from './components/ConfirmationModal';
import TemplateFormModal from './components/TemplateFormModal';
import WeeklyPlanFormModal from './components/WeeklyPlanFormModal';
import FeedbackModal from './components/FeedbackModal'; // Import the new modal
import { INITIAL_WORKOUT_TEMPLATES, INITIAL_EXERCISE_LIBRARY, INITIAL_WEEKLY_PLANS, WORKOUT_LEVELS, PLAN_LEVELS, EXERCISE_CATEGORIES, EXERCISE_LEVELS } from './constants';
import type { WorkoutTemplate, CompletionLog, Exercise, PlannedExercise, ID, WeeklyPlan, CompletionLogEntry, Feedback } from './types';

type Tab = 'plan' | 'progress' | 'library' | 'workout';


// A robust CSV/TSV parser that handles quoted fields for commas.
const universalParseLine = (line: string, delimiter: string): string[] => {
    if (delimiter === '\t') {
        return line.split('\t').map(s => s.trim().replace(/^"|"$/g, ''));
    }
    
    // Existing comma-parser for CSV
    const result: string[] = [];
    let current = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i+1];
        
        if (char === '"' && inQuote && nextChar === '"') { // Handle escaped quote ""
            current += '"';
            i++; // Skip next quote
        } else if (char === '"') {
            inQuote = !inQuote;
        } else if (char === delimiter && !inQuote) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result.map(s => s.replace(/^"|"$/g, ''));
};


const parseExercisesCSV = (csvText: string): Exercise[] => {
    const newExercises: Exercise[] = [];
    // 1. Filter out empty lines first to make parsing more predictable.
    const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim() !== '');

    if (lines.length < 2) { // Need at least header + 1 data row
      if (lines.length > 0) {
        alert("קובץ ה-CSV חייב להכיל שורת כותרת ולפחות שורת נתונים אחת.");
      }
      return [];
    }

    let headerLine = lines[0];
    // Remove BOM (Byte Order Mark) if present
    if (headerLine.charCodeAt(0) === 0xFEFF) {
        headerLine = headerLine.substring(1);
    }

    const delimiter = headerLine.includes('\t') ? '\t' : ',';
    const headers = headerLine.split(delimiter).map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const requiredHeaders = ['name', 'equipment', 'description', 'safetynotes', 'category', 'level', 'rest'];
    
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
        alert(`קובץ ה-CSV/TSV אינו תקין. העמודות הבאות חסרות:\n\n- ${missingHeaders.join('\n- ')}\n\nאנא ודא שהקובץ מכיל את כל העמודות הנדרשות.`);
        return [];
    }
    
    // 2. Explicitly slice the array to process only data rows.
    const dataLines = lines.slice(1);

    for (const line of dataLines) {
        const data = universalParseLine(line, delimiter);
        const row: any = {};
        headers.forEach((header, index) => {
            row[header] = data[index] || '';
        });

        // Basic validation to prevent creating empty exercises
        if (!row.name || !row.category || !row.level) continue;

        // Type casting and validation
        const category = EXERCISE_CATEGORIES.includes(row.category as any) ? row.category : EXERCISE_CATEGORIES[0];
        const level = EXERCISE_LEVELS.includes(row.level as any) ? row.level : EXERCISE_LEVELS[0];

        const newExercise: Exercise = {
            id: crypto.randomUUID(),
            name: row.name,
            equipment: row.equipment,
            description: row.description,
            sets: row.sets && !isNaN(parseInt(row.sets, 10)) ? parseInt(row.sets, 10) : undefined,
            reps: row.reps || undefined,
            duration: row.duration && !isNaN(parseInt(row.duration, 10)) ? parseInt(row.duration, 10) : undefined,
            rest: row.rest,
            safetyNotes: row.safetynotes,
            category: category as Exercise['category'],
            level: level as Exercise['level'],
        };
        newExercises.push(newExercise);
    }
    return newExercises;
};


function App() {
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<Tab>('plan');
  
  const [exerciseLibrary, setExerciseLibrary] = useState<Exercise[]>(() => {
    try { const saved = localStorage.getItem('exerciseLibrary'); return saved ? JSON.parse(saved) : INITIAL_EXERCISE_LIBRARY; } catch { return INITIAL_EXERCISE_LIBRARY; }
  });

  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>(() => {
    try { const saved = localStorage.getItem('workoutTemplates'); return saved ? JSON.parse(saved) : INITIAL_WORKOUT_TEMPLATES; } catch { return INITIAL_WORKOUT_TEMPLATES; }
  });
  
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>(() => {
     try { const saved = localStorage.getItem('weeklyPlans'); const plans = saved ? JSON.parse(saved) : INITIAL_WEEKLY_PLANS; return Array.isArray(plans) ? plans : INITIAL_WEEKLY_PLANS } catch { return INITIAL_WEEKLY_PLANS; }
  });

  const [activeWeeklyPlanId, setActiveWeeklyPlanId] = useState<ID>(() => {
    const savedPlans = (() => { try { const saved = localStorage.getItem('weeklyPlans'); const plans = saved ? JSON.parse(saved) : INITIAL_WEEKLY_PLANS; return Array.isArray(plans) ? plans : INITIAL_WEEKLY_PLANS } catch { return INITIAL_WEEKLY_PLANS; } })();
    return savedPlans[0]?.id || '';
  });


  const [completionLog, setCompletionLog] = useState<CompletionLog>(() => {
    try { const saved = localStorage.getItem('workoutCompletionLog'); const log = saved ? JSON.parse(saved) : {}; return typeof log === 'object' && log !== null ? log : {}; } catch { return {}; }
  });

  // Modals state
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [exerciseToAdd, setExerciseToAdd] = useState<Exercise | null>(null);
  const [templateToAddTo, setTemplateToAddTo] = useState<ID | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<{workoutId: ID, exercise: PlannedExercise} | null>(null);
  
  const [isExerciseFormModalOpen, setIsExerciseFormModalOpen] = useState(false);
  const [exerciseToEditInLibrary, setExerciseToEditInLibrary] = useState<Exercise | null>(null);
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<{type: 'exercise' | 'template' | 'plan', id: ID} | null>(null);
  
  const [isTemplateFormModalOpen, setIsTemplateFormModalOpen] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<WorkoutTemplate | null>(null);
  
  const [isWeeklyPlanFormModalOpen, setIsWeeklyPlanFormModalOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<WeeklyPlan | null>(null);

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackLogDate, setFeedbackLogDate] = useState<string | null>(null);


  useEffect(() => { localStorage.setItem('exerciseLibrary', JSON.stringify(exerciseLibrary)); }, [exerciseLibrary]);
  useEffect(() => { localStorage.setItem('workoutTemplates', JSON.stringify(workoutTemplates)); }, [workoutTemplates]);
  useEffect(() => { localStorage.setItem('weeklyPlans', JSON.stringify(weeklyPlans)); }, [weeklyPlans]);
  useEffect(() => { localStorage.setItem('workoutCompletionLog', JSON.stringify(completionLog)); }, [completionLog]);

  // --- Completion Log Handlers ---
  const handleUpdateCompletion = (date: string, logEntry: CompletionLogEntry) => {
    setCompletionLog(prev => ({ ...prev, [date]: logEntry }));
  };

  const handleRemoveCompletion = (date: string) => {
    setCompletionLog(prev => {
        const newLog = { ...prev };
        delete newLog[date];
        return newLog;
    });
  };

  // --- Feedback Handlers ---
  const handleOpenFeedbackModal = (date: string) => {
    setFeedbackLogDate(date);
    setIsFeedbackModalOpen(true);
  };
  
  const handleSaveFeedback = (feedback: Feedback) => {
    if (feedbackLogDate && completionLog[feedbackLogDate]) {
        setCompletionLog(prev => ({
            ...prev,
            [feedbackLogDate]: {
                ...prev[feedbackLogDate],
                feedback: feedback,
            }
        }));
    }
    setIsFeedbackModalOpen(false);
    setFeedbackLogDate(null);
  };
  
  const handleExportHistory = () => {
        const headers = ['date', 'dayOfWeek', 'weeklyPlanName', 'workoutTitle', 'completedExercisesDetails', 'feeling', 'painLevel', 'painLocation', 'difficulty', 'notes'];
        
        const feelingMap = { excellent: 'מצוינת', good: 'טובה', ok: 'בסדר', tired: 'עייפות' };
        const difficultyMap = { easy: 'קל מדי', 'just_right': 'בול', hard: 'קשה מדי' };
        
        const escapeCSV = (field: any): string => {
            if (field === null || field === undefined) return '';
            const str = String(field);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const csvRows = [headers.join(',')];

        Object.entries(completionLog).sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime()).forEach(([date, entry]) => {
            const exercisesDetails = Object.values(entry.completedExercises).map(ex => {
                 const setsRepsString = [
                    ex.sets ? `${ex.sets} סטים` : '',
                    ex.reps ? `x ${ex.reps}` : '',
                    ex.duration ? `${ex.duration} שניות` : '',
                ].filter(Boolean).join(' ');
                return `${ex.name} (${setsRepsString})`;
            }).join('\n');

            const rowData = {
                date: date,
                dayOfWeek: entry.dayOfWeek,
                weeklyPlanName: entry.weeklyPlanName,
                workoutTitle: entry.workoutTemplate.title,
                completedExercisesDetails: exercisesDetails,
                feeling: entry.feedback?.feeling ? feelingMap[entry.feedback.feeling] : '',
                painLevel: entry.feedback?.painLevel ?? '',
                painLocation: entry.feedback?.painLocation ?? '',
                difficulty: entry.feedback?.difficulty ? difficultyMap[entry.feedback.difficulty] : '',
                notes: entry.feedback?.notes ?? ''
            };
            const row = headers.map(header => escapeCSV(rowData[header as keyof typeof rowData]));
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\r\n');
        const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'workout_history.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
  };

  // --- Weekly Plan Schedule Handler ---
  const handleUpdateWeeklyPlanSchedule = (planId: ID, day: string, templateId: ID | null) => {
      setWeeklyPlans(prev => prev.map(plan => 
          plan.id === planId
          ? { ...plan, schedule: { ...plan.schedule, [day]: templateId } }
          : plan
      ));
  };

  // --- Planned Exercise Handlers (within a template) ---
  const handleOpenEditModal = (workoutId: ID, exercise: PlannedExercise) => {
    setExerciseToEdit({ workoutId, exercise });
    setIsEditModalOpen(true);
  };

  const handleUpdatePlannedExercise = (workoutId: ID, updatedExercise: PlannedExercise) => {
    setWorkoutTemplates(prev => prev.map(w => {
        if (w.id === workoutId) {
            return { ...w, exercises: w.exercises.map(e => e.planInstanceId === updatedExercise.planInstanceId ? updatedExercise : e) };
        }
        return w;
    }));
    setIsEditModalOpen(false);
    setExerciseToEdit(null);
  };
  
  const handleRemoveExerciseFromTemplate = (templateId: ID, planInstanceId: string) => {
     setWorkoutTemplates(prev => prev.map(w => {
        if (w.id === templateId) {
            return { ...w, exercises: w.exercises.filter(e => e.planInstanceId !== planInstanceId) };
        }
        return w;
    }));
  };

  const handleAddExerciseToTemplate = (templateId: ID, exercise: Exercise) => {
    const newPlannedExercise: PlannedExercise = {
        ...exercise,
        planInstanceId: crypto.randomUUID(),
    };
    setWorkoutTemplates(prev => prev.map(t => 
        t.id === templateId 
        ? { ...t, exercises: [...t.exercises, newPlannedExercise] }
        : t
    ));
  };


  // --- Exercise Library Handlers ---
  const handleOpenExerciseForm = (exercise: Exercise | null) => {
    setExerciseToEditInLibrary(exercise);
    setIsExerciseFormModalOpen(true);
  };

  const handleSaveExerciseToLibrary = (exercise: Exercise) => {
    if('id' in exercise && exercise.id) { // Edit mode
        setExerciseLibrary(prev => prev.map(e => e.id === exercise.id ? exercise : e));
    } else { // Add mode
        setExerciseLibrary(prev => [...prev, { ...exercise, id: crypto.randomUUID() }]);
    }
    setIsExerciseFormModalOpen(false);
    setExerciseToEditInLibrary(null);
  };

  const handleConfirmDeleteExercise = (exerciseId: ID) => {
    setIdToDelete({type: 'exercise', id: exerciseId});
    setIsConfirmModalOpen(true);
  };

  const handleDeleteExerciseFromLibrary = () => {
    if (!idToDelete || idToDelete.type !== 'exercise') return;
    setExerciseLibrary(prev => prev.filter(e => e.id !== idToDelete.id));
    // Also remove from all templates
    setWorkoutTemplates(prev => prev.map(t => ({
      ...t,
      exercises: t.exercises.filter(ex => ex.id !== idToDelete.id)
    })));
    setIsConfirmModalOpen(false);
    setIdToDelete(null);
  };

  const handleDuplicateExercise = (exercise: Exercise) => {
    const newExercise = { ...exercise, name: `${exercise.name} (עותק)`, id: crypto.randomUUID() };
    setExerciseLibrary(prev => [...prev, newExercise]);
  };

  const handleImportExercises = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
            try {
                const importedExercises = parseExercisesCSV(text);
                if (importedExercises.length > 0) {
                    setExerciseLibrary(prev => [...prev, ...importedExercises]);
                    alert(`${importedExercises.length} תרגילים יובאו בהצלחה!`);
                } else if (text.trim().split(/\r?\n/).length > 1) {
                    // Alert is handled inside parseExercisesCSV for better feedback
                }
            } catch (error) {
                console.error("Error parsing CSV:", error);
                alert("אירעה שגיאה בעיבוד קובץ ה-CSV.");
            }
        }
    };
    reader.onerror = () => {
         alert("אירעה שגיאה בקריאת הקובץ.");
    };
    reader.readAsText(file, 'UTF-8');
  };

   const handleExportExercises = () => {
        const headers = ['id', 'name', 'equipment', 'description', 'sets', 'reps', 'duration', 'rest', 'safetyNotes', 'category', 'level'];
        
        const escapeCSV = (field: any): string => {
            if (field === null || field === undefined) return '';
            const str = String(field);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const csvRows = [headers.join(',')];

        exerciseLibrary.forEach(ex => {
            const row = headers.map(header => escapeCSV(ex[header as keyof Exercise]));
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\r\n');
        const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'exercise_library.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

  // --- Workout Template Handlers ---
   const handleOpenTemplateForm = (template: WorkoutTemplate | null) => {
        setTemplateToEdit(template);
        setIsTemplateFormModalOpen(true);
    };

    const handleSaveTemplate = (data: { title: string; level: typeof WORKOUT_LEVELS[number]; tags: string[] }) => {
        if (templateToEdit) { // Edit
            setWorkoutTemplates(prev => prev.map(t => t.id === templateToEdit.id ? { ...t, ...data } : t));
        } else { // Create
            const newTemplate: WorkoutTemplate = {
                id: crypto.randomUUID(),
                title: data.title,
                level: data.level,
                tags: data.tags,
                type: "אימון מותאם",
                duration: "",
                exercises: []
            };
            setWorkoutTemplates(prev => [...prev, newTemplate]);
        }
        setIsTemplateFormModalOpen(false);
        setTemplateToEdit(null);
    };

    const handleConfirmDeleteTemplate = (templateId: ID) => {
        setIdToDelete({type: 'template', id: templateId});
        setIsConfirmModalOpen(true);
    };
    
    const handleDeleteTemplate = () => {
        if (!idToDelete || idToDelete.type !== 'template') return;
        setWorkoutTemplates(prev => prev.filter(t => t.id !== idToDelete.id));
        // Also remove from any weekly plans
        setWeeklyPlans(prev => prev.map(p => {
          const newSchedule = { ...p.schedule };
          Object.keys(newSchedule).forEach(day => {
            if (newSchedule[day] === idToDelete.id) {
              newSchedule[day] = null;
            }
          });
          return { ...p, schedule: newSchedule };
        }));
        setIsConfirmModalOpen(false);
        setIdToDelete(null);
    };
    
  // --- Weekly Plan Handlers ---
    const handleOpenWeeklyPlanForm = (plan: WeeklyPlan | null) => {
        setPlanToEdit(plan);
        setIsWeeklyPlanFormModalOpen(true);
    };

    const handleSaveWeeklyPlan = (data: { name: string; level: typeof PLAN_LEVELS[number] }) => {
        if (planToEdit) { // Edit mode
            setWeeklyPlans(prev => prev.map(p => p.id === planToEdit.id ? { ...p, ...data } : p));
        } else { // Create mode
            const newPlan: WeeklyPlan = {
                id: crypto.randomUUID(),
                name: data.name,
                level: data.level,
                schedule: {}, // Empty schedule
            };
            setWeeklyPlans(prev => [...prev, newPlan]);
        }
        setIsWeeklyPlanFormModalOpen(false);
        setPlanToEdit(null);
    };

    const handleConfirmDeleteWeeklyPlan = (planId: ID) => {
        setIdToDelete({type: 'plan', id: planId});
        setIsConfirmModalOpen(true);
    };

    const handleDeleteWeeklyPlan = () => {
        if (!idToDelete || idToDelete.type !== 'plan') return;
        
        const remainingPlans = weeklyPlans.filter(p => p.id !== idToDelete.id);
        setWeeklyPlans(remainingPlans);

        if (activeWeeklyPlanId === idToDelete.id) {
            setActiveWeeklyPlanId(remainingPlans[0]?.id || '');
        }
        setIsConfirmModalOpen(false);
        setIdToDelete(null);
    };

  const renderContent = () => {
    switch (activeTab) {
      case 'plan':
        return <WorkoutPlanner 
            weeklyPlans={weeklyPlans}
            workoutTemplates={workoutTemplates}
            activeWeeklyPlanId={activeWeeklyPlanId}
            onSetActiveWeeklyPlanId={setActiveWeeklyPlanId}
            completionLog={completionLog}
            onUpdateCompletion={handleUpdateCompletion}
            onRemoveCompletion={handleRemoveCompletion}
            onEditExercise={handleOpenEditModal}
            onRemoveExercise={handleRemoveExerciseFromTemplate}
            onUpdateSchedule={handleUpdateWeeklyPlanSchedule}
        />;
      case 'progress':
        return <ProgressTracker 
            completionLog={completionLog}
            onRemoveCompletion={handleRemoveCompletion}
            onOpenFeedbackModal={handleOpenFeedbackModal}
            onExportHistory={handleExportHistory}
        />;
      case 'library':
        return <ExerciseLibrary 
            exerciseLibrary={exerciseLibrary}
            workoutTemplates={workoutTemplates}
            weeklyPlans={weeklyPlans}
            onAddExerciseToPlan={() => {}} // Deprecated - remove?
            onAddNewExercise={() => handleOpenExerciseForm(null)}
            onEditExercise={(ex) => handleOpenExerciseForm(ex)}
            onDeleteExercise={handleConfirmDeleteExercise}
            onDuplicateExercise={handleDuplicateExercise}
            onImportExercises={handleImportExercises}
            onExportExercises={handleExportExercises}
            // Template handlers
            onAddExerciseToTemplate={handleAddExerciseToTemplate}
            onRemoveExerciseFromTemplate={handleRemoveExerciseFromTemplate}
            onCreateTemplate={() => handleOpenTemplateForm(null)}
            onEditTemplate={handleOpenTemplateForm}
            onDeleteTemplate={handleConfirmDeleteTemplate}
             // Plan handlers
            onCreateWeeklyPlan={() => handleOpenWeeklyPlanForm(null)}
            onEditWeeklyPlan={handleOpenWeeklyPlanForm}
            onDeleteWeeklyPlan={handleConfirmDeleteWeeklyPlan}
            onUpdateWeeklyPlanSchedule={handleUpdateWeeklyPlanSchedule}
        />;
      case 'workout':
        return <WorkoutSessionPage 
            weeklyPlans={weeklyPlans}
            workoutTemplates={workoutTemplates}
            activeWeeklyPlanId={activeWeeklyPlanId}
        />;
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
      
      {isAddExerciseModalOpen && exerciseToAdd && (
        <AddExerciseModal
            exercise={exerciseToAdd}
            workoutTemplates={workoutTemplates}
            onClose={() => setIsAddExerciseModalOpen(false)}
            onConfirm={(workoutId) => {
              handleAddExerciseToTemplate(workoutId, exerciseToAdd);
              setIsAddExerciseModalOpen(false);
            }}
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
            onClose={() => { setIsExerciseFormModalOpen(false); setExerciseToEditInLibrary(null); }}
            onSave={handleSaveExerciseToLibrary}
            initialData={exerciseToEditInLibrary}
        />
      )}
      
       {isTemplateFormModalOpen && (
        <TemplateFormModal
            isOpen={isTemplateFormModalOpen}
            onClose={() => { setIsTemplateFormModalOpen(false); setTemplateToEdit(null); }}
            onSave={handleSaveTemplate}
            initialData={templateToEdit}
        />
       )}
       
       {isWeeklyPlanFormModalOpen && (
        <WeeklyPlanFormModal
            isOpen={isWeeklyPlanFormModalOpen}
            onClose={() => { setIsWeeklyPlanFormModalOpen(false); setPlanToEdit(null); }}
            onSave={handleSaveWeeklyPlan}
            initialData={planToEdit}
        />
       )}

      {isConfirmModalOpen && idToDelete && (
        <ConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            onConfirm={
                idToDelete.type === 'exercise' ? handleDeleteExerciseFromLibrary : 
                idToDelete.type === 'template' ? handleDeleteTemplate :
                handleDeleteWeeklyPlan
            }
            title={
                idToDelete.type === 'exercise' ? "אישור מחיקת תרגיל" : 
                idToDelete.type === 'template' ? "אישור מחיקת תבנית" :
                "אישור מחיקת תוכנית שבועית"
            }
            message={
                idToDelete.type === 'exercise' 
                ? "האם אתה בטוח שברצונך למחוק תרגיל זה מהספרייה? הוא יוסר גם מכל תבניות האימון." 
                : idToDelete.type === 'template'
                ? "האם אתה בטוח שברצונך למחוק תבנית זו? היא תוסר מכל שבועות האימונים."
                : "האם אתה בטוח שברצונך למחוק תוכנית שבועית זו? לא ניתן יהיה לבחור אותה יותר בדף הראשי."
            }
        />
      )}
      
      {isFeedbackModalOpen && feedbackLogDate && (
        <FeedbackModal
            isOpen={isFeedbackModalOpen}
            onClose={() => setIsFeedbackModalOpen(false)}
            onSave={handleSaveFeedback}
            initialData={completionLog[feedbackLogDate]?.feedback}
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
                    <TabButton tabName="library" label="ספרייה ועריכה" />
                    <TabButton tabName="workout" label="אימון" />
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