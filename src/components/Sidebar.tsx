/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon, CheckCircle2, Circle } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';

interface SidebarProps {
  currentStep: number;
  completedSteps: Set<number>;
  setCurrentStep: (s: number) => void;
  lang: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentStep, completedSteps, setCurrentStep, lang }) => {
  const t = TRANSLATIONS[lang];
  const steps = Object.values(t.steps);

  return (
    <aside className="w-64 bg-[#F5F3EE] border-r border-[#E2DDD5] flex flex-col sticky top-0 h-screen overflow-y-auto shrink-0">
      <div className="p-6 border-bottom border-[#E2DDD5]">
        <h1 className="font-serif text-lg font-semibold text-[#1C1C1A] leading-tight">{t.appName}</h1>
        <p className="text-xs text-[#8A8A85] mt-1">{t.appSub}</p>
      </div>

      <div className="p-4 border-b border-[#E2DDD5] flex items-center gap-3">
        <div className="flex-1 h-1 bg-[#E2DDD5] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#4A6741] transition-all duration-500" 
            style={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
          />
        </div>
        <span className="text-[10px] text-[#8A8A85] whitespace-nowrap">
          {completedSteps.size} / {steps.length}
        </span>
      </div>

      <nav className="flex-1 py-4">
        {steps.map((st, i) => {
          const isActive = currentStep === i;
          const isDone = completedSteps.has(i);
          return (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`w-full flex items-start gap-3 px-5 py-3 transition-colors text-left group
                ${isActive ? 'bg-[#E8EFE7]' : 'hover:bg-[#4A6741]/5'}`}
            >
              <div className={`mt-1 shrink-0 ${isDone ? 'text-[#4A6741]' : isActive ? 'text-[#4A6741]' : 'text-[#8A8A85]'}`}>
                {isDone ? <CheckCircle2 size={18} /> : <Circle size={18} />}
              </div>
              <div>
                <div className={`text-sm font-medium ${isActive ? 'text-[#1C1C1A]' : 'text-[#4A4A47]'}`}>
                  {st.label}
                </div>
                <div className="text-[11px] text-[#8A8A85] leading-snug">
                  {st.sub}
                </div>
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
