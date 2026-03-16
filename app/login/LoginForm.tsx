"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl: "/dashboard",
      redirect: true,
    });

    if (result?.error) {
      setPending(false);
      setError("로그인에 실패했습니다. 환경변수 계정을 확인하세요.");
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <label className="field" htmlFor="email">
        <span>Email</span>
        <input
          autoComplete="email"
          id="email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </label>
      <label className="field" htmlFor="password">
        <span>Password</span>
        <input
          autoComplete="current-password"
          id="password"
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </label>
      {error ? <p className="error-text">{error}</p> : null}
      <button className="btn-primary" disabled={pending} type="submit">
        {pending ? "로그인 중..." : "로그인"}
      </button>
    </form>
  );
}
