import { useEffect, useRef, useState } from "react";
import type { Subscription } from "../types";
import { readDb, writeDb } from "../tauri/fs";
import { normalizeNextCharges } from "../utils/date";

export function useSubs() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const hydrated = useRef(false);

  // Initial load
  useEffect(() => {
    (async () => {
      try {
        const raw = await readDb();
        if (raw) {
          let loaded: Subscription[] = [];
          try {
            loaded = JSON.parse(raw);
          } catch (e) {
            console.error("[SubVision] JSON parse failed, keeping file as-is", e);
            loaded = [];
          }
          const { subs: normalized, changed } = normalizeNextCharges(loaded);
          setSubs(normalized);
          // Only write if we actually changed dates
          if (changed) await writeDb(JSON.stringify(normalized, null, 2));
        } else {
          // No file yet → just set empty, DO NOT create the file now
          setSubs([]);
        }
      } catch (e) {
        console.error("[SubVision] load error", e);
        setSubs([]);
      } finally {
        hydrated.current = true;
        setLoading(false);
      }
    })();
  }, []);

  // Persist only after hydration (i.e., user changed something)
  useEffect(() => {
    if (!hydrated.current) return;
    (async () => {
      try {
        await writeDb(JSON.stringify(subs, null, 2));
      } catch (e) {
        console.error("[SubVision] persist error", e);
      }
    })();
  }, [subs]);

  return { subs, setSubs, loading };
}
