
import type { Exercise, PlannedExercise, WorkoutTemplate, WeeklyPlan, ContentSection } from './types';

export const EXERCISE_CATEGORIES = ['כוח', 'ליבה', 'אירובי', 'קליסטניקס', 'כדורסל', 'חימום', 'גמישות'] as const;
export const EXERCISE_LEVELS = ['מתחיל', 'בינוני', 'מתקדם'] as const;
export const DAYS_OF_WEEK = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'] as const;

export const WORKOUT_LEVELS = ['כל הרמות', 'מתחיל', 'בינוני', 'מתקדם'] as const;
export const PLAN_LEVELS = ['מתחיל', 'בינוני', 'מתקדם'] as const;
export const WORKOUT_TAGS = [...EXERCISE_CATEGORIES, 'מנוחה'] as const;


export const INITIAL_EXERCISE_LIBRARY: Exercise[] = [
  // כוח
  {
    id: 'force-1',
    name: "לחיצת חזה בשכיבה",
    equipment: "2 משקולות 5 ק\"ג, מזרון",
    description: "שכיבה על הגב, ברכיים כפופות, כפות רגליים על הרצפה. יש להניף את המשקולות מעלה עם ידיים ישרות ולהוריד אותן באיטיות לצדי החזה.",
    sets: 3, reps: '10-15',
    rest: "60-90 שניות",
    safetyNotes: "להקפיד על תנועה מבוקרת, אין להוריד את המשקולות מהר מדי.",
    category: "כוח",
    level: "מתחיל",
  },
  {
    id: 'force-2',
    name: "שכיבות סמיכה בשיפוע",
    equipment: "ספסל/כיסא",
    description: "להישען עם כפות הידיים על משטח מוגבה. יש להוריד את הגוף כלפי המשטח על ידי כיפוף המרפקים ולהרים אותו חזרה למעלה.",
    sets: 3, reps: '10-15',
    rest: "60 שניות",
    safetyNotes: "להקפיד על גב ישר, להימנע משקיעה של הגב התחתון.",
    category: "כוח",
    level: "מתחיל",
  },
  {
    id: 'force-3',
    name: "חתירה עם משקולות",
    equipment: "2 משקולות 5 ק\"ג",
    description: "עמידה בפישוק קל, גב ישר והטייה קלה קדימה. יש להרים את המשקולות לצדי הגוף לכיוון החזה וליישר את הידיים.",
    sets: 2, reps: '10-15',
    rest: "60-90 שניות",
    safetyNotes: "להקפיד על גב ישר ויציב, להימנע מסיבוב הגוף.",
    category: "כוח",
    level: "מתחיל",
  },
  {
    id: 'force-4',
    name: "סקוואט",
    equipment: "משקל גוף / 2 משקולות 5 ק\"ג",
    description: "עמידה בפישוק ברוחב כתפיים. הורדת הישבן לאחור כאילו מתיישבים על כיסא. ירידה לזווית של כ-90 מעלות ועלייה חזרה.",
    sets: 3, reps: '10-15',
    rest: "60 שניות",
    safetyNotes: "יש לשמור על גב ישר ומבט לפנים. להקפיד שהברכיים לא יעברו את קו הבהונות.",
    category: "כוח",
    level: "מתחיל",
  },
  {
    id: 'force-5',
    name: "לאנג'ים (מכרעים)",
    equipment: "משקל גוף / 2 משקולות 5 ק\"ג",
    description: "צעידה קדימה עם רגל אחת וכיפוף הברך עד שנוצרות זוויות של 90 מעלות בשתי הברכיים. חזרה לעמידה והחלפת רגליים.",
    sets: 2, reps: '8-12 لكل רגל',
    rest: "60 שניות",
    safetyNotes: "יש לשמור על פלג גוף עליון ישר ויציב.",
    category: "כוח",
    level: "מתחיל",
  },
  // ליבה
  {
    id: 'core-1',
    name: "פלאנק",
    equipment: "משקל גוף",
    description: "תמיכה על האמות והבהונות, גוף ישר מהראש עד העקבים. יש לשמור על שרירי הבטן מכווצים כדי למנוע שקיעה של הגב התחתון.",
    sets: 3, duration: 40, // 20-60 seconds, default to 40
    rest: "30 שניות",
    safetyNotes: "להקפיד על נשימה סדירה. יש להפסיק מיד אם מופיע כאב גב.",
    category: "ליבה",
    level: "מתחיל",
  },
   // קליסטניקס
  {
    id: 'calisthenics-1',
    name: "חתירה הפוכה בטבעות",
    equipment: "טבעות מתח",
    description: "תלייה בשיפוע כשהרגליים על הקרקע. משיכת הגוף מעלה עד שהחזה נוגע בטבעות והורדה איטית.",
    sets: 3, reps: '10-12',
    rest: "60 שניות",
    safetyNotes: "תרגיל זה הוא בסיס מצוין למתח. הוא מפתח כוח בגב ובזרועות ללא עומס גדול מדי.",
    category: "קליסטניקס",
    level: "מתחיל",
  },
  // אירובי
  {
    id: 'cardio-1',
    name: "דלגית",
    equipment: "דלגית",
    description: "קפיצה קלה מעל החבל, רצוי על קצות האצבעות. יש לשמור על קצב אחיד ומבוקר.",
    duration: 300, // 5 minutes
    rest: "",
    safetyNotes: "כלי מצוין לחימום אירובי ולשיפור קואורדינציה.",
    category: "אירובי",
    level: "מתחיל",
  },
  // כדורסל
  {
    id: 'basketball-1',
    name: "אימון כדורסל",
    equipment: "כדורסל",
    description: "תרגילי כדרור בשתי הידיים, קליעה לסל ממרחקים שונים, שילוב תרגילי כוח עם כדורסל.",
    duration: 1500, // 25 minutes
    rest: "משתנה",
    safetyNotes: "יש להתמקד בשליטה ודיוק, במיוחד בכדרור ביד החלשה.",
    category: "כדורסל",
    level: "מתחיל",
  },
  {
    id: 'basketball-2',
    name: "משחק כדורסל 5x5",
    equipment: "כדורסל, מגרש",
    description: "משחק כדורסל מלא. דרך מצוינת לשלב אירובי, כוח מתפרץ וקואורדינציה.",
    reps: "4 רבעים של 10 דק'",
    rest: "2 דקות בין רבעים",
    safetyNotes: "חשוב לבצע חימום טוב לפני המשחק ולשמור על שתיית מים.",
    category: "כדורסל",
    level: "בינוני",
  },
  // חימום
  {
    id: 'warmup-1',
    name: "סיבובי זרועות",
    equipment: "משקל גוף",
    description: "עמידה ישרה, ביצוע סיבובים גדולים ומבוקרים עם הידיים קדימה ואז אחורה.",
    duration: 60, // 30 sec each way
    rest: "",
    safetyNotes: "בצעו את התנועה לאט ובטווח תנועה מלא.",
    category: "חימום",
    level: "מתחיל",
  },
  {
    id: 'warmup-2',
    name: "הרמות ברכיים במקום",
    equipment: "משקל גוף",
    description: "הליכה או ריצה קלה במקום תוך הרמת הברכיים גבוה לכיוון החזה.",
    sets: 2, duration: 30,
    rest: "15 שניות",
    safetyNotes: "שמרו על גב ישר והפעילו את שרירי הבטן.",
    category: "חימום",
    level: "מתחיל",
  },
  // גמישות
  {
    id: 'flex-1',
    name: "מתיחת hamstring",
    equipment: "משקל גוף",
    description: "ישיבה על הרצפה עם רגל אחת ישרה והשנייה כפופה. התכופפו קדימה לכיוון הרגל הישרה עד להרגשת מתיחה.",
    duration: 60, // 30 sec each leg
    rest: "",
    safetyNotes: "הימנעו מנעילת הברך ושמרו על גב יחסית ישר.",
    category: "גמישות",
    level: "מתחיל",
  },
  {
    id: 'flex-2',
    name: "תנוחת הילד (יוגה)",
    equipment: "מזרון",
    description: "כרעו על הרצפה, הצמידו את הבהונות הגדולות ופשקו את הברכיים ברוחב המותניים. הורידו את הישבן לעקבים והניחו את המצח על הרצפה.",
    duration: 90,
    rest: "",
    safetyNotes: "נשמו עמוק והרגישו את המתיחה בגב התחתון.",
    category: "גמישות",
    level: "מתחיל",
  },
];

