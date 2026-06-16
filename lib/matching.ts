import type {
  ProjectRequirement,
  SkillLevel,
  Student,
  StudentMatchResult,
  TeamMatchResult,
} from "./types";

function getSkillLevel(student: Student, skillName: string): SkillLevel | null {
  const normalized = skillName.toLowerCase();
  const skill = student.skills.find(
    (item) => item.name.toLowerCase() === normalized,
  );
  return skill?.level ?? null;
}

export function matchStudentToProject(
  student: Student,
  requirements: ProjectRequirement[],
): StudentMatchResult {
  const details = requirements.map((req) => {
    const actual = getSkillLevel(student, req.skillName);
    const met = actual !== null && actual >= req.minLevel;
    return {
      skillName: req.skillName,
      required: req.minLevel,
      actual,
      met,
    };
  });

  const coveredCount = details.filter((item) => item.met).length;
  const score =
    requirements.length === 0
      ? 100
      : Math.round((coveredCount / requirements.length) * 100);

  return {
    studentId: student.id,
    details,
    score,
    coveredCount,
  };
}

export function matchTeamToProject(
  teamStudentIds: string[],
  students: Student[],
  requirements: ProjectRequirement[],
): TeamMatchResult {
  const teamStudents = students.filter((student) =>
    teamStudentIds.includes(student.id),
  );

  const coverage = requirements.map((req) => {
    const levels = teamStudents
      .map((student) => getSkillLevel(student, req.skillName))
      .filter((level): level is SkillLevel => level !== null);

    const teamLevel =
      levels.length > 0 ? (Math.max(...levels) as SkillLevel) : null;
    const met = teamLevel !== null && teamLevel >= req.minLevel;

    return {
      skillName: req.skillName,
      required: req.minLevel,
      teamLevel,
      met,
    };
  });

  return {
    coverage,
    allMet: coverage.every((item) => item.met),
  };
}

export function compareStudents(
  students: Student[],
  requirements: ProjectRequirement[],
): StudentMatchResult[] {
  return students
    .map((student) => matchStudentToProject(student, requirements))
    .sort((a, b) => b.score - a.score);
}
