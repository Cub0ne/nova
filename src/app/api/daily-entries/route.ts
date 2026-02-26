import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entries = await prisma.dailyEntry.findMany({
    where: { ownerId: user.id },
    orderBy: { date: "desc" }
  });

  return NextResponse.json(entries);
}

function toDate(dateParam: string) {
  const [year, month, day] = dateParam.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { date, workContent, mood, journal } = body as {
    date?: string;
    workContent?: string;
    mood?: string;
    journal?: string;
  };

  if (!date || !workContent || !mood) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const entryDate = toDate(date);

  const entry = await prisma.dailyEntry.upsert({
    where: {
      ownerId_date: {
        ownerId: user.id,
        date: entryDate
      }
    },
    update: {
      workContent,
      mood,
      journal: journal ?? ""
    },
    create: {
      ownerId: user.id,
      date: entryDate,
      workContent,
      mood,
      journal: journal ?? ""
    }
  });

  return NextResponse.json(entry);
}
