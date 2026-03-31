import type { ReactNode } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSidebar } from "../context/SidebarContext";
import { useRawT } from "../i18n/useRawT";

export interface PageTabItem {
  value: string;
  label: ReactNode;
}

interface PageTabBarProps {
  items: PageTabItem[];
  value?: string;
  onValueChange?: (value: string) => void;
  align?: "center" | "start";
}

export function PageTabBar({ items, value, onValueChange, align = "center" }: PageTabBarProps) {
  const { isMobile } = useSidebar();
  const rawT = useRawT();

  if (isMobile && value !== undefined && onValueChange) {
    return (
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="h-9 rounded-md border border-border bg-background px-2 py-1 text-base focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {items.map((item) => (
          <option key={item.value} value={item.value}>
            {typeof item.label === "string" ? rawT(item.label) : rawT(item.value)}
          </option>
        ))}
      </select>
    );
  }

  return (
      <TabsList variant="line" className={align === "start" ? "justify-start" : undefined}>
        {items.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            {typeof item.label === "string" ? rawT(item.label) : item.label}
          </TabsTrigger>
        ))}
      </TabsList>
  );
}
