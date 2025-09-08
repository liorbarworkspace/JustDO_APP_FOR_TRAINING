import type { Exercise, ContentSection, PlannedExercise, WorkoutTemplate, WeeklyPlan } from './types';

export const EXERCISE_CATEGORIES = ['כוח', 'ליבה', 'אירובי', 'קליסטניקס', 'כדורסל', 'חימום', 'גמישות'] as const;
export const EXERCISE_LEVELS = ['מתחיל', 'בינוני', 'מתקדם'] as const;
export const DAYS_OF_WEEK = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'] as const;


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
    imageUrl: "https://picsum.photos/seed/dumbbell-press/400/300",
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
    imageUrl: "https://picsum.photos/seed/incline-pushup/400/300",
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
    imageUrl: "https://picsum.photos/seed/dumbbell-row/400/300",
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
    imageUrl: "https://picsum.photos/seed/squat/400/300",
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
    imageUrl: "https://picsum.photos/seed/lunge/400/300",
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
    imageUrl: "https://picsum.photos/seed/plank/400/300",
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
    imageUrl: "https://picsum.photos/seed/ring-row/400/300",
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
    imageUrl: "https://picsum.photos/seed/jumprope/400/300",
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
    imageUrl: "https://picsum.photos/seed/basketball/400/300",
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
    imageUrl: "https://picsum.photos/seed/basketball-game/400/300",
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
    imageUrl: "https://picsum.photos/seed/arm-circles/400/300",
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
    imageUrl: "https://picsum.photos/seed/high-knees/400/300",
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
    imageUrl: "https://picsum.photos/seed/hamstring-stretch/400/300",
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
    imageUrl: "https://picsum.photos/seed/childs-pose/400/300",
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
        exercises: createPlannedExercises(['flex-1', 'flex-2']),
    },
    {
        id: 'workout-game',
        title: "משחק כדורסל",
        type: "אימון אופציונלי",
        duration: "",
        exercises: createPlannedExercises(['basketball-2']),
    },
     {
        id: 'workout-full-rest',
        title: "מנוחה מלאה",
        type: "התאוששות",
        duration: "",
        exercises: [],
    },
];

