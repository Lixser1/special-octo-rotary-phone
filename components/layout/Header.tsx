"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

export function RoleSwitcher() {
  const users = useAppStore((state) => state.users);
  const activeUserId = useAppStore((state) => state.activeUserId);
  const setActiveUser = useAppStore((state) => state.setActiveUser);

  const students = users.filter((user) => user.role === "student");
  const teachers = users.filter((user) => user.role === "teacher");
  const admins = users.filter((user) => user.role === "admin");

  return (
    <select
      value={activeUserId}
      onChange={(event) => setActiveUser(event.target.value)}
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
    >
      <optgroup label="Студенты">
        {students.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </optgroup>
      <optgroup label="Преподаватели">
        {teachers.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </optgroup>
      <optgroup label="Админ">
        {admins.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </optgroup>
    </select>
  );
}

export function RegisterModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const registerUser = useAppStore((state) => state.registerUser);
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;
    registerUser(role, name.trim());
    setName("");
    setRole("student");
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Регистрация"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            Зарегистрироваться
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Роль
          </label>
          <select
            value={role}
            onChange={(event) =>
              setRole(event.target.value as "student" | "teacher")
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="student">Студент</option>
            <option value="teacher">Преподаватель</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Имя
          </label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Введите имя"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </div>
    </Modal>
  );
}

export function Header() {
  const [registerOpen, setRegisterOpen] = useState(false);

  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              IT-колледж
            </p>
            <h1 className="text-xl font-bold text-slate-900">
              Платформа сборки команд
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <RoleSwitcher />
            <Button variant="secondary" onClick={() => setRegisterOpen(true)}>
              Регистрация
            </Button>
          </div>
        </div>
      </header>
      <RegisterModal open={registerOpen} onClose={() => setRegisterOpen(false)} />
    </>
  );
}
