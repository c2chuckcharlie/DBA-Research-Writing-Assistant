/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { ResearchState, Language } from "../types";

const genAI = (() => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY') {
    console.warn("⚠️ GEMINI_API_KEY is not set. AI features will fail.");
  }
  return new GoogleGenAI({ apiKey: key || '' });
})();

function buildContext(state: ResearchState, currentStepId: string): string {
  let context = "CURRENT RESEARCH DRAFT SO FAR:\n\n";
  
  const stepOrder = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'];
  const currentIndex = stepOrder.indexOf(currentStepId);
  
  for (let i = 0; i < currentIndex; i++) {
    const sId = stepOrder[i];
    const data = state[sId as keyof ResearchState];
    context += `--- SECTION ${sId.toUpperCase()} ---\n`;
    Object.entries(data).forEach(([field, value]) => {
      if (value) context += `${field.toUpperCase()}: ${value}\n`;
    });
    context += "\n";
  }
  
  return context;
}

export async function generateAcademicContent(
  stepId: string,
  state: ResearchState,
  lang: Language
) {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
    throw new Error("Gemini API Key is missing. Please add it to your project secrets in AI Studio.");
  }
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: `You are an expert DBA (Doctor of Business Administration) advisor and academic editor. 
    Your goal is to help a student write a high-impact, peer-reviewed journal paper. 
    Maintain absolute consistency in terminology, variables, and hypotheses across all sections. 
    Use a formal, objective academic tone.`
  });
  
  const langPrompt = lang === 'zh' ? 
    "Please respond in Traditional Chinese (繁體中文). Use formal academic terminology (e.g. 變數, 中介效應, 實證分析)." : 
    "Please respond in formal Academic English (US/UK consistent).";

  const context = buildContext(state, stepId);
  const currentInputs = JSON.stringify(state[stepId as keyof ResearchState]);

  let prompt = `${langPrompt}\n\n${context}\n\n`;
  prompt += `NOW GENERATE CONTENT FOR SECTION: ${stepId.toUpperCase()}\n`;
  prompt += `USER INPUTS FOR THIS SECTION: ${currentInputs}\n\n`;
  prompt += `Ensure the new content perfectly aligns with everything in the CURRENT RESEARCH DRAFT above.\n\n`;

  switch(stepId) {
    case 's1':
      prompt += `Generate: 
      1. A formal RESEARCH PROBLEM statement. 
      2. 3-4 RESEARCH OBJECTIVES. 
      3. 3-4 specific RESEARCH QUESTIONS.
      Format: Separate these 3 sections strictly with the marker [SPLIT]`;
      break;
    case 's2':
      prompt += `Generate: 
      1. A thematic LITERATURE REVIEW. 
      2. CORE THEORIES involved. 
      3. Precise RESEARCH GAPS.
      Format: Separate these 3 sections strictly with the marker [SPLIT]`;
      break;
    case 's3':
      prompt += `Generate: 
      1. A description of the CONCEPTUAL MODEL. 
      2. Formal testable HYPOTHESES (H1, H2, etc).
      Format: Separate these 2 sections strictly with the marker [SPLIT]`;
      break;
    case 's4':
      prompt += `Generate: 
      1. RESEARCH DESIGN. 
      2. DATA COLLECTION PROCEDURE.
      3. MEASUREMENT (scaling).
      4. DATA ANALYSIS PLAN.
      Format: Separate these 4 sections strictly with the marker [SPLIT]`;
      break;
    case 's5':
      prompt += `Generate: 
      1. FINDINGS (based on results input).
      2. INTERPRETATION.
      Format: Separate these 2 sections strictly with the marker [SPLIT]`;
      break;
    case 's6':
      prompt += `Generate: 
      1. THEORETICAL CONTRIBUTIONS.
      2. PRACTICAL IMPLICATIONS.
      3. MANAGERIAL INSIGHTS.
      Format: Separate these 3 sections strictly with the marker [SPLIT]`;
      break;
    case 's7':
      prompt += `Generate: 
      1. SUMMARY OF CONTRIBUTIONS.
      2. LIMITATIONS.
      3. FUTURE RESEARCH DIRECTIONS.
      Format: Separate these 3 sections strictly with the marker [SPLIT]`;
      break;
    case 's8':
      prompt += `Generate: 
      1. One optimized ACADEMIC TITLE.
      2. A structured ABSTRACT (250 words).
      3. KEYWORDS.
      Format: Separate these 3 sections strictly with the marker [SPLIT]`;
      break;
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}
