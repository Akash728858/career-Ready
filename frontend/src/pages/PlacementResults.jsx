import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { placementPrepApi } from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import {
  ArrowLeft,
  Calendar,
  ListChecks,
  Target,
  MessageCircle,
  Copy,
  Download,
  Lightbulb,
  Building2,
  GitBranch,
} from 'lucide-react';

const SKILL_KEYS = ['coreCS', 'languages', 'web', 'data', 'cloud', 'testing', 'other'];
const SKILL_LABELS = { coreCS: 'Core CS', languages: 'Languages', web: 'Web', data: 'Data', cloud: 'Cloud/DevOps', testing: 'Testing', other: 'Other' };
const CONF = { know: 'know', practice: 'practice' };
const SCORE_DELTA_KNOW = 2;
const SCORE_DELTA_PRACTICE = -2;
const CONFIDENCE_STORAGE_KEY = 'placement_prep_confidence';

function getAllSkills(extractedSkills) {
  const list = [];
  if (!extractedSkills) return list;
  const cats = extractedSkills.categories || extractedSkills;
  for (const key of SKILL_KEYS) {
    const arr = Array.isArray(cats[key]) ? cats[key] : (cats[key]?.skills || []);
    if (arr?.length) for (const s of arr) { if (s && !list.includes(s)) list.push(s); }
  }
  const all = extractedSkills.all || [];
  for (const s of all) { if (s && !list.includes(s)) list.push(s); }
  return list;
}

function getExtractedByKey(extractedSkills) {
  const out = {};
  const cats = extractedSkills?.categories || extractedSkills || {};
  for (const key of SKILL_KEYS) {
    const arr = Array.isArray(cats[key]) ? cats[key] : (cats[key]?.skills || []);
    if (arr?.length) out[key] = arr;
  }
  return out;
}

