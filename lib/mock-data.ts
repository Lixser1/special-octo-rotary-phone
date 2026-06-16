import type { Project, User } from "./types";

export function avatarUrl(userId: string): string {
  return `https://i.pravatar.cc/150?u=${userId}`;
}

export const initialUsers: User[] = [
  {
    id: "student-1",
    role: "student",
    name: "Алексей Петров",
    avatar: avatarUrl("student-1"),
    status: "available",
    bio: "Frontend-разработчик, увлекаюсь React и TypeScript. Ищу коммерческие проекты для портфолио.",
    portfolio: ["https://github.com/alexey-p", "https://alexey-dev.ru"],
    skills: [
      { name: "React", level: 4 },
      { name: "TypeScript", level: 4 },
      { name: "CSS", level: 3 },
      { name: "Git", level: 3 },
    ],
    weaknesses: [
      { name: "DevOps", level: 1 },
      { name: "PostgreSQL", level: 2 },
    ],
  },
  {
    id: "student-2",
    role: "student",
    name: "Мария Соколова",
    avatar: avatarUrl("student-2"),
    status: "available",
    bio: "UI/UX-дизайнер с опытом прототипирования и визуального дизайна интерфейсов.",
    portfolio: ["https://behance.net/maria-s", "https://dribbble.com/maria-s"],
    skills: [
      { name: "UI/UX", level: 5 },
      { name: "Figma", level: 5 },
      { name: "CSS", level: 3 },
      { name: "React", level: 2 },
    ],
    weaknesses: [
      { name: "Node.js", level: 1 },
      { name: "PostgreSQL", level: 1 },
    ],
  },
  {
    id: "student-3",
    role: "student",
    name: "Дмитрий Козлов",
    avatar: avatarUrl("student-3"),
    status: "available",
    bio: "Backend-разработчик, специализируюсь на Node.js и базах данных.",
    portfolio: ["https://github.com/dkozlov"],
    skills: [
      { name: "Node.js", level: 5 },
      { name: "PostgreSQL", level: 4 },
      { name: "TypeScript", level: 3 },
      { name: "Git", level: 4 },
      { name: "QA", level: 3 },
    ],
    weaknesses: [
      { name: "React", level: 1 },
      { name: "UI/UX", level: 2 },
    ],
  },
  {
    id: "student-4",
    role: "student",
    name: "Елена Волкова",
    avatar: avatarUrl("student-4"),
    status: "available",
    bio: "Data Science и ML-инженер. Работаю с Python и аналитикой данных.",
    portfolio: ["https://github.com/elena-volkova"],
    skills: [
      { name: "Python", level: 5 },
      { name: "ML", level: 4 },
      { name: "PostgreSQL", level: 3 },
      { name: "Git", level: 3 },
    ],
    weaknesses: [
      { name: "React Native", level: 1 },
      { name: "UI/UX", level: 2 },
    ],
  },
  {
    id: "student-5",
    role: "student",
    name: "Иван Новиков",
    avatar: avatarUrl("student-5"),
    status: "busy",
    bio: "Mobile-разработчик на React Native. Участвую в коммерческих проектах.",
    portfolio: ["https://github.com/ivan-novikov", "https://apps.ivan.dev"],
    skills: [
      { name: "React Native", level: 4 },
      { name: "React", level: 3 },
      { name: "TypeScript", level: 3 },
      { name: "Node.js", level: 2 },
    ],
    weaknesses: [
      { name: "QA", level: 1 },
      { name: "UI/UX", level: 2 },
    ],
  },
  {
    id: "teacher-1",
    role: "teacher",
    name: "Сергей Морозов",
    avatar: avatarUrl("teacher-1"),
  },
  {
    id: "teacher-2",
    role: "teacher",
    name: "Ольга Лебедева",
    avatar: avatarUrl("teacher-2"),
  },
  {
    id: "admin-1",
    role: "admin",
    name: "Андрей Кузнецов",
    avatar: avatarUrl("admin-1"),
  },
];

export const initialProjects: Project[] = [
  {
    id: "project-1",
    teacherId: "teacher-1",
    title: "Интернет-магазин для локального бренда",
    description:
      "Разработка интернет-магазина с каталогом, корзиной и оплатой. Нужна команда с frontend и backend навыками.",
    budget: 150000,
    deadline: "2026-09-30",
    status: "draft",
    requirements: [
      { skillName: "React", minLevel: 3 },
      { skillName: "Node.js", minLevel: 3 },
      { skillName: "PostgreSQL", minLevel: 2 },
      { skillName: "UI/UX", minLevel: 2 },
    ],
    team: [],
  },
  {
    id: "project-2",
    teacherId: "teacher-2",
    title: "Мобильное приложение доставки",
    description:
      "Кроссплатформенное приложение для службы доставки еды с трекингом заказов.",
    budget: 200000,
    deadline: "2026-10-15",
    status: "active",
    requirements: [
      { skillName: "React Native", minLevel: 3 },
      { skillName: "Node.js", minLevel: 2 },
      { skillName: "QA", minLevel: 2 },
    ],
    team: [{ studentId: "student-5", role: "Mobile-разработчик" }],
  },
];
