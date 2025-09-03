import { useMemo, useState } from "react";
import type { Subscription, CycleType } from "../types";
import { nextFutureCharge } from "../utils/date";
import dayjs from "dayjs";

const cycleOptions: CycleType[] = ["weekly", "monthly", "quarterly", "yearly", "custom", "lifetime"];

// lightweight field shell
function Field({
  label,
  children,
  hint,
  error,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  error?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

export default function SubscriptionForm({ onAdd }: { onAdd: (s: Subscription) => void }) {
  const [form, setForm] = useState<Subscription>({
    id: crypto.randomUUID(),
    name: "",
    amount: 0,
    currency: "EUR",
    cycle: { type: "monthly", intervalMonths: 1 },
    status: "active",
  });
  const [customN, setCustomN] = useState<number>(1);

  function set<K extends keyof Subscription>(k: K, v: Subscription[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  // ---- simple validations
  const errors = useMemo(() => {
    const e: Record<string, string | undefined> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.amount || form.amount <= 0) e.amount = "Must be greater than 0";
    if (!form.currency.trim()) e.currency = "Required";
    if (form.cycle.type === "custom" && (!customN || customN < 1)) e.customN = "Min 1 month";
    if (!form.nextChargeDate) e.next = "Pick a date";
    return e;
  }, [form, customN]);

  const isValid = Object.keys(errors).length === 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    let s = { ...form };
    if (s.cycle.type === "custom") s.cycle.intervalMonths = customN;

    // If nextChargeDate is in the past, roll it forward immediately
    if (s.nextChargeDate) {
      const rolled = nextFutureCharge(s, dayjs());
      if (rolled) s.nextChargeDate = rolled.format("YYYY-MM-DD");
    }

    onAdd(s);
    // reset
    setForm({
      id: crypto.randomUUID(),
      name: "",
      amount: 0,
      currency: "EUR",
      cycle: { type: "monthly", intervalMonths: 1 },
      status: "active",
    });
    setCustomN(1);
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Add subscription</h3>
          <p className="text-xs text-slate-500">
            Name, amount, billing cycle, next charge date — then hit Add.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 grid gap-4 md:grid-cols-6">
        <Field label="Name" error={errors.name} className="md:col-span-2">
          <input
            className="w-full rounded-xl border px-3 py-2 outline-none focus:ring focus:ring-slate-200"
            placeholder="e.g. Spotify"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </Field>

        <Field label="Amount" error={errors.amount}>
          <div className="flex items-center rounded-xl border px-3 py-2 focus-within:ring focus-within:ring-slate-200">
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-full outline-none"
              value={form.amount || ""}
              onChange={(e) => set("amount", Number(e.target.value))}
            />
          </div>
        </Field>

        <Field label="Currency" error={errors.currency}>
          <input
            className="w-full rounded-xl border px-3 py-2 outline-none focus:ring focus:ring-slate-200"
            placeholder="EUR"
            value={form.currency}
            onChange={(e) => set("currency", e.target.value.toUpperCase())}
          />
        </Field>

        <Field label="Billing cycle" className="md:col-span-2">
          <div className="grid grid-cols-2 gap-2">
            <select
              className="rounded-xl border px-3 py-2 outline-none focus:ring focus:ring-slate-200"
              value={form.cycle.type}
              onChange={(e) => set("cycle", { ...form.cycle, type: e.target.value as any })}
            >
              {cycleOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {form.cycle.type === "custom" && (
              <div className="flex items-center gap-2 rounded-xl border px-3 py-2 focus-within:ring focus-within:ring-slate-200">
                <input
                  type="number"
                  min={1}
                  value={customN}
                  onChange={(e) => setCustomN(Number(e.target.value))}
                  className="w-full outline-none"
                />
                <span className="text-sm text-slate-500">months</span>
              </div>
            )}
          </div>
          {form.cycle.type === "custom" && errors.customN && (
            <p className="text-xs text-red-600 mt-1">{errors.customN}</p>
          )}
        </Field>

        <Field
          label="Next charge date"
          error={errors.next}
          hint="You can pick a past date — it will auto-roll forward."
        >
          <input
            className="w-full rounded-xl border px-3 py-2 outline-none focus:ring focus:ring-slate-200"
            type="date"
            value={form.nextChargeDate ?? ""}
            onChange={(e) => set("nextChargeDate", e.target.value)}
          />
        </Field>

        <Field label="Category" className="md:col-span-2">
          <input
            className="w-full rounded-xl border px-3 py-2 outline-none focus:ring focus:ring-slate-200"
            placeholder="e.g. Music"
            value={form.category ?? ""}
            onChange={(e) => set("category", e.target.value)}
          />
        </Field>

        <Field label="Payment method" className="md:col-span-2">
          <input
            className="w-full rounded-xl border px-3 py-2 outline-none focus:ring focus:ring-slate-200"
            placeholder="e.g. Visa ****4242"
            value={form.paymentMethod ?? ""}
            onChange={(e) => set("paymentMethod", e.target.value)}
          />
        </Field>

        <Field label="Tags (comma separated)" className="md:col-span-2">
          <input
            className="w-full rounded-xl border px-3 py-2 outline-none focus:ring focus:ring-slate-200"
            placeholder="personal, work"
            value={(form.tags ?? []).join(",")}
            onChange={(e) =>
              set(
                "tags",
                e.target.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
              )
            }
          />
        </Field>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-t">
        <p className="text-xs text-slate-500">
          Tip: set a past date to anchor the cycle; we’ll roll it forward automatically.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setForm({
                id: crypto.randomUUID(),
                name: "",
                amount: 0,
                currency: "EUR",
                cycle: { type: "monthly", intervalMonths: 1 },
                status: "active",
              });
              setCustomN(1);
            }}
            className="inline-flex items-center px-3 py-2 rounded-xl border text-slate-700 hover:bg-slate-50"
          >
            Reset
          </button>
          <button
            className="inline-flex items-center px-4 py-2 rounded-xl shadow bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            disabled={!isValid}
          >
            Add
          </button>
        </div>
      </div>
    </form>
  );
}
