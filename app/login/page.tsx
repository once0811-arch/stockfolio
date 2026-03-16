import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="panel">
      <h1>로그인</h1>
      <p>
        M0 기본 인증은 로컬 환경변수 `DEMO_AUTH_EMAIL`,
        `DEMO_AUTH_PASSWORD`를 사용합니다.
      </p>
      <LoginForm />
    </div>
  );
}
