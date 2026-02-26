import Link from "next/link";
import Topbar from "@/components/Topbar";
import LoginForm from "@/components/LoginForm";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <>
      <Topbar showAuthLinks />
      <main className="container">
        <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
          <h1>登录</h1>
          <Suspense fallback={<div className="notice">加载中...</div>}>
            <LoginForm />
          </Suspense>
          <p style={{ marginTop: 12 }}>
            还没有账号？ <Link href="/register">去注册</Link>
          </p>
        </div>
      </main>
    </>
  );
}
