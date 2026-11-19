"use client";
import { useFormStatus } from "react-dom";

export default function SubmitButton({ children, className = "btn btn-primary", pendingText, confirm: confirmMsg, ...props }) {
  const { pending } = useFormStatus();
  return (
    <button
      {...props}
      type="submit"
      className={className}
      disabled={pending}
      onClick={(e) => {
        if (confirmMsg && !window.confirm(confirmMsg)) e.preventDefault();
      }}
    >
      {pending ? pendingText || "Salvando…" : children}
    </button>
  );
}
