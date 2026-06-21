"use client";

import { useAppStore } from "@/lib/store";
import type { Teacher } from "@/lib/types";
import { TeacherStatusBadge } from "../layout/StatusBadge";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { SkillsEditor } from "../student/SkillsEditor";

interface TeacherProfileViewProps {
  teacher: Teacher;
  activeProjects: any[];
}

export function TeacherProfileView({ teacher, activeProjects }: TeacherProfileViewProps) {
  const updateTeacherProfile = useAppStore((state) => state.updateTeacherProfile);

  const toggleStatus = () => {
    const nextStatus =
      teacher.status === "available"
        ? ("busy" as const)
        : teacher.status === "busy"
        ? ("on_leave" as const)
        : ("available" as const);
    updateTeacherProfile(teacher.id, { status: nextStatus });
  };

  const updateBio = (value: string) => {
    updateTeacherProfile(teacher.id, { bio: value });
  };

  const updateSkills = (newSkills: any[]) => {
    updateTeacherProfile(teacher.id, { skills: newSkills });
  };

  const updatePortfolioLink = (index: number, value: string) => {
    const portfolio = [...(teacher.portfolio || [])];
    portfolio[index] = value;
    updateTeacherProfile(teacher.id, { portfolio });
  };

  const addPortfolioLink = () => {
    updateTeacherProfile(teacher.id, {
      portfolio: [...(teacher.portfolio || []), ""],
    });
  };

  const removePortfolioLink = (index: number) => {
    updateTeacherProfile(teacher.id, {
      portfolio: (teacher.portfolio || []).filter((_, itemIndex) => itemIndex !== index),
    });
  };

  const getStatusLabel = (status: Teacher["status"]) => {
    switch (status) {
      case "available":
        return "Свободен";
      case "busy":
        return "Занят";
      case "on_leave":
        return "В отпуске";
      default:
        return status;
    }
  };

  const nextStatusLabel = () => {
    switch (teacher.status) {
      case "available":
        return "Отметить как занят";
      case "busy":
        return "Взять отпуск";
      case "on_leave":
        return "Отметить как свободен";
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Profile Card */}
      <Card title="Профиль преподавателя">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <img
            src={teacher.avatar}
            alt={teacher.name}
            className="h-24 w-24 rounded-full border border-slate-200 object-cover"
          />
          <div className="flex-1 space-y-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{teacher.name}</h2>
              <p className="text-sm text-slate-500">Преподаватель / Руководитель проектов</p>
            </div>
            <div>
              <TeacherStatusBadge status={teacher.status} />
            </div>
            <p className="text-sm text-slate-600">
              Статус: <strong>{getStatusLabel(teacher.status)}</strong>
            </p>
            <Button variant="secondary" onClick={toggleStatus} className="w-full sm:w-auto">
              {nextStatusLabel()}
            </Button>
          </div>
        </div>
      </Card>

      {/* Bio Card */}
      <Card title="О себе / Профессиональный опыт">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Краткое резюме
            </label>
            <textarea
              value={teacher.bio || ""}
              onChange={(event) => updateBio(event.target.value)}
              rows={5}
              placeholder="Расскажите о своей специализации, опыте руководства проектами или коммерческой разработке..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </Card>

      {/* Skills Card */}
      <Card title="Навыки и Экспертиза">
        <SkillsEditor
          title=""
          items={teacher.skills || []}
          variant="skill"
          onChange={updateSkills}
        />
      </Card>

      {/* Portfolio Card */}
      <Card title="Ссылки и Портфолио">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">
              Ссылки (GitHub, LinkedIn, личный сайт)
            </label>
            <Button
              variant="secondary"
              className="px-3 py-1 text-xs"
              onClick={addPortfolioLink}
            >
              Добавить ссылку
            </Button>
          </div>
          {(teacher.portfolio || []).length === 0 && (
            <p className="text-sm text-slate-500">Ссылки пока не добавлены</p>
          )}
          <div className="space-y-2">
            {(teacher.portfolio || []).map((link, index) => (
              <div key={`${link}-${index}`} className="flex gap-2">
                <input
                  type="url"
                  value={link}
                  onChange={(event) => updatePortfolioLink(index, event.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removePortfolioLink(index)}
                  className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50 transition-colors"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Active Projects Card */}
      {activeProjects.length > 0 && (
        <Card title="Активные проекты" className="lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeProjects.map((project) => (
              <div
                key={project.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <h4 className="text-sm font-semibold text-slate-900">{project.title}</h4>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                  {project.description}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                  <span>Бюджет: {project.budget.toLocaleString()} ₽</span>
                  <span>•</span>
                  <span>Дедлайн: {new Date(project.deadline).toLocaleDateString("ru-RU")}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
