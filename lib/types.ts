export type SkillLevel = 1 | 2 | 3 | 4 | 5;

export type Role = "student" | "teacher" | "admin";

export type StudentStatus = "available" | "busy";

export type ProjectStatus = "draft" | "active" | "completed";

export interface Skill {
  name: string;
  level: SkillLevel;
}

export interface BaseUser {
  id: string;
  name: string;
  avatar: string;
  blocked?: boolean;
  blockReason?: string;
}

export interface Student extends BaseUser {
  role: "student";
  status: StudentStatus;
  bio: string;
  portfolio: string[];
  skills: Skill[];
  weaknesses: Skill[];
}

export interface Teacher extends BaseUser {
  role: "teacher";
}

export interface Admin extends BaseUser {
  role: "admin";
}

export type User = Student | Teacher | Admin;

export interface ProjectRequirement {
  skillName: string;
  minLevel: SkillLevel;
}

export interface TeamMember {
  studentId: string;
  role: string;
}

export interface Project {
  id: string;
  teacherId: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  status: ProjectStatus;
  requirements: ProjectRequirement[];
  team: TeamMember[];
}

export interface MatchDetail {
  skillName: string;
  required: SkillLevel;
  actual: SkillLevel | null;
  met: boolean;
}

export interface StudentMatchResult {
  studentId: string;
  details: MatchDetail[];
  score: number;
  coveredCount: number;
}

export interface TeamCoverageDetail {
  skillName: string;
  required: SkillLevel;
  teamLevel: SkillLevel | null;
  met: boolean;
}

export interface TeamMatchResult {
  coverage: TeamCoverageDetail[];
  allMet: boolean;
}

export interface CreateProjectInput {
  title: string;
  description: string;
  budget: number;
  deadline: string;
  requirements: ProjectRequirement[];
}
