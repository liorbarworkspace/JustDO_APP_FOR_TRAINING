import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { Chat } from '@google/genai';
import type { Exercise, WorkoutTemplate } from '../types';
import { SparklesIcon, UserIcon } from './icons';

interface PersonalCoachChatProps {
    exerciseLibrary: Exercise[];
    workoutTemplates: WorkoutTemplate[];
}

interface Message {
    role: 'user' | 'model';
    text: string;
}

const PersonalCoachChat: React.FC<PersonalCoachChatProps> = ({ exerciseLibrary, workoutTemplates }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'model',
            text: 'שלום! אני מאמן הכושר האישי שלך, Gemini. איך אני יכול לעזור לך להתאמן היום? אתה יכול לבקש ממני לבנות לך תוכנית אימונים שבועית, לשאול על תרגילים ספציפיים, או לקבל טיפים למוטיבציה.'
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const initializeChat = () => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const systemInstruction = `You are a professional and encouraging personal trainer. Your name is Gemini Coach. You speak only in Hebrew.
Your goal is to help the user build workout plans and stay motivated.
You have access to the user's personal exercise library and existing workout templates. Use this information to answer their questions and create personalized plans.

Here is the user's current exercise library in JSON format:
${JSON.stringify(exerciseLibrary, null, 2)}

Here are the user's current workout templates in JSON format:
${JSON.stringify(workoutTemplates, null, 2)}

When a user asks for a weekly plan, create a schedule for them. Suggest using their existing workout templates by name (e.g., "אימון קצר", "מנוחה פעילה"). If they don't have suitable templates, suggest creating a new one by listing specific exercises from their library.
Always provide clear, actionable advice. Format your responses with Markdown for readability (e.g., use lists for schedules).`;

            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: systemInstruction,
                },
                history: messages.length > 1 ? messages.slice(1).map(m => ({
                    role: m.role,
                    parts: [{ text: m.text }]
                })) : []
            });
        } catch (e) {
            console.error(e);
            setError('לא הצלחתי להתחבר למאמן. אנא בדוק את הגדרות ה-API שלך ורענן את הדף.');
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', text: inputValue };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        setError(null);

        try {
            if (!chatRef.current) {
                initializeChat();
            }
            if (!chatRef.current) throw new Error("Chat not initialized");

            const stream = await chatRef.current.sendMessageStream({ message: inputValue });

            let modelResponse = '';
            setMessages(prev => [...prev, { role: 'model', text: '' }]); 

            for await (const chunk of stream) {
                modelResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = modelResponse;
                    return newMessages;
                });
            }
        } catch (e) {
            console.error(e);
            const errorMessage = 'אוי, נתקלתי בבעיה. אנא נסה שוב בעוד כמה רגעים.';
            setError(errorMessage);
            setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-6 flex flex-col h-[calc(100vh-200px)]">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-2 text-right tracking-tight font-rubik">מאמן אישי AI</h2>
            <p className="text-slate-500 dark:text-gray-400 mb-6 text-right text-lg">שאל את Gemini כל מה שקשור לתוכנית האימונים שלך.</p>
            
            <div className="flex-1 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                                <SparklesIcon className="w-5 h-5 text-white" />
                            </div>
                        )}
                        <div className={`max-w-xl p-3 rounded-lg ${msg.role === 'user' ? 'bg-slate-200 dark:bg-slate-700' : 'bg-slate-100 dark:bg-slate-900'}`}>
                            <p className="text-slate-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                        </div>
                         {msg.role === 'user' && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-400 dark:bg-slate-600 flex items-center justify-center">
                                <UserIcon className="w-5 h-5 text-white" />
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && messages[messages.length -1].role === 'user' && (
                     <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                           <SparklesIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="max-w-xl p-3 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center">
                           <span className="animate-pulse">...מקליד</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {error && <p className="text-red-400 text-center mt-2">{error}</p>}
            
            <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="שאל אותי משהו על תוכנית האימונים..."
                    disabled={isLoading}
                    className="flex-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-md rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'שולח...' : 'שלח'}
                </button>
            </form>
        </div>
    );
};

export default PersonalCoachChat;