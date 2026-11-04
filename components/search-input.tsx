"use client";

import { useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

export function SearchInput({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function search(q: string, delay: number) {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => router.replace(pathname + (q ? "?q=" + encodeURIComponent(q) : "")), delay);
  }

  return (
    <Input
      type="search"
      aria-label="Search notes"
      placeholder="Search"
      defaultValue={defaultValue}
      onChange={(e) => search(e.target.value.trim(), 250)}
      onKeyDown={(e) => {
        if (e.key !== "Escape") return;
        e.currentTarget.value = "";
        search("", 0);
      }}
    />
  );
}
