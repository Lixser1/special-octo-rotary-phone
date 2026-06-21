import type { Project, User } from "./types";
import type { TeacherStatus } from "./types";

export function avatarUrl(userId: string): string {
  return `https://i.pravatar.cc/150?u=${userId}`;
}

export const initialUsers: User[] = [
  {
    id: "student-1",
    role: "student",
    name: "Алексей Петров",
    username: "student-1",
    password: "123456",
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
    username: "student-2",
    password: "123456",
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
    username: "student-3",
    password: "123456",
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
    username: "student-4",
    password: "123456",
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
    username: "student-5",
    password: "123456",
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
    username: "teacher-1",
    password: "123456",
    avatar: avatarUrl("teacher-1"),
    status: "available" as TeacherStatus,
    bio: "Руководитель проектов с 10-летним опытом в коммерческой разработке. Специализация: веб-приложения, e-commerce.",
    portfolio: ["https://github.com/morozov-s", "https://morozov-dev.ru"],
    skills: [
      { name: "React", level: 4 },
      { name: "Node.js", level: 4 },
      { name: "TypeScript", level: 3 },
      { name: "Project Management", level: 5 },
    ],
  },
  {
    id: "teacher-2",
    role: "teacher",
    name: "Ольга Лебедева",
    username: "teacher-2",
    password: "123456",
    avatar: avatarUrl("teacher-2"),
    status: "available" as TeacherStatus,
    bio: "Преподаватель по мобильной разработке. Опыт работы в Apple и Yandex.",
    portfolio: ["https://github.com/lebedeva-o", "https://mobile-dev.ru"],
    skills: [
      { name: "React Native", level: 5 },
      { name: "iOS", level: 4 },
      { name: "Android", level: 3 },
      { name: "UI/UX", level: 4 },
    ],
  },
  {
    id: "admin-1",
    role: "admin",
    name: "Андрей Кузнецов",
    username: "admin-1",
    password: "123456",
    avatar: avatarUrl("admin-1"),
  },
  {
    id: "customer-1",
    role: "customer",
    name: "Игорь Смирнов",
    username: "customer-1",
    password: "123456",
    avatar: avatarUrl("customer-1"),
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

export const initialOrders = [
  {
    id: "order-1",
    customerId: "customer-1",
    title: "Мобильное приложение для трекинга привычек",
    description: "Необходимо разработать кроссплатформенное мобильное приложение для отслеживания полезных привычек с напоминаниями и графиками прогресса.",
    specText: "Техническое задание:\n1. Стек: React Native, Node.js.\n2. Основные экраны: авторизация, календарь привычек, статистика (графики), настройки профиля.\n3. Push-уведомления через Firebase.\n4. Дизайн должен быть чистым и минималистичным в светлых тонах.",
    budget: 120000,
    deadline: "2026-11-01",
    status: "pending" as const,
    requirements: [
      { skillName: "React Native", minLevel: 3 as const },
      { skillName: "TypeScript", minLevel: 2 as const },
      { skillName: "UI/UX", minLevel: 2 as const }
    ],
    responses: []
  },
  {
    id: "order-2",
    customerId: "customer-1",
    title: "Сервис бронирования переговорных комнат",
    description: "Разработка веб-сервиса для бронирования переговорных комнат внутри компании с интеграцией с Google календарем.",
    specText: "Техническое задание:\n1. Стек: React (Next.js), Node.js, PostgreSQL.\n2. Основные функции: интерактивная карта переговорных, бронирование по слотам времени, отправка инвайтов на почту, админ-панель для настройки комнат.\n3. Интеграция по OAuth2 с Google Календарем.",
    budget: 180000,
    deadline: "2026-12-15",
    status: "pending" as const,
    requirements: [
      { skillName: "React", minLevel: 3 as const },
      { skillName: "Node.js", minLevel: 3 as const },
      { skillName: "PostgreSQL", minLevel: 2 as const }
    ],
    responses: []
  }
];
