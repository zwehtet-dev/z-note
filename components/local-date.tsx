"use client";

import { useSyncExternalStore } from "react";

const format = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
const subscribe = () => () => {};

// Empty on the server (UTC on Vercel); filled in after hydration with the viewer's locale and time zone.
export function LocalDate({ date }: { date: Date }) {
  const text = useSyncExternalStore(subscribe, () => format.format(date), () => "");
  return <time dateTime={date.toISOString()}>{text}</time>;
}
