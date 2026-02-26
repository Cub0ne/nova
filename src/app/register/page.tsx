import Link from "next/link";
import Topbar from "@/components/Topbar";
import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <>
      <Topbar showAuthLinks />
      <main className="container">
        <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
          <h1>创建账号</h1>
          <RegisterForm />
          <p style={{ marginTop: 12 }}>
            已有账号？ <Link href="/login">去登录</Link>
          </p>
        </div>
      </main>
    </>
  );
}
