import { create } from "zustand";
import { avatarUrl, initialProjects, initialUsers } from "./mock-data";
import type {
  CreateProjectInput,
  Project,
  Skill,
  Student,
  StudentStatus,
  TeamMember,
  User,
} from "./types";

interface AppState {
  users: User[];
  projects: Project[];
  activeUserId: string;
  teamDrafts: Record<string, TeamMember[]>;

  setActiveUser: (id: string) => void;
  registerUser: (role: "student" | "teacher", name: string) => string;
  updateStudentProfile: (
    studentId: string,
    updates: Partial<
      Pick<Student, "bio" | "portfolio" | "skills" | "weaknesses" | "status">
    >,
  ) => void;
  createProject: (teacherId: string, input: CreateProjectInput) => string;
  initTeamDraft: (projectId: string) => void;
  addTeamMember: (projectId: string, studentId: string, role: string) => void;
  removeTeamMember: (projectId: string, studentId: string) => void;
  updateTeamMemberRole: (
    projectId: string,
    studentId: string,
    role: string,
  ) => void;
  saveTeam: (projectId: string) => void;
  deleteProject: (projectId: string) => void;
  deleteUser: (userId: string) => void;
  blockUser: (userId: string, reason: string) => void;

  getActiveUser: () => User | undefined;
  getStudents: () => Student[];
  getAvailableStudents: () => Student[];
  getTeacherProjects: (teacherId: string) => Project[];
  getStudentProjects: (studentId: string) => Array<{
    project: Project;
    role: string;
  }>;
}

function releaseTeamStudents(
  users: User[],
  team: TeamMember[],
): User[] {
  const studentIds = new Set(team.map((member) => member.studentId));
  return users.map((user) => {
    if (user.role === "student" && studentIds.has(user.id)) {
      return { ...user, status: "available" as StudentStatus };
    }
    return user;
  });
}

function markStudentsBusy(users: User[], team: TeamMember[]): User[] {
  const studentIds = new Set(team.map((member) => member.studentId));
  return users.map((user) => {
    if (user.role === "student" && studentIds.has(user.id)) {
      return { ...user, status: "busy" as StudentStatus };
    }
    return user;
  });
}

let userCounter = 0;