const createPlannedExercises = (ids: string[]): PlannedExercise[] => {
    const exerciseMap = new Map<string, Exercise>(INITIAL_EXERCISE_LIBRARY.map(e => [e.id, e]));
    return ids.map(id => {
        const exercise = exerciseMap.get(id);
        if (!exercise) throw new Error(`Exercise with id ${id} not found`);
        return {
            ...exercise,
            planInstanceId: crypto.randomUUID(),
        };
    });
};


export const INITIAL_WORKOUT_TEMPLATES: WorkoutTemplate[] = [
    {
        id: 'workout-short',
        title: "אימון קצר",
        type: "Full Body",
        duration: "(כ-25 דק')",
        level: "מתחיל",
        tags: ["כוח", "ליבה", "אירובי", "חימום"],
        exercises: [
            ...createPlannedExercises(['warmup-1', 'cardio-1']),
            ...createPlannedExercises(['force-4', 'force-2', 'core-1']),
        ]
    },
    {
        id: 'workout-medium',
        title: "אימון בינוני",
        type: "Full Body",
        duration: "(כ-45 דק')",
        level: "מתחיל",
        tags: ["כוח", "ליבה", "אירובי", "חימום"],
        exercises: [
            ...createPlannedExercises(['warmup-2', 'cardio-1']),
            ...createPlannedExercises(['force-1', 'force-3', 'force-5', 'core-1']),
        ]
    },
    {
        id: 'workout-long',
        title: "אימון ארוך",
        type: "Full Body + Skills",
        duration: "(כ-60 דק')",
        level: "בינוני",
        tags: ["כדורסל", "כוח", "קליסטניקס", "אירובי"],
        exercises: [
            ...createPlannedExercises(['cardio-1']),
            ...createPlannedExercises(['basketball-1']),
            ...createPlannedExercises(['force-4', 'calisthenics-1']),
        ]
    },
    {
        id: 'workout-active-rest',
        title: "מנוחה פעילה",
        type: "שחרור ומתיחות",
        duration: "",
        level: "כל הרמות",
        tags: ["גמישות"],
        exercises: createPlannedExercises(['flex-1', 'flex-2']),
    },
    {
        id: 'workout-game',
        title: "משחק כדורסל",
        type: "אימון אופציונלי",
        duration: "",
        level: "בינוני",
        tags: ["כדורסל"],
        exercises: createPlannedExercises(['basketball-2']),
    },
     {
        id: 'workout-full-rest',
        title: "מנוחה מלאה",
        type: "התאוששות",
        duration: "",
        level: "כל הרמות",
        tags: ["מנוחה"],
        exercises: [],
    },
];

