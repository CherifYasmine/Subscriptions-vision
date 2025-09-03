import type { Subscription } from "../types";


export function monthlyized(s: Subscription): number {
    const amt = +s.amount;
    switch (s.cycle.type) {
        case "weekly": return (amt * 52) / 12;
        case "monthly": return amt;
        case "quarterly": return amt / 3;
        case "yearly": return amt / 12;
        case "custom": return amt / Math.max(1, s.cycle.intervalMonths ?? 1);
        case "lifetime": return 0;
    }
}


export function totals(subs: Subscription[]) {
    const active = subs.filter(s => s.status === "active");
    const monthly = active.reduce((sum, s) => sum + monthlyized(s), 0);
    return { monthly, yearly: monthly * 12 };
}