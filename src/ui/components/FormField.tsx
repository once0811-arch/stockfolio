import type { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  children: ReactNode;
};

export function FormField({ label, htmlFor, children }: FormFieldProps) {
  return (
    <label className="ds-field" htmlFor={htmlFor}>
      <span>{label}</span>
      {children}
    </label>
  );
}
