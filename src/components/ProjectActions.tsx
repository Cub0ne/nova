"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProjectActions({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);
    const response = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? `删除失败（${response.status}）。`);
      setIsDeleting(false);
      return;
    }
    setIsDeleting(false);
    setIsOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        className="button secondary"
        onClick={() => setIsOpen(true)}
      >
        删除项目
      </button>
      {isOpen && (
        <div className="modal-mask" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>确认删除项目</h3>
            <p style={{ color: "var(--muted)" }}>删除后无法恢复。</p>
            {error && <div className="notice">{error}</div>}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
              <button
                type="button"
                className="button secondary"
                onClick={() => setIsOpen(false)}
                disabled={isDeleting}
              >
                取消
              </button>
              <button
                type="button"
                className="button"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
