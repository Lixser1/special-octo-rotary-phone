"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { BirzhaDashboard } from "@/components/birzha/BirzhaDashboard";
import type { Teacher, Student } from "@/lib/types";

export default function BirzhaPage() {
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
      } else if (activeUser.role !== "teacher" && !(activeUser.role === "student" && (activeUser as any).isSuperStudent)) {
        router.replace(`/${activeUser.role}`);
      }
    }
  }, [mounted, activeUser, router]);

  if (!mounted || !activeUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-500">Загрузка...</div>
      </div>
    );
  }

  if (activeUser.role !== "teacher" && !(activeUser.role === "student" && (activeUser as any).isSuperStudent)) {
    return null;
  }

  const canCreateOrder = activeUser.role === "student";
  const user = activeUser as Teacher | Student;

  return (
    <div className="min-h-screen bg-slate-50">
      <BirzhaDashboard user={user} canCreateOrder={canCreateOrder} />
    </div>
  );
}
