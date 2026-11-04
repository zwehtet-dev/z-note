import { it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LocalDate } from "@/components/local-date";

it("leaves the date unformatted on the server so the viewer's time zone and locale apply", () => {
  const html = renderToStaticMarkup(<LocalDate date={new Date("2026-01-01T00:30:00Z")} />);
  expect(html).toBe('<time dateTime="2026-01-01T00:30:00.000Z"></time>');
});
