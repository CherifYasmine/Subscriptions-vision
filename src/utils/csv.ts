import Papa from "papaparse";
import type { Subscription } from "../types";


export function exportCSV(rows: Subscription[]): string {
    const flat = rows.map(r => ({
        id: r.id,
        name: r.name,
        amount: r.amount,
        currency: r.currency,
        billing_type: r.cycle.type,
        interval_months: r.cycle.intervalMonths ?? "",
        next_charge_date: r.nextChargeDate ?? "",
        category: r.category ?? "",
        payment_method: r.paymentMethod ?? "",
        status: r.status,
        tags: r.tags?.join(",") ?? "",
        notes: r.notes ?? "",
        start_date: r.startDate ?? "",
        trial_is_trial: r.trialIsTrial ? "true" : "false",
        trial_ends_on: r.trialEndsOn ?? "",
        seats: r.seats ?? "",
    }));
    return Papa.unparse(flat);
}


export function importCSV(text: string): Subscription[] {
    const parsed = Papa.parse(text, { header: true });
    const rows: Subscription[] = [];
    for (const row of parsed.data as any[]) {
        if (!row || !row.name) continue;
        rows.push({
            id: crypto.randomUUID(),
            name: String(row.name).trim(),
            amount: Number(row.amount ?? 0),
            currency: (row.currency ?? "EUR").trim(),
            cycle: { type: (row.billing_type ?? "monthly").trim(), intervalMonths: row.interval_months ? Number(row.interval_months) : undefined } as any,
            nextChargeDate: row.next_charge_date || undefined,
            startDate: row.start_date || undefined,
            status: (row.status ?? "active").trim(),
            category: row.category || undefined,
            paymentMethod: row.payment_method || undefined,
            seats: row.seats ? Number(row.seats) : undefined,
            tags: row.tags ? String(row.tags).split(',').map((t: string) => t.trim()).filter(Boolean) : [],
            notes: row.notes || undefined,
            trialIsTrial: String(row.trial_is_trial ?? "false").toLowerCase() === "true",
            trialEndsOn: row.trial_ends_on || undefined,
        });
    }
    return rows;
}