function computeLiveScore(baseScore, skillConfidenceMap, allSkills) {
  let score = Number(baseScore) || 0;
  for (const skill of allSkills) {
    const v = skillConfidenceMap[skill];
    if (v === CONF.know) score += SCORE_DELTA_KNOW;
    else score += SCORE_DELTA_PRACTICE;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

function loadSkillConfidence(id) {
  try {
    const raw = localStorage.getItem(`${CONFIDENCE_STORAGE_KEY}_${id}`);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveSkillConfidence(id, map) {
  try {
    localStorage.setItem(`${CONFIDENCE_STORAGE_KEY}_${id}`, JSON.stringify(map));
  } catch {}
}

export default function PlacementResults() {
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [skillConfidenceMap, setSkillConfidenceMap] = useState({});
  const [copyFeedback, setCopyFeedback] = useState('');

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    placementPrepApi.get(id)
      .then((e) => {
        setEntry(e);
        setSkillConfidenceMap(loadSkillConfidence(id));
      })
      .catch(() => {
        setEntry(null);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const extractedByKey = useMemo(() => getExtractedByKey(entry?.extractedSkills), [entry?.extractedSkills]);
  const allSkills = useMemo(() => getAllSkills(entry?.extractedSkills), [entry?.extractedSkills]);
  const baseScore = Number(entry?.readinessScore ?? entry?.baseScore) || 0;
  const liveScore = useMemo(
    () => computeLiveScore(baseScore, skillConfidenceMap, allSkills),
    [baseScore, skillConfidenceMap, allSkills]
  );

  function setSkillConfidence(skill, value) {
    const next = { ...skillConfidenceMap, [skill]: value };
    setSkillConfidenceMap(next);
    saveSkillConfidence(id, next);
  }

  function copyToClipboard(text, label) {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopyFeedback(`Copied: ${label}`);
        setTimeout(() => setCopyFeedback(''), 2000);
      },
      () => setCopyFeedback('Copy failed')
    );
  }

  const plan7Days = entry?.plan7Days ?? entry?.plan ?? [];
  const checklist = entry?.checklist ?? [];
  const questions = entry?.questions ?? [];
  let roundMappingDisplay = entry?.roundMapping || [];
  if (roundMappingDisplay.length && !roundMappingDisplay[0]?.roundTitle && roundMappingDisplay[0]?.title) {
    roundMappingDisplay = roundMappingDisplay.map((r) => ({
      roundTitle: r.roundTitle ?? r.title,
      focusAreas: Array.isArray(r.focusAreas) ? r.focusAreas : (r.description ? [r.description] : []),
      whyItMatters: r.whyItMatters ?? '',
    }));
  }

  function getExportText() {
    const parts = [];
    if (entry?.company || entry?.role) {
      parts.push([entry.company, entry.role].filter(Boolean).join(' · '));
      parts.push('');
    }
    parts.push('--- Round-wise checklist ---');
    for (const round of checklist) {
      parts.push(round.roundTitle ?? round.round ?? '');
      for (const item of round.items || []) parts.push(`  • ${item}`);
      parts.push('');
    }
    parts.push('--- 7-day plan ---');
    for (const day of plan7Days) {
      parts.push(day.focus ?? day.title ?? '');
      for (const item of day.tasks || day.items || []) parts.push(`  • ${item}`);
      parts.push('');
    }
    parts.push('--- 10 likely interview questions ---');
    questions.forEach((q, i) => parts.push(`${i + 1}. ${q}`));
    return parts.join('\n');
  }

  function handleCopyPlan() {
    const lines = [];
    for (const day of plan7Days) {
      lines.push(day.focus ?? day.title ?? '');
      for (const item of day.tasks || day.items || []) lines.push(`  • ${item}`);
      lines.push('');
    }
    copyToClipboard(lines.join('\n').trim(), '7-day plan');
  }

  function handleCopyChecklist() {
    const lines = [];
    for (const round of checklist) {
      lines.push(round.roundTitle ?? round.round ?? '');
      for (const item of round.items || []) lines.push(`  • ${item}`);
      lines.push('');
    }
    copyToClipboard(lines.join('\n').trim(), 'Round checklist');
  }

  function handleCopyQuestions() {
    const text = questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
    copyToClipboard(text, '10 questions');
  }

  function handleDownloadTxt() {
    const blob = new Blob([getExportText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `placement-prep-${entry?.company || 'analysis'}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const practiceSkills = useMemo(() => {
    return allSkills.filter((s) => (skillConfidenceMap[s] ?? CONF.practice) === CONF.practice).slice(0, 3);
  }, [allSkills, skillConfidenceMap]);

  const companyIntelDisplay = entry?.companyIntel;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (liveScore / 100) * circumference;
  const sizeLabel = companyIntelDisplay?.sizeCategory === 'enterprise' ? 'Enterprise (2000+)' : companyIntelDisplay?.sizeCategory === 'mid-size' ? 'Mid-size (200–2000)' : 'Startup (<200)';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  if (notFound || !entry) {
    return (
      <div className="space-y-6">
        <Link to="/dashboard/placement/analyze" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Analyze
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-600">
              {id ? 'This analysis could not be found.' : 'No analysis found. Run an analysis from the Analyze page.'}
            </p>
            <Link
              to="/dashboard/placement/analyze"
              className="inline-flex items-center justify-center mt-4 px-4 py-2 rounded-lg font-medium text-white bg-primary hover:opacity-90"
            >
              Analyze a JD
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { company, role, createdAt } = entry;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to="/dashboard/placement/history" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" />
          History
        </Link>
        <span className="text-sm text-slate-500">
          {createdAt ? new Date(createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : ''}
          {company && ` · ${company}`}
          {role && ` · ${role}`}
        </span>
      </div>

      {company && companyIntelDisplay && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" strokeWidth={2} />
              Company intel
            </CardTitle>
            <CardDescription>Heuristic estimate from company name and JD. Not from external data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500 block mb-0.5">Company</span>
                <span className="font-medium text-slate-900">{companyIntelDisplay.companyName}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Industry</span>
                <span className="font-medium text-slate-900">{companyIntelDisplay.industry}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Estimated size</span>
                <span className="font-medium text-slate-900">{sizeLabel}</span>
              </div>
            </div>
            <div>
              <span className="text-slate-500 text-sm block mb-1">Typical hiring focus</span>
              <p className="text-slate-700 text-sm leading-relaxed">{companyIntelDisplay.typicalHiringFocus}</p>
            </div>
            <p className="text-xs text-slate-500 pt-1 border-t border-slate-100">Demo Mode: Company intel generated heuristically.</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Readiness Score</CardTitle>
          <CardDescription>Updates with your skill self-assessment below</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="relative w-44 h-44">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-200" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="text-primary transition-[stroke-dashoffset] duration-300 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-slate-900">
                {liveScore}
                <span className="text-lg font-medium text-slate-500">/100</span>
              </span>
              <span className="text-sm text-slate-500 mt-0.5">Readiness Score</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {Object.keys(extractedByKey).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" strokeWidth={2} />
              Key skills extracted
            </CardTitle>
            <CardDescription>Mark each skill. Score updates in real time and is saved to history.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {SKILL_KEYS.map((key) => {
                const skills = extractedByKey[key];
                if (!Array.isArray(skills) || skills.length === 0) return null;
                return (
                  <div key={key} className="space-y-1.5">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{SKILL_LABELS[key]}</span>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => {
                        const value = skillConfidenceMap[skill] ?? CONF.practice;
                        const isKnow = value === CONF.know;
                        return (
                          <div key={skill} className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50/50 px-2.5 py-1.5">
                            <span className="text-sm font-medium text-slate-900">{skill}</span>
                            <div className="flex rounded border border-slate-200 overflow-hidden">
                              <button
                                type="button"
                                onClick={() => setSkillConfidence(skill, CONF.know)}
                                className={`px-2 py-0.5 text-xs font-medium transition-colors ${isKnow ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                              >
                                I know this
                              </button>
                              <button
                                type="button"
                                onClick={() => setSkillConfidence(skill, CONF.practice)}
                                className={`px-2 py-0.5 text-xs font-medium transition-colors ${!isKnow ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                              >
                                Need practice
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {roundMappingDisplay?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-primary" strokeWidth={2} />
              Round mapping
            </CardTitle>
            <CardDescription>Expected interview flow based on company size and detected skills</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {roundMappingDisplay.map((round, idx) => (
                <div key={idx} className="flex gap-4 pb-6 last:pb-0">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      {idx + 1}
                    </div>
                    {idx < roundMappingDisplay.length - 1 && (
                      <div className="w-0.5 flex-1 min-h-[24px] bg-slate-200 my-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <h4 className="font-semibold text-slate-900">{round.roundTitle ?? round.title}</h4>
                    {(round.focusAreas || (round.description ? [round.description] : [])).map((area, i) => (
                      <p key={i} className="text-sm text-slate-600 mt-0.5">{area}</p>
                    ))}
                    {round.whyItMatters && (
                      <p className="text-xs text-slate-500 mt-2 italic">Why this round matters: {round.whyItMatters}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-primary" strokeWidth={2} />
            Round-wise preparation checklist
          </CardTitle>
          <CardDescription>Template-based items adapted to detected skills</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {checklist.map((round, idx) => (
            <div key={idx}>
              <h4 className="font-semibold text-slate-900 mb-2">{round.roundTitle ?? round.round}</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600 text-sm">
                {(round.items || []).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" strokeWidth={2} />
            7-day plan
          </CardTitle>
          <CardDescription>Adapted to detected skills</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {plan7Days.map((day, idx) => (
            <div key={day.day ?? idx}>
              <h4 className="font-semibold text-slate-900 mb-1.5">{day.focus ?? day.title}</h4>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-sm">
                {(day.tasks || day.items || []).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" strokeWidth={2} />
            10 likely interview questions
          </CardTitle>
          <CardDescription>Based on detected skills</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-slate-700">
            {questions.map((q, i) => (
              <li key={i} className="pl-1">{q}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export</CardTitle>
          <CardDescription>Copy or download this analysis as plain text</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopyPlan}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <Copy className="w-4 h-4" strokeWidth={2} />
            Copy 7-day plan
          </button>
          <button
            type="button"
            onClick={handleCopyChecklist}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <Copy className="w-4 h-4" strokeWidth={2} />
            Copy round checklist
          </button>
          <button
            type="button"
            onClick={handleCopyQuestions}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <Copy className="w-4 h-4" strokeWidth={2} />
            Copy 10 questions
          </button>
          <button
            type="button"
            onClick={handleDownloadTxt}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4" strokeWidth={2} />
            Download as TXT
          </button>
          {copyFeedback && <span className="inline-flex items-center text-sm text-slate-500 ml-2">{copyFeedback}</span>}
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Lightbulb className="w-5 h-5 text-primary" strokeWidth={2} />
            Action next
          </CardTitle>
          <CardDescription>Focus areas and suggested next step</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {practiceSkills.length > 0 ? (
            <>
              <p className="text-sm font-medium text-slate-700">Top weak areas (need practice):</p>
              <ul className="list-disc list-inside text-slate-600 text-sm">
                {practiceSkills.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-slate-600">All listed skills are marked as known. Keep revising and run mocks.</p>
          )}
          <p className="text-sm font-medium text-slate-900 pt-1">Start Day 1 plan now.</p>
        </CardContent>
      </Card>
    </div>
  );
}
