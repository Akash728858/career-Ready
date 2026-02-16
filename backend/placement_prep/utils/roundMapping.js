function hasCategory(extracted, key) {
  const cat = extracted?.categories?.[key];
  return cat && Array.isArray(cat.skills) && cat.skills.length > 0;
}
function hasDSA(extracted) {
  return hasCategory(extracted, 'coreCS') || (extracted?.all || []).some(s => /dsa|algorithm|data structure/i.test(String(s)));
}
function hasWebStack(extracted) {
  return hasCategory(extracted, 'web') || hasCategory(extracted, 'languages');
}
function hasSystemDesign(extracted) {
  return (extracted?.all || []).some(s => /system design|scalability|distributed/i.test(String(s))) || hasCategory(extracted, 'cloudDevOps');
}

export function getRoundMapping(sizeCategory, extractedSkills) {
  const size = sizeCategory || 'startup';
  const hasDSAFlag = hasDSA(extractedSkills);
  const hasWeb = hasWebStack(extractedSkills);
  const hasSys = hasSystemDesign(extractedSkills);

  if (size === 'enterprise' && hasDSAFlag) {
    return [
      { roundNumber: 1, title: 'Round 1: Online Test', description: 'DSA + Aptitude.', whyItMatters: 'Screens for fundamentals.' },
      { roundNumber: 2, title: 'Round 2: Technical (DSA + Core CS)', description: 'DSA, OS, DBMS.', whyItMatters: 'Validates depth.' },
      { roundNumber: 3, title: 'Round 3: Tech + Projects', description: 'Project deep-dive.', whyItMatters: 'Shows application.' },
      { roundNumber: 4, title: 'Round 4: HR', description: 'Behavioral and fit.', whyItMatters: 'Final check.' },
    ];
  }
  if (size === 'enterprise') {
    return [
      { roundNumber: 1, title: 'Round 1: Aptitude', description: 'Aptitude and MCQs.', whyItMatters: 'First filter.' },
      { roundNumber: 2, title: 'Round 2: Technical', description: 'Core CS topics.', whyItMatters: 'Technical depth.' },
      { roundNumber: 3, title: 'Round 3: Projects', description: 'Project discussion.', whyItMatters: 'Practical experience.' },
      { roundNumber: 4, title: 'Round 4: HR', description: 'Behavioral.', whyItMatters: 'Culture fit.' },
    ];
  }
  if ((size === 'startup' || size === 'mid-size') && (hasWeb || hasSys)) {
    return [
      { roundNumber: 1, title: 'Round 1: Practical coding', description: 'Hands-on coding.', whyItMatters: 'Proves you can ship.' },
      { roundNumber: 2, title: 'Round 2: System / Design', description: 'Architecture discussion.', whyItMatters: 'Scale thinking.' },
      { roundNumber: 3, title: 'Round 3: Culture fit', description: 'Values and motivation.', whyItMatters: 'Team fit.' },
    ];
  }
  return [
    { roundNumber: 1, title: 'Round 1: Technical', description: 'Coding or problem-solving.', whyItMatters: 'Core signal.' },
    { roundNumber: 2, title: 'Round 2: Discussion', description: 'Projects and approach.', whyItMatters: 'Communication.' },
    { roundNumber: 3, title: 'Round 3: Culture fit', description: 'Values and style.', whyItMatters: 'Mutual fit.' },
  ];
}
