"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import type { Teacher } from "@/lib/types";
import { ProjectDetail } from "./ProjectDetail";
import { ProjectForm } from "./ProjectForm";
import { ProjectList } from "./ProjectList";
import { TeamBuilder } from "./TeamBuilder";
import { TeacherProfileView } from "./TeacherProfileView";

type TeacherView = "profile" | "list" | "detail" | "team";

export function TeacherDashboard({ teacher }: { teacher: Teacher }) {
  const projects = useAppStore((state) => state.projects);
  const getStudents = useAppStore((state) => state.getStudents);
  const createProject = useAppStore((state) => state.createProject);
  const initTeamDraft = useAppStore((state) => state.initTeamDraft);

  const [view, setView] = useState<TeacherView>("profile");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const teacherProjects = useMemo(
    () => projects.filter((project) => project.teacherId === teacher.id),
    [projects, teacher.id],
  );

  const activeProjects = useMemo(
    () => teacherProjects.filter((project) => project.status === "active"),
    [teacherProjects],
  );

  const selectedProject = teacherProjects.find(
    (project) => project.id === selectedProjectId,
  );

  const openProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setView("detail");
  };

  const openTeamBuilder = (projectId: string) => {
    initTeamDraft(projectId);
    setSelectedProjectId(projectId);
    setView("team");
  };

  const switchView = (newView: TeacherView) => {
    setView(newView);
    setSelectedProjectId(null);
  };

  if (view === "team" && selectedProject) {
    return (
      <TeamBuilder
        project={selectedProject}
        onBack={() => setView("list")}
        onSaved={() => {
          setView("list");
          setSelectedProjectId(null);
        }}
      />
    );
  }

  if (view === "detail" && selectedProject) {
    return (
      <ProjectDetail
        project={selectedProject}
        students={getStudents()}
        onBack={() => setView("list")}
        onBuildTeam={() => openTeamBuilder(selectedProject.id)}
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-px">
        <button
          onClick={() => switchView("profile")}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-all ${
            view === "profile"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Профиль
        </button>
        <button
          onClick={() => switchView("list")}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-all ${
            view === "list"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Мои Проекты ({teacherProjects.length})
        </button>
      </div>

      {/* Profile View */}
      {view === "profile" && (
        <TeacherProfileView teacher={teacher} activeProjects={activeProjects} />
      )}

      {/* Projects View */}
      {view === "list" && (
        <>
          <ProjectList
            projects={teacherProjects}
            onOpen={openProject}
            onBuildTeam={openTeamBuilder}
            onCreate={() => setFormOpen(true)}
          />
          <ProjectForm
            open={formOpen}
            onClose={() => setFormOpen(false)}
            onSubmit={(input) => createProject(teacher.id, input)}
          />
        </>
      )}
    </div>
  );
}
