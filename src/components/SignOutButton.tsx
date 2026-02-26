"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      className="tag"
      onClick={() => signOut({ callbackUrl: "/" })}
      type="button"
    >
      退出
    </button>
  );
}
