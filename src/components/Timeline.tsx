import { ProjectEvent } from "@prisma/client";
import { formatLocalDate } from "@/lib/date";

export default function Timeline({ events }: { events: ProjectEvent[] }) {
  if (events.length === 0) {
    return <div className="notice">暂无时间点记录。</div>;
  }

  return (
    <div className="timeline">
      {events.map((event) => (
        <span key={event.id} className="tag">
          <span
            className="timeline-dot"
            style={{ background: event.color }}
            aria-hidden
          />
          {event.title} · {formatLocalDate(event.date)}
        </span>
      ))}
    </div>
  );
}
