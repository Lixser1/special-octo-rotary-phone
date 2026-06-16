"use client";

import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { Header } from "@/components/layout/Header";
import { StudentDashboard } from "@/components/student/StudentDashboard";
import { TeacherDashboard } from "@/components/teacher/TeacherDashboard";
import { useAppStore } from "@/lib/store";

export default function HomePage() {
  const activeUser = useAppStore((state) => state.getActiveUser());

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main>
        {!activeUser && (
          <div className="mx-auto max-w-6xl px-4 py-16 text-center text-slate-500">
            Пользователь не найден
          </div>
        )}
        {activeUser?.role === "student" && (
          <StudentDashboard student={activeUser} />
        )}
        {activeUser?.role === "teacher" && (
          <TeacherDashboard teacher={activeUser} />
        )}
        {activeUser?.role === "admin" && <AdminDashboard />}
      </main>
    </div>
  );
}
