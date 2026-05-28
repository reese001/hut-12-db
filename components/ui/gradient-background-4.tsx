import { cn } from "@/lib/utils";

export function Component({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0 h-full w-full bg-background [background:radial-gradient(125%_125%_at_50%_-50%,#6366f136_40%,transparent_100%)]",
        className,
      )}
    />
  );
}
