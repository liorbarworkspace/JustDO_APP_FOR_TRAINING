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
}

export interface PlannedExercise extends Exercise {
    planInstanceId: ID;
}

export interface WorkoutActivity {
    title: string;
    duration?: string;
    details: string;
    exercises: PlannedExercise[];
}

export interface DailyPlan {
  day: string;
  type: string;
  duration: string;
  activities: WorkoutActivity[];
}

export interface ContentSection {
  title: string;
  content: string[];
}

export type CompletionLog = {
  [date: string]: {
    workoutDay: string;
    completedExercises: { [planInstanceId: string]: PlannedExercise };
  };
};