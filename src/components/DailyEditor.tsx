"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DailyEntry } from "@prisma/client";
import { MOOD_OPTIONS } from "@/lib/mood";

interface DailyEditorProps {
  date: string;
  entry: DailyEntry | null;
  readOnly?: boolean;
}

export default function DailyEditor({ date, entry, readOnly = false }: DailyEditorProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (readOnly) {
      return;
    }
    setError(null);
    setSuccess(null);
    const formData = new FormData(event.currentTarget);
    const payload = {
      date,
      workContent: formData.get("workContent"),
      mood: formData.get("mood"),
      journal: formData.get("journal")
    };

    const response = await fetch("/api/daily-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? `保存失败（${response.status}）。`);
      return;
    }

    setSuccess("保存成功，已返回控制台。");
    router.refresh();
    router.push("/dashboard");
  }

  return (
    <section className="card">
      <h2>今日记录</h2>
      <form onSubmit={handleSubmit} className="grid" style={{ gap: 12 }}>
        <textarea
          className="textarea"
          name="workContent"
          placeholder="今天具体做了什么？"
          defaultValue={entry?.workContent ?? ""}
          required={!readOnly}
          readOnly={readOnly}
        />
        <select
          className="select"
          name="mood"
          defaultValue={entry?.mood ?? ""}
          required={!readOnly}
          disabled={readOnly}
        >
          <option value="">选择心情</option>
          {MOOD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <textarea
          className="textarea"
          name="journal"
          placeholder="日常记录/复盘"
          defaultValue={entry?.journal ?? ""}
          readOnly={readOnly}
        />
        {error && <div className="notice">{error}</div>}
        {success && <div className="notice">{success}</div>}
        {!readOnly && <button className="button">保存</button>}
      </form>
    </section>
  );
}
