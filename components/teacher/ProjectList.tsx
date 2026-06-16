"use client";

import type { Project } from "@/lib/types";
import {
  formatBudget,
  formatDate,
  ProjectStatusBadge,
} from "../layout/StatusBadge";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface ProjectListProps {
  projects: Project[];
  onOpen: (projectId: string) => void;
  onBuildTeam: (projectId: string) => void;
  onCreate: () => void;
}

export function ProjectList({
  projects,
  onOpen,
  onBuildTeam,
  onCreate,
}: ProjectListProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Мои проекты</h2>
          <p className="text-sm text-slate-500">
            Создавайте проекты и собирайте команды студентов
          </p>
        </div>
        <Button onClick={onCreate}>Создать проект</Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-500">Проектов пока нет</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <Card key={project.id}>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {project.title}
                  </h3>
                  <ProjectStatusBadge status={project.status} />
                </div>
                <p className="line-clamp-2 text-sm text-slate-600">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                  <span>{formatBudget(project.budget)}</span>
                  <span>·</span>
                  <span>{formatDate(project.deadline)}</span>
                  <span>·</span>
                  <span>{project.team.length} участников</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.requirements.map((req) => (
                    <Badge key={req.skillName} variant="skill">
                      {req.skillName} ≥ {req.minLevel}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button variant="secondary" onClick={() => onOpen(project.id)}>
                    Открыть
                  </Button>
                  {(project.status === "draft" || project.status === "active") && (
                    <Button onClick={() => onBuildTeam(project.id)}>
                      Собрать команду
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
