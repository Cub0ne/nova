import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Topbar from "@/components/Topbar";
import DashboardClient from "@/components/DashboardClient";
import CalendarGantt from "@/components/CalendarGantt";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" }
  });

  const dailyEntries = await prisma.dailyEntry.findMany({
    where: { ownerId: userId },
    orderBy: { date: "desc" }
  });

  return (
    <>
      <Topbar userName={session.user?.name} />
      <main className="container">
        <section className="grid" style={{ gap: 14, marginBottom: 24 }}>
          <div className="badge">飞书横道图灵感 · 每日打卡 · 心情记录</div>
          <h1>欢迎回来，{session.user?.name ?? "伙伴"}</h1>
        </section>

        <CalendarGantt projects={projects} dailyEntries={dailyEntries} />

        <DashboardClient projects={projects} dailyEntries={dailyEntries} />
      </main>
    </>
  );
}
