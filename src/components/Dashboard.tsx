import dayjs from "dayjs";
import type { Subscription } from "../types";
import { totals } from "../utils/monthlyize";
import { upcoming } from "../utils/date";

function formatMoney(n: number, currency = "EUR") {
    try {
        return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
    } catch {
        // fallback if currency isn't recognized
        return `€ ${n.toFixed(2)}`;
    }
}

export default function Dashboard({ subs }: { subs: Subscription[] }) {
    const t = totals(subs);
    const up7 = upcoming(subs, 7);
    const up30 = upcoming(subs, 30);

    // Try to infer a display currency from the first active sub
    const displayCurrency = subs.find(s => s.status === "active")?.currency ?? "EUR";

    return (
        <section className="p-4 space-y-4">
            {/* Stat cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Monthly total"
                    value={formatMoney(t.monthly, displayCurrency)}
                    icon="📅"
                    gradient="from-indigo-500/10 to-indigo-500/0"
                />
                <StatCard
                    title="Yearly total"
                    value={formatMoney(t.yearly, displayCurrency)}
                    icon="📈"
                    gradient="from-emerald-500/10 to-emerald-500/0"
                />
                <StatCard
                    title="Due in 30 days"
                    value={String(up30.length)}
                    icon="⏰"
                    gradient="from-amber-500/10 to-amber-500/0"
                />
            </div>

            {/* Upcoming list */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">🗓️</span>
                        <h3 className="text-base font-semibold text-slate-900">Upcoming (7 days)</h3>
                    </div>
                    <span className="text-xs text-slate-500">
                        {up7.length > 0 ? `${up7.length} charge${up7.length > 1 ? "s" : ""}` : "No charges"}
                    </span>
                </div>

                {up7.length === 0 ? (
                    <EmptyState />
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {up7.map(({ s, when }) => {
                            const daysLeft = when ? when.diff(dayjs(), "day") : null;
                            return (
                                <li key={s.id} className="px-4 py-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                                                    {s.name.slice(0, 1).toUpperCase()}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium text-slate-900">{s.name}</p>
                                                    <p className="truncate text-xs text-slate-500">
                                                        {s.category || "Uncategorized"} • {s.paymentMethod || "Payment method"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="font-medium text-slate-900">
                                                {formatMoney(Number(s.amount || 0), s.currency || displayCurrency)}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {when ? when.format("MMM D, YYYY") : "Unknown date"} • {daysLeft == null ? "unknown" : daysLeft <= 0 ? "today" : `${daysLeft}d`}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </section>
    );
}

function StatCard({
    title,
    value,
    icon,
    gradient,
}: {
    title: string;
    value: string;
    icon: string;
    gradient: string;
}) {
    return (
        <div className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm`}>
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient}`} />
            <div className="relative flex items-start justify-between">
                <div>
                    <p className="text-sm text-slate-500">{title}</p>
                    <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
                </div>
                <span className="text-2xl">{icon}</span>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="px-4 py-10 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50">
                <span>🌤️</span>
            </div>
            <p className="text-sm font-medium text-slate-900">Nothing due this week</p>
            <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
                Add your next charge date in each subscription. We’ll surface anything due in the next 7 days here.
            </p>
        </div>
    );
}
