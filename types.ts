
export type ID = string;

export interface Exercise {
  id: ID;
  name: string;
  equipment: string;
  description: string;
  sets?: number;
  reps?: string;
  duration?: number; // in seconds
  rest: string;
  safetyNotes: string;
  // FIX: Added 'שיקום' and 'הרפיה' to the category type to match the categories used in constants.ts.
  category: 'כוח' | 'ליבה' | 'אירובי' | 'קליסטניקס' | 'כדורסל' | 'חימום' | 'גמישות' | 'שיקום' | 'הרפיה';
  level: 'מתחיל' | 'בינוני' | 'מתקדם';
  muscleGroups: string[];
}

export interface PlannedExercise extends Exercise {
    planInstanceId: ID;
}

export interface WorkoutTemplate {
    id: ID;
    title: string;
    type: string;
    duration: string;
    exercises: PlannedExercise[];
    level: 'כל הרמות' | 'מתחיל' | 'בינוני' | 'מתקדם';
    tags: string[];
}

export interface WeeklyPlan {
  id: ID;
  name: string;
  level: 'מתחיל' | 'בינוני' | 'מתקדם';
  schedule: {
    // Key is day name in Hebrew, value is WorkoutTemplate ID
    [day: string]: ID | null; 
  };
}

export interface ContentSection {
  title: string;
  content: string[];
}

export interface Feedback {
    feeling: 'excellent' | 'good' | 'ok' | 'tired';
    painLevel: number; // 0-5
    painLocation: string;
    difficulty: 'easy' | 'just_right' | 'hard';
    notes: string;
}

export type CompletionLogEntry = {
    weeklyPlanName: string;
    dayOfWeek: string;
    workoutTemplate: WorkoutTemplate; // Snapshot of the workout
    completedExercises: { [planInstanceId: string]: PlannedExercise };
    feedback?: Feedback;
    actualDurationSeconds?: number;
};

export type CompletionLog = {
  [date: string]: CompletionLogEntry;
};