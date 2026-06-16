"use client";

import { useMemo, useState } from "react";
import { compareStudents, matchTeamToProject } from "@/lib/matching";
import { useAppStore } from "@/lib/store";
import type { Project, Student } from "@/lib/types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../ui/Table";

interface TeamBuilderProps {
  project: Project;
  onBack: () => void;
  onSaved: () => void;
}

function CoverageChecklist({
  project,
  teamStudentIds,
  students,
}: {
  project: Project;
  teamStudentIds: string[];
  students: Student[];
}) {
  const result = matchTeamToProject(
    teamStudentIds,
    students,
    project.requirements,
  );

  return (
    <Card title="Покрытие требований">
      <ul className="space-y-2">
        {result.coverage.map((item) => (
          <li
            key={item.skillName}
            className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
              item.met
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-300 bg-red-50 text-red-800 ring-1 ring-red-200"
            }`}
          >
            <span>
              {item.met ? "✓" : "✗"} {item.skillName} (≥ {item.required})
            </span>
            <span>
              {item.teamLevel !== null ? `Команда: ${item.teamLevel}` : "Нет навыка"}
            </span>
          </li>
        ))}
      </ul>
      {!result.allMet && (
        <p className="mt-3 text-sm font-medium text-red-700">
          Не все требования закрыты. Добавьте студентов с нужными навыками.
        </p>
      )}
    </Card>
  );
}

function StudentMatchCard({
  student,
  project,
  inTeam,
  onAdd,
}: {
  student: Student;
  project: Project;
  inTeam: boolean;
  onAdd: (role: string) => void;
}) {
  const [role, setRole] = useState("Разработчик");
  const match = compareStudents([student], project.requirements)[0];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <img
          src={student.avatar}
          alt={student.name}
          className="h-12 w-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold text-slate-900">{student.name}</h4>
            <Badge variant={match.score >= 75 ? "success" : match.score >= 40 ? "default" : "danger"}>
              {match.score}% match
            </Badge>
          </div>
          <div className="mt-2 space-y-1">
            {match.details.map((detail) => (
              <div
                key={detail.skillName}
                className={`text-xs ${
                  detail.met ? "text-green-700" : "text-red-700"
                }`}
              >
                {detail.met ? "✓" : "✗"} {detail.skillName}:{" "}
                {detail.actual ?? 0}/{detail.required}
              </div>
            ))}
          </div>
          {student.weaknesses.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {student.weaknesses.map((weakness) => (
                <Badge key={weakness.name} variant="weakness">
                  {weakness.name} {weakness.level}/5
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      {!inTeam && (
        <div className="mt-3 flex gap-2">
          <input
            value={role}
            onChange={(event) => setRole(event.target.value)}
            placeholder="Роль в команде"
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <Button onClick={() => onAdd(role)} disabled={!role.trim()}>
            Добавить
          </Button>
        </div>
      )}
      {inTeam && (
        <p className="mt-3 text-sm font-medium text-blue-700">Уже в команде</p>
      )}
    </div>
  );
}

export function TeamBuilder({ project, onBack, onSaved }: TeamBuilderProps) {
  const teamDrafts = useAppStore((state) => state.teamDrafts);
  const getAvailableStudents = useAppStore((state) => state.getAvailableStudents);
  const getStudents = useAppStore((state) => state.getStudents);
  const addTeamMember = useAppStore((state) => state.addTeamMember);
  const removeTeamMember = useAppStore((state) => state.removeTeamMember);
  const updateTeamMemberRole = useAppStore((state) => state.updateTeamMemberRole);
  const saveTeam = useAppStore((state) => state.saveTeam);

  const [showCompare, setShowCompare] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const draft = teamDrafts[project.id] ?? [];
  const availableStudents = getAvailableStudents();
  const allStudents = getStudents();

  const draftStudentIds = draft.map((member) => member.studentId);

  const teamCoverage = useMemo(
    () => matchTeamToProject(draftStudentIds, allStudents, project.requirements),
    [draftStudentIds, allStudents, project.requirements],
  );

  const sortedMatches = useMemo(
    () => compareStudents(availableStudents, project.requirements),
    [availableStudents, project.requirements],
  );

  const handleSave = () => {
    saveTeam(project.id);
    setSavedMessage("Команда сохранена! Студенты отмечены как занятые.");
    setTimeout(() => {
      onSaved();
    }, 1200);
  };

  const getStudentById = (id: string) =>
    allStudents.find((student) => student.id === id);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="secondary" onClick={onBack}>
            ← Назад
          </Button>
          <h2 className="mt-3 text-2xl font-bold text-slate-900">
            Сбор команды: {project.title}
          </h2>
        </div>
        <Button
          onClick={handleSave}
          disabled={!teamCoverage.allMet || draft.length === 0}
        >
          Сохранить команду
        </Button>
      </div>

      {savedMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {savedMessage}
        </div>
      )}

      <CoverageChecklist
        project={project}
        teamStudentIds={draftStudentIds}
        students={allStudents}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Свободные студенты
            </h3>
            <Button variant="secondary" onClick={() => setShowCompare(!showCompare)}>
              {showCompare ? "Скрыть сравнение" : "Сравнить студентов"}
            </Button>
          </div>

          {showCompare && sortedMatches.length > 0 && (
            <Card title="Сравнение по требованиям">
              <Table>
                <TableHead>
                  <TableHeaderCell>Студент</TableHeaderCell>
                  {project.requirements.map((req) => (
                    <TableHeaderCell key={req.skillName}>
                      {req.skillName} (≥{req.minLevel})
                    </TableHeaderCell>
                  ))}
                  <TableHeaderCell>Match</TableHeaderCell>
                </TableHead>
                <TableBody>
                  {sortedMatches.map((match) => {
                    const student = availableStudents.find(
                      (item) => item.id === match.studentId,
                    );
                    if (!student) return null;
                    return (
                      <TableRow key={match.studentId}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        {match.details.map((detail) => (
                          <TableCell
                            key={detail.skillName}
                            className={
                              detail.met ? "text-green-700" : "text-red-700"
                            }
                          >
                            {detail.actual ?? 0} / {detail.required}
                          </TableCell>
                        ))}
                        <TableCell>{match.score}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {sortedMatches.map((match) => {
              const student = availableStudents.find(
                (item) => item.id === match.studentId,
              );
              if (!student) return null;
              return (
                <StudentMatchCard
                  key={student.id}
                  student={student}
                  project={project}
                  inTeam={draftStudentIds.includes(student.id)}
                  onAdd={(role) => addTeamMember(project.id, student.id, role)}
                />
              );
            })}
          </div>

          {availableStudents.length === 0 && (
            <Card>
              <p className="text-sm text-slate-500">
                Нет свободных студентов для добавления в команду
              </p>
            </Card>
          )}
        </div>

        <Card title="Команда (черновик)">
          {draft.length === 0 ? (
            <p className="text-sm text-slate-500">Добавьте студентов из списка</p>
          ) : (
            <ul className="space-y-3">
              {draft.map((member) => {
                const student = getStudentById(member.studentId);
                return (
                  <li
                    key={member.studentId}
                    className="rounded-lg border border-slate-200 p-3"
                  >
                    <div className="flex items-center gap-2">
                      {student && (
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="h-8 w-8 rounded-full"
                        />
                      )}
                      <span className="font-medium">{student?.name}</span>
                    </div>
                    <input
                      value={member.role}
                      onChange={(event) =>
                        updateTeamMemberRole(
                          project.id,
                          member.studentId,
                          event.target.value,
                        )
                      }
                      className="mt-2 w-full rounded-lg border border-slate-200 px-2 py-1 text-sm"
                    />
                    <Button
                      variant="ghost"
                      className="mt-2 text-red-600"
                      onClick={() =>
                        removeTeamMember(project.id, member.studentId)
                      }
                    >
                      Удалить
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
