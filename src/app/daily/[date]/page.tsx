import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Topbar from "@/components/Topbar";
import DailyEditor from "@/components/DailyEditor";

export default async function DailyPage({
  params,
  searchParams
}: {
  params: { date: string };
  searchParams?: { mode?: string };
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }

  const [year, month, day] = params.date.split("-").map(Number);
  const entryDate = new Date(year, (month ?? 1) - 1, day ?? 1);

  const entry = await prisma.dailyEntry.findUnique({
    where: {
      ownerId_date: {
        ownerId: userId,
        date: entryDate
      }
    }
  });

  return (
    <>
      <Topbar userName={session.user?.name} />
      <main className="container">
        <h1>每日记录 · {params.date}</h1>
        <DailyEditor date={params.date} entry={entry} readOnly={searchParams?.mode === "view"} />
      </main>
    </>
  );
}
