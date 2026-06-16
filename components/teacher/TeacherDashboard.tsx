"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import type { Teacher } from "@/lib/types";
import { ProjectDetail } from "./ProjectDetail";
import { ProjectForm } from "./ProjectForm";
import { ProjectList } from "./ProjectList";
import { TeamBuilder } from "./TeamBuilder";

type TeacherView = "list" | "detail" | "team";

export function TeacherDashboard({ teacher }: { teacher: Teacher }) {
  const projects = useAppStore((state) => state.projects);
  const getStudents = useAppStore((state) => state.getStudents);
  const createProject = useAppStore((state) => state.createProject);
  const initTeamDraft = useAppStore((state) => state.initTeamDraft);

  const [view, setView] = useState<TeacherView>("list");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const teacherProjects = useMemo(
    () => projects.filter((project) => project.teacherId === teacher.id),
    [projects, teacher.id],
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
  );
}
