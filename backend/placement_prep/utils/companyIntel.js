const KNOWN_ENTERPRISE = ['amazon', 'infosys', 'tcs', 'wipro', 'accenture', 'microsoft', 'google', 'meta', 'apple', 'ibm', 'oracle', 'capgemini', 'cognizant', 'dell', 'cisco', 'intel', 'sap', 'salesforce', 'adobe'];
const INDUSTRY_KEYWORDS = [
  { keywords: ['fintech', 'banking', 'finance', 'payment'], industry: 'Financial Services' },
  { keywords: ['healthcare', 'medical', 'pharma'], industry: 'Healthcare' },
  { keywords: ['ecommerce', 'retail', 'marketplace'], industry: 'E-commerce' },
  { keywords: ['saas', 'cloud', 'enterprise software'], industry: 'SaaS' },
];

export function getCompanyIntel(company, extractedSkills, jdText = '') {
  const companyName = String(company || '').trim() || 'Unknown';
  const normalized = companyName.toLowerCase();
  const combined = normalized + ' ' + (jdText || '').toLowerCase();
  let sizeCategory = normalized && KNOWN_ENTERPRISE.some(k => normalized.includes(k) || k.includes(normalized)) ? 'enterprise' : 'startup';
  let industry = 'Technology Services';
  for (const row of INDUSTRY_KEYWORDS) {
    if (row.keywords.some(kw => combined.includes(kw))) { industry = row.industry; break; }
  }
  const typicalHiringFocus = sizeCategory === 'enterprise'
    ? 'Structured process with emphasis on DSA, core CS fundamentals.'
    : 'Practical problem-solving and stack depth. Focus on projects and culture fit.';
  return { companyName, industry, sizeCategory, typicalHiringFocus };
}
