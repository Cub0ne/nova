import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await prisma.project.findFirst({
    where: { id: params.id, ownerId: user.id },
    include: { events: true }
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, startDate, endDate, progress, color } = body as {
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    progress?: number;
    color?: string;
  };

  const toDate = (value?: string) => {
    if (!value) return undefined;
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, (month ?? 1) - 1, day ?? 1);
  };

  const normalizedProgress =
    typeof progress === "number" ? Math.min(Math.max(progress, 0), 100) : undefined;

  const project = await prisma.project.updateMany({
    where: { id: params.id, ownerId: user.id },
    data: {
      name,
      description,
      startDate: toDate(startDate),
      endDate: toDate(endDate),
      progress: normalizedProgress,
      color
    }
  });

  if (project.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.project.deleteMany({
    where: { id: params.id, ownerId: user.id }
  });

  return NextResponse.json({ ok: true });
}
