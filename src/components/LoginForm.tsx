"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl,
      redirect: true
    });

    if (result?.error) {
      setError("账号或密码不正确");
      return;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid" style={{ gap: 12 }}>
      <input className="input" name="email" type="email" placeholder="邮箱" required />
      <input className="input" name="password" type="password" placeholder="密码" required />
      {error && <div className="notice">{error}</div>}
      <button className="button">登录</button>
    </form>
  );
}
