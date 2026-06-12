import { Badge } from "@/components/ui/badge";

type StatusBadgeTone =
  | "active"
  | "inactive"
  | "reserved"
  | "not-tracked"
  | "future";

type StatusBadgeProps = {
  status: StatusBadgeTone;
  label?: string;
};

const statusStyles: Record<
  StatusBadgeTone,
  { label: string; className: string }
> = {
  active: {
    label: "Activo",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
  inactive: {
    label: "Inactivo",
    className:
      "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-300",
  },
  reserved: {
    label: "Reservado",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  },
  "not-tracked": {
    label: "No inventariable",
    className:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300",
  },
  future: {
    label: "Futuro",
    className:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300",
  },
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusStyles[status];

  return (
    <Badge variant="outline" className={config.className}>
      {label ?? config.label}
    </Badge>
  );
}
