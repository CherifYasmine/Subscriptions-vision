import { useSubs } from "./store/useSubs";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import SubscriptionForm from "./components/SubscriptionForm";
import SubscriptionList from "./components/SubscriptionList";
import { notify } from "./tauri/notify";
// import { exportCSV, importCSV } from "./utils/csv";
import { useEffect, useRef } from "react";
import { getDbPath } from "./tauri/fs";
import { upcoming } from "./utils/date";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const LEAD_DAYS = 7;

export default function App() {
  const { subs, setSubs, loading } = useSubs();
  const hasNotifiedRef = useRef(false);
  useEffect(() => {
    getDbPath().then(p => console.log("SubVision DB path:", p));
  }, []);
  useEffect(() => {
    if (loading || hasNotifiedRef.current) return;

    // avoid spamming: once per session + once per day
    const todayKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const last = localStorage.getItem("sv_lastNotifyDate");
    if (last === todayKey) {
      hasNotifiedRef.current = true;
      return;
    }

    const due = upcoming(subs, LEAD_DAYS);
    if (due.length > 0) {
      const summary = due.length === 1
        ? `${due[0].s.name} due ${due[0].when.fromNow()} (${due[0].when.format("MMM D")})`
        : `${due.length} renewals in next ${LEAD_DAYS} days`;
      notify("SubVision", summary);

      due.slice(0, 3).forEach(({ s, when }) => {
        notify(s.name, `${s.amount} ${s.currency} • ${when.format("ddd, MMM D")}`);
      });
    }

    localStorage.setItem("sv_lastNotifyDate", todayKey);
    hasNotifiedRef.current = true;
  }, [loading, subs]);



  function addSub(s: any) { setSubs(prev => [s, ...prev]); }
  function delSub(id: string) { setSubs(prev => prev.filter(x => x.id !== id)); }


  // async function onExport() {
  //   const csv = exportCSV(subs);
  //   const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url; a.download = 'subscriptions_export.csv'; a.click();
  //   URL.revokeObjectURL(url);
  // }


  // async function onImport(ev: React.ChangeEvent<HTMLInputElement>) {
  //   const file = ev.target.files?.[0]; if (!file) return;
  //   const text = await file.text();
  //   const rows = importCSV(text);
  //   setSubs(rows);
  // }


  // async function testNotify() {
  //   await notify("SubVision", "Notifications are enabled ✅");
  // }


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <div className="max-w-5xl mx-auto p-4 space-y-4">
        {loading ? <div>Loading…</div> : (
          <>
            <Dashboard subs={subs} />
            <div className="flex gap-2">
              {/* <button className="btn" onClick={onExport}>Export CSV</button>
              <label className="btn cursor-pointer">
                Import CSV
                <input type="file" accept=".csv" className="hidden" onChange={onImport} />
              </label> */}
              {/* <button className="btn" onClick={testNotify}>Test Notification</button> */}
            </div>
            <SubscriptionForm onAdd={addSub} />
            <SubscriptionList subs={subs} onDelete={delSub} />
          </>
        )}
      </div>
    </div>
  );
}