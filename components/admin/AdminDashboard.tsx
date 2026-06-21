"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import type { ProjectStatus, Role } from "@/lib/types";
import { formatBudget, ProjectStatusBadge, StudentStatusBadge } from "../layout/StatusBadge";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Modal } from "../ui/Modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../ui/Table";

const roleLabels: Record<Role, string> = {
  student: "Студент",
  teacher: "Преподаватель",
  admin: "Админ",
  customer: "Заказчик",
};

export function AdminDashboard() {
  const users = useAppStore((state) => state.users);
  const projects = useAppStore((state) => state.projects);
  const deleteUser = useAppStore((state) => state.deleteUser);
  const blockUser = useAppStore((state) => state.blockUser);
  const deleteProject = useAppStore((state) => state.deleteProject);

  const [tab, setTab] = useState<"users" | "projects">("users");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [blockTargetId, setBlockTargetId] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState("");

  const filteredUsers = useMemo(() => {
    if (roleFilter === "all") return users;
    return users.filter((user) => user.role === roleFilter);
  }, [users, roleFilter]);

  const filteredProjects = useMemo(() => {
    if (statusFilter === "all") return projects;
    return projects.filter((project) => project.status === statusFilter);
  }, [projects, statusFilter]);

  const getTeacherName = (teacherId: string) =>
    users.find((user) => user.id === teacherId)?.name ?? "—";

  const handleBlock = () => {
    if (!blockTargetId || !blockReason.trim()) return;
    blockUser(blockTargetId, blockReason.trim());
    setBlockTargetId(null);
    setBlockReason("");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Панель администратора</h2>
        <p className="text-sm text-slate-500">
          Управление пользователями и проектами платформы
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          variant={tab === "users" ? "primary" : "secondary"}
          onClick={() => setTab("users")}
        >
          Пользователи
        </Button>
        <Button
          variant={tab === "projects" ? "primary" : "secondary"}
          onClick={() => setTab("projects")}
        >
          Проекты
        </Button>
      </div>

      {tab === "users" && (
        <Card>
          <div className="mb-4">
            <label className="mr-2 text-sm font-medium text-slate-700">
              Фильтр по роли:
            </label>
            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value as Role | "all")
              }
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="all">Все</option>
              <option value="student">Студенты</option>
              <option value="teacher">Преподаватели</option>
              <option value="admin">Админы</option>
              <option value="customer">Заказчики</option>
            </select>
          </div>
          <Table>
            <TableHead>
              <TableHeaderCell>Имя</TableHeaderCell>
              <TableHeaderCell>Роль</TableHeaderCell>
              <TableHeaderCell>Статус</TableHeaderCell>
              <TableHeaderCell>Блокировка</TableHeaderCell>
              <TableHeaderCell>Действия</TableHeaderCell>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{roleLabels[user.role]}</TableCell>
                  <TableCell>
                    {user.role === "student" ? (
                      <StudentStatusBadge status={user.status} />
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {user.blocked ? (
                      <Badge variant="danger">
                        Заблокирован: {user.blockReason}
                      </Badge>
                    ) : (
                      <Badge variant="success">Активен</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {!user.blocked && user.role !== "admin" && (
                        <Button
                          variant="secondary"
                          className="px-3 py-1 text-xs"
                          onClick={() => setBlockTargetId(user.id)}
                        >
                          Заблокировать
                        </Button>
                      )}
                      {user.role !== "admin" && (
                        <Button
                          variant="danger"
                          className="px-3 py-1 text-xs"
                          onClick={() => deleteUser(user.id)}
                        >
                          Удалить
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {tab === "projects" && (
        <Card>
          <div className="mb-4">
            <label className="mr-2 text-sm font-medium text-slate-700">
              Фильтр по статусу:
            </label>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as ProjectStatus | "all")
              }
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="all">Все</option>
              <option value="draft">Черновик</option>
              <option value="active">Активный</option>
              <option value="completed">Завершён</option>
            </select>
          </div>
          <Table>
            <TableHead>
              <TableHeaderCell>Название</TableHeaderCell>
              <TableHeaderCell>Преподаватель</TableHeaderCell>
              <TableHeaderCell>Статус</TableHeaderCell>
              <TableHeaderCell>Бюджет</TableHeaderCell>
              <TableHeaderCell>Действия</TableHeaderCell>
            </TableHead>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.title}</TableCell>
                  <TableCell>{getTeacherName(project.teacherId)}</TableCell>
                  <TableCell>
                    <ProjectStatusBadge status={project.status} />
                  </TableCell>
                  <TableCell>{formatBudget(project.budget)}</TableCell>
                  <TableCell>
                    <Button
                      variant="danger"
                      className="px-3 py-1 text-xs"
                      onClick={() => deleteProject(project.id)}
                    >
                      Удалить
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Modal
        open={blockTargetId !== null}
        title="Заблокировать пользователя"
        onClose={() => {
          setBlockTargetId(null);
          setBlockReason("");
        }}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setBlockTargetId(null);
                setBlockReason("");
              }}
            >
              Отмена
            </Button>
            <Button onClick={handleBlock} disabled={!blockReason.trim()}>
              Заблокировать
            </Button>
          </>
        }
      >
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Причина блокировки
        </label>
        <textarea
          value={blockReason}
          onChange={(event) => setBlockReason(event.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Укажите причину..."
        />
      </Modal>
    </div>
  );
}
