import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "surface" | "danger" | "warning";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-white/10 text-foreground/80 border-white/10",
    primary: "bg-primary/15 text-primary border-primary/30",
    surface: "bg-surface border-border text-muted",
    danger: "bg-danger/15 text-danger border-danger/30",
    warning: "bg-warning/15 text-warning border-warning/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border px-2.5 py-0.5 text-xs font-medium rounded-full",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