export const INITIAL_WEEKLY_PLANS: WeeklyPlan[] = [
    {
        id: 'week-1',
        name: 'שבוע 1 - רמה: מתחיל',
        level: 'מתחיל',
        schedule: {
            'ראשון': 'workout-short',
            'שני': 'workout-full-rest',
            'שלישי': 'workout-medium',
            'רביעי': 'workout-active-rest',
            'חמישי': 'workout-long',
            'שישי': 'workout-game',
            'שבת': 'workout-full-rest',
        }
    },
    {
        id: 'week-2',
        name: 'שבוע 2 - רמה: מתחיל',
        level: 'מתחיל',
        schedule: {
            'ראשון': 'workout-short',
            'שני': 'workout-active-rest',
            'שלישי': 'workout-medium',
            'רביעי': 'workout-full-rest',
            'חמישי': 'workout-long',
            'שישי': 'workout-game',
            'שבת': 'workout-full-rest',
        }
    },
    {
        id: 'week-3',
        name: 'שבוע 3 - רמה: מתחיל',
        level: 'מתחיל',
        schedule: {
            'ראשון': 'workout-medium',
            'שני': 'workout-full-rest',
            'שלישי': 'workout-short',
            'רביעי': 'workout-active-rest',
            'חמישי': 'workout-long',
            'שישי': 'workout-game',
            'שבת': 'workout-full-rest',
        }
    },
     {
        id: 'week-4',
        name: 'שבוע 4 - רמה: מתחיל',
        level: 'מתחיל',
        schedule: {
            'ראשון': 'workout-medium',
            'שני': 'workout-active-rest',
            'שלישי': 'workout-short',
            'רביעי': 'workout-full-rest',
            'חמישי': 'workout-long',
            'שישי': 'workout-game',
            'שבת': 'workout-full-rest',
        }
    }
];

export const SAFETY_DISCLAIMER: ContentSection = {
  title: "הערה מקדימה בנושא בטיחות",
  content: [
    "מסמך זה נכתב על בסיס נתונים ומידע מדעי זמינים, אך הוא אינו מהווה תחליף לייעץ רפואי אישי. עבור מתאמנים הסובלים מכאבים קיימים או ממגבלות פיזיות, חיוני להיוועץ ברופא או בפיזיותרפיסט מוסמך לפני תחילת כל תוכנית אימונים.",
    "העיקרון המנחה לאורך כל התוכנית הוא \"הקשבה לגוף\" – יש להבדיל בין עייפות שרירים נורמלית לבין כאב חד או מתמשך, הדורש הפסקה מיידית ובירור מקצועי. אימון נכון הוא אימון חכם ובטוח, המכבד את גבולות הגוף ודואג להתאוששותו."
  ]
};

