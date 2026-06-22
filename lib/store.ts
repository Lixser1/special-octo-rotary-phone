import { create } from "zustand";
import { persist } from "zustand/middleware";
import { avatarUrl, initialProjects, initialUsers, initialOrders } from "./mock-data";
import type {
  CreateProjectInput,
  Project,
  ProjectStatus,
  Skill,
  Student,
  StudentStatus,
  TeamMember,
  User,
  Chat,
  ChatMessage,
  Customer,
  Order,
  Teacher,
  TeacherStatus,
} from "./types";

interface AppState {
  users: User[];
  projects: Project[];
  activeUserId: string;
  teamDrafts: Record<string, TeamMember[]>;

  setActiveUser: (id: string) => void;
  registerUser: (
    role: "student" | "teacher" | "admin" | "customer",
    name: string,
    username?: string,
    password?: string,
  ) => string;
  updateStudentProfile: (
    studentId: string,
    updates: Partial<
      Pick<Student, "bio" | "portfolio" | "skills" | "weaknesses" | "status" | "rating" | "completedProjectIds" | "positiveReviewsCount" | "isSuperStudent">
    >,
  ) => void;
  orders: Order[];
  chats: Chat[];
  createOrder: (
    customerId: string,
    input: {
      title: string;
      description: string;
      specText?: string;
      budget: number;
      deadline: string;
      requirements: any[];
    },
  ) => string;
  respondToOrder: (orderId: string, teacherId: string) => void;
  acceptResponse: (orderId: string, teacherId: string) => void;
  getOrCreateChat: (
    orderId: string,
    customerId: string,
    teacherId: string,
  ) => Chat;
  sendChatMessage: (
    chatId: string,
    senderId: string,
    senderName: string,
    text: string,
  ) => void;
  updateTeacherProfile: (
    teacherId: string,
    updates: Partial<Pick<Teacher, "bio" | "portfolio" | "skills" | "status">>,
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
  completeProject: (studentId: string, projectId: string) => void;
  submitReview: (studentId: string, rating: number) => void;

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

function migrateUsers(users: User[]): User[] {
  return users.map((user) => {
    if (user.role === "student") {
      const student = user as Student;
      return {
        ...student,
        completedProjectIds: student.completedProjectIds ?? [],
        rating: student.rating ?? 0,
        positiveReviewsCount: student.positiveReviewsCount ?? 0,
        isSuperStudent: student.isSuperStudent ?? false,
      };
    }
    return user;
  });
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      users: migrateUsers(initialUsers),
      projects: initialProjects,
      orders: initialOrders,
      chats: [],
      activeUserId: "",
      teamDrafts: {},

      setActiveUser: (id) => set({ activeUserId: id }),

      registerUser: (role, name, username, password) => {
        userCounter += 1;
        const id = `${role}-new-${userCounter}`;

        const newUser: User =
          role === "student"
            ? {
                id,
                role: "student",
                name,
                username,
                password,
                avatar: avatarUrl(id),
                status: "available",
                bio: "",
                portfolio: [],
                skills: [],
                weaknesses: [],
                completedProjectIds: [],
                rating: 0,
                positiveReviewsCount: 0,
                isSuperStudent: false,
              }
            : role === "teacher"
            ? {
                id,
                role: "teacher",
                name,
                username,
                password,
                avatar: avatarUrl(id),
                status: "available" as TeacherStatus,
                bio: "",
                portfolio: [],
                skills: [],
              }
            : role === "customer"
            ? {
                id,
                role: "customer",
                name,
                username,
                password,
                avatar: avatarUrl(id),
              }
            : {
                id,
                role: "admin",
                name,
                username,
                password,
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

  saveTeam: (projectId: string) => {
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

  completeProject: (studentId, projectId) => {
    set((state) => {
      const users = state.users.map((user) => {
        if (user.id !== studentId || user.role !== "student") return user;
        
        const newCompletedIds = [...user.completedProjectIds];
        if (!newCompletedIds.includes(projectId)) {
          newCompletedIds.push(projectId);
        }

        const isSuperStudent = newCompletedIds.length >= 4;
        
        return {
          ...user,
          completedProjectIds: newCompletedIds,
          isSuperStudent: isSuperStudent || user.isSuperStudent,
        };
      });

      // Also mark the project as completed if it exists
      const projects = state.projects.map((project) => {
        if (project.id === projectId) {
          return { ...project, status: "completed" as ProjectStatus };
        }
        return project;
      });

      return { users, projects };
    });
  },

  submitReview: (studentId, rating) => {
    set((state) => {
      const users = state.users.map((user) => {
        if (user.id !== studentId || user.role !== "student") return user;
        
        const isPositive = rating >= 4;
        const newPositiveCount = isPositive ? user.positiveReviewsCount + 1 : user.positiveReviewsCount;
        const newRating = user.rating + rating;
        const isSuperStudent = user.isSuperStudent || (newPositiveCount >= 7);
        
        return {
          ...user,
          rating: newRating,
          positiveReviewsCount: newPositiveCount,
          isSuperStudent,
        };
      });
      return { users };
    });
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

      createOrder: (customerId, input) => {
        const id = `order-${Date.now()}`;
        const newOrder: Order = {
          id,
          customerId,
          title: input.title,
          description: input.description,
          specText: input.specText,
          budget: input.budget,
          deadline: input.deadline,
          status: "pending",
          requirements: input.requirements,
          responses: [],
        };
        set((state) => ({
          orders: [...state.orders, newOrder],
        }));
        return id;
      },

      respondToOrder: (orderId, teacherId) => {
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id !== orderId) return order;
            if (order.responses.some((r) => r.teacherId === teacherId)) return order;
            return {
              ...order,
              responses: [...order.responses, { teacherId, status: "applied" }],
              status: order.status === "pending" ? "negotiating" : order.status,
            };
          }),
        }));
      },

