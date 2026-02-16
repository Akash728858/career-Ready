/**
 * JD Analysis - checklist, 7-day plan, questions, readiness score
 */
import { extractSkills } from './skillExtraction.js';
import { getCompanyIntel } from './companyIntel.js';
import { getRoundMapping } from './roundMapping.js';

const ROUND_TEMPLATES = {
  round1: { title: 'Round 1: Aptitude / Basics', base: ['Revise quantitative aptitude.', 'Practice logical reasoning.', 'Review verbal ability.'] },
  round2: { title: 'Round 2: DSA + Core CS', base: ['Revise arrays, strings.', 'Practice trees and graphs.', 'Solve 2–3 medium problems daily.'] },
  round3: { title: 'Round 3: Tech interview', base: ['Prepare 2–3 project deep-dives.', 'Align resume with JD keywords.', 'Prepare STAR examples.'] },
  round4: { title: 'Round 4: Managerial / HR', base: ['Prepare "Tell me about yourself".', 'List strengths and weaknesses.', 'Prepare questions to ask.'] },
};

const DAY_TEMPLATES = [
  { day: 1, title: 'Day 1–2: Basics', base: ['Aptitude practice (30 min).', 'Revise OS, DBMS.'] },
  { day: 2, title: 'Day 3–4: DSA', base: ['Solve 3–4 problems.', 'Revise recursion and DP.'] },
  { day: 3, title: 'Day 5: Projects', base: ['Document 2 projects.', 'Align resume with JD.'] },
  { day: 4, title: 'Day 6: Mock', base: ['Practice behavioral questions.', 'Mock tech round.'] },
  { day: 5, title: 'Day 7: Revision', base: ['Revise weak topics.', 'Rest before interview.'] },
];

const QUESTION_TEMPLATES = [
  { trigger: 'SQL', question: 'Explain indexing in databases.' },
  { trigger: 'React', question: 'Explain state management in React.' },
  { trigger: 'DSA', question: 'How would you optimize search in sorted data?' },
  { trigger: 'Node.js', question: 'How does the Node.js event loop work?' },
  { trigger: 'Docker', question: 'Difference between Docker image and container?' },
  { trigger: 'DBMS', question: 'Explain ACID properties.' },
  { trigger: 'OS', question: 'Process vs thread.' },
  { trigger: 'System Design', question: 'Design a URL shortener.' },
  { trigger: 'Java', question: 'Difference between equals() and == in Java.' },
  { trigger: 'Python', question: 'List vs tuple.' },
  { trigger: 'JavaScript', question: 'Explain closures.' },
];

function generateChecklist(extracted) {
  return Object.entries(ROUND_TEMPLATES).map(([, t]) => ({ round: t.title, items: t.base || [] }));
}

function generate7DayPlan(extracted) {
  return DAY_TEMPLATES.map(t => ({ day: t.day, title: t.title, items: t.base || [] }));
}

function generateQuestions(extracted) {
  const all = (extracted.all || []).map(s => s.toLowerCase());
  const selected = [];
  const used = new Set();
  for (const { trigger, question } of QUESTION_TEMPLATES) {
    const tl = trigger.toLowerCase();
    if (all.some(s => s.includes(tl) || tl.includes(s)) && !used.has(question)) {
      used.add(question);
      selected.push(question);
    }
    if (selected.length >= 10) break;
  }
  const fallback = ['Walk me through your resume.', 'Describe a difficult technical problem.', 'How do you stay updated?'];
  for (const q of fallback) {
    if (selected.length >= 10) break;
    if (!used.has(q)) selected.push(q);
  }
  return selected.slice(0, 10);
}

export function calculateReadinessScore(extracted, { company = '', role = '', jdText = '' }) {
  let score = 35;
  const cats = extracted.categories || {};
  score += Math.min(Object.keys(cats).filter(k => k !== 'general').length * 5, 30);
  if (company?.trim()) score += 10;
  if (role?.trim()) score += 10;
  if (jdText?.trim().length > 800) score += 10;
  return Math.min(100, Math.max(0, score));
}

export function runAnalysis(jdText, company = '', role = '') {
  const extracted = extractSkills(jdText);
  const checklist = generateChecklist(extracted);
  const plan = generate7DayPlan(extracted);
  const questions = generateQuestions(extracted);
  const readinessScore = calculateReadinessScore(extracted, { company, role, jdText });
  const companyIntel = company?.trim() ? getCompanyIntel(company.trim(), extracted, jdText) : null;
  const roundMapping = getRoundMapping(companyIntel?.sizeCategory ?? 'startup', extracted);
  return {
    extractedSkills: extracted,
    checklist,
    plan,
    questions,
    readinessScore,
    companyIntel,
    roundMapping,
  };
}