// FIX: Add missing PRINCIPLES constant
export const PRINCIPLES: ContentSection = {
  title: "עקרונות מנחים לאימון אפקטיבי",
  content: [
    "**עקביות:** המפתח להתקדמות הוא התמדה לאורך זמן. עדיף להתאמן פחות זמן אך באופן קבוע, מאשר אימונים ארוכים וספורדיים.",
    "**הדרגתיות (Progressive Overload):** כדי להמשיך ולהשתפר, יש לאתגר את הגוף באופן הדרגתי. ניתן לעשות זאת על ידי העלאת משקלים, הגדלת מספר החזרות או הסטים, או קיצור זמני המנוחה.",
    "**ספציפיות:** הגוף מסתגל באופן ספציפי לסוג האימון שמבצעים. אם המטרה היא כוח, יש להתמקד בתרגילי כוח. אם המטרה היא סיבולת, יש להתמקד באימונים אירוביים.",
    "**הקשבה לגוף:** חשוב להבדיל בין כאב שרירים טבעי (DOMS) לבין כאב חד או פציעה. אין להתאמן דרך כאב חד. מנוחה והתאוששות הם חלק בלתי נפרד מהתהליך.",
    "**גיוון:** שילוב תרגילים וסוגי אימון שונים יכול למנוע שעמום, להפחית סיכון לפציעות שימוש יתר, ולאתגר את הגוף בדרכים חדשות."
  ]
};

// FIX: Add missing PAIN_MANAGEMENT constant
export const PAIN_MANAGEMENT: ContentSection = {
  title: "ניהול כאב ומניעת פציעות",
  content: [
    "**חימום ומתיחות דינמיות:** לפני כל אימון, הקדישו 5-10 דקות לחימום שיכלול פעילות אירובית קלה (הליכה, אופניים) ומתיחות דינמיות להכנת השרירים והמפרקים למאמץ.",
    "**קירור ומתיחות סטטיות:** בסיום האימון, בצעו קירור הדרגתי ומתיחות סטטיות (החזקת כל מתיחה כ-30 שניות) כדי לשפר את הגמישות ולהרגיע את מערכת העצבים.",
    "**טכניקה נכונה:** הקפידו על ביצוע נכון של כל תרגיל, גם אם זה אומר להשתמש במשקל נמוך יותר. טכניקה לקויה היא גורם מרכזי לפציעות.",
    "**כאב 'טוב' מול כאב 'רע':** כאב שרירים עמום המופיע יום-יומיים אחרי אימון הוא תקין. כאב חד, דוקר, שורף או כזה שמחמיר עם תנועה הוא סימן אזהרה. במקרה כזה, יש להפסיק את התרגיל ולהיוועץ באיש מקצוע במידת הצורך.",
    "**כלל ה-RICE לפציעות קלות:** במקרה של מתיחה או נקע קל, ניתן להשתמש בכלל: מנוחה (Rest), קרח (Ice), חבישה (Compression) והגבהה (Elevation)."
  ]
};

// FIX: Add missing RECOVERY_NUTRITION constant
export const RECOVERY_NUTRITION: ContentSection = {
  title: "התאוששות ותזונה",
  content: [
    "**שינה:** שינה איכותית (7-9 שעות בלילה) חיונית להתאוששות השרירים, איזון הורמונלי ותפקוד כללי. זהו הזמן בו הגוף בונה ומתקן את עצמו.",
    "**תזונת חלבון:** צריכת חלבון מספקת חשובה לתיקון ובניית רקמת השריר לאחר אימון. מומלץ לשלב מקור חלבון (עוף, דגים, ביצים, קטניות, טופו) בכל ארוחה.",
    "**פחמימות:** פחמימות מורכבות (אורז מלא, בטטה, קינואה) הן 'הדלק' של הגוף. הן ממלאות את מאגרי האנרגיה (גליקוגן) בשרירים ומסייעות בהתאוששות.",
    "**שתיית מים:** שמירה על מאזן נוזלים תקין חיונית לתפקוד השרירים, ויסות טמפרטורת הגוף ומניעת התכווצויות. הקפידו לשתות מים לפני, במהלך ואחרי האימון.",
    "**מנוחה פעילה:** בימי מנוחה, פעילות קלה כמו הליכה או יוגה יכולה לשפר את זרימת הדם, להקל על כאבי שרירים ולהאיץ את ההתאוששות."
  ]
};
