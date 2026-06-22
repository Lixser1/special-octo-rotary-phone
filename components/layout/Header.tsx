"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { Button } from "../ui/Button";

const roleLabels: Record<string, string> = {
  student: "Студент",
  teacher: "Преподаватель",
  admin: "Админ",
  customer: "Заказчик",
};

const teacherLinks = [
  { href: "/teacher", label: "Кабинет" },
  { href: "/birzha", label: "Биржа" },
];

const customerLinks = [
  { href: "/customer", label: "Кабинет" },
];

const adminLinks = [
  { href: "/admin", label: "Панель" },
];

export function Header() {
  const router = useRouter();
  const activeUserId = useAppStore((state) => state.activeUserId);
  const users = useAppStore((state) => state.users);
  const setActiveUser = useAppStore((state) => state.setActiveUser);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeUser = users.find((user) => user.id === activeUserId);

  const handleLogout = () => {
    setActiveUser("");
    router.push("/sing-in");
  };

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Team assemly
          </p>
          <Link href="/" className="text-xl font-bold text-slate-900 hover:text-blue-600 transition-colors">
            Платформа сборки команд
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {mounted && activeUser ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={activeUser.avatar}
                  alt={activeUser.name}
                  className="h-9 w-9 rounded-full border border-slate-200 object-cover"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-slate-800 leading-tight">
                    {activeUser.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-slate-500">
                      {roleLabels[activeUser.role] || activeUser.role}
                    </p>
                    {activeUser.role === "student" && (activeUser as any).isSuperStudent && (
                      <span className="text-[10px] font-semibold text-amber-600">🏆</span>
                    )}
                  </div>
                </div>
              </div>
              {activeUser.role === "teacher" && (
                <nav className="flex gap-1">
                  {teacherLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              )}
              {activeUser.role === "customer" && (
                <nav className="flex gap-1">
                  {customerLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              )}
              {activeUser.role === "admin" && (
                <nav className="flex gap-1">
                  {adminLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              )}
              {activeUser.role === "student" && (activeUser as any).isSuperStudent && (
                <nav className="flex gap-1">
                  <Link
                    href="/birzha"
                    className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors"
                  >
                    Биржа
                  </Link>
                </nav>
              )}
              <Button variant="secondary" onClick={handleLogout}>
                Выйти
              </Button>
            </div>
          ) : (
            mounted && (
              <div className="flex gap-2">
                <Link href="/sing-in">
                  <Button variant="primary">Войти</Button>
                </Link>
                <Link href="/sing-up">
                  <Button variant="secondary">Регистрация</Button>
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  );
}

