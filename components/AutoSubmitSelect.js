"use client";
// <select> que envia o formulário pai automaticamente ao mudar.
export default function AutoSubmitSelect({ children, className = "select select-inline", ...props }) {
  return (
    <select {...props} className={className} onChange={(e) => e.currentTarget.form?.requestSubmit()}>
      {children}
    </select>
  );
}
