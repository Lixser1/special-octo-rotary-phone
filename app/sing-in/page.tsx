"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function SignInPage() {
  const router = useRouter();
  const users = useAppStore((state) => state.users);
  const activeUserId = useAppStore((state) => state.activeUserId);
  const setActiveUser = useAppStore((state) => state.setActiveUser);

  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<"student" | "teacher" | "admin" | "customer">("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (mounted && activeUserId) {
      const user = users.find((u) => u.id === activeUserId);
      if (user) {
        router.replace(`/${user.role}`);
      }
    }
  }, [mounted, activeUserId, users, router]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-500">Загрузка...</div>
      </div>
    );
  }

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Пожалуйста, заполните все поля.");
      return;
    }

    const matchedUser = users.find(
      (u) =>
        u.role === role &&
        u.username === username.trim() &&
        u.password === password
    );

    if (!matchedUser) {
      setError("Неверное имя пользователя или пароль для выбранной роли.");
      return;
    }

    if (matchedUser.blocked) {
      setError(`Данный аккаунт заблокирован. Причина: ${matchedUser.blockReason || "не указана"}`);
      return;
    }

    setActiveUser(matchedUser.id);
    router.push(`/${role}`);
  };

  const handleDemoLogin = (demoUsername: string) => {
    setUsername(demoUsername);
    setPassword("123456");
    setError("");
  };

  const filteredDemoUsers = users.filter((u) => u.role === role);

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-blue-600">
          IT-колледж
        </p>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900">
          Вход в платформу
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Нет аккаунта?{" "}
          <Link
            href="/sing-up"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Зарегистрироваться
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <form className="space-y-6" onSubmit={handleSignIn}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Кто вы? (Ваша роль)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["student", "teacher", "admin", "customer"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRole(r);
                      setError("");
                      setUsername("");
                      setPassword("");
                    }}
                    className={`rounded-lg border py-2 text-sm font-medium transition-all ${
                      role === r
                        ? "border-blue-600 bg-blue-50 text-blue-600 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {r === "student" && "Студент"}
                    {r === "teacher" && "Препод"}
                    {r === "admin" && "Админ"}
                    {r === "customer" && "Заказчик"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-700"
              >
                Логин
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={role === "student" ? "student-1" : role === "teacher" ? "teacher-1" : "admin-1"}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Пароль
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <Button type="submit" className="w-full justify-center">
                Войти
              </Button>
            </div>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Быстрый демо-вход ({role === "student" ? "студенты" : role === "teacher" ? "преподаватели" : role === "customer" ? "заказчики" : "админы"})
            </h4>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {filteredDemoUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleDemoLogin(user.username || user.id)}
                  className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/50 p-2 text-left hover:bg-slate-50 transition-colors"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-slate-800">
                      {user.name}
                    </p>
                    <p className="truncate text-[10px] text-slate-400">
                      Логин: {user.username || user.id} (123456)
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
