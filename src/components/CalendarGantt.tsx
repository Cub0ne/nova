"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatLocalDate } from "@/lib/date";
import CalendarCell from "@/components/CalendarCell";

interface ProjectItem {
  id: string;
  name: string;
  description?: string | null;
  startDate: string | Date;
  endDate: string | Date;
  progress: number;
  color?: string | null;
}

interface DailyEntryItem {
  id: string;
  date: string | Date;
  mood?: string | null;
  workContent?: string | null;
  journal?: string | null;
}

type ViewMode = "month" | "quarter" | "year";

function toDate(value: string | Date) {
  return value instanceof Date ? value : new Date(value);
}

function formatDate(date: Date) {
  return formatLocalDate(date);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthEnd(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export default function CalendarGantt({
  projects,
  dailyEntries
}: {
  projects: ProjectItem[];
  dailyEntries: DailyEntryItem[];
}) {
  const router = useRouter();
  const [baseDate, setBaseDate] = useState(() => new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectionStart, setSelectionStart] = useState<string | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<string | null>(null);
  const [addFormDates, setAddFormDates] = useState({
    startDate: "",
    endDate: ""
  });
  const [addFormProgress, setAddFormProgress] = useState(0);
  const [addFormColor, setAddFormColor] = useState("#d04f3b");
  const [showAddProject, setShowAddProject] = useState(false);
  const [viewDate, setViewDate] = useState<string | null>(null);
  const [viewProjectId, setViewProjectId] = useState<string | null>(null);

  const now = new Date();
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  const range = useMemo(() => {
    if (viewMode === "year") {
      return {
        start: new Date(year, 0, 1),
        end: new Date(year, 11, 31),
        days: 365 + (new Date(year, 1, 29).getMonth() === 1 ? 1 : 0)
      };
    }

    if (viewMode === "quarter") {
      const quarterStartMonth = Math.floor(month / 3) * 3;
      const start = new Date(year, quarterStartMonth, 1);
      const end = new Date(year, quarterStartMonth + 3, 0);
      const days = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
      return { start, end, days };
    }

    const start = getMonthStart(baseDate);
    const end = getMonthEnd(baseDate);
    return { start, end, days: end.getDate() };
  }, [baseDate, viewMode, year, month]);

  const monthLabel = useMemo(() => {
    if (viewMode === "quarter") {
      const quarter = Math.floor(month / 3) + 1;
      return `${year} Q${quarter}`;
    }
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "long"
    }).format(getMonthStart(baseDate));
  }, [viewMode, month, year, baseDate]);

  const entrySet = useMemo(
    () => new Set(dailyEntries.map((entry) => formatDate(startOfDay(toDate(entry.date))))),
    [dailyEntries]
  );

  const entryMap = useMemo(() => {
    const map = new Map<string, DailyEntryItem>();
    dailyEntries.forEach((entry) => {
      map.set(formatDate(startOfDay(toDate(entry.date))), entry);
    });
    return map;
  }, [dailyEntries]);

  const projectMap = useMemo(() => {
    const map = new Map<string, ProjectItem>();
    projects.forEach((project) => map.set(project.id, project));
    return map;
  }, [projects]);

  useEffect(() => {
    if (!selectionStart || !selectionEnd) return;
    setAddFormDates({ startDate: selectionStart, endDate: selectionEnd });
  }, [selectionStart, selectionEnd]);

  function moveMonth(delta: number) {
    const next = new Date(year, month + delta, 1);
    setBaseDate(next);
  }

  function handleDateSelect(dateKey: string) {
    if (!selectionStart || (selectionStart && selectionEnd)) {
      setSelectionStart(dateKey);
      setSelectionEnd(dateKey);
      return;
    }

    if (selectionStart && !selectionEnd) {
      if (dateKey < selectionStart) {
        setSelectionEnd(selectionStart);
        setSelectionStart(dateKey);
      } else {
        setSelectionEnd(dateKey);
      }
    }
  }

  const ganttRows = projects
    .map((project) => {
      const start = startOfDay(toDate(project.startDate));
      const end = startOfDay(toDate(project.endDate));

      if (end < range.start || start > range.end) {
        return null;
      }

      const clampedStart = start < range.start ? range.start : start;
      const clampedEnd = end > range.end ? range.end : end;

      const startCol =
        Math.floor(
          (clampedStart.getTime() - range.start.getTime()) / 86400000
        ) + 1;
      const endCol =
        Math.floor((clampedEnd.getTime() - range.start.getTime()) / 86400000) + 1;

      return {
        id: project.id,
        name: project.name,
        color: project.color ?? "#d04f3b",
        progress: Math.min(Math.max(project.progress ?? 0, 0), 100),
        startCol,
        endCol
      };
    })
    .filter(Boolean) as Array<{
    id: string;
    name: string;
    color: string;
    progress: number;
    startCol: number;
    endCol: number;
  }>;

  async function handleAddRow(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const formData = new FormData(event.currentTarget);

    const payload = {
      name: formData.get("name"),
      description: formData.get("description"),
      startDate: addFormDates.startDate,
      endDate: addFormDates.endDate,
      color: addFormColor,
      progress: Number(addFormProgress)
    };

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? `添加失败（${response.status}），请检查必填项或数据库迁移。`);
        setIsSubmitting(false);
        return;
      }

      setError(null);
      event.currentTarget.reset();
      setSelectionStart(null);
      setSelectionEnd(null);
      setAddFormDates({ startDate: "", endDate: "" });
      setAddFormProgress(0);
      setAddFormColor("#d04f3b");
      setIsSubmitting(false);
      router.refresh();
    } catch (err) {
      setError("网络错误，稍后再试。");
      setIsSubmitting(false);
    }
  }

  function renderMonthGrid(monthDate: Date) {
    const monthStart = getMonthStart(monthDate);
    const monthEnd = getMonthEnd(monthDate);
    const leading = monthStart.getDay();
    const totalDays = monthEnd.getDate();
    const cells = [
      ...Array.from({ length: leading }, () => null),
      ...Array.from({ length: totalDays }, (_, i) => i + 1)
    ];
    const paddedLength = Math.ceil(cells.length / 7) * 7;
    const paddedCells = cells.concat(Array.from({ length: paddedLength - cells.length }, () => null));
    const weeks = Array.from({ length: paddedCells.length / 7 }, (_, i) =>
      paddedCells.slice(i * 7, i * 7 + 7)
    );

    return (
      <div className="calendar-grid-wrap">
        {weeks.map((week, weekIndex) => {
          const weekStartIndex = week.findIndex((day) => day !== null);
          const weekEndIndex = [...week].reverse().findIndex((day) => day !== null);
          const weekStartDay = weekStartIndex === -1 ? null : week[weekStartIndex] as number;
          const weekEndDay =
            weekEndIndex === -1 ? null : week[week.length - 1 - weekEndIndex] as number;

          const weekStartDate = weekStartDay
            ? new Date(monthDate.getFullYear(), monthDate.getMonth(), weekStartDay)
            : null;
          const weekEndDate = weekEndDay
            ? new Date(monthDate.getFullYear(), monthDate.getMonth(), weekEndDay)
            : null;

          const bars: Array<{
            id: string;
            projectId: string;
            color: string;
            startCol: number;
            endCol: number;
            name: string;
          }> = [];

          if (weekStartDate && weekEndDate) {
            const sorted = [...projects].sort(
              (a, b) =>
                startOfDay(toDate(a.startDate)).getTime() -
                startOfDay(toDate(b.startDate)).getTime()
            );
            const rowEnds: Date[] = [];

            sorted.forEach((project) => {
              const projStart = startOfDay(toDate(project.startDate));
              const projEnd = startOfDay(toDate(project.endDate));
              if (projEnd < weekStartDate || projStart > weekEndDate) {
                return;
              }
              const clampedStart = projStart < weekStartDate ? weekStartDate : projStart;
              const clampedEnd = projEnd > weekEndDate ? weekEndDate : projEnd;
              const startCol =
                Math.floor((clampedStart.getTime() - weekStartDate.getTime()) / 86400000) + 1;
              const endCol =
                Math.floor((clampedEnd.getTime() - weekStartDate.getTime()) / 86400000) + 1;

              let rowIndex = rowEnds.findIndex((end) => end < clampedStart);
              if (rowIndex === -1) {
                rowIndex = rowEnds.length;
                rowEnds.push(clampedEnd);
              } else {
                rowEnds[rowIndex] = clampedEnd;
              }

              bars.push({
                id: `${project.id}-${weekIndex}`,
                projectId: project.id,
                color: project.color ?? "#d04f3b",
                startCol,
                endCol,
                name: project.name
              });
            });
          }

          return (
            <div key={`week-${weekIndex}`} className="calendar-week-block">
              <div className="calendar-grid">
                {week.map((day, idx) => {
                  if (!day) {
                    return <div key={`empty-${weekIndex}-${idx}`} className="calendar-cell empty" />;
                  }
                  const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
                  const dateKey = formatDate(date);
                  const weekday = new Intl.DateTimeFormat("zh-CN", { weekday: "short" }).format(date);
                  const hasEntry = entrySet.has(dateKey);
                  const isToday = formatDate(startOfDay(date)) === formatDate(startOfDay(now));
                  const inRange =
                    selectionStart &&
                    selectionEnd &&
                    dateKey >= selectionStart &&
                    dateKey <= selectionEnd;
                  const isSelected = selectionStart && selectionEnd && dateKey === selectionStart;
                  return (
                    <CalendarCell
                      key={dateKey}
                      dateKey={dateKey}
                      dayLabel={day}
                      weekLabel={weekday}
                      hasEntry={hasEntry}
                      isToday={isToday}
                      inRange={!!inRange}
                      isSelected={!!isSelected}
                      onSelect={() => handleDateSelect(dateKey)}
                      onView={() => {
                        setViewProjectId(null);
                        setViewDate(dateKey);
                      }}
                      onEdit={() => router.push(`/daily/${dateKey}`)}
                    />
                  );
                })}
              </div>
              {bars.length > 0 && (
                <div className="week-bars" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
                  {bars.map((bar) => (
                    <button
                      key={bar.id}
                      type="button"
                      className="week-bar"
                      style={{
                        gridColumn: `${bar.startCol} / ${bar.endCol + 1}`,
                        background: bar.color
                      }}
                      title={bar.name}
                      onClick={() => {
                        setViewDate(null);
                        setViewProjectId(bar.projectId);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="calendar-stack">
      <section className="calendar-board">
        <div className="calendar-header">
          <div>
            <div className="badge">万年历同步 · 月历视图 · 多项目甘特图</div>
            <h2>{monthLabel}</h2>
          </div>
          <div className="calendar-controls">
            <button className="button secondary" type="button" onClick={() => moveMonth(-1)}>
              上个月
            </button>
            <button className="button secondary" type="button" onClick={() => setBaseDate(new Date())}>
              本月
            </button>
            <button className="button secondary" type="button" onClick={() => moveMonth(1)}>
              下个月
            </button>
          </div>
        </div>

        <div className="calendar-mode">
          <button
            type="button"
            className={`tag ${viewMode === "month" ? "active" : ""}`}
            onClick={() => setViewMode("month")}
          >
            单月
          </button>
          <button
            type="button"
            className={`tag ${viewMode === "quarter" ? "active" : ""}`}
            onClick={() => setViewMode("quarter")}
          >
            季度
          </button>
          <button
            type="button"
            className={`tag ${viewMode === "year" ? "active" : ""}`}
            onClick={() => setViewMode("year")}
          >
            年视图
          </button>
        </div>

        {viewMode === "month" && renderMonthGrid(baseDate)}
        {viewMode === "quarter" && (
          <div className="calendar-quarter">
            {Array.from({ length: 3 }, (_, idx) => {
              const quarterStartMonth = Math.floor(month / 3) * 3;
              const monthDate = new Date(year, quarterStartMonth + idx, 1);
              return (
                <div key={idx} className="calendar-month-block">
                  <div className="tag">
                    {new Intl.DateTimeFormat("zh-CN", { month: "long" }).format(monthDate)}
                  </div>
                  {renderMonthGrid(monthDate)}
                </div>
              );
            })}
          </div>
        )}
        {viewMode === "year" && (
          <div className="calendar-year">
            {Array.from({ length: 12 }, (_, idx) => {
              const monthDate = new Date(year, idx, 1);
              return (
                <div key={idx} className="calendar-year-row">
                  <div className="tag">
                    {new Intl.DateTimeFormat("zh-CN", { month: "long" }).format(monthDate)}
                  </div>
                  {renderMonthGrid(monthDate)}
                </div>
              );
            })}
          </div>
        )}

        <div className="gantt-board">
          <div className="gantt-scroll">
            <div className="gantt-header">
              <span>项目</span>
              <button
                className="button secondary"
                type="button"
                onClick={() => setShowAddProject((prev) => !prev)}
              >
                添加项目
              </button>
              <div
                className="gantt-columns"
                style={{ gridTemplateColumns: `repeat(${range.days}, 1fr)` }}
              >
                {Array.from({ length: range.days }, (_, offset) => {
                  const date = new Date(range.start);
                  date.setDate(range.start.getDate() + offset);
                  return (
                    <span key={offset} className="gantt-day">
                      {date.getDate()}
                    </span>
                  );
                })}
              </div>
            </div>

            {ganttRows.length === 0 && (
              <div className="notice">暂无项目进度，先添加事件行。</div>
            )}

            {ganttRows.map((row) => (
              <div key={row.id} className="gantt-row-new">
                <div className="gantt-label">
                  <Link className="gantt-edit" href={`/projects/${row.id}`}>
                    {row.name}
                  </Link>
                  <span className="tag" style={{ borderColor: row.color }}>
                    {row.progress}%
                  </span>
                </div>
                <div className="gantt-track" style={{ gridTemplateColumns: `repeat(${range.days}, 1fr)` }}>
                  <div
                    className="gantt-bar-new"
                    style={{
                      gridColumn: `${row.startCol} / ${row.endCol + 1}`,
                      background: row.color
                    }}
                  >
                    <span
                      className="gantt-progress-new"
                      style={{ width: `${row.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showAddProject && (
        <div className="modal-mask" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="panel-header">
              <h3>添加事件行（不同项目）</h3>
              <button className="tag" type="button" onClick={() => setShowAddProject(false)}>
                关闭
              </button>
            </div>
            <p className="muted">先在日历上选择日期范围，再填写项目内容。</p>
            <form onSubmit={handleAddRow} className="grid" style={{ gap: 12 }}>
              <input className="input" name="name" placeholder="项目/事件名称" required />
              <input className="input" name="description" placeholder="备注（可选）" />
              <div className="grid grid-2">
                <input
                  className="input"
                  name="startDate"
                  type="date"
                  value={addFormDates.startDate}
                  onChange={(event) =>
                    setAddFormDates({ ...addFormDates, startDate: event.target.value })
                  }
                  required
                />
                <input
                  className="input"
                  name="endDate"
                  type="date"
                  value={addFormDates.endDate}
                  onChange={(event) =>
                    setAddFormDates({ ...addFormDates, endDate: event.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-2">
                <input
                  className="input"
                  name="progress"
                  type="number"
                  min={0}
                  max={100}
                  value={addFormProgress}
                  onChange={(event) => setAddFormProgress(Number(event.target.value))}
                />
                <input
                  className="input color-input"
                  name="color"
                  type="color"
                  value={addFormColor}
                  onChange={(event) => setAddFormColor(event.target.value)}
                />
              </div>
              {error && <div className="notice">{error}</div>}
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="button secondary" type="button" onClick={() => setShowAddProject(false)}>
                  取消
                </button>
                <button className="button" disabled={isSubmitting}>
                  添加到甘特图
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {viewProjectId && projectMap.get(viewProjectId) && (
        <div className="side-panel">
          <div className="side-panel-header">
            <div>
              <div className="badge">项目概览</div>
              <h3>{projectMap.get(viewProjectId)?.name}</h3>
            </div>
          </div>
          <div className="side-panel-body">
            <div className="tag">
              周期 {formatDate(startOfDay(toDate(projectMap.get(viewProjectId)!.startDate)))} -{" "}
              {formatDate(startOfDay(toDate(projectMap.get(viewProjectId)!.endDate)))}
            </div>
            <div className="tag">进度 {projectMap.get(viewProjectId)?.progress}%</div>
            <div className="notice">
              {projectMap.get(viewProjectId)?.description || "暂无描述。"}
            </div>
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button className="button secondary" onClick={() => setViewProjectId(null)}>
              关闭
            </button>
            <button
              className="button"
              onClick={() => router.push(`/projects/${viewProjectId}`)}
            >
              去项目
            </button>
          </div>
        </div>
      )}
      {!viewProjectId && viewDate && (
        <div className="side-panel">
          <div className="side-panel-header">
            <div>
              <div className="badge">每日打卡</div>
              <h3>{viewDate}</h3>
            </div>
          </div>
          {entryMap.get(viewDate) ? (
            <div className="side-panel-body">
              <div className="tag">心情 {entryMap.get(viewDate)?.mood}</div>
              <p style={{ margin: "10px 0" }}>{entryMap.get(viewDate)?.workContent}</p>
              <div className="notice">
                {entryMap.get(viewDate)?.journal || "暂无日常/反思。"}
              </div>
            </div>
          ) : (
            <div className="notice">当天还没有打卡记录。</div>
          )}
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button className="button secondary" onClick={() => setViewDate(null)}>
              关闭
            </button>
            <button className="button" onClick={() => router.push(`/daily/${viewDate}`)}>
              去编辑
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
