import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import { MessageSquare, Send, Loader2, PlayCircle, ShieldCheck, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function MockInterview() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  const [mode, setMode] = useState<'Scholarship Interview' | 'Job Interview' | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      getDoc(doc(db, 'users', user.uid)).then(snap => {
        if (snap.exists()) setProfile(snap.data() as UserProfile);
      });
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startInterview = async (selectedMode: 'Scholarship Interview' | 'Job Interview') => {
    setMode(selectedMode);
    setIsTyping(true);
    setMessages([]); // Reset for safety
    try {
      const response = await fetch('/api/gemini/mock-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, mode: selectedMode, history: [], answer: '' }),
      });
      const data = await response.json();
      if (data.success) {
        const parsed = JSON.parse(data.text);
        setMessages([{ role: 'model', content: parsed.nextQuestion }]);
      } else {
        alert("Failed to start interview.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMsg.trim() || isTyping) return;
    
    const userMsg: Message = { role: 'user', content: inputMsg };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMsg('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/gemini/mock-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          profile, 
          mode, 
          history: messages, // Send previous messages, not including the current user answer (handled via 'answer' prop)
          answer: userMsg.content 
        }),
      });
      const data = await response.json();
      if (data.success) {
        const parsed = JSON.parse(data.text);
        // We get score, feedback, nextQuestion
        const aiResponse = `**Score: ${parsed.score}/100**\n\n**Feedback:**\n${parsed.feedback}\n\n**Next Question:**\n${parsed.nextQuestion}`;
        setMessages([...newHistory, { role: 'model', content: aiResponse }]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  if (!mode) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12 h-[calc(100vh-2rem)] flex pl-2">
        <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">AI Mock Interview</h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">Practice your interviewing skills with our Gemini-powered HR simulation. Get real-time feedback and scores based on your actual profile.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <button 
              onClick={() => startInterview('Job Interview')}
              className="text-left bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all group"
            >
              <BriefcaseIcon className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Job Interview</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Simulate a technical or behavioral interview tailored to your major and skills.</p>
            </button>

            <button 
              onClick={() => startInterview('Scholarship Interview')}
              className="text-left bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-xl hover:-translate-y-1 transition-all group"
            >
              <GraduationCapIcon className="w-8 h-8 text-emerald-500 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-500 transition-colors">Scholarship Interview</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Practice answering common scholarship questions and showcase your unique potential.</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{mode}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gemini Interviwer is active</p>
        </div>
        <button 
          onClick={() => setMode(null)}
          className="text-sm px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        >
          End Session
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 space-y-6 custom-scrollbar pr-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-5 ${
              msg.role === 'user' 
                ? 'bg-primary text-white ml-auto' 
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-sm'
            }`}>
              {msg.role === 'model' && (
                <div className="flex items-center space-x-2 mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-primary flex items-center justify-center">
                    <MessageSquare className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">AI INTERVIEWER</span>
                </div>
              )}
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 rounded-2xl p-4 shadow-sm flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm font-medium">Interviewer is typing...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="pt-4">
        <div className="relative">
          <input 
            type="text" 
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your answer here..."
            className="w-full pl-6 pr-14 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary shadow-sm text-slate-900 dark:text-white"
            disabled={isTyping}
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputMsg.trim() || isTyping}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Send className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

function BriefcaseIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  );
}

function GraduationCapIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.42 10.922a2 2 0 0 1-.01 3.837l-8.5 4.354a2 2 0 0 1-1.82 0l-8.5-4.354a2 2 0 0 1-.01-3.837l8.5-4.354a2 2 0 0 1 1.83 0l8.5 4.354Z"/>
      <path d="M22 10v6"/>
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>
    </svg>
  );
}
