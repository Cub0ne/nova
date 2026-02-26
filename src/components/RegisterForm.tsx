"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password")
    };

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "注册失败");
      return;
    }

    router.push("/login");
  }

  return (
    <form onSubmit={handleSubmit} className="grid" style={{ gap: 12 }}>
      <input className="input" name="name" placeholder="姓名" required />
      <input className="input" name="email" type="email" placeholder="邮箱" required />
      <input className="input" name="password" type="password" placeholder="密码" required />
      {error && <div className="notice">{error}</div>}
      <button className="button">创建账号</button>
    </form>
  );
}
