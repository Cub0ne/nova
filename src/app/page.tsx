import Link from "next/link";
import Topbar from "@/components/Topbar";

export default function HomePage() {
  return (
    <>
      <Topbar showAuthLinks />
      <main className="container">
        <section className="card" style={{ padding: 32 }}>
          <div className="badge">专注项目推进与日常记录</div>
          <h1>Nova · 项目系统</h1>
          <p style={{ color: "var(--muted)", fontSize: 18 }}>
            横道图进度、彩色时间点、每日工作记录、心情与日常，一体化管理。
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <Link href="/register" className="button">
              立即开始
            </Link>
            <Link href="/login" className="button secondary">
              登录
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
