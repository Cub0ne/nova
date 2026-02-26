import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Topbar from "@/components/Topbar";
import ProjectDetailClient from "@/components/ProjectDetailClient";
import { formatLocalDate } from "@/lib/date";

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }

  const project = await prisma.project.findFirst({
    where: { id: params.id, ownerId: userId },
    include: { events: true }
  });

  if (!project) {
    return (
      <>
        <Topbar userName={session.user?.name} />
        <main className="container">
          <div className="notice">项目不存在或无权限。</div>
        </main>
      </>
    );
  }

  return (
    <>
      <Topbar userName={session.user?.name} />
      <main className="container">
        <section className="project-hero">
          <div>
            <div className="badge">项目概览</div>
            <h1>{project.name}</h1>
            <p style={{ color: "var(--muted)" }}>{project.description}</p>
          </div>
        </section>
        <ProjectDetailClient project={project} events={project.events} />
      </main>
    </>
  );
}
