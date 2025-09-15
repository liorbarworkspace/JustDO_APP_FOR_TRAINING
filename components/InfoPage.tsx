import React from 'react';
import { PRINCIPLES, PAIN_MANAGEMENT, RECOVERY_NUTRITION, SAFETY_DISCLAIMER } from '../constants';
import type { ContentSection } from '../types';

const ContentCard: React.FC<{ section: ContentSection }> = ({ section }) => (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-4 font-rubik">{section.title}</h3>
        <div className="space-y-3 text-slate-600 dark:text-gray-300 text-lg">
            {section.content.map((paragraph, index) => (
                <p key={index} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
            ))}
        </div>
    </div>
);

const InfoPage: React.FC = () => {
    const sections = [PRINCIPLES, PAIN_MANAGEMENT, RECOVERY_NUTRITION, SAFETY_DISCLAIMER];
    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-6 text-right">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight font-rubik">עקרונות ומידע חשוב</h2>
            <p className="text-slate-500 dark:text-gray-400 mb-8 text-lg">מידע חיוני לבניית תוכנית אימונים בטוחה, יעילה ומותאמת אישית.</p>
            <div className="space-y-6">
                {sections.map(section => (
                    <ContentCard key={section.title} section={section} />
                ))}
            </div>
        </div>
    );
};

export default InfoPage;