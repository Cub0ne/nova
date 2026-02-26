import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(projects);
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
  const { name, description, startDate, endDate, color, progress } = body as {
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    color?: string;
    progress?: number;
  };

  if (!name || !startDate || !endDate) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const normalizedProgress =
    typeof progress === "number" ? Math.min(Math.max(progress, 0), 100) : undefined;

  const project = await prisma.project.create({
    data: {
      ownerId: user.id,
      name,
      description,
      startDate: toDate(startDate),
      endDate: toDate(endDate),
      color: color ?? undefined,
      progress: normalizedProgress
    }
  });

  return NextResponse.json(project);
}
