import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

function toDate(dateParam: string) {
  const [year, month, day] = dateParam.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export async function GET(_: Request, { params }: { params: { date: string } }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entry = await prisma.dailyEntry.findUnique({
    where: {
      ownerId_date: {
        ownerId: user.id,
        date: toDate(params.date)
      }
    }
  });

  return NextResponse.json(entry ?? null);
}
