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
import FeedbackModal from './components/FeedbackModal';
import Login from './components/Login';
import { EditCompletionLogModal, InWorkoutEditModal, InfoModal, OnboardingGuide } from './components/AllModals';
import { SunIcon, MoonIcon, DumbbellIcon } from './components/icons';
import { INITIAL_WORKOUT_TEMPLATES, INITIAL_EXERCISE_LIBRARY, INITIAL_WEEKLY_PLANS, WORKOUT_LEVELS, PLAN_LEVELS, EXERCISE_CATEGORIES, EXERCISE_LEVELS, DAYS_OF_WEEK } from './constants';
import type { WorkoutTemplate, CompletionLog, Exercise, PlannedExercise, ID, WeeklyPlan, CompletionLogEntry, Feedback } from './types';

type Tab = 'plan' | 'progress' | 'library' | 'workout';
type InfoModalState = {
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
};

const ACCESS_KEY = 'liorbar23';

const universalParseLine = (line: string, delimiter: string): string[] => {
    if (delimiter === '\t') {
        return line.split('\t').map(s => s.trim().replace(/^"|"$/g, ''));
    }
    
    const result: string[] = [];
    let current = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i+1];
        
        if (char === '"' && inQuote && nextChar === '"') { 
            current += '"';
            i++; 
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

const parseExercisesCSV = (csvText: string): { exercises: Exercise[] | null, error: string | null } => {
    const newExercises: Exercise[] = [];
    const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim() !== '');

    if (lines.length < 2) { 
      return { exercises: null, error: "קובץ ה-CSV חייב להכיל שורת כותרת ולפחות שורת נתונים אחת." };
    }

    let headerLine = lines[0];
    if (headerLine.charCodeAt(0) === 0xFEFF) {
        headerLine = headerLine.substring(1);
    }

    const delimiter = headerLine.includes('\t') ? '\t' : ',';
    const headers = headerLine.split(delimiter).map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const requiredHeaders = ['name', 'equipment', 'description', 'safetynotes', 'category', 'level', 'rest'];
    
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
        return { exercises: null, error: `קובץ ה-CSV/TSV אינו תקין. העמודות הבאות חסרות:\n\n- ${missingHeaders.join('\n- ')}\n\nאנא ודא שהקובץ מכיל את כל העמודות הנדרשות.`};
    }
    
    const dataLines = lines.slice(1);

    for (const line of dataLines) {
        const data = universalParseLine(line, delimiter);
        const row: any = {};
        headers.forEach((header, index) => {
            row[header] = data[index] || '';
        });

        if (!row.name || !row.category || !row.level) continue;

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
            muscleGroups: row.musclegroups ? row.musclegroups.split(',').map((s: string) => s.trim()) : [],
        };
        newExercises.push(newExercise);
    }
    return { exercises: newExercises, error: null };
};

const onboardingSteps = [
    { title: 'ברוכים הבאים!', content: 'זהו סיור מהיר שיכיר לכם את האפליקציה. בכל שלב, נסביר על חלק אחר ונעביר אתכם אליו.' },
    { title: 'תוכנית אימונים', content: 'זהו דף הבית שלכם. כאן תראו את תוכנית האימונים השבועית שלכם ותוכלו להתחיל אימון.', targetId: 'onboarding-target-plan', tab: 'plan' },
    { title: 'ספרייה ועריכה', content: 'כאן נמצא כל המידע שלכם: תרגילים, תבניות אימון, תוכניות שבועיות ואשף ליצירת תוכניות אוטומטיות.', targetId: 'onboarding-target-library', tab: 'library' },
    { title: 'מעקב התקדמות', content: 'כל אימון שתשלימו יתועד כאן. תוכלו לראות ניתוח של הביצועים שלכם, להוסיף משוב ולייצא את ההיסטוריה.', targetId: 'onboarding-target-progress', tab: 'progress' },
    { title: 'מוכנים להתחיל!', content: 'זהו! אתם מוכנים להתחיל להתאמן. זכרו, עקביות היא המפתח. בהצלחה!' }
];