      acceptResponse: (orderId, teacherId) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order) return;

        const projectId = `project-order-${orderId}`;
        const newProject: Project = {
          id: projectId,
          teacherId,
          title: order.title,
          description: order.description,
          budget: order.budget,
          deadline: order.deadline,
          status: "draft",
          requirements: order.requirements,
          team: [],
          orderId,
        };

        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id !== orderId) return o;
            return {
              ...o,
              status: "accepted",
              teacherId,
              responses: o.responses.map((r) =>
                r.teacherId === teacherId
                  ? { ...r, status: "accepted" as const }
                  : { ...r, status: "declined" as const }
              ),
            };
          }),
          projects: [...state.projects, newProject],
        }));
      },

      getOrCreateChat: (orderId, customerId, teacherId) => {
        const existing = get().chats.find(
          (c) =>
            c.orderId === orderId &&
            c.customerId === customerId &&
            c.teacherId === teacherId
        );
        if (existing) return existing;

        const id = `chat-${orderId}-${customerId}-${teacherId}`;
        const newChat: Chat = {
          id,
          orderId,
          customerId,
          teacherId,
          messages: [],
        };
        set((state) => ({
          chats: [...state.chats, newChat],
        }));
        return newChat;
      },

      sendChatMessage: (chatId, senderId, senderName, text) => {
        const newMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          senderId,
          senderName,
          text,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          chats: state.chats.map((chat) => {
            if (chat.id !== chatId) return chat;
            return {
              ...chat,
              messages: [...chat.messages, newMessage],
            };
          }),
        }));
      },

      updateTeacherProfile: (teacherId, updates) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === teacherId && user.role === "teacher"
              ? { ...user, ...updates }
              : user
          ),
        }));
      },
    }),
    {
      name: "college-team-platform-storage",
      partialize: (state) => ({
        users: state.users,
        projects: state.projects,
        activeUserId: state.activeUserId,
        orders: state.orders,
        chats: state.chats,
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error || !state?.users) return;
          const migratedUsers = migrateUsers(state.users);
          state.users = migratedUsers;
        };
      },
    }
  )
);

export function isStudent(user: User): user is Student {
  return user.role === "student";
}

export const SKILL_LEVELS = [1, 2, 3, 4, 5] as const;

export function emptySkill(): Skill {
  return { name: "", level: 1 };
}
