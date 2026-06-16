"use client";

import type { Project } from "@/lib/types";
import { ProjectStatusBadge } from "../layout/StatusBadge";
import { Card } from "../ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../ui/Table";

interface StudentProjectsProps {
  projects: Array<{ project: Project; role: string }>;
}

export function StudentProjects({ projects }: StudentProjectsProps) {
  return (
    <Card title="Мои проекты">
      {projects.length === 0 ? (
        <p className="text-sm text-slate-500">Вы пока не участвуете в проектах</p>
      ) : (
        <Table>
          <TableHead>
            <TableHeaderCell>Название</TableHeaderCell>
            <TableHeaderCell>Роль</TableHeaderCell>
            <TableHeaderCell>Статус</TableHeaderCell>
          </TableHead>
          <TableBody>
            {projects.map(({ project, role }) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.title}</TableCell>
                <TableCell>{role}</TableCell>
                <TableCell>
                  <ProjectStatusBadge status={project.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
