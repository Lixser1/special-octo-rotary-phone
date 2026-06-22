import type { ProjectStatus, StudentStatus, TeacherStatus } from "@/lib/types";
import { Badge } from "../ui/Badge";

const studentLabels: Record<StudentStatus, string> = {
  available: "Свободен",
  busy: "Занят",
};

const teacherLabels: Record<TeacherStatus, string> = {
  available: "Свободен",
  busy: "Занят",
};

const projectLabels: Record<ProjectStatus, string> = {
  draft: "Черновик",
  active: "Активный",
  completed: "Завершён",
};

export function StudentStatusBadge({ status }: { status: StudentStatus }) {
  return (
    <Badge variant={status === "available" ? "available" : "busy"}>
      {studentLabels[status]}
    </Badge>
  );
}

export function TeacherStatusBadge({ status }: { status: TeacherStatus }) {
  return (
    <Badge variant={status === "available" ? "available" : status === "busy" ? "busy" : "danger"}>
      {teacherLabels[status]}
    </Badge>
  );
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge variant={status}>{projectLabels[status]}</Badge>;
}

export function SuperStudentBadge() {
  return (
    <Badge variant="success">
      🏆 Супер-студент
    </Badge>
  );
}

export function formatBudget(amount: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("ru-RU").format(new Date(date));
}
