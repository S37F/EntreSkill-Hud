export function scoreIdeaForUser(
  userSkillIds: string[],
  userInterestIds: string[],
  ideaSkills: { skillId: string }[],
  ideaInterests: { interestId: string }[],
): number {
  const sSet = new Set(userSkillIds);
  const iSet = new Set(userInterestIds);
  let score = 0;
  for (const row of ideaSkills) {
    if (sSet.has(row.skillId)) score += 2;
  }
  for (const row of ideaInterests) {
    if (iSet.has(row.interestId)) score += 1;
  }
  return score;
}
