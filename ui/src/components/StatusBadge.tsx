import { cn } from "../lib/utils";
import { statusBadge, statusBadgeDefault } from "../lib/status-colors";
import { useRawT } from "../i18n/useRawT";

export function StatusBadge({ status }: { status: string }) {
  const rawT = useRawT();

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap shrink-0",
        statusBadge[status] ?? statusBadgeDefault
      )}
    >
      {rawT(status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))}
    </span>
  );
}
