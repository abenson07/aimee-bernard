"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <div className="login-wrap">
      <form action={formAction} className="login-card">
        <h1>Aimee Bernard</h1>
        <label className="field">
          <span className="label">Password</span>
          <input type="password" name="password" className="input" required autoFocus />
        </label>
        {state?.error && <p className="form-error">{state.error}</p>}
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
