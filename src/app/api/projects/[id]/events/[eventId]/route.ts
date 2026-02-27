import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

function toDate(value?: string) {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; eventId: string } }
) {
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

  const event = await prisma.projectEvent.updateMany({
    where: {
      id: params.eventId,
      project: { id: params.id, ownerId: user.id }
    },
    data: {
      title,
      date: toDate(date),
      color,
      note
    }
  });

  if (event.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string; eventId: string } }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = await prisma.projectEvent.deleteMany({
    where: {
      id: params.eventId,
      project: { id: params.id, ownerId: user.id }
    }
  });

  if (event.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
