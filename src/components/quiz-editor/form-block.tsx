import { useId, type ReactNode } from "react";
import { CircleAlertIcon } from "lucide-react";

export const inputClass =
  "w-full rounded-xl border border-input bg-card px-4 py-3 text-base shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-ring/40 aria-invalid:border-incorrect";

export function FormBlock({
  label,
  hint,
  error,
  optional = false,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  htmlFor?: string;
  children: ReactNode;
}) {
  const labelId = useId();
  const grouped = htmlFor === undefined;

  const text = (
    <>
      {label}
      {optional && (
        <span className="font-normal text-muted-foreground"> (optional)</span>
      )}
    </>
  );

  return (
    <div
      role={grouped ? "group" : undefined}
      aria-labelledby={grouped ? labelId : undefined}
      className="space-y-2">
      <div className="space-y-0.5">
        {grouped ? (
          <p id={labelId} className="text-sm font-medium">
            {text}
          </p>
        ) : (
          <label htmlFor={htmlFor} className="block text-sm font-medium">
            {text}
          </label>
        )}
        {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      </div>

      {children}

      {error && (
        <p className="flex items-center gap-1.5 text-sm text-incorrect-ink">
          <CircleAlertIcon aria-hidden className="size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