export const INITIAL_WEEKLY_PLANS: WeeklyPlan[] = [
    {
        id: 'week-1',
        name: 'שבוע 1 - רמה: מתחיל',
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

export const PRINCIPLES: ContentSection[] = [
  {
    title: "1.1. עקרון ההדרגתיות: מניעת פציעות כחזון יסוד",
    content: [
      "תפיסת האימון המוצגת כאן מבוססת על עקרונות פיזיולוגיים מוכחים, בראשם עקרון העומס המתגבר (Progressive Overload). על מנת לייצר התקדמות, יש לספק לשריר גירוי גדול יותר ממה שהוא רגיל אליו. עבור מתאמן מתחיל, במיוחד כזה המדווח על כאבים, הדגש הראשוני אינו על משקלים חיצוניים כבדים.",
      "הגישה הבטוחה לבניית יסודות מתחילה בשיפור מיומנויות תנועה ובבניית נפח אימון הדרגתי. במקום להעלות משקלים, ההתקדמות תושג באמצעות הגברת מספר החזרות והסטים. גישה זו מאפשרת לגוף להסתגל, לשכלל טכניקה ולבנות יציבות, שהיא המפתח למניעת פציעות. העבודה ההדרגתית תגרום לאימונים להרגיש קלים בהתחלה, אך הגירוי היציב והמתמשך יוביל לחיזוק מצטבר."
    ]
  },
  {
    title: "1.2. חשיבות המנוחה וההתאוששות",
    content: [
      "מנוחה אינה שלב פסיבי, אלא חלק אינטגרלי ואקטיבי מתהליך הגדילה. תהליך הפיצוי העילאי (Supercompensation) מתרחש בזמן ההתאוששות: לאחר שהשרירים נפגעו ממיקרו-קרעים באימון, הם נבנים מחדש וחזקים יותר במנוחה.",
      "מתאמן מתחיל נדרש למנוחה של לפחות 48 שעות בין אימוני כוח על אותן קבוצות שרירים, כדי לאפשר לגוף להתאושש באופן מלא. זמני המנוחה בין הסטים נעים בין 45 ל-90 שניות. הכרה במנוחה כחלק מהתוכנית מונעת תסכול ומאפשרת צמיחה אמיתית."
    ]
  },
  {
    title: "1.3. מוטיבציה ככלי לאימון לטווח ארוך",
    content: [
      "המוטיבציה להתאמן לאורך זמן נובעת ממקורות פנימיים, כגון הנאה והשראה. התוכנית נועדה להיות \"לא משעממת\" על ידי שילוב כדורסל, דלגית וקליסטניקס, כדי להפוך את האימון למשחק וחוויה.",
      "התוכנית מקשרת בין תרגילים בסיסיים למטרה גדולה יותר. לדוגמה, חיזוק שרירי הליבה מוסבר ככלי לשיפור ביצועי כדורסל (יציבות לכדרור וקליעה), מה שמעניק משמעות מיידית לתרגיל הפלאנק ומחבר אותו לתשוקה של המתאמן. גישה זו מחזקת מוטיבציה פנימית ומבטיחה התמדה."
    ]
  }
];

export const PAIN_MANAGEMENT: ContentSection[] = [
    {
      title: "2.1. התמודדות עם כאבי מפרק כף היד",
      content: [
        "כאבים במפרק כף היד בשכיבות סמיכה נובעים לרוב מכיפוף יתר. ניתן להשתמש בטכניקות המפחיתות עומס ומחזקות את האזור בהדרגה.",
        "חיזוק מקדים: בצעו לפני אימון 'תנוחת התפילה' (לחיצת כפות ידיים זו בזו והנמכה איטית), מעיכת כדור טניס, ודחיפת שולחן איזומטרית (מיקום כפות ידיים מתחת לשולחן ודחיפה עדינה כלפי מעלה).",
        "וריאציות שכיבות סמיכה: בצעו שכיבות סמיכה בשיפוע חיובי (ידיים על משטח מוגבה) להפחתת עומס, או שכיבות סמיכה על האגרופים כדי לשמור על מפרק ישר."
      ]
    },
    {
      title: "2.2. חיזוק עדין לגב ולצוואר",
      content: [
        "כאבים בגב ובצוואר קשורים לעיתים קרובות לחולשת שרירי ליבה. חיזוק הדרגתי של אזורים אלה קריטי למניעה והקלה.",
        "תרגילים מומלצים: שכיבה על הגב עם משיכת ברכיים לחזה להקלה על גב תחתון, ותרגיל 'פלאנק' לחיזוק ליבה כללי. בפלאנק, חשוב לשמור על גב ישר ולהפסיק אם מופיע כאב."
      ]
    }
];

export const FUTURE_PLAN: ContentSection[] = [
    {
      title: "חודש 2: העלאת דרגה - הוספת וריאציות",
      content: [
        "לאחר ביסוס טכניקה והתחזקות, נעלה את הקושי על ידי שינוי וריאציות. גישה זו מאפשרת התקדמות מבלי להעמיס יתר על המידה.",
        "שכיבות סמיכה: נתקדם משיפוע חיובי לשכיבות סמיכה רגילות (על הבהונות או אגרופים), בהתאם לתחושה במפרק.",
        "קליסטניקס: אימוני טבעות יתמקדו בחתירה הפוכה, תרגיל יסוד לבניית כוח בגב ובזרועות לקראת מתח עתידי."
      ]
    },
    {
      title: "חודש 3: התמחות ופיצול - מעבר למודל A/B",
      content: [
        "לאחר כשישה שבועות, הגוף יהיה מוכן לעומסים גבוהים יותר. נפצל את התוכנית לשני סוגי אימונים (A ו-B) לעבודה ממוקדת יותר.",
        "תוכנית A: תתמקד בתרגילי 'דחיפה' (חזה, כתפיים, תלת-ראשי) ורגליים.",
        "תוכנית B: תתמקד בתרגילי 'משיכה' (גב, דו-ראשי) וליבה.",
      ]
    },
    {
        title: "הערה חשובה: אימון פליאומטרי",
        content: [
            "אימון פליאומטרי (קפיצות וניתורים) קריטי לשיפור כוח מתפרץ בכדורסל, אך הוא מייצר עומס גבוה על המפרקים ואינו מומלץ למתחילים. יש להתייחס אליו כמטרה עתידית רק לאחר בניית בסיס כוח מוצק."
        ]
    }
];

export const CONCLUSION: ContentSection = {
    title: "סיכום ומסקנות",
    content: [
        "התוכנית מהווה מפת דרכים הוליסטית, המשלבת עקרונות פיזיולוגיים עם גישה פסיכולוגית ממוקדת. היא נבנתה להתקדמות בטוחה, יעילה ולא משעממת. המפתח להצלחה הוא עקביות ושיפור מתמיד לטווח ארוך.",
        "ניהול יומן אימונים: זהו כלי הכרחי להתמדה. מעקב אחר חזרות, סטים וזמנים מאפשר לראות באופן מוחשי את השיפור ומחזק את המוטיבציה.",
        "מבט קדימה: התוכנית היא רק ההתחלה. היא נועדה לבנות בסיס איתן שישפר לא רק כוח, אלא גם יציבה, תחושת מסוגלות והפחתת כאבים. המטרה היא מסע שלם של התפתחות, שבו כל צעד קדימה הוא ניצחון."
    ]
};
