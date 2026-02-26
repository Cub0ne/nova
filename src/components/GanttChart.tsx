import { Project } from "@prisma/client";
import { formatLocalDate } from "@/lib/date";

function formatDate(date: Date) {
  return formatLocalDate(date);
}

export default function GanttChart({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return <div className="notice">还没有项目进度，先创建一个项目吧。</div>;
  }

  return (
    <div className="gantt">
      {projects.map((project) => {
        const duration = project.endDate.getTime() - project.startDate.getTime();
        const progress = Math.min(Math.max(project.progress, 0), 100);
        const width = duration > 0 ? 100 : 100;
        return (
          <div key={project.id} className="gantt-row">
            <div>
              <strong>{project.name}</strong>
              <div className="tag" style={{ marginTop: 6 }}>
                {formatDate(project.startDate)} - {formatDate(project.endDate)}
              </div>
            </div>
            <div className="gantt-bar" style={{ width: `${width}%` }}>
              <div className="gantt-progress" style={{ width: `${progress}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
