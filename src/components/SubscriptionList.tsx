import dayjs from "dayjs";
import type { Subscription } from "../types";
import { monthlyized } from "../utils/monthlyize";

function money(n: number, c = "EUR") {
    try {
        return new Intl.NumberFormat(undefined, { style: "currency", currency: c }).format(n);
    } catch {
        return `€ ${n.toFixed(2)}`;
    }
}

export default function SubscriptionList({
    subs,
    onDelete,
}: {
    subs: Subscription[];
    onDelete: (id: string) => void;
}) {
    const hasItems = subs.length > 0;

    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                    <span className="text-lg">📦</span>
                    <h3 className="text-base font-semibold text-slate-900">Subscriptions</h3>
                </div>
                <span className="text-xs text-slate-500">{subs.length} total</span>
            </div>

            {/* Table */}
            {hasItems ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr className="text-left text-slate-600">
                                <Th>Name</Th>
                                <Th>Amount</Th>
                                <Th>Cycle</Th>
                                <Th>Next Charge</Th>
                                <Th className="text-right">Monthlyized</Th>
                                <Th className="w-16 text-right">Actions</Th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {subs.map((s) => (
                                <tr key={s.id} className="hover:bg-slate-50/50">
                                    <Td>
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                                {s.name.slice(0, 1).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate font-medium text-slate-900">{s.name}</p>
                                                <p className="truncate text-xs text-slate-500">
                                                    {(s.category || "Uncategorized") +
                                                        (s.paymentMethod ? ` • ${s.paymentMethod}` : "")}
                                                </p>
                                                {s.tags && s.tags.length > 0 && (
                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                        {s.tags.map((t) => (
                                                            <span
                                                                key={t}
                                                                className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600"
                                                            >
                                                                {t}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Td>

                                    <Td className="whitespace-nowrap">{money(Number(s.amount || 0), s.currency)}</Td>

                                    <Td className="whitespace-nowrap">
                                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                                            {s.cycle.type}
                                            {s.cycle.type === "custom" && s.cycle.intervalMonths
                                                ? ` / ${s.cycle.intervalMonths}m`
                                                : ""}
                                        </span>
                                        {s.status === "canceled" && (
                                            <span className="ml-2 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700">
                                                canceled
                                            </span>
                                        )}
                                    </Td>

                                    <Td className="whitespace-nowrap">
                                        {s.nextChargeDate ? (
                                            <div className="flex flex-col">
                                                <span className="text-slate-900">
                                                    {dayjs(s.nextChargeDate).format("MMM D, YYYY")}
                                                </span>
                                                <span className="text-[11px] text-slate-500">
                                                    {labelDaysLeft(s.nextChargeDate)}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400">—</span>
                                        )}
                                    </Td>

                                    <Td className="whitespace-nowrap text-right font-medium">
                                        {money(monthlyized(s), s.currency)}
                                    </Td>

                                    <Td className="text-right">
                                        <button
                                            onClick={() => {
                                                if (confirm(`Delete “${s.name}”?`)) onDelete(s.id);
                                            }}
                                            className="inline-flex items-center rounded-lg px-2 py-1 text-[12px] font-medium text-rose-700 hover:bg-rose-50"
                                            title="Delete"
                                        >
                                            Delete
                                        </button>
                                    </Td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <EmptyState />
            )}
        </div>
    );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <th className={`px-4 py-2 text-xs font-medium ${className}`}>{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <td className={`px-4 py-3 align-top text-slate-700 ${className}`}>{children}</td>;
}

function EmptyState() {
    return (
        <div className="px-4 py-12 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50">
                <span>🗃️</span>
            </div>
            <p className="text-sm font-medium text-slate-900">No subscriptions yet</p>
            <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
                Add your first subscription using the form above. You can also import from CSV.
            </p>
        </div>
    );
}

function labelDaysLeft(iso: string) {
    const d = dayjs(iso);
    const today = dayjs();
    const diff = d.startOf("day").diff(today.startOf("day"), "day");
    if (diff === 0) return "due today";
    if (diff === 1) return "in 1 day";
    if (diff > 1) return `in ${diff} days`;
    if (diff === -1) return "1 day ago";
    return `${Math.abs(diff)} days ago`;
}
