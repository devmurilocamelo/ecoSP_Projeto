"use client";
import { useActionState } from "react";
import { login } from "@/lib/actions";

export default function LoginForm({ needsCode }) {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action}>
      {state?.error && <div className="error">{state.error}</div>}
      <div className="field">
        <label htmlFor="name">Seu nome</label>
        <input id="name" name="name" className="input" required autoComplete="name" />
      </div>
      <div className="field">
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" className="input" required autoComplete="email" />
      </div>
      {needsCode && (
        <div className="field">
          <label htmlFor="code">Código de acesso do time</label>
          <input id="code" name="code" type="password" className="input" required />
        </div>
      )}
      <button className="btn btn-primary" style={{ width: "100%", height: 38 }} disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
