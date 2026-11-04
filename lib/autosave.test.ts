import { it, expect, vi, beforeEach } from "vitest";
import { createAutosaver, type SaveStatus } from "./autosave";

beforeEach(() => vi.useFakeTimers());

function setup(save: (v: string) => Promise<void>) {
  const statuses: SaveStatus[] = [];
  const s = createAutosaver({ save, delay: 800, onStatus: (x) => statuses.push(x) });
  return { s, statuses };
}

it("debounces rapid updates into one save of the latest value", async () => {
  const save = vi.fn().mockResolvedValue(undefined);
  const { s, statuses } = setup(save);
  s.update("a"); s.update("ab"); s.update("abc");
  expect(statuses[0]).toBe("pending");
  await vi.advanceTimersByTimeAsync(799);
  expect(save).not.toHaveBeenCalled();
  await vi.advanceTimersByTimeAsync(1);
  expect(save).toHaveBeenCalledExactlyOnceWith("abc");
  expect(statuses.at(-1)).toBe("saved");
});

it("never overlaps saves and saves the newest value after the in-flight one", async () => {
  let release!: () => void;
  const save = vi.fn()
    .mockReturnValueOnce(new Promise<void>((r) => (release = r)))
    .mockResolvedValue(undefined);
  const { s, statuses } = setup(save);
  s.update("v1"); await vi.advanceTimersByTimeAsync(800);
  s.update("v2"); await vi.advanceTimersByTimeAsync(800);
  expect(save).toHaveBeenCalledTimes(1);
  release(); await vi.runAllTimersAsync();
  expect(save).toHaveBeenCalledTimes(2);
  expect(save).toHaveBeenLastCalledWith("v2");
  expect(statuses.filter((x) => x === "saved")).toHaveLength(1);
  expect(statuses.at(-1)).toBe("saved");
});

it("reports error on failure and retries on the next update", async () => {
  const save = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(undefined);
  const { s, statuses } = setup(save);
  s.update("x"); await vi.advanceTimersByTimeAsync(800);
  expect(statuses.at(-1)).toBe("error");
  s.update("xy"); await vi.advanceTimersByTimeAsync(800);
  expect(save).toHaveBeenLastCalledWith("xy");
  expect(statuses.at(-1)).toBe("saved");
});

it("flush saves a pending value immediately", async () => {
  const save = vi.fn().mockResolvedValue(undefined);
  const { s, statuses } = setup(save);
  s.update("draft");
  await s.flush();
  expect(save).toHaveBeenCalledExactlyOnceWith("draft");
  expect(statuses.at(-1)).toBe("saved");
});

it("a failed flush leaves the edit pending so the next flush retries it", async () => {
  const save = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(undefined);
  const { s, statuses } = setup(save);
  s.update("draft");
  await s.flush();
  expect(statuses.at(-1)).toBe("error");
  await s.flush();
  expect(save).toHaveBeenCalledTimes(2);
  expect(save).toHaveBeenLastCalledWith("draft");
  expect(statuses.at(-1)).toBe("saved");
});

it("flush with nothing pending does not save", async () => {
  const save = vi.fn().mockResolvedValue(undefined);
  const { s } = setup(save);
  await s.flush();
  expect(save).not.toHaveBeenCalled();
});
