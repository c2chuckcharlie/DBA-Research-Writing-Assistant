/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'en' | 'zh';

export interface ResearchState {
  s1: { topic: string; context: string; journal: string; problem: string; objectives: string; questions: string };
  s2: { keywords: string; references: string; themes: string; theories: string; gaps: string };
  s3: { independent: string; dependent: string; mediators: string; moderators: string; model: string; hypotheses: string };
  s4: { method: string; sample: string; datasource: string; design: string; collection: string; measurement: string; analysis: string };
  s5: { results_input: string; findings: string; interpretation: string };
  s6: { theoretical: string; practical: string; managerial: string };
  s7: { summary: string; limitations: string; future: string };
  s8: { title: string; abstract: string; keywords: string };
}

export const INITIAL_STATE: ResearchState = {
  s1: { topic: '', context: '', journal: '', problem: '', objectives: '', questions: '' },
  s2: { keywords: '', references: '', themes: '', theories: '', gaps: '' },
  s3: { independent: '', dependent: '', mediators: '', moderators: '', model: '', hypotheses: '' },
  s4: { method: 'quantitative', sample: '', datasource: '', design: '', collection: '', measurement: '', analysis: '' },
  s5: { results_input: '', findings: '', interpretation: '' },
  s6: { theoretical: '', practical: '', managerial: '' },
  s7: { summary: '', limitations: '', future: '' },
  s8: { title: '', abstract: '', keywords: '' },
};
