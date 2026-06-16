"use client";

import type { Project, Student, TeamMember } from "@/lib/types";
import {
  formatBudget,
  formatDate,
  ProjectStatusBadge,
} from "../layout/StatusBadge";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface ProjectDetailProps {
  project: Project;
  students: Student[];
  onBack: () => void;
  onBuildTeam: () => void;
}

export function ProjectDetail({
  project,
  students,
  onBack,
  onBuildTeam,
}: ProjectDetailProps) {
  const getStudentName = (member: TeamMember) => {
    const student = students.find((item) => item.id === member.studentId);
    return student?.name ?? "Неизвестный студент";
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <Button variant="secondary" onClick={onBack}>
        ← Назад к проектам
      </Button>

      <Card>
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{project.title}</h2>
              <p className="mt-2 text-slate-600">{project.description}</p>
            </div>
            <ProjectStatusBadge status={project.status} />
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <span>Бюджет: {formatBudget(project.budget)}</span>
            <span>Дедлайн: {formatDate(project.deadline)}</span>
            <span>Участников: {project.team.length}</span>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-800">
              Требования
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.requirements.map((req) => (
                <Badge key={req.skillName} variant="skill">
                  {req.skillName} ≥ {req.minLevel}
                </Badge>
              ))}
            </div>
          </div>
          <Button onClick={onBuildTeam}>Собрать команду</Button>
        </div>
      </Card>

      <Card title="Команда проекта">
        {project.team.length === 0 ? (
          <p className="text-sm text-slate-500">Команда ещё не собрана</p>
        ) : (
          <ul className="space-y-3">
            {project.team.map((member) => (
              <li
                key={member.studentId}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
              >
                <span className="font-medium text-slate-900">
                  {getStudentName(member)}
                </span>
                <Badge>{member.role}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
