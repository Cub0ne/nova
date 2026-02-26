import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

interface TopbarProps {
  userName?: string | null;
  showAuthLinks?: boolean;
}

export default function Topbar({ userName, showAuthLinks }: TopbarProps) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="badge">Nova Project System</span>
        <strong>项目进度与每日心情</strong>
      </div>
      <nav style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Link href="/dashboard" className="tag">
          控制台
        </Link>
        <Link href="/projects" className="tag">
          项目列表
        </Link>
        {showAuthLinks ? (
          <>
            <Link href="/login" className="tag">
              登录
            </Link>
            <Link href="/register" className="tag">
              注册
            </Link>
          </>
        ) : (
          <>
            <span className="tag">你好，{userName ?? "伙伴"}</span>
            <SignOutButton />
          </>
        )}
      </nav>
    </header>
  );
}
