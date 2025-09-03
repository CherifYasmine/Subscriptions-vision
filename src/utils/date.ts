import dayjs, { Dayjs } from "dayjs";
import type { Subscription } from "../types";

export type UpcomingItem = { s: Subscription; when: Dayjs };

/** months represented by each cycle (for month-based rolling) */
export function cycleMonths(s: Subscription): number {
    switch (s.cycle.type) {
        case "weekly": return 0;               // handled as +7 days
        case "monthly": return 1;
        case "quarterly": return 3;
        case "yearly": return 12;
        case "custom": return Math.max(1, s.cycle.intervalMonths ?? 1);
        case "lifetime": return 1200;
    }
}

export function parseISO(d?: string): Dayjs | null {
    return d ? dayjs(d) : null;
}

/** Return the next future charge date for a sub (doesn't persist). */
export function nextFutureCharge(s: Subscription, today = dayjs()): Dayjs | null {
    if (!s.nextChargeDate) return null;
    let next = dayjs(s.nextChargeDate);

    // respect active trial if it ends before the first charge
    if (s.trialIsTrial && s.trialEndsOn) {
        const trialEnd = dayjs(s.trialEndsOn);
        if (today.isBefore(trialEnd, "day") && trialEnd.isBefore(next)) return next;
    }

    if (s.cycle.type === "weekly") {
        while (next.isBefore(today, "day")) next = next.add(7, "day");
    } else if (s.cycle.type !== "lifetime") {
        const months = cycleMonths(s);
        while (next.isBefore(today, "day")) next = next.add(months, "month");
    }
    return next;
}

/** List upcoming charges within N days (non-mutating). */
export function upcoming(
    subs: Subscription[],
    days = 30,
    today = dayjs()
): UpcomingItem[] {
    const cutoff = today.add(days, "day");
    return subs
        .filter((s) => s.status === "active")
        .map((s) => ({ s, when: nextFutureCharge(s, today) }))
        .filter((x): x is UpcomingItem => !!x.when && !x.when.isAfter(cutoff)) // ⬅️ type guard
        .sort((a, b) => a.when.valueOf() - b.when.valueOf());
}

/** Mutating helper used on load: advance past-due nextChargeDate and return updated copy. */
export function advanceNextCharge(
    sub: Subscription,
    today = dayjs()
): { sub: Subscription; updated: boolean } {
    if (!sub.nextChargeDate || sub.status !== "active") return { sub, updated: false };

    const start = dayjs(sub.nextChargeDate);
    const rolled = nextFutureCharge(sub, today);
    if (!rolled || rolled.isSame(start, "day")) return { sub, updated: false };

    return { sub: { ...sub, nextChargeDate: rolled.format("YYYY-MM-DD") }, updated: true };
}

/** Normalize an array on load: roll all past-due dates and indicate if anything changed. */
export function normalizeNextCharges(
    subs: Subscription[],
    today = dayjs()
): { subs: Subscription[]; changed: boolean } {
    let changed = false;
    const out = subs.map((s) => {
        const r = advanceNextCharge(s, today);
        if (r.updated) changed = true;
        return r.sub;
    });
    return { subs: out, changed };
}
