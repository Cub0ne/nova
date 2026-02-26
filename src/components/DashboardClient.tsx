"use client";

import { useMemo } from "react";
import type { DailyEntry, Project } from "@prisma/client";
import { formatLocalDate, todayLocalDate } from "@/lib/date";

interface DashboardClientProps {
  projects: Project[];
  dailyEntries: DailyEntry[];
}

function todayString() {
  return todayLocalDate();
}

export default function DashboardClient({
  projects,
  dailyEntries
}: DashboardClientProps) {
  const today = todayString();

  const hasTodayEntry = useMemo(
    () => dailyEntries.some((entry) => formatLocalDate(entry.date) === today),
    [dailyEntries, today]
  );

  return (
    <div className="grid" style={{ gap: 28 }}>
      {!hasTodayEntry && (
        <div className="notice">
          你今天还没有打卡记录，写点进度或心情吧。
        </div>
      )}
    </div>
  );
}
