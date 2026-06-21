"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function SignUpPage() {
  const router = useRouter();
  const users = useAppStore((state) => state.users);
  const activeUserId = useAppStore((state) => state.activeUserId);
  const registerUser = useAppStore((state) => state.registerUser);

  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<"student" | "teacher" | "admin" | "customer">("student");
  const [name, setName] = useState("");
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

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !username.trim() || !password) {
      setError("Пожалуйста, заполните все поля.");
      return;
    }

    if (username.trim().length < 3) {
      setError("Логин должен содержать не менее 3 символов.");
      return;
    }

    if (password.length < 6) {
      setError("Пароль должен быть не менее 6 символов.");
      return;
    }

    // Check username uniqueness (case-insensitive for convenience)
    const usernameExists = users.some(
      (u) => u.username?.toLowerCase() === username.trim().toLowerCase()
    );

    if (usernameExists) {
      setError("Пользователь с таким логином уже существует.");
      return;
    }

    // Register user
    const newUserId = registerUser(role, name.trim(), username.trim(), password);

    // Redirect to the role page
    router.push(`/${role}`);
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-blue-600">
          IT-колледж
        </p>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900">
          Регистрация аккаунта
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Уже есть аккаунт?{" "}
          <Link
            href="/sing-in"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Войти
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <form className="space-y-5" onSubmit={handleSignUp}>
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
                htmlFor="name"
                className="block text-sm font-medium text-slate-700"
              >
                ФИО / Отображаемое имя
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Иван Иванов"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-700"
              >
                Логин для входа
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ivanov12"
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
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Не менее 6 символов"
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
                Зарегистрироваться
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
