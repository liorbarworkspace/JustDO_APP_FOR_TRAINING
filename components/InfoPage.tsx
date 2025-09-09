
import React from 'react';
import { PRINCIPLES, PAIN_MANAGEMENT, RECOVERY_NUTRITION, SAFETY_DISCLAIMER } from '../constants';
import type { ContentSection } from '../types';

const ContentCard: React.FC<{ section: ContentSection }> = ({ section }) => (
    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <h3 className="text-2xl font-bold text-cyan-400 mb-4">{section.title}</h3>
        <div className="space-y-3 text-gray-300">
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
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2">עקרונות ומידע חשוב</h2>
            <p className="text-gray-400 mb-8">מידע חיוני לבניית תוכנית אימונים בטוחה, יעילה ומותאמת אישית.</p>
            <div className="space-y-6">
                {sections.map(section => (
                    <ContentCard key={section.title} section={section} />
                ))}
            </div>
        </div>
    );
};

export default InfoPage;