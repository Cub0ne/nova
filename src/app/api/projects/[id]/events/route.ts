import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, date, color, note } = body as {
    title?: string;
    date?: string;
    color?: string;
    note?: string;
  };

  if (!title || !date || !color) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const project = await prisma.project.findFirst({
    where: { id: params.id, ownerId: user.id }
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [year, month, day] = date.split("-").map(Number);
  const eventDate = new Date(year, (month ?? 1) - 1, day ?? 1);

  const event = await prisma.projectEvent.create({
    data: {
      projectId: params.id,
      title,
      date: eventDate,
      color,
      note
    }
  });

  return NextResponse.json(event);
}
