import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Topbar from "@/components/Topbar";
import ProjectActions from "@/components/ProjectActions";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" }
  });

  return (
    <>
      <Topbar userName={session.user?.name} />
      <main className="container">
        <h1>项目列表</h1>
        <div className="grid">
          {projects.map((project) => (
            <div key={project.id} className="card">
              <h2>{project.name}</h2>
              <p style={{ color: "var(--muted)" }}>{project.description}</p>
              <div className="tag" style={{ borderColor: project.color, display: "inline-flex", gap: 8 }}>
                <span className="color-dot" style={{ background: project.color }} />
                颜色标记
              </div>
              <div className="tag">进度 {project.progress}%</div>
              <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                <Link href={`/projects/${project.id}`} className="button secondary">
                  进入项目
                </Link>
                <ProjectActions projectId={project.id} />
              </div>
            </div>
          ))}
          {projects.length === 0 && <div className="notice">还没有项目。</div>}
        </div>
      </main>
    </>
  );
}
