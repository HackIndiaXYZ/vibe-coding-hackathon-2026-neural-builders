import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, TrendingUp, Loader2, File } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { useToast } from '../hooks/useToast';

export default function CvAssistant() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [cvText, setCvText] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | {
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    missingKeywords?: string[];
    formattingTips?: string[];
  }>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      toast("Please upload a PDF file.", "warning");
      return;
    }
    
    setPdfFile(file);
    setCvText(''); // Clear text if file uploaded

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64String = (ev.target?.result as string).split(',')[1];
      setPdfBase64(base64String);
    };
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    setPdfFile(null);
    setPdfBase64('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const analyzeCV = async () => {
    if (!cvText.trim() && !pdfBase64) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/gemini/analyze-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, base64Pdf: pdfBase64 })
      });
      const data = await res.json();
      if (data.success && data.text) {
        let cleaned = data.text.replace(/```json/gi, '').replace(/```/g, '').trim();
        // Fallback for cases where it may return text outside JSON
        const firstBracket = cleaned.indexOf('{');
        const lastBracket = cleaned.lastIndexOf('}');
        if (firstBracket !== -1 && lastBracket !== -1) {
             cleaned = cleaned.substring(firstBracket, lastBracket + 1);
        }
        
        let parsed;
        try {
           parsed = JSON.parse(cleaned);
        } catch (e) {
           toast("Could not parse AI response", "error");
           setLoading(false);
           return;
        }

        setResult(parsed);

        // Save to History
        if (user) {
          await setDoc(doc(collection(db, 'users', user.uid, 'history')), {
            type: 'cv',
            title: `Analyzed CV: ${pdfFile?.name || 'Text Input'}`,
            score: parsed.score,
            createdAt: serverTimestamp()
          });
        }
      } else {
        toast("Failed to analyze CV.", "error");
      }
    } catch (err) {
      console.error(err);
      toast("An error occurred during analysis.", "error");
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Score', value: result?.score || 0, color: '#2563EB' },
    { name: 'Remaining', value: 100 - (result?.score || 0), color: '#E2E8F0' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('sidebar.cv')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">AI-powered Expert HR & ATS Scanner</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 flex flex-col h-[600px]">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t('cv.uploadTitle')}</h2>
          
          <div className="flex-1 flex flex-col gap-4">
            
            {/* File Upload Zone */}
            <div 
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
                pdfFile 
                  ? 'border-primary/50 bg-blue-50/50 dark:bg-blue-900/10' 
                  : 'border-slate-300 dark:border-slate-700 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="application/pdf"
                onChange={handleFileChange}
              />
              
              {pdfFile ? (
                <>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-primary rounded-full flex items-center justify-center mb-3">
                    <File className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1 truncate max-w-[200px]">{pdfFile.name}</h3>
                  <p className="text-xs text-slate-500 mb-4">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB PDF</p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); clearFile(); }}
                    className="text-xs font-semibold text-red-500 hover:text-red-700"
                  >
                    Remove File
                  </button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white"><span className="text-primary">{t('cv.clickUpload')}</span> or drag and drop</div>
                  <p className="text-xs text-slate-500 mt-1">PDF files up to 10MB</p>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
              <span className="text-xs text-slate-400 font-medium">{t('cv.orPaste')}</span>
              <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
            </div>

            <textarea
              className="flex-1 w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-mono text-sm leading-relaxed"
              placeholder={t('cv.placeholder')}
              value={cvText}
              onChange={(e) => { setCvText(e.target.value); if (pdfFile) clearFile(); }}
              disabled={loading}
            ></textarea>
            
            <button 
              onClick={analyzeCV}
              disabled={loading || (!cvText.trim() && !pdfBase64)}
              className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50 mt-2 shrink-0"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> {t('cv.analyzing')}</>
              ) : (
                <><FileText className="w-5 h-5 mr-2" /> {t('cv.analyzeBtn')}</>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 h-[600px] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <div className="w-16 h-16 border-4 border-slate-100 dark:border-slate-800 border-t-primary rounded-full animate-spin mb-4"></div>
              <p>Acting as Expert HR Scanner...</p>
            </div>
          ) : result ? (
            <div className="space-y-8 animate-in fade-in zoom-in duration-300">
              {/* ATS Score */}
              <div className="flex flex-col items-center">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('cv.score')}</h2>
                <div className="relative w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={0}
                        dataKey="value"
                        stroke="none"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">{result.score}</span>
                    <span className="text-xs text-slate-500">/ 100</span>
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900/30">
                  <h3 className="font-semibold text-emerald-800 dark:text-emerald-400 flex items-center mb-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> {t('cv.strengths')}
                  </h3>
                  <ul className="space-y-2">
                    {result.strengths.map((item, i) => (
                      <li key={i} className="text-xs text-emerald-700 dark:text-emerald-300 flex items-start break-words leading-tight">- {item}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 border border-red-100 dark:border-red-900/30">
                  <h3 className="font-semibold text-red-800 dark:text-red-400 flex items-center mb-3 text-sm">
                    <AlertCircle className="w-4 h-4 mr-2" /> {t('cv.weaknesses')}
                  </h3>
                  <ul className="space-y-2">
                    {result.weaknesses.map((item, i) => (
                      <li key={i} className="text-xs text-red-700 dark:text-red-300 flex items-start break-words leading-tight">- {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Formatting & Keywords */}
              <div className="grid grid-cols-2 gap-4">
                {result.missingKeywords && result.missingKeywords.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-100 dark:border-amber-900/30">
                    <h3 className="font-semibold text-amber-800 dark:text-amber-400 flex items-center mb-3 text-sm">
                      Missing Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                       {result.missingKeywords.map((item, i) => (
                         <span key={i} className="px-2 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded text-xs font-semibold">{item}</span>
                       ))}
                    </div>
                  </div>
                )}
                
                {result.formattingTips && result.formattingTips.length > 0 && (
                  <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-xl p-4 border border-indigo-100 dark:border-indigo-900/30">
                    <h3 className="font-semibold text-indigo-800 dark:text-indigo-400 flex items-center mb-3 text-sm">
                      Formatting Tips
                    </h3>
                    <ul className="space-y-2">
                      {result.formattingTips.map((item, i) => (
                        <li key={i} className="text-xs text-indigo-700 dark:text-indigo-300 flex items-start break-words leading-tight">- {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Actionable Suggestions */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center mb-4">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-500" /> {t('cv.suggestions')}
                </h3>
                <div className="space-y-3">
                  {result.suggestions.map((item, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <UploadCloud className="w-16 h-16 mb-4 opacity-20" />
              <p>{t('cv.placeholder')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