export const useAppStore = create<AppState>((set, get) => ({
  users: initialUsers,
  projects: initialProjects,
  activeUserId: "teacher-1",
  teamDrafts: {},

  setActiveUser: (id) => set({ activeUserId: id }),

  registerUser: (role, name) => {
    userCounter += 1;
    const id = `${role}-new-${userCounter}`;

    const newUser: User =
      role === "student"
        ? {
            id,
            role: "student",
            name,
            avatar: avatarUrl(id),
            status: "available",
            bio: "",
            portfolio: [],
            skills: [],
            weaknesses: [],
          }
        : {
            id,
            role: "teacher",
            name,
            avatar: avatarUrl(id),
          };

    set((state) => ({
      users: [...state.users, newUser],
      activeUserId: id,
    }));

    return id;
  },

  updateStudentProfile: (studentId, updates) => {
    set((state) => ({
      users: state.users.map((user) =>
        user.id === studentId && user.role === "student"
          ? { ...user, ...updates }
          : user,
      ),
    }));
  },

  createProject: (teacherId, input) => {
    const id = `project-new-${Date.now()}`;
    const project: Project = {
      id,
      teacherId,
      title: input.title,
      description: input.description,
      budget: input.budget,
      deadline: input.deadline,
      status: "draft",
      requirements: input.requirements,
      team: [],
    };

    set((state) => ({
      projects: [...state.projects, project],
    }));

    return id;
  },

  initTeamDraft: (projectId) => {
    const project = get().projects.find((item) => item.id === projectId);
    if (!project) return;

    set((state) => ({
      teamDrafts: {
        ...state.teamDrafts,
        [projectId]: [...project.team],
      },
    }));
  },

  addTeamMember: (projectId, studentId, role) => {
    set((state) => {
      const draft = state.teamDrafts[projectId] ?? [];
      if (draft.some((member) => member.studentId === studentId)) {
        return state;
      }
      return {
        teamDrafts: {
          ...state.teamDrafts,
          [projectId]: [...draft, { studentId, role }],
        },
      };
    });
  },

  removeTeamMember: (projectId, studentId) => {
    set((state) => ({
      teamDrafts: {
        ...state.teamDrafts,
        [projectId]: (state.teamDrafts[projectId] ?? []).filter(
          (member) => member.studentId !== studentId,
        ),
      },
    }));
  },

  updateTeamMemberRole: (projectId, studentId, role) => {
    set((state) => ({
      teamDrafts: {
        ...state.teamDrafts,
        [projectId]: (state.teamDrafts[projectId] ?? []).map((member) =>
          member.studentId === studentId ? { ...member, role } : member,
        ),
      },
    }));
  },

  saveTeam: (projectId) => {
    const state = get();
    const draft = state.teamDrafts[projectId];
    const project = state.projects.find((item) => item.id === projectId);
    if (!draft || !project) return;

    const previousTeamIds = new Set(project.team.map((m) => m.studentId));
    const newTeamIds = new Set(draft.map((m) => m.studentId));

    let users = state.users;

    const removedIds = [...previousTeamIds].filter((id) => !newTeamIds.has(id));
    if (removedIds.length > 0) {
      users = users.map((user) =>
        user.role === "student" && removedIds.includes(user.id)
          ? { ...user, status: "available" as StudentStatus }
          : user,
      );
    }

    users = markStudentsBusy(users, draft);

    set({
      users,
      projects: state.projects.map((item) =>
        item.id === projectId
          ? { ...item, team: draft, status: "active" }
          : item,
      ),
      teamDrafts: {
        ...state.teamDrafts,
        [projectId]: draft,
      },
    });
  },

  deleteProject: (projectId) => {
    set((state) => {
      const project = state.projects.find((item) => item.id === projectId);
      if (!project) return state;

      const restDrafts = { ...state.teamDrafts };
      delete restDrafts[projectId];

      return {
        users: releaseTeamStudents(state.users, project.team),
        projects: state.projects.filter((item) => item.id !== projectId),
        teamDrafts: restDrafts,
      };
    });
  },

  deleteUser: (userId) => {
    set((state) => {
      const userProjects = state.projects.filter(
        (project) =>
          project.team.some((member) => member.studentId === userId) ||
          project.teacherId === userId,
      );

      let users = state.users.filter((user) => user.id !== userId);
      let projects = state.projects;

      for (const project of userProjects) {
        if (project.teacherId === userId) {
          users = releaseTeamStudents(users, project.team);
          projects = projects.filter((item) => item.id !== project.id);
        } else {
          const updatedTeam = project.team.filter(
            (member) => member.studentId !== userId,
          );
          users = releaseTeamStudents(
            users,
            project.team.filter((member) => member.studentId === userId),
          );
          projects = projects.map((item) =>
            item.id === project.id ? { ...item, team: updatedTeam } : item,
          );
        }
      }

      const activeUserId =
        state.activeUserId === userId
          ? (users[0]?.id ?? state.activeUserId)
          : state.activeUserId;

      return { users, projects, activeUserId };
    });
  },

  blockUser: (userId, reason) => {
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId ? { ...user, blocked: true, blockReason: reason } : user,
      ),
    }));
  },

  getActiveUser: () => get().users.find((user) => user.id === get().activeUserId),

  getStudents: () =>
    get().users.filter((user): user is Student => user.role === "student"),

  getAvailableStudents: () =>
    get()
      .users.filter(
        (user): user is Student =>
          user.role === "student" &&
          user.status === "available" &&
          !user.blocked,
      ),

  getTeacherProjects: (teacherId) =>
    get().projects.filter((project) => project.teacherId === teacherId),

  getStudentProjects: (studentId) => {
    const results: Array<{ project: Project; role: string }> = [];
    for (const project of get().projects) {
      const member = project.team.find((item) => item.studentId === studentId);
      if (member) {
        results.push({ project, role: member.role });
      }
    }
    return results;
  },
}));

export function isStudent(user: User): user is Student {
  return user.role === "student";
}

export const SKILL_LEVELS = [1, 2, 3, 4, 5] as const;

export function emptySkill(): Skill {
  return { name: "", level: 1 };
}