function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
        return localStorage.getItem('theme') as 'light' | 'dark';
    }
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
  });
  
  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };
  
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [onboardingCompleted, setOnboardingCompleted] = useState(() => localStorage.getItem('onboardingCompleted') === 'true');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [showWelcomeModal, setShowWelcomeModal] = useState(() => localStorage.getItem('welcomeModalSeen') !== 'true');
  
  const [activeTab, setActiveTab] = useState<Tab>('plan');
  
  const [exerciseLibrary, setExerciseLibrary] = useState<Exercise[]>(() => {
    try { 
        const saved = localStorage.getItem('exerciseLibrary'); 
        const parsed = saved ? JSON.parse(saved) : INITIAL_EXERCISE_LIBRARY;
        return Array.isArray(parsed) ? parsed : INITIAL_EXERCISE_LIBRARY;
    } catch { return INITIAL_EXERCISE_LIBRARY; }
  });

  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>(() => {
    try { 
        const saved = localStorage.getItem('workoutTemplates');
        const parsed = saved ? JSON.parse(saved) : INITIAL_WORKOUT_TEMPLATES;
        return Array.isArray(parsed) ? parsed : INITIAL_WORKOUT_TEMPLATES;
    } catch { return INITIAL_WORKOUT_TEMPLATES; }
  });
  
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>(() => {
     try { 
        const saved = localStorage.getItem('weeklyPlans');
        const plans = saved ? JSON.parse(saved) : INITIAL_WEEKLY_PLANS; 
        return Array.isArray(plans) ? plans : INITIAL_WEEKLY_PLANS 
    } catch { return INITIAL_WEEKLY_PLANS; }
  });

  const [activeWeeklyPlanId, setActiveWeeklyPlanId] = useState<ID>(() => {
    const savedPlans = (() => { try { const saved = localStorage.getItem('weeklyPlans'); const plans = saved ? JSON.parse(saved) : INITIAL_WEEKLY_PLANS; return Array.isArray(plans) ? plans : INITIAL_WEEKLY_PLANS } catch { return INITIAL_WEEKLY_PLANS; } })();
    return savedPlans[0]?.id || '';
  });

  const [completionLog, setCompletionLog] = useState<CompletionLog>(() => {
    try { 
        const saved = localStorage.getItem('workoutCompletionLog'); 
        const log = saved ? JSON.parse(saved) : {}; 
        return typeof log === 'object' && log !== null && !Array.isArray(log) ? log : {};
    } catch { return {}; }
  });
  
  // FIX: Create a state for categories to allow dynamic updates.
  const [allCategories, setAllCategories] = useState<readonly string[]>(() => {
    try { 
        const saved = localStorage.getItem('allCategories'); 
        const parsed = saved ? JSON.parse(saved) : EXERCISE_CATEGORIES;
        return Array.isArray(parsed) ? parsed : EXERCISE_CATEGORIES;
    } catch { return EXERCISE_CATEGORIES; }
  });

  // Modals state
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [exerciseToAdd, setExerciseToAdd] = useState<Exercise | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<{workoutId: ID, exercise: PlannedExercise} | null>(null);
  const [isExerciseFormModalOpen, setIsExerciseFormModalOpen] = useState(false);
  const [exerciseToEditInLibrary, setExerciseToEditInLibrary] = useState<Exercise | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  // FIX: Update the state type to accommodate the new category confirmation flow.
  const [itemToDelete, setItemToDelete] = useState<{type: 'exercise' | 'template' | 'plan' | 'bulk-exercise' | 'new-category' | 'all-data-import', id?: ID, ids?: ID[], data?: any} | null>(null);
  const [isTemplateFormModalOpen, setIsTemplateFormModalOpen] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<WorkoutTemplate | null>(null);
  const [isWeeklyPlanFormModalOpen, setIsWeeklyPlanFormModalOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<WeeklyPlan | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackLogDate, setFeedbackLogDate] = useState<string | null>(null);
  const [isEditLogModalOpen, setIsEditLogModalOpen] = useState(false);
  const [logEntryToEdit, setLogEntryToEdit] = useState<{ date: string, entry: CompletionLogEntry } | null>(null);
  const [isInWorkoutEditModalOpen, setIsInWorkoutEditModalOpen] = useState(false);
  const [inWorkoutEditData, setInWorkoutEditData] = useState<{ exercise: PlannedExercise; onSave: (updatedExercise: PlannedExercise) => void; } | null>(null);
  const [infoModalState, setInfoModalState] = useState<InfoModalState>({ isOpen: false, title: '', message: '', type: 'success' });


  useEffect(() => {
    const storedAuth = sessionStorage.getItem('isAuthenticated');
    if (storedAuth === 'true') {
        setIsAuthenticated(true);
        if (!onboardingCompleted) {
            setShowOnboarding(true);
            setOnboardingStep(1);
        }
    }
  }, [onboardingCompleted]);

  useEffect(() => { localStorage.setItem('exerciseLibrary', JSON.stringify(exerciseLibrary)); }, [exerciseLibrary]);
  useEffect(() => { localStorage.setItem('workoutTemplates', JSON.stringify(workoutTemplates)); }, [workoutTemplates]);
  useEffect(() => { localStorage.setItem('weeklyPlans', JSON.stringify(weeklyPlans)); }, [weeklyPlans]);
  useEffect(() => { localStorage.setItem('workoutCompletionLog', JSON.stringify(completionLog)); }, [completionLog]);
  // FIX: Add a useEffect to persist the updated categories list to localStorage.
  useEffect(() => { localStorage.setItem('allCategories', JSON.stringify(allCategories)); }, [allCategories]);

  const handleLogin = (key: string): boolean => {
    if (key === ACCESS_KEY) {
        sessionStorage.setItem('isAuthenticated', 'true');
        setIsAuthenticated(true);
        if (!onboardingCompleted) {
            setShowOnboarding(true);
            setOnboardingStep(1);
        }
        return true;
    }
    return false;
  };
  
  const handleWelcomeClose = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('welcomeModalSeen', 'true');
    setActiveTab('plan');
  }

  const handleOnboardingFinish = () => {
    setShowOnboarding(false);
    setOnboardingCompleted(true);
    localStorage.setItem('onboardingCompleted', 'true');
    setShowWelcomeModal(true);
  };

  const handleOnboardingNext = () => {
    const nextStepIndex = onboardingStep; 
    if (nextStepIndex >= onboardingSteps.length) {
        handleOnboardingFinish();
        return;
    }
    const nextStepData = onboardingSteps[nextStepIndex];
    if (nextStepData.tab) {
        setActiveTab(nextStepData.tab as Tab);
    }
    setOnboardingStep(prev => prev + 1);
  };

  const handleOpenAddExerciseModal = (exercise: Exercise) => {
    setExerciseToAdd(exercise);
    setIsAddExerciseModalOpen(true);
  };

  const handleUpdateCompletion = (date: string, logEntry: CompletionLogEntry) => {
    setCompletionLog(prev => ({ ...prev, [date]: logEntry }));
  };
  
  const handleUpdateCompletionLogEntry = (date: string, updatedEntry: CompletionLogEntry) => {
    handleUpdateCompletion(date, updatedEntry);
    setIsEditLogModalOpen(false);
    setLogEntryToEdit(null);
  };

  const handleRemoveCompletion = (date: string) => {
    setCompletionLog(prev => {
        const newLog = { ...prev };
        delete newLog[date];
        return newLog;
    });
  };

  const handleMarkDayComplete = (date: string, workout: WorkoutTemplate) => {
    const activePlan = weeklyPlans.find(p => p.id === activeWeeklyPlanId);
    if (!activePlan) return;

    const dayIndex = new Date(date).getUTCDay();
    const dayOfWeek = DAYS_OF_WEEK[dayIndex];

    const completedExercisesMap: { [planInstanceId: string]: PlannedExercise } = {};
    workout.exercises.forEach(ex => {
        completedExercisesMap[ex.planInstanceId] = ex;
    });

    const newLogEntry: CompletionLogEntry = {
        weeklyPlanName: activePlan.name,
        dayOfWeek: dayOfWeek,
        workoutTemplate: workout,
        completedExercises: completedExercisesMap,
    };

    handleUpdateCompletion(date, newLogEntry);
    handleOpenFeedbackModal(date);
  };
  
  const handleOpenInWorkoutEditModal = (exercise: PlannedExercise, onSave: (updatedExercise: PlannedExercise) => void) => {
    setInWorkoutEditData({ exercise, onSave });
    setIsInWorkoutEditModalOpen(true);
  };

  const handleOpenFeedbackModal = (date: string) => {
    setFeedbackLogDate(date);
    setIsFeedbackModalOpen(true);
  };
  
  const handleOpenEditLogModal = (date: string) => {
    const entry = completionLog[date];
    if (entry) {
        setLogEntryToEdit({ date, entry });
        setIsEditLogModalOpen(true);
    }
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
    const headers = ['date', 'dayOfWeek', 'weeklyPlanName', 'workoutTitle', 'workoutAnalysis', 'feeling', 'painLevel', 'painLocation', 'difficulty', 'notes'];
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
        let analysis = '';
        const modifiedParts: string[] = [];
        const skippedParts: string[] = [];
        
        const originalTemplate = workoutTemplates.find(t => t.id === entry.workoutTemplate.id);
        
        if (originalTemplate) {
            originalTemplate.exercises.forEach(originalEx => {
                const performedEx = entry.completedExercises[originalEx.planInstanceId];
                if (!performedEx) {
                    skippedParts.push(originalEx.name);
                } else {
                    const originalDetails = `${originalEx.sets || 1}x${originalEx.reps || originalEx.duration || ''}`;
                    const performedDetails = `${performedEx.sets || 1}x${performedEx.reps || performedEx.duration || ''}`;
                    
                    if (originalEx.sets !== performedEx.sets || originalEx.reps !== performedEx.reps || originalEx.duration !== performedEx.duration) {
                        const plannedStr = [ originalEx.sets ? `${originalEx.sets} סטים` : '', originalEx.reps ? `x ${originalEx.reps}` : '', originalEx.duration ? `${originalEx.duration} שניות` : '' ].filter(Boolean).join(' ');
                        const performedStr = [ performedEx.sets ? `${performedEx.sets} סטים` : '', performedEx.reps ? `x ${performedEx.reps}` : '', performedEx.duration ? `${performedEx.duration} שניות` : '' ].filter(Boolean).join(' ');
                        modifiedParts.push(`${originalEx.name} (תוכנן: ${plannedStr}, בוצע: ${performedStr})`);
                    }
                }
            });
        }

        if (modifiedParts.length === 0 && skippedParts.length === 0) {
            analysis = "המתאמן ביצע את כל התרגילים לפי התוכנית המקורית.";
        } else {
            const analysisSections = [];
            if (modifiedParts.length > 0) {
                analysisSections.push(`שינויים: ${modifiedParts.join('; ')}.`);
            }
            if (skippedParts.length > 0) {
                analysisSections.push(`תרגילים שדולגו: ${skippedParts.join(', ')}.`);
            }
            analysis = analysisSections.join(' ');
        }
        
        const rowData = {
            date: date,
            dayOfWeek: entry.dayOfWeek,
            weeklyPlanName: entry.weeklyPlanName,
            workoutTitle: entry.workoutTemplate.title,
            workoutAnalysis: analysis,
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
    link.setAttribute('download', 'workout_history_analysis.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setInfoModalState({ isOpen: true, title: 'היסטוריה יוצאה', message: 'קובץ ה-CSV עם ניתוח היסטוריית האימונים שלך נוצר בהצלחה.', type: 'success' });
  };

  const handleUpdateWeeklyPlanSchedule = (planId: ID, day: string, templateId: ID | null) => {
      setWeeklyPlans(prev => prev.map(plan => 
          plan.id === planId
          ? { ...plan, schedule: { ...plan.schedule, [day]: templateId } }
          : plan
      ));
  };

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

  const handleAddExercisesToTemplate = (templateId: ID, exercises: Exercise[]) => {
      const newPlannedExercises: PlannedExercise[] = exercises.map(ex => ({
          ...ex,
          planInstanceId: crypto.randomUUID(),
      }));
      setWorkoutTemplates(prev => prev.map(t =>
          t.id === templateId
          ? { ...t, exercises: [...t.exercises, ...newPlannedExercises] }
          : t
      ));
  };

  const handleReorderExerciseInTemplate = (templateId: ID, planInstanceId: ID, direction: 'up' | 'down') => {
    setWorkoutTemplates(prev => prev.map(template => {
      if (template.id === templateId) {
        const exercises = [...template.exercises];
        const index = exercises.findIndex(ex => ex.planInstanceId === planInstanceId);
  
        if (index === -1) return template;
  
        if (direction === 'up' && index > 0) {
          [exercises[index], exercises[index - 1]] = [exercises[index - 1], exercises[index]];
        } else if (direction === 'down' && index < exercises.length - 1) {
          [exercises[index], exercises[index + 1]] = [exercises[index + 1], exercises[index]];
        }
  
        return { ...template, exercises };
      }
      return template;
    }));
  };

  const handleOpenExerciseForm = (exercise: Exercise | null) => {
    setExerciseToEditInLibrary(exercise);
    setIsExerciseFormModalOpen(true);
  };

  const handleSaveExerciseToLibrary = (exercise: Exercise) => {
    const isNewCategory = !allCategories.includes(exercise.category);

    const performSave = () => {
        if (isNewCategory) {
            setAllCategories(prev => [...new Set([...prev, exercise.category])].sort((a,b) => a.localeCompare(b, 'he')));
        }

        if('id' in exercise && exercise.id) {
            setExerciseLibrary(prev => prev.map(e => e.id === exercise.id ? exercise : e));
        } else { 
            setExerciseLibrary(prev => [...prev, { ...exercise, id: crypto.randomUUID() }]);
        }
        setIsExerciseFormModalOpen(false);
        setExerciseToEditInLibrary(null);
    };

    if (isNewCategory) {
        setItemToDelete({ type: 'new-category', data: { onConfirm: performSave, categoryName: exercise.category } });
        setIsConfirmModalOpen(true);
    } else {
        performSave();
    }
  };


  const handleConfirmDeleteExercise = (exerciseId: ID) => {
    setItemToDelete({type: 'exercise', id: exerciseId});
    setIsConfirmModalOpen(true);
  };

  const handleDeleteExerciseFromLibrary = () => {
    if (!itemToDelete || itemToDelete.type !== 'exercise' || !itemToDelete.id) return;
    setExerciseLibrary(prev => prev.filter(e => e.id !== itemToDelete.id));
    setWorkoutTemplates(prev => prev.map(t => ({
      ...t,
      exercises: t.exercises.filter(ex => ex.id !== itemToDelete.id)
    })));
    setIsConfirmModalOpen(false);
    setItemToDelete(null);
  };
  
  const handleConfirmBulkDeleteExercises = (exerciseIds: ID[]) => {
    setItemToDelete({type: 'bulk-exercise', ids: exerciseIds});
    setIsConfirmModalOpen(true);
  };
  
  const handleBulkDeleteExercises = () => {
    if (!itemToDelete || itemToDelete.type !== 'bulk-exercise' || !itemToDelete.ids) return;
    const idsToDelete = new Set(itemToDelete.ids);
    
    setExerciseLibrary(prev => prev.filter(e => !idsToDelete.has(e.id)));
    setWorkoutTemplates(prev => prev.map(t => ({
      ...t,
      exercises: t.exercises.filter(ex => !idsToDelete.has(ex.id))
    })));
    
    setIsConfirmModalOpen(false);
    setItemToDelete(null);
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
                const { exercises, error } = parseExercisesCSV(text);
                if (error) {
                    setInfoModalState({ isOpen: true, title: 'שגיאה בייבוא', message: error, type: 'error' });
                    return;
                }
                if (exercises && exercises.length > 0) {
                    setExerciseLibrary(prev => [...prev, ...exercises]);
                    setInfoModalState({ isOpen: true, title: 'ייבוא הושלם בהצלחה', message: `${exercises.length} תרגילים יובאו לספרייה שלך.`, type: 'success' });
                }
            } catch (error) {
                console.error("Error parsing CSV:", error);
                setInfoModalState({ isOpen: true, title: 'שגיאה בייבוא', message: 'אירעה שגיאה בלתי צפויה בעיבוד קובץ ה-CSV.', type: 'error' });
            }
        }
    };
    reader.onerror = () => {
         setInfoModalState({ isOpen: true, title: 'שגיאה בקריאת קובץ', message: 'אירעה שגיאה בקריאת הקובץ.', type: 'error' });
    };
    reader.readAsText(file, 'UTF-8');
  };

   const handleExportExercises = () => {
        const headers = ['id', 'name', 'equipment', 'description', 'sets', 'reps', 'duration', 'rest', 'safetyNotes', 'category', 'level', 'muscleGroups'];
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
            const rowData = { ...ex, muscleGroups: ex.muscleGroups.join(', ') };
            const row = headers.map(header => escapeCSV(rowData[header as keyof typeof rowData]));
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
        setInfoModalState({ isOpen: true, title: 'ספרייה יוצאה', message: 'ספריית התרגילים שלך יוצאה בהצלחה לקובץ CSV.', type: 'success' });
    };
    
   const handleExportAllData = () => {
        const allData = {
            exerciseLibrary,
            workoutTemplates,
            weeklyPlans,
            allCategories,
            // We don't export completionLog as it's device-specific history
        };
        const jsonString = JSON.stringify(allData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'workout_data.json');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setInfoModalState({ isOpen: true, title: 'הנתונים יוצאו', message: 'כל נתוני האפליקציה שלך יוצאו בהצלחה. שמור את הקובץ כדי לגבות או להעביר למכשיר אחר.', type: 'success' });
   };
   
   const handleImportAllData = (file: File) => {
     const reader = new FileReader();
     reader.onload = (e) => {
         const text = e.target?.result;
         if (typeof text === 'string') {
             try {
                 const data = JSON.parse(text);
                 
                 // Basic validation
                 if (Array.isArray(data.exerciseLibrary) && Array.isArray(data.workoutTemplates) && Array.isArray(data.weeklyPlans) && Array.isArray(data.allCategories)) {
                    setItemToDelete({ type: 'all-data-import', data: data });
                    setIsConfirmModalOpen(true);
                 } else {
                     throw new Error("Invalid file structure.");
                 }
             } catch (error) {
                 console.error("Error parsing all data JSON:", error);
                 setInfoModalState({ isOpen: true, title: 'שגיאה בייבוא', message: 'קובץ ה-JSON אינו תקין או בעל מבנה שגוי.', type: 'error' });
             }
         }
     };
     reader.onerror = () => {
         setInfoModalState({ isOpen: true, title: 'שגיאה בקריאת קובץ', message: 'אירעה שגיאה בקריאת הקובץ.', type: 'error' });
     };
     reader.readAsText(file);
   };
   
   const performAllDataImport = (data: any) => {
        setExerciseLibrary(data.exerciseLibrary);
        setWorkoutTemplates(data.workoutTemplates);
        setWeeklyPlans(data.weeklyPlans);
        setAllCategories(data.allCategories);
        // Reset active plan if the old one doesn't exist anymore
        if (!data.weeklyPlans.some((p: WeeklyPlan) => p.id === activeWeeklyPlanId)) {
            setActiveWeeklyPlanId(data.weeklyPlans[0]?.id || '');
        }
        setInfoModalState({ isOpen: true, title: 'הייבוא הושלם!', message: 'כל הנתונים שלך יובאו ונטענו בהצלחה.', type: 'success' });
   }

   const handleOpenTemplateForm = (template: WorkoutTemplate | null) => {
        setTemplateToEdit(template);
        setIsTemplateFormModalOpen(true);
    };

    const handleSaveTemplate = (data: { title: string; level: typeof WORKOUT_LEVELS[number]; tags: string[] }) => {
        if (templateToEdit) { 
            setWorkoutTemplates(prev => prev.map(t => t.id === templateToEdit.id ? { ...t, ...data } : t));
        } else {
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
        setItemToDelete({type: 'template', id: templateId});
        setIsConfirmModalOpen(true);
    };
    
    const handleDeleteTemplate = () => {
        if (!itemToDelete || itemToDelete.type !== 'template' || !itemToDelete.id) return;
        setWorkoutTemplates(prev => prev.filter(t => t.id !== itemToDelete.id));
        setWeeklyPlans(prev => prev.map(p => {
          const newSchedule = { ...p.schedule };
          Object.keys(newSchedule).forEach(day => {
            if (newSchedule[day] === itemToDelete.id) {
              newSchedule[day] = null;
            }
          });
          return { ...p, schedule: newSchedule };
        }));
        setIsConfirmModalOpen(false);
        setItemToDelete(null);
    };
    
    const handleOpenWeeklyPlanForm = (plan: WeeklyPlan | null) => {
        setPlanToEdit(plan);
        setIsWeeklyPlanFormModalOpen(true);
    };

    const handleSaveWeeklyPlan = (data: { name: string; level: typeof PLAN_LEVELS[number] }) => {
        if (planToEdit) {
            setWeeklyPlans(prev => prev.map(p => p.id === planToEdit.id ? { ...p, ...data } : p));
        } else { 
            const newPlan: WeeklyPlan = {
                id: crypto.randomUUID(),
                name: data.name,
                level: data.level,
                schedule: {},
            };
            setWeeklyPlans(prev => [...prev, newPlan]);
        }
        setIsWeeklyPlanFormModalOpen(false);
        setPlanToEdit(null);
    };

    const handleConfirmDeleteWeeklyPlan = (planId: ID) => {
        setItemToDelete({type: 'plan', id: planId});
        setIsConfirmModalOpen(true);
    };

    const handleDeleteWeeklyPlan = () => {
        if (!itemToDelete || itemToDelete.type !== 'plan' || !itemToDelete.id) return;
        const remainingPlans = weeklyPlans.filter(p => p.id !== itemToDelete.id);
        setWeeklyPlans(remainingPlans);
        if (activeWeeklyPlanId === itemToDelete.id) {
            setActiveWeeklyPlanId(remainingPlans[0]?.id || '');
        }
        setIsConfirmModalOpen(false);
        setItemToDelete(null);
    };

    const handleSaveGeneratedPlan = (data: { newTemplates: WorkoutTemplate[], newPlan: WeeklyPlan }) => {
        setWorkoutTemplates(prev => [...prev, ...data.newTemplates]);
        setWeeklyPlans(prev => [...prev, data.newPlan]);
        setInfoModalState({ isOpen: true, title: 'התוכנית נשמרה!', message: 'התוכנית והתבניות החדשות נשמרו בהצלחה בספרייה שלך.', type: 'success' });
        setActiveWeeklyPlanId(data.newPlan.id);
        setActiveTab('plan');
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
            onMarkDayComplete={handleMarkDayComplete}
            onOpenFeedbackModal={handleOpenFeedbackModal}
            onOpenEditLogModal={handleOpenEditLogModal}
            setActiveTab={setActiveTab}
        />;
      case 'progress':
        return <ProgressTracker 
            completionLog={completionLog}
            workoutTemplates={workoutTemplates}
            onRemoveCompletion={handleRemoveCompletion}
            onOpenFeedbackModal={handleOpenFeedbackModal}
            onOpenEditLogModal={handleOpenEditLogModal}
            onExportHistory={handleExportHistory}
        />;
      case 'library':
        return <ExerciseLibrary 
            exerciseLibrary={exerciseLibrary}
            workoutTemplates={workoutTemplates}
            weeklyPlans={weeklyPlans}
            // FIX: Pass the dynamic categories list to the library component.
            allCategories={allCategories}
            onAddExerciseToPlan={handleOpenAddExerciseModal}
            onAddExercisesToTemplate={handleAddExercisesToTemplate}
            onAddNewExercise={() => handleOpenExerciseForm(null)}
            onEditExercise={(ex) => handleOpenExerciseForm(ex)}
            onDeleteExercise={handleConfirmDeleteExercise}
            onDuplicateExercise={handleDuplicateExercise}
            onImportExercises={handleImportExercises}
            onExportExercises={handleExportExercises}
            onImportAllData={handleImportAllData}
            onExportAllData={handleExportAllData}
            onRemoveExerciseFromTemplate={handleRemoveExerciseFromTemplate}
            onEditPlannedExercise={handleOpenEditModal}
            onReorderExerciseInTemplate={handleReorderExerciseInTemplate}
            onCreateTemplate={() => handleOpenTemplateForm(null)}
            onEditTemplate={handleOpenTemplateForm}
            onDeleteTemplate={handleConfirmDeleteTemplate}
            onCreateWeeklyPlan={() => handleOpenWeeklyPlanForm(null)}
            onEditWeeklyPlan={handleOpenWeeklyPlanForm}
            onDeleteWeeklyPlan={handleConfirmDeleteWeeklyPlan}
            onUpdateWeeklyPlanSchedule={handleUpdateWeeklyPlanSchedule}
            onSaveGeneratedPlan={handleSaveGeneratedPlan}
            onConfirmBulkDelete={handleConfirmBulkDeleteExercises}
        />;
      case 'workout':
        return <WorkoutSessionPage 
            weeklyPlans={weeklyPlans}
            workoutTemplates={workoutTemplates}
            activeWeeklyPlanId={activeWeeklyPlanId}
            onUpdateCompletion={handleUpdateCompletion}
            onOpenFeedbackModal={handleOpenFeedbackModal}
            onOpenInWorkoutEditModal={handleOpenInWorkoutEditModal}
        />;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{tabName: Tab, label: string, id?: string}> = ({tabName, label, id}) => (
    <button
        id={id}
        onClick={() => setActiveTab(tabName)}
        className={`font-rubik px-3 py-2 md:px-5 md:py-3 text-xl md:text-2xl font-bold rounded-lg transition-all duration-300 ${
            activeTab === tabName
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-slate-600 dark:text-gray-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/70'
        }`}
    >
        {label}
    </button>
  );

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-gray-200">
      {showOnboarding && (
        <OnboardingGuide
            steps={onboardingSteps}
            step={onboardingStep}
            onNext={handleOnboardingNext}
            onFinish={handleOnboardingFinish}
        />
      )}
      
      { !showOnboarding && showWelcomeModal && <WelcomeModal onClose={handleWelcomeClose} />}
      

      {isAddExerciseModalOpen && exerciseToAdd && (
        <AddExerciseModal
            exercise={exerciseToAdd}
            workoutTemplates={workoutTemplates}
            onClose={() => setIsAddExerciseModalOpen(false)}
            onConfirm={(workoutId) => {
              if (exerciseToAdd) {
                handleAddExercisesToTemplate(workoutId, [exerciseToAdd]);
              }
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
            // FIX: Pass the dynamic categories list to the form modal.
            allCategories={allCategories}
        />
      )}
      
       {isTemplateFormModalOpen && (
        <TemplateFormModal
            isOpen={isTemplateFormModalOpen}
            onClose={() => { setIsTemplateFormModalOpen(false); setTemplateToEdit(null); }}
            onSave={handleSaveTemplate}
            initialData={templateToEdit}
            allCategories={allCategories}
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

      {isConfirmModalOpen && itemToDelete && (
        <ConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={() => { setIsConfirmModalOpen(false); setItemToDelete(null); }}
            onConfirm={() => {
                switch (itemToDelete.type) {
                    case 'exercise':
                        handleDeleteExerciseFromLibrary();
                        break;
                    case 'template':
                        handleDeleteTemplate();
                        break;
                    case 'plan':
                        handleDeleteWeeklyPlan();
                        break;
                    case 'bulk-exercise':
                        handleBulkDeleteExercises();
                        break;
                    // FIX: Handle the new category confirmation action.
                    case 'new-category':
                        itemToDelete.data.onConfirm();
                        break;
                    case 'all-data-import':
                        performAllDataImport(itemToDelete.data);
                        break;
                }
                // FIX: Close the modal after any confirmation.
                setIsConfirmModalOpen(false);
                setItemToDelete(null);
            }}
            // FIX: Pass the item to delete to the modal to generate content dynamically.
            item={itemToDelete}
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

      {isEditLogModalOpen && logEntryToEdit && (
        <EditCompletionLogModal
            isOpen={isEditLogModalOpen}
            onClose={() => setIsEditLogModalOpen(false)}
            onSave={handleUpdateCompletionLogEntry}
            logEntryData={logEntryToEdit}
        />
      )}
      
      {isInWorkoutEditModalOpen && inWorkoutEditData && (
        <InWorkoutEditModal
            isOpen={isInWorkoutEditModalOpen}
            onClose={() => setIsInWorkoutEditModalOpen(false)}
            exerciseData={inWorkoutEditData.exercise}
            onSave={(updatedExercise) => {
                inWorkoutEditData.onSave(updatedExercise);
                setIsInWorkoutEditModalOpen(false);
            }}
        />
      )}

      <InfoModal 
        isOpen={infoModalState.isOpen}
        onClose={() => setInfoModalState(prev => ({...prev, isOpen: false}))}
        title={infoModalState.title}
        message={infoModalState.message}
        type={infoModalState.type}
      />


      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm sticky top-0 z-40 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <nav className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between py-4 md:py-0 md:h-20">
                <div className="flex-shrink-0 mb-4 md:mb-0 flex items-center gap-3">
                    <DumbbellIcon className="w-8 h-8 text-amber-500" />
                    <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white font-rubik">תוכנית אימונים אישית</h1>
                </div>
                <div className="flex items-center justify-center flex-wrap gap-2">
                    <TabButton tabName="plan" label="תוכנית אימונים" id="onboarding-target-plan" />
                    <TabButton tabName="progress" label="מעקב התקדמות" id="onboarding-target-progress" />
                    <TabButton tabName="library" label="ספרייה ועריכה" id="onboarding-target-library" />
                    <TabButton tabName="workout" label="אימון" />
                     <button
                        onClick={handleThemeToggle}
                        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        aria-label="Toggle theme"
                    >
                        {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
                    </button>
                </div>
            </div>
        </nav>
      </header>

      <main className="py-10">
        {renderContent()}
      </main>

      <footer className="bg-white dark:bg-slate-800 text-center py-4 mt-10 border-t border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-500 dark:text-gray-500">נבנה עבורך כדי שתגיע ליעדים שלך. בהצלחה!</p>
      </footer>
    </div>
  );
}

export default App;