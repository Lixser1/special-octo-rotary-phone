"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Header } from "@/components/layout/Header";
import { StudentDashboard } from "@/components/student/StudentDashboard";

export default function StudentPage() {
  const router = useRouter();
  const activeUser = useAppStore((state) => state.getActiveUser());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!activeUser) {
        router.replace("/sing-in");
      } else if (activeUser.role !== "student") {
        router.replace(`/${activeUser.role}`);
      }
    }
  }, [mounted, activeUser, router]);

  if (!mounted || !activeUser || activeUser.role !== "student") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <StudentDashboard student={activeUser} />
    </div>
  );
}
