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
  imageUrl: string;
  category: 'כוח' | 'ליבה' | 'אירובי' | 'קליסטניקס' | 'כדורסל' | 'חימום' | 'גמישות';
  level: 'מתחיל' | 'בינוני' | 'מתקדם';
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
}

export interface WeeklyPlan {
  id: ID;
  name: string;
  schedule: {
    // Key is day name in Hebrew, value is WorkoutTemplate ID
    [day: string]: ID | null; 
  };
}

export interface ContentSection {
  title: string;
  content: string[];
}

export type CompletionLogEntry = {
    weeklyPlanName: string;
    dayOfWeek: string;
    workoutTemplate: WorkoutTemplate; // Snapshot of the workout
    completedExercises: { [planInstanceId: string]: PlannedExercise };
};

export type CompletionLog = {
  [date: string]: CompletionLogEntry;
};