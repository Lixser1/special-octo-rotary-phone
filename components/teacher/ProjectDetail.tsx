"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import type { Project, Student, TeamMember } from "@/lib/types";
import {
  formatBudget,
  formatDate,
  ProjectStatusBadge,
} from "../layout/StatusBadge";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Modal } from "../ui/Modal";

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
  const completeProject = useAppStore((state) => state.completeProject);
  const submitReview = useAppStore((state) => state.submitReview);
  const removeTeamMember = useAppStore((state) => state.removeTeamMember);
  const initTeamDraft = useAppStore((state) => state.initTeamDraft);

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);

  const getStudentName = (member: TeamMember) => {
    const student = students.find((item) => item.id === member.studentId);
    return student?.name ?? "Неизвестный студент";
  };

  const handleComplete = () => {
    if (!selectedStudentId) return;
    completeProject(selectedStudentId, project.id);
    submitReview(selectedStudentId, rating);
    setShowCompleteModal(false);
    setSelectedStudentId(null);
    setRating(5);
  };

  const handleRemoveMember = (studentId: string) => {
    if (confirm("Вы уверены, что хотите удалить этого студента из команды?")) {
      initTeamDraft(project.id);
      removeTeamMember(project.id, studentId);
      // Сохраняем сразу после удаления
      setTimeout(() => {
        // saveTeam будет вызван в TeamBuilder при необходимости
      }, 100);
    }
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
          <div className="flex gap-2">
            <Button onClick={onBuildTeam}>
              {project.team.length === 0 ? "Собрать команду" : "Редактировать команду"}
            </Button>
          </div>
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
                <div className="flex gap-2">
                  {project.status === "active" && (
                    <Button
                      variant="secondary"
                      className="text-xs"
                      onClick={() => {
                        setSelectedStudentId(member.studentId);
                        setShowCompleteModal(true);
                      }}
                    >
                      Завершить
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="text-red-600 text-xs"
                    onClick={() => handleRemoveMember(member.studentId)}
                  >
                    Удалить
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={showCompleteModal}
        title="Завершить проект"
        onClose={() => setShowCompleteModal(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCompleteModal(false)}>
              Отмена
            </Button>
            <Button onClick={handleComplete}>Завершить</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Вы завершаете проект для студента. Выставьте оценку:
          </p>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Оценка (1-5)
            </label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value={5}>5 — Отлично</option>
              <option value={4}>4 — Хорошо</option>
              <option value={3}>3 — Удовлетворительно</option>
              <option value={2}>2 — Плохо</option>
              <option value={1}>1 — Ужасно</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
