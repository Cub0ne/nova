"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Project, ProjectEvent } from "@prisma/client";
import { formatLocalDate } from "@/lib/date";

interface ProjectDetailClientProps {
  project: Project;
  events: ProjectEvent[];
}

export default function ProjectDetailClient({ project, events }: ProjectDetailClientProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [eventItems, setEventItems] = useState<ProjectEvent[]>(events);
  const [eventMessage, setEventMessage] = useState<string | null>(null);

  useEffect(() => {
    setEventItems(events);
  }, [events]);

  async function handleProgress(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "");
    const progress = Number(formData.get("progress"));
    const color = String(formData.get("color"));
    const startDate = String(formData.get("startDate") || "");
    const endDate = String(formData.get("endDate") || "");

    const response = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, progress, color, startDate, endDate })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessage(data.error ?? `保存失败（${response.status}）。`);
      setIsSaving(false);
      return;
    }

    setMessage("已保存。");
    setIsSaving(false);
    router.refresh();
  }

  async function handleEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form) {
      return;
    }
    const formData = new FormData(form);

    await fetch(`/api/projects/${project.id}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        date: formData.get("date"),
        color: formData.get("color"),
        note: formData.get("note")
      })
    });

    form.reset();
    router.refresh();
  }

  async function handleEventUpdate(eventId: string) {
    setEventMessage(null);
    const eventItem = eventItems.find((item) => item.id === eventId);
    if (!eventItem) return;

    const response = await fetch(`/api/projects/${project.id}/events/${eventId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: eventItem.title,
        date: formatLocalDate(eventItem.date),
        color: eventItem.color,
        note: eventItem.note
      })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setEventMessage(data.error ?? `保存失败（${response.status}）。`);
      return;
    }

    setEventMessage("时间点已更新。");
    router.refresh();
  }

  async function handleEventDelete(eventId: string) {
    setEventMessage(null);
    const response = await fetch(`/api/projects/${project.id}/events/${eventId}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setEventMessage(data.error ?? `删除失败（${response.status}）。`);
      return;
    }

    setEventItems((prev) => prev.filter((item) => item.id !== eventId));
    setEventMessage("时间点已删除。");
    router.refresh();
  }

  return (
    <div className="project-detail">
      <section className="panel panel-split">
        <div>
          <h2>更新进度</h2>
          <p className="muted">快速调整进度和项目颜色，实时同步到甘特图。</p>
          <form onSubmit={handleProgress} className="grid" style={{ gap: 12 }}>
            <label className="field">
              <span className="field-label">项目名称</span>
              <input
                className="input"
                type="text"
                name="name"
                defaultValue={project.name}
                required
              />
            </label>
            <label className="field">
              <span className="field-label">进度（0-100）</span>
              <input
                className="input compact"
                type="number"
                name="progress"
                min={0}
                max={100}
                defaultValue={project.progress}
                required
              />
            </label>
            <label className="field">
              <span className="field-label">颜色标记</span>
              <input
                className="input compact color-input"
                type="color"
                name="color"
                defaultValue={project.color ?? "#d04f3b"}
              />
            </label>
            <div className="grid grid-2">
              <label className="field">
                <span className="field-label">开始日期</span>
                <input
                  className="input"
                  type="date"
                  name="startDate"
                  defaultValue={formatLocalDate(project.startDate)}
                />
              </label>
              <label className="field">
                <span className="field-label">结束日期</span>
                <input
                  className="input"
                  type="date"
                  name="endDate"
                  defaultValue={formatLocalDate(project.endDate)}
                />
              </label>
            </div>
            {message && <div className="notice">{message}</div>}
            <button className="button fit" disabled={isSaving}>
              保存进度
            </button>
          </form>
        </div>
        <div className="panel-aside">
          <div className="tag">当前进度 {project.progress}%</div>
          <div className="progress-track">
            <span className="progress-fill" style={{ width: `${project.progress}%` }} />
          </div>
          <div className="tag">
            <span className="color-dot" style={{ background: project.color }} />
            当前颜色
          </div>
        </div>
      </section>

      <section className="panel panel-split">
        <div>
          <h2>添加时间点</h2>
          <p className="muted">记录关键节点，方便团队追踪项目里程碑。</p>
          <form onSubmit={handleEvent} className="grid" style={{ gap: 12 }}>
            <input className="input" name="title" placeholder="事件标题" required />
            <input className="input" name="date" type="date" required />
            <input className="input compact" name="color" type="color" defaultValue="#1f7a6d" />
            <input className="input" name="note" placeholder="补充说明" />
            <button className="button fit">保存时间点</button>
          </form>
        </div>
        <div className="panel-aside">
          <div className="tag">已记录 {events.length} 项</div>
          <div className="notice">点击项目名可继续修改，时间点会在下方列表显示。</div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>时间点记录</h2>
          <span className="tag">按日期排列</span>
        </div>
        {eventMessage && <div className="notice">{eventMessage}</div>}
        <div className="event-list">
          {eventItems.map((eventItem) => (
            <div key={eventItem.id} className="event-row">
              <input
                className="input"
                value={eventItem.title}
                onChange={(event) =>
                  setEventItems((prev) =>
                    prev.map((item) =>
                      item.id === eventItem.id ? { ...item, title: event.target.value } : item
                    )
                  )
                }
              />
              <input
                className="input"
                type="date"
                value={formatLocalDate(eventItem.date)}
                onChange={(event) =>
                  setEventItems((prev) =>
                    prev.map((item) =>
                      item.id === eventItem.id
                        ? { ...item, date: new Date(event.target.value) }
                        : item
                    )
                  )
                }
              />
              <input
                className="input color-input"
                type="color"
                value={eventItem.color}
                onChange={(event) =>
                  setEventItems((prev) =>
                    prev.map((item) =>
                      item.id === eventItem.id ? { ...item, color: event.target.value } : item
                    )
                  )
                }
              />
              <input
                className="input"
                value={eventItem.note ?? ""}
                placeholder="备注"
                onChange={(event) =>
                  setEventItems((prev) =>
                    prev.map((item) =>
                      item.id === eventItem.id ? { ...item, note: event.target.value } : item
                    )
                  )
                }
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => handleEventUpdate(eventItem.id)}
                >
                  保存
                </button>
                <button
                  className="button"
                  type="button"
                  onClick={() => handleEventDelete(eventItem.id)}
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
        {eventItems.length === 0 && <div className="notice">暂无时间点。</div>}
      </section>
    </div>
  );
}
