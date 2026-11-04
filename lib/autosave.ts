export type SaveStatus = "saved" | "pending" | "saving" | "error";

export function createAutosaver<T>({
  save,
  delay,
  onStatus,
}: {
  save: (value: T) => Promise<void>;
  delay: number;
  onStatus: (s: SaveStatus) => void;
}) {
  let latest: T;
  let dirty = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let running: Promise<void> | null = null;

  // Saves until nothing newer is waiting; a failure stops the loop until the next update/flush.
  async function run() {
    while (dirty) {
      dirty = false;
      onStatus("saving");
      try {
        await save(latest);
      } catch {
        dirty = true;
        onStatus("error");
        return;
      }
    }
    onStatus("saved");
  }

  function flush(): Promise<void> {
    clearTimeout(timer);
    if (!dirty && !running) return Promise.resolve();
    running ??= run().finally(() => (running = null));
    return running;
  }

  return {
    update(value: T) {
      latest = value;
      dirty = true;
      onStatus("pending");
      clearTimeout(timer);
      timer = setTimeout(flush, delay);
    },
    flush,
    dispose: () => clearTimeout(timer),
  };
}
