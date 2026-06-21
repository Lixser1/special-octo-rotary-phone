"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { TeacherDashboard } from "@/components/teacher/TeacherDashboard";

export default function TeacherPage() {
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
      } else if (activeUser.role !== "teacher") {
        router.replace(`/${activeUser.role}`);
      }
    }
  }, [mounted, activeUser, router]);

  if (!mounted || !activeUser || activeUser.role !== "teacher") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TeacherDashboard teacher={activeUser} />
    </div>
  );
}
