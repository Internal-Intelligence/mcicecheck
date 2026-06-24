import type { IceCreamStatus, McLocation } from "@/types";

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function calcBrokenPercent(locations: McLocation[]): number {
  const known = locations.filter((l) => l.status !== "unknown");
  if (known.length === 0) return 0;
  const broken = known.filter((l) => l.status === "broken").length;
  return Math.round((broken / known.length) * 100);
}

export function statusLabel(status: IceCreamStatus): string {
  switch (status) {
    case "working":
      return "Working";
    case "broken":
      return "Broken";
    default:
      return "Unknown";
  }
}

export function statusColor(status: IceCreamStatus): string {
  switch (status) {
    case "working":
      return "#34D399";
    case "broken":
      return "#F87171";
    default:
      return "#9CA3AF";
  }
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}