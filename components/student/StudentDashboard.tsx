"use client";

import { useAppStore } from "@/lib/store";
import type { Student } from "@/lib/types";
import { StudentStatusBadge } from "../layout/StatusBadge";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { SkillsEditor } from "./SkillsEditor";
import { StudentProjects } from "./StudentProjects";

export function StudentDashboard({ student }: { student: Student }) {
  const updateStudentProfile = useAppStore((state) => state.updateStudentProfile);
  const getStudentProjects = useAppStore((state) => state.getStudentProjects);

  const projects = getStudentProjects(student.id);

  const toggleStatus = () => {
    updateStudentProfile(student.id, {
      status: student.status === "available" ? "busy" : "available",
    });
  };

  const updatePortfolio = (index: number, value: string) => {
    const portfolio = [...student.portfolio];
    portfolio[index] = value;
    updateStudentProfile(student.id, { portfolio });
  };

  const addPortfolioLink = () => {
    updateStudentProfile(student.id, {
      portfolio: [...student.portfolio, ""],
    });
  };

  const removePortfolioLink = (index: number) => {
    updateStudentProfile(student.id, {
      portfolio: student.portfolio.filter((_, itemIndex) => itemIndex !== index),
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Профиль">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <img
              src={student.avatar}
              alt={student.name}
              className="h-24 w-24 rounded-full border border-slate-200 object-cover"
            />
            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{student.name}</h2>
                <div className="mt-2">
                  <StudentStatusBadge status={student.status} />
                </div>
              </div>
              <Button variant="secondary" onClick={toggleStatus}>
                {student.status === "available"
                  ? "Отметить как занят"
                  : "Отметить как свободен"}
              </Button>
            </div>
          </div>
        </Card>

        <Card title="Био и портфолио">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                О себе
              </label>
              <textarea
                value={student.bio}
                onChange={(event) =>
                  updateStudentProfile(student.id, { bio: event.target.value })
                }
                rows={4}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">
                  Портфолио
                </label>
                <Button
                  variant="secondary"
                  className="px-3 py-1 text-xs"
                  onClick={addPortfolioLink}
                >
                  Добавить ссылку
                </Button>
              </div>
              <div className="space-y-2">
                {student.portfolio.map((link, index) => (
                  <div key={`${link}-${index}`} className="flex gap-2">
                    <input
                      type="url"
                      value={link}
                      onChange={(event) => updatePortfolio(index, event.target.value)}
                      placeholder="https://..."
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                    <Button
                      variant="ghost"
                      className="text-red-600"
                      onClick={() => removePortfolioLink(index)}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card title="Навыки">
          <SkillsEditor
            title=""
            items={student.skills}
            variant="skill"
            onChange={(skills) => updateStudentProfile(student.id, { skills })}
          />
        </Card>

        <Card title="Слабые стороны">
          <SkillsEditor
            title=""
            items={student.weaknesses}
            variant="weakness"
            onChange={(weaknesses) =>
              updateStudentProfile(student.id, { weaknesses })
            }
          />
        </Card>
      </div>

      <StudentProjects projects={projects} />
    </div>
  );
}
