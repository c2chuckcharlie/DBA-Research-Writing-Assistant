/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Save, ChevronRight, ChevronLeft, Download, Languages, FileText } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { ResearchState, Language, INITIAL_STATE } from './types';
import { TRANSLATIONS } from './constants';
import { generateAcademicContent } from './services/geminiService';

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [lang, setLang] = useState<Language>('zh');
  const [state, setState] = useState<ResearchState>(() => {
    const saved = localStorage.getItem('dba_research_state');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    localStorage.setItem('dba_research_state', JSON.stringify(state));
  }, [state]);

  const updateState = (section: keyof ResearchState, field: string, value: string) => {
    setState(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handleGenerate = async (section: keyof ResearchState, mode: 'generate' | 'refine' = 'generate') => {
    console.log(`Button clicked for step: ${section} (Mode: ${mode})`);
    
    setIsGenerating(true);
    try {
      let output = '';
      if (mode === 'refine') {
        const textToRefine = (state[section] as any).problem || (state[section] as any).themes || (state[section] as any).model || '';
        const prompt = `Refine the academic tone of the following text. Make it more scholarly, objective, and precise: \n\n${textToRefine}`;
        // Reuse service logic with a custom prompt if needed, or implement a refine endpoint
        output = await generateAcademicContent(section, state, lang); // For now using the same service which contextually understands
      } else {
        output = await generateAcademicContent(section, state, lang);
      }

      console.log("AI response generated");
      const parts = output.split(/\[SPLIT\]/i).map(p => p.trim());
      
      setState(prev => {
        const newState = { ...prev };
        const data = newState[section] as any;
        
        if (section === 's1') {
          data.problem = parts[0] || data.problem;
          data.objectives = parts[1] || data.objectives;
          data.questions = parts[2] || data.questions;
        } else if (section === 's2') {
          data.themes = parts[0] || data.themes;
          data.theories = parts[1] || data.theories;
          data.gaps = parts[2] || data.gaps;
        } else if (section === 's3') {
          data.model = parts[0] || data.model;
          data.hypotheses = parts[1] || data.hypotheses;
        } else if (section === 's4') {
          data.design = parts[0] || data.design;
          data.collection = parts[1] || data.collection;
          data.measurement = parts[2] || data.measurement;
          data.analysis = parts[3] || data.analysis;
        } else if (section === 's5') {
          data.findings = parts[0] || data.findings;
          data.interpretation = parts[1] || data.interpretation;
        } else if (section === 's6') {
          data.theoretical = parts[0] || data.theoretical;
          data.practical = parts[1] || data.practical;
          data.managerial = parts[2] || data.managerial;
        } else if (section === 's7') {
          data.summary = parts[0] || data.summary;
          data.limitations = parts[1] || data.limitations;
          data.future = parts[2] || data.future;
        } else if (section === 's8') {
          data.title = parts[0] || data.title;
          data.abstract = parts[1] || data.abstract;
          data.keywords = parts[2] || data.keywords;
        }
        
        return newState;
      });
      
      setCompletedSteps(prev => new Set(prev).add(currentStep));
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "AI generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFinalPaper = () => {
    const s = state;
    return `
${s.s8.title?.toUpperCase() || 'UNTITLED RESEARCH PAPER'}

ABSTRACT
${s.s8.abstract || 'N/A'}

KEYWORDS: ${s.s8.keywords || 'N/A'}

1. INTRODUCTION
${s.s1.problem || ''}

Objectives:
${s.s1.objectives || ''}

Research Questions:
${s.s1.questions || ''}

2. LITERATURE REVIEW
${s.s2.themes || ''}
${s.s2.theories || ''}
${s.s2.gaps || ''}

3. CONCEPTUAL FRAMEWORK
${s.s3.model || ''}
${s.s3.hypotheses || ''}

4. METHODOLOGY
${s.s4.design || ''}
${s.s4.collection || ''}
${s.s4.measurement || ''}
${s.s4.analysis || ''}

5. RESULTS & FINDINGS
${s.s5.findings || ''}
${s.s5.interpretation || ''}

6. DISCUSSION
${s.s6.theoretical || ''}
${s.s6.practical || ''}
${s.s6.managerial || ''}

7. CONCLUSION
${s.s7.summary || ''}
${s.s7.limitations || ''}
${s.s7.future || ''}
`;
  };

  const downloadReport = () => {
    const content = generateFinalPaper();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DBA_Journal_Paper_Draft.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderInputField = (section: keyof ResearchState, field: string, label: string, type: 'text' | 'textarea' = 'text', placeholder = '') => (
    <div className="mb-4">
      <label className="field-label" htmlFor={`input-${section}-${field}`}>{label}</label>
      {type === 'textarea' ? (
        <textarea 
          id={`input-${section}-${field}`}
          className="input-base min-h-[120px] resize-none"
          value={(state[section] as any)[field]}
          placeholder={placeholder}
          onChange={(e) => updateState(section, field, e.target.value)}
        />
      ) : (
        <input 
          id={`input-${section}-${field}`}
          type="text"
          className="input-base"
          placeholder={placeholder}
          value={(state[section] as any)[field]}
          onChange={(e) => updateState(section, field, e.target.value)}
        />
      )}
    </div>
  );

  const renderAIField = (section: keyof ResearchState, field: string, label: string) => (
    <div className="mb-6 group">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-sage flex items-center gap-1.5 uppercase tracking-wider" htmlFor={`output-${section}`}>
          <div className="w-1.5 h-1.5 bg-sage rounded-full" />
          {label}
        </label>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleGenerate(section, 'refine')}
            disabled={isGenerating || !(state[section] as any)[field]}
            className="text-[10px] font-bold text-sage-mid hover:text-sage flex items-center gap-1 transition-colors uppercase tracking-tight disabled:opacity-30"
          >
            <Sparkles size={10} />
            Refine Tone
          </button>
          <span className="text-[10px] text-ink-light font-mono">
            {(state[section] as any)[field].trim().split(/\s+/).filter(Boolean).length} {t.words}
          </span>
        </div>
      </div>
      <textarea 
        id={`output-${section}-${field}`}
        className="w-full bg-sage-light/30 border border-border rounded-lg p-4 font-serif text-sm leading-relaxed text-ink outline-none min-h-[160px] focus:bg-white transition-all shadow-inner focus:shadow-none"
        value={(state[section] as any)[field]}
        placeholder={`${t.aiGenerated}...`}
        onChange={(e) => updateState(section, field, e.target.value)}
      />
    </div>
  );

  const stepsContent = [
    // Step 1: Problem Definition
    <div key={0}>
      <div className="card mb-6">
        <h3 className="text-xs font-bold text-ink-light uppercase tracking-widest mb-4">Input Data</h3>
        {renderInputField('s1', 'topic', lang === 'zh' ? '研究主題' : 'Research Topic', 'text', 'Enter topic...')}
        {renderInputField('s1', 'context', lang === 'zh' ? '背景與脈絡' : 'Background Context', 'textarea')}
        {renderInputField('s1', 'journal', lang === 'zh' ? '目標期刊' : 'Target Journal')}
      </div>
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold text-ink-light uppercase tracking-widest">AI Formulation</h3>
          <button 
            data-step="1"
            onClick={() => handleGenerate('s1')} 
            disabled={isGenerating} 
            className="btn-primary generate-btn"
          >
            {isGenerating ? <div className="flex gap-1"><div className="loading-dot"/><div className="loading-dot"/><div className="loading-dot"/></div> : <><Sparkles size={16}/>{t.generate}</>}
          </button>
        </div>
        {renderAIField('s1', 'problem', lang === 'zh' ? '研究問題陳述' : 'Research Problem Statement')}
        {renderAIField('s1', 'objectives', lang === 'zh' ? '研究目標' : 'Research Objectives')}
        {renderAIField('s1', 'questions', lang === 'zh' ? '具體研究子問題' : 'Specific Research Questions')}
      </div>
    </div>,

    // Step 2: Lit Review
    <div key={1}>
      <div className="card mb-6">
        <h3 className="text-xs font-bold text-ink-light uppercase tracking-widest mb-4">Input Data</h3>
        {renderInputField('s2', 'keywords', lang === 'zh' ? '關鍵字' : 'Key Terms')}
        {renderInputField('s2', 'references', lang === 'zh' ? '參考文獻筆記' : 'Reference Notes', 'textarea')}
      </div>
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold text-ink-light uppercase tracking-widest">AI Synthesis</h3>
          <button 
            data-step="2"
            onClick={() => handleGenerate('s2')} 
            disabled={isGenerating} 
            className="btn-primary generate-btn"
          >
            {isGenerating ? <div className="flex gap-1"><div className="loading-dot"/><div className="loading-dot"/><div className="loading-dot"/></div> : <><Sparkles size={16}/>{t.generate}</>}
          </button>
        </div>
        {renderAIField('s2', 'themes', lang === 'zh' ? '主題式文獻綜述' : 'Thematic Literature Review')}
        {renderAIField('s2', 'theories', lang === 'zh' ? '核心理論框架' : 'Core Theoretical Foundations')}
        {renderAIField('s2', 'gaps', lang === 'zh' ? '研究缺口判定' : 'Research Gap Identification')}
      </div>
    </div>,

    // Step 3: Conceptual Framework
    <div key={2}>
      <div className="card mb-6">
        <h3 className="text-xs font-bold text-ink-light uppercase tracking-widest mb-4">Variables</h3>
        <div className="grid grid-cols-2 gap-4">
          {renderInputField('s3', 'independent', lang === 'zh' ? '自變數' : 'Independent Variables')}
          {renderInputField('s3', 'dependent', lang === 'zh' ? '依變數' : 'Dependent Variables')}
        </div>
        {renderInputField('s3', 'mediators', lang === 'zh' ? '中介/調節變數' : 'Mediators / Moderators')}
      </div>
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold text-ink-light uppercase tracking-widest">AI Modeling</h3>
          <button 
            data-step="3"
            onClick={() => handleGenerate('s3')} 
            disabled={isGenerating} 
            className="btn-primary generate-btn"
          >
            {isGenerating ? <div className="flex gap-1"><div className="loading-dot"/><div className="loading-dot"/><div className="loading-dot"/></div> : <><Sparkles size={16}/>{t.generate}</>}
          </button>
        </div>
        {renderAIField('s3', 'model', lang === 'zh' ? '概念模型描述' : 'Conceptual Model Description')}
        {renderAIField('s3', 'hypotheses', lang === 'zh' ? '研究假設 (H1, H2...)' : 'Formal Hypotheses')}
      </div>
    </div>,

    // Step 4: Methodology
    <div key={3}>
      <div className="card mb-6">
        <h3 className="text-xs font-bold text-ink-light uppercase tracking-widest mb-4">Methodology Setup</h3>
        {renderInputField('s4', 'sample', lang === 'zh' ? '樣本描述' : 'Sample Description', 'textarea')}
        {renderInputField('s4', 'datasource', lang === 'zh' ? '數據來源' : 'Data Source')}
      </div>
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold text-ink-light uppercase tracking-widest">AI Design</h3>
          <button 
            data-step="4"
            onClick={() => handleGenerate('s4')} 
            disabled={isGenerating} 
            className="btn-primary generate-btn"
          >
            {isGenerating ? <div className="flex gap-1"><div className="loading-dot"/><div className="loading-dot"/><div className="loading-dot"/></div> : <><Sparkles size={16}/>{t.generate}</>}
          </button>
        </div>
        {renderAIField('s4', 'design', lang === 'zh' ? '研究設計' : 'Research Design')}
        {renderAIField('s4', 'collection', lang === 'zh' ? '數據收集' : 'Data Collection')}
        {renderAIField('s4', 'measurement', lang === 'zh' ? '測量指標' : 'Measurement')}
        {renderAIField('s4', 'analysis', lang === 'zh' ? '分析方法' : 'Analysis Plan')}
      </div>
    </div>,

    // Step 5: Findings
    <div key={4}>
      <div className="card mb-6">
        <h3 className="text-xs font-bold text-ink-light uppercase tracking-widest mb-4">Results Summary</h3>
        {renderInputField('s5', 'results_input', lang === 'zh' ? '結果數據摘要' : 'Results Data Summary', 'textarea', 'e.g. Beta=0.45, p<0.01 for H1...')}
      </div>
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold text-ink-light uppercase tracking-widest">AI interpretation</h3>
          <button 
            data-step="5"
            onClick={() => handleGenerate('s5')} 
            disabled={isGenerating} 
            className="btn-primary generate-btn"
          >
            {isGenerating ? <div className="flex gap-1"><div className="loading-dot"/><div className="loading-dot"/><div className="loading-dot"/></div> : <><Sparkles size={16}/>{t.generate}</>}
          </button>
        </div>
        {renderAIField('s5', 'findings', lang === 'zh' ? '正式研究發現' : 'Formal Findings')}
        {renderAIField('s5', 'interpretation', lang === 'zh' ? '結果解讀' : 'Interpretation')}
      </div>
    </div>,

    // Step 6: Discussion
    <div key={5}>
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold text-ink-light uppercase tracking-widest">AI Discussion</h3>
          <button 
            data-step="6"
            onClick={() => handleGenerate('s6')} 
            disabled={isGenerating} 
            className="btn-primary generate-btn"
          >
            {isGenerating ? <div className="flex gap-1"><div className="loading-dot"/><div className="loading-dot"/><div className="loading-dot"/></div> : <><Sparkles size={16}/>{t.generate}</>}
          </button>
        </div>
        {renderAIField('s6', 'theoretical', lang === 'zh' ? '理論貢獻' : 'Theoretical Contributions')}
        {renderAIField('s6', 'practical', lang === 'zh' ? '實踐啟示' : 'Practical Implications')}
        {renderAIField('s6', 'managerial', lang === 'zh' ? '管理建議' : 'Managerial Insights')}
      </div>
    </div>,

    // Step 7: Conclusion
    <div key={6}>
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold text-ink-light uppercase tracking-widest">AI Conclusion</h3>
          <button 
            data-step="7"
            onClick={() => handleGenerate('s7')} 
            disabled={isGenerating} 
            className="btn-primary generate-btn"
          >
            {isGenerating ? <div className="flex gap-1"><div className="loading-dot"/><div className="loading-dot"/><div className="loading-dot"/></div> : <><Sparkles size={16}/>{t.generate}</>}
          </button>
        </div>
        {renderAIField('s7', 'summary', lang === 'zh' ? '貢獻總結' : 'Summary of Contributions')}
        {renderAIField('s7', 'limitations', lang === 'zh' ? '研究限制' : 'Limitations')}
        {renderAIField('s7', 'future', lang === 'zh' ? '未來方向' : 'Future Research')}
      </div>
    </div>,

    // Step 8: Title & Abstract
    <div key={7}>
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold text-ink-light uppercase tracking-widest">AI Final Framing</h3>
          <button 
            data-step="8"
            onClick={() => handleGenerate('s8')} 
            disabled={isGenerating} 
            className="btn-primary generate-btn"
          >
            {isGenerating ? <div className="flex gap-1"><div className="loading-dot"/><div className="loading-dot"/><div className="loading-dot"/></div> : <><Sparkles size={16}/>{t.generate}</>}
          </button>
        </div>
        {renderAIField('s8', 'title', lang === 'zh' ? '學術標題' : 'Academic Title')}
        {renderAIField('s8', 'abstract', lang === 'zh' ? '結構化摘要' : 'Structured Abstract')}
        {renderAIField('s8', 'keywords', lang === 'zh' ? '檢索關鍵字' : 'Search Keywords')}
      </div>
    </div>,

    // Final Preview & Download Step
    <div key={8} className="max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-sage-light rounded-full flex items-center justify-center mx-auto mb-4 text-sage">
          <FileText size={32} />
        </div>
        <h2 className="text-2xl font-serif font-bold text-ink mb-2">{t.preview}</h2>
        <p className="text-ink-mid">{lang === 'zh' ? '您的學術論文草稿已準備就緒。' : 'Your academic paper draft is ready for export.'}</p>
      </div>

      <div className="card bg-[#F9F7F2] border-[#E2DDD5] border-2 border-dashed p-8 mb-8 overflow-y-auto max-h-[400px]">
        <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-ink-mid">
          {generateFinalPaper()}
        </pre>
      </div>

      <div className="flex flex-col gap-3">
        <button 
          onClick={downloadReport}
          className="btn-primary w-full justify-center py-4 text-base shadow-lg shadow-sage/20"
        >
          <Download size={20} />
          {t.download}
        </button>
        <button 
          onClick={() => setCurrentStep(0)}
          className="btn-secondary w-full justify-center"
        >
          {lang === 'zh' ? '回頭修改' : 'Go back and edit'}
        </button>
      </div>
    </div>
  ];

  const currentStepInfo = Object.values(t.steps)[currentStep];

  return (
    <div className="flex min-h-screen bg-cream selection:bg-sage-light selection:text-sage">
      <Sidebar 
        currentStep={currentStep} 
        completedSteps={completedSteps} 
        setCurrentStep={setCurrentStep}
        lang={lang} 
      />

      <main className="flex-1 overflow-y-auto px-12 py-12 flex flex-col items-center relative">
        {isGenerating && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center pointer-events-none">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-8 rounded-2xl shadow-xl border border-sage/20 flex flex-col items-center gap-4"
            >
              <div className="flex gap-2">
                <div className="loading-dot w-3 h-3" />
                <div className="loading-dot w-3 h-3 [animation-delay:0.2s]" />
                <div className="loading-dot w-3 h-3 [animation-delay:0.4s]" />
              </div>
              <p className="text-sage font-serif italic text-sm animate-pulse">{t.loading}</p>
            </motion.div>
          </div>
        )}
        <div className="w-full max-w-3xl">
          {/* Header */}
          <header className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <div className="bg-sage-light text-sage text-[10px] font-bold px-2 py-1 rounded-full border border-sage/20 tracking-tighter uppercase">
                {t.step} {currentStep + 1} {t.of} 9
              </div>
              <button 
                onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')}
                className="flex items-center gap-1.5 text-xs font-medium text-ink-light hover:text-ink transition-colors"
              >
                <Languages size={14} />
                {lang === 'zh' ? 'ENGLISH' : '繁體中文'}
              </button>
            </div>
            
            <button 
              onClick={() => {
                setCompletedSteps(prev => new Set(prev).add(currentStep));
                alert('Progress saved to local browser storage.');
              }}
              className="btn-secondary scale-90"
            >
              <Save size={14} />
              {t.save}
            </button>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-serif font-bold text-ink mb-1">{currentStepInfo.label}</h2>
                <p className="text-ink-mid text-sm">{currentStepInfo.sub}</p>
              </div>

              {stepsContent[currentStep] || (
                <div className="card text-center py-12">
                  <p className="text-ink-light italic">More steps coming soon in this refactor...</p>
                </div>
              )}

              {/* Nav Buttons */}
              <div className="mt-8 pt-8 border-t border-border flex items-center justify-between">
                <button 
                  onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
                  disabled={currentStep === 0}
                  className="btn-secondary"
                >
                  <ChevronLeft size={16} />
                  {t.prev}
                </button>
                <button 
                  onClick={() => {
                    const next = Math.min(8, currentStep + 1);
                    setCompletedSteps(prev => new Set(prev).add(currentStep));
                    setCurrentStep(next);
                  }}
                  className="btn-primary"
                >
                  {t.next}
                  <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